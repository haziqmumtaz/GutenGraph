export interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
  description?: string;
}
