import { injectable } from 'inversify';
import { promises as fs } from 'fs';
import path from 'path';
import { TYPES } from '../types/di.js';
import { container } from '../container.js';
import { AnalysisResult } from '../types/models.js';
import { GroqService } from './groq.service.js';
import { GutenbergService } from './gutenberg.service.js';
import { extractMainContent } from '../utils/textClean.js';
import { Result, success, failure } from '../utils/result.js';
import { notFound, internalServerError } from '../utils/errors.js';

export interface AnalysisService {
  analyzeBook(bookId: string): Promise<Result<AnalysisResult>>;
}

@injectable()
export class Analysis implements AnalysisService {
  async analyzeBook(bookId: string): Promise<Result<AnalysisResult>> {
    try {
      // Get services from container
      const groqService = container.get<GroqService>(TYPES.GroqService);
      const gutenbergService = container.get<GutenbergService>(
        TYPES.GutenbergService
      );

      // Read book content
      const filePath = path.join(
        process.cwd(),
        'book-content',
        `${bookId}.txt`
      );
      let bookContent: string;

      try {
        bookContent = await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        // Book content not found, try to download it
        console.log(
          `Book content for ${bookId} not found, attempting to download...`
        );
        const downloadResult =
          await gutenbergService.downloadBookContent(bookId);

        if (!downloadResult.success) {
          // Check if it's a 404 error (book content not available)
          if (downloadResult.error?.status === 404) {
            return failure(
              notFound(
                `Book content for ${bookId} is not available on Project Gutenberg.`
              )
            );
          }

          // Check if it's a timeout error
          if (downloadResult.error?.status === 503) {
            return failure(
              notFound(
                `Book content for ${bookId} could not be downloaded due to a timeout. Please try again later.`
              )
            );
          }

          // Generic download error
          return failure(
            notFound(
              `Book content for ${bookId} could not be downloaded. Please try again later.`
            )
          );
        }

        bookContent = downloadResult.data;
      }

      // Extract main content and clean it
      const cleanContent = extractMainContent(bookContent);

      // Take a sample of the text (first 8000 characters) to avoid token limits
      const textSample = cleanContent.substring(0, 8000);

      // Extract characters using Groq
      const characterResult = await groqService.extractCharacters(textSample);
      if (!characterResult.success) {
        return characterResult;
      }

      // Add 1 second delay between API calls
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Analyze interactions using Groq
      const interactionResult = await groqService.analyzeInteractions(
        textSample,
        characterResult.data.characters
      );
      if (!interactionResult.success) {
        return interactionResult;
      }

      // Add 1 second delay between API calls
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Analyze sentiments using Groq
      const sentimentResult = await groqService.analyzeSentiments(
        textSample,
        interactionResult.data.links
      );
      if (!sentimentResult.success) {
        return sentimentResult;
      }

      // Merge sentiment data with interaction data
      const linksWithSentiments = interactionResult.data.links.map(link => {
        const sentimentData = sentimentResult.data.find(
          (s: {
            source: string;
            target: string;
            sentiment: 'positive' | 'negative' | 'neutral';
          }) => s.source === link.source && s.target === link.target
        );
        return {
          ...link,
          sentiment: sentimentData?.sentiment || 'neutral',
        };
      });

      // Filter out characters that don't have any interactions
      const nodesWithInteractions = new Set<string>();

      // Add all characters that appear in links
      linksWithSentiments.forEach(link => {
        nodesWithInteractions.add(link.source);
        nodesWithInteractions.add(link.target);
      });

      // Filter nodes to only include those with interactions
      const filteredNodes = interactionResult.data.nodes.filter(node =>
        nodesWithInteractions.has(node.id)
      );

      // Filter characters to only include those with interactions
      const filteredCharacters = characterResult.data.characters.filter(
        character => nodesWithInteractions.has(character.name)
      );

      // Create filtered graph data
      const filteredGraph = {
        nodes: filteredNodes,
        links: linksWithSentiments,
      };

      // Create analysis result
      const result: AnalysisResult = {
        bookId,
        characters: filteredCharacters,
        graph: filteredGraph,
      };

      return success(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      return failure(internalServerError(`Analysis failed for book ${bookId}`));
    }
  }
}
