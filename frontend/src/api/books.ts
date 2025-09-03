import { http } from "./client";
import type { BookMeta, AnalysisResult } from "../types/api";

export async function getBookMetaData(bookId: number): Promise<BookMeta> {
  const res = await http.get(`/books/${bookId}`);
  return res.data;
}

export async function analyzeBook(bookId: number): Promise<AnalysisResult> {
  const res = await http.post(`/books/${bookId}/analyse`);
  return res.data;
}
