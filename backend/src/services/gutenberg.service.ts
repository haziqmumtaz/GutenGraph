import axios from 'axios';
import { injectable } from 'inversify';
import {
  internalServerError,
  notFound,
  serviceUnavailable,
} from '../utils/errors.js';
import { BookSummary } from '../types/models.js';
import { Result, success, failure } from '../utils/result.js';

export interface GutenbergService {
  fetchBookMetadata(bookId: string): Promise<Result<BookSummary>>;
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

      return success({
        id: bookId,
        title: metadata.title,
        author: metadata.author,
      });
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

    return result;
  }
}
