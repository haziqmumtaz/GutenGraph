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

export interface Character {
  name: string;
  aliases: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface AnalysisResult {
  bookId: string;
  characters: Character[];
  graph: GraphData;
}
