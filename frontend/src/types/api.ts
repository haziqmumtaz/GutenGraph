export type BookMeta = {
  id?: string;
  title?: string;
  author?: string;
  imageUrl?: string;
  description?: string;
  [key: string]: unknown;
};

export type Character = {
  name: string;
  aliases: string[];
};

export type GraphNode = {
  id: string;
  name: string;
  val: number;
};

export type GraphLink = {
  source: string;
  target: string;
  value: number;
  sentiment?: "positive" | "negative" | "neutral";
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export type AnalysisResult = {
  bookId: string;
  characters: Character[];
  graph: GraphData;
};
