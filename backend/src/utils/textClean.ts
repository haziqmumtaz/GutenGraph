export function cleanText(text: string): string {
  return (
    text
      // Remove Project Gutenberg boilerplate
      .replace(/\*\*\* START OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/gis, '')
      .replace(/\*\*\* END OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/gis, '')
      .replace(/Produced by.*?Project Gutenberg.*?/gis, '')
      .replace(/Updated editions will.*?Project Gutenberg.*?/gis, '')

      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')

      // Remove page numbers and headers
      .replace(/\[Page \d+\]/g, '')
      .replace(/^\s*\d+\s*$/gm, '')

      // Clean up character names in plays
      .replace(/^([A-Z\s]+):\s*/gm, '$1: ')

      // Trim whitespace
      .trim()
  );
}

export function extractMainContent(text: string): string {
  // Find the main content between Gutenberg headers
  const startMatch = text.match(
    /\*\*\* START OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/is
  );
  const endMatch = text.match(
    /\*\*\* END OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/is
  );

  if (startMatch && endMatch) {
    const startIndex = startMatch.index! + startMatch[0].length;
    const endIndex = endMatch.index!;
    return text.substring(startIndex, endIndex).trim();
  }

  // Fallback: return cleaned text
  return cleanText(text);
}
