import { http } from "./client";
import type { BookMeta } from "../types/api";

export async function getBookMetaData(bookId: number): Promise<BookMeta> {
  const res = await http.get(`/books/${bookId}`);
  return res.data;
}
