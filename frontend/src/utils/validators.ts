export const isValidBookId = (raw: string) =>
  /^\d+$/.test(raw) && Number(raw) > 0;
