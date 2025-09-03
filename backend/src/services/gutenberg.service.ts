import axios from 'axios';
import { injectable } from 'inversify';
import { promises as fs } from 'fs';
import path from 'path';
import {
  internalServerError,
  notFound,
  serviceUnavailable,
} from '../utils/errors.js';
import { BookSummary } from '../types/models.js';
import { Result, success, failure } from '../utils/result.js';

export interface GutenbergService {
  fetchBookMetadata(bookId: string): Promise<Result<BookSummary>>;
  downloadBookContent(bookId: string): Promise<Result<string>>;
}

@injectable()
export class Gutenberg implements GutenbergService {
  private readonly baseUrl = 'https://www.gutenberg.org';
  private readonly timeout = 10000;

  async fetchBookMetadata(bookId: string): Promise<Result<BookSummary>> {
    const metadataUrl = `${this.baseUrl}/ebooks/${bookId}`;

    try {
      const response = await axios.get(metadataUrl, {
        timeout: this.timeout,
        responseType: 'text',
      });

      const metadata = this.extractMetadataFromHtml(response.data);

      const result: BookSummary = {
        id: bookId,
        title: metadata.title,
        author: metadata.author,
      };

      if (metadata.imageUrl) {
        result.imageUrl = metadata.imageUrl;
      }

      if (metadata.description) {
        result.description = metadata.description;
      }

      return success(result);
    } catch (error) {
      console.warn(`Could not fetch metadata for book ${bookId}`);

      if (error instanceof Error && error.message.includes('404')) {
        return failure(notFound(`Book with ID ${bookId} not found`));
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return failure(
          serviceUnavailable(`Request timeout while fetching book ${bookId}`)
        );
      }

      return failure(internalServerError(`Error fetching book ${bookId}`));
    }
  }

  async downloadBookContent(bookId: string): Promise<Result<string>> {
    const contentUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
    const bookContentDir = path.join(process.cwd(), 'book-content');
    const filePath = path.join(bookContentDir, `${bookId}.txt`);

    try {
      // Check if book content already exists
      try {
        const existingContent = await fs.readFile(filePath, 'utf-8');
        return success(existingContent);
      } catch (error) {
        // File doesn't exist, continue to download
      }

      // Create book-content directory if it doesn't exist
      try {
        await fs.mkdir(bookContentDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Download book content
      const response = await axios.get(contentUrl, {
        timeout: this.timeout,
        responseType: 'text',
      });

      // Save book content to file
      await fs.writeFile(filePath, response.data, 'utf-8');

      return success(response.data);
    } catch (error) {
      console.error(`Could not download content for book ${bookId}:`, error);

      if (error instanceof Error && error.message.includes('404')) {
        return failure(notFound(`Book content for ${bookId} not found`));
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return failure(
          serviceUnavailable(`Request timeout while downloading book ${bookId}`)
        );
      }

      return failure(internalServerError(`Error downloading book ${bookId}`));
    }
  }

  private extractMetadataFromHtml(html: string): Omit<BookSummary, 'id'> {
    const result: Omit<BookSummary, 'id'> = {
      title: '',
      author: '',
    };

    const titlePatterns = [
      /<h1[^>]*itemprop=["']name["'][^>]*>([^<]+)<\/h1>/i,
      /<title>([^<]+?)\s*(?:\||\-|\s*by\s*Project Gutenberg)/i,
      /<title>([^<]+)<\/title>/i,
    ];

    for (const pattern of titlePatterns) {
      const titleMatch = html.match(pattern);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        if (title && title !== 'Project Gutenberg') {
          result.title = title;
          break;
        }
      }
    }

    const authorPatterns = [
      /<[^>]*itemprop=["']creator["'][^>]*>([^<]+)<\/[^>]*>/i,
      /<[^>]*itemprop=["']author["'][^>]*>([^<]+)<\/[^>]*>/i,
      /<a[^>]*href=["'][^"']*\/ebooks\/author\/[^"']*["'][^>]*>([^<]+)<\/a>/i,
      /by\s+([^<\n\r]+?)(?:\s*<|\s*\n|\s*\r|$)/i,
    ];

    for (const pattern of authorPatterns) {
      const authorMatch = html.match(pattern);
      if (authorMatch && authorMatch[1]) {
        const author = authorMatch[1].trim();
        if (author && !author.includes('Project Gutenberg')) {
          result.author = author;
          break;
        }
      }
    }

    // Extract image URL - Project Gutenberg typically uses cover images
    const imagePatterns = [
      // Look for cover image with specific patterns
      /<img[^>]*src=["']([^"']*cover[^"']*\.(?:jpg|jpeg|png|gif))[^"']*["'][^>]*>/i,
      /<img[^>]*src=["']([^"']*\/covers\/[^"']*\.(?:jpg|jpeg|png|gif))[^"']*["'][^>]*>/i,
      // Look for any image that might be the book cover in the content area
      /<img[^>]*class=["'][^"']*cover[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
      /<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*cover[^"']*["'][^>]*>/i,
      // Fallback to first image with book-related alt text
      /<img[^>]*alt=["'][^"']*(?:cover|book)[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
      /<img[^>]*src=["']([^"']+)["'][^>]*alt=["'][^"']*(?:cover|book)[^"']*["'][^>]*>/i,
    ];

    for (const pattern of imagePatterns) {
      const imageMatch = html.match(pattern);
      if (imageMatch && imageMatch[1]) {
        let imageUrl = imageMatch[1].trim();

        // Handle relative URLs by making them absolute
        if (imageUrl.startsWith('/')) {
          imageUrl = `${this.baseUrl}${imageUrl}`;
        } else if (imageUrl.startsWith('http')) {
          // Already absolute URL
        } else {
          // Relative path, prepend base URL
          imageUrl = `${this.baseUrl}/${imageUrl}`;
        }

        (result as any).imageUrl = imageUrl;
        break;
      }
    }

    // Extract description - Project Gutenberg uses specific summary-text-container structure
    let description = '';

    // First, try to extract from the new summary-text-container structure
    const summaryContainerMatch = html.match(
      /<div[^>]*class=["'][^"']*summary-text-container[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    );
    if (summaryContainerMatch && summaryContainerMatch[1]) {
      const containerContent = summaryContainerMatch[1];

      // Extract all text content from the container, then clean it up
      let fullText = containerContent
        .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove any scripts
        .replace(/<style[\s\S]*?<\/style>/gi, '') // Remove any styles
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/<input[^>]*>/g, '') // Remove input elements
        .replace(/<label[^>]*>[\s\S]*?<\/label>/g, '') // Remove labels
        .replace(/<[^>]+>/g, '') // Remove all remaining HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Remove common UI text that's not part of the description
      fullText = fullText
        .replace(/\.\.\.\s*Read More/g, '')
        .replace(/Show Less/g, '')
        .replace(/\(This is an automatically generated summary\.\)/g, '')
        .trim();

      if (fullText && fullText.length > 50) {
        description = fullText;
      }
    }

    // Fallback to other description patterns if summary-text-container not found
    if (!description) {
      const descriptionPatterns = [
        // Look for meta description
        /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i,
        /<meta\s+content=["']([^"']+)["']\s+name=["']description["'][^>]*>/i,
        // Look for structured data description
        /<[^>]*itemprop=["']description["'][^>]*>([^<]+)<\/[^>]*>/i,
        // Look for description in summary or abstract sections
        /<summary[^>]*>([^<]+)<\/summary>/i,
        /<p[^>]*class=["'][^"']*(?:summary|description|abstract)[^"']*["'][^>]*>([^<]+)<\/p>/i,
        // Look for description in divs with relevant classes
        /<div[^>]*class=["'][^"']*(?:summary|description|abstract)[^"']*["'][^>]*>(?:<[^>]*>)*([^<]+)/i,
        // Look for first paragraph after title/author that looks like a description
        /<p[^>]*>([^<]{100,500})<\/p>/i,
      ];

      for (const pattern of descriptionPatterns) {
        const descriptionMatch = html.match(pattern);
        if (descriptionMatch && descriptionMatch[1]) {
          description = descriptionMatch[1].trim();
          break;
        }
      }
    }

    if (description) {
      description = description
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/&quot;/g, '"') // Replace HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/^"/, '') // Remove leading quote if present
        .replace(/"$/, '') // Remove trailing quote if present
        .trim();

      if (
        description.length > 50 &&
        !description.toLowerCase().includes('project gutenberg') &&
        !description.toLowerCase().includes('this ebook') &&
        !description.toLowerCase().includes('free ebook')
      ) {
        (result as any).description = description;
      }
    }

    return result;
  }
}
