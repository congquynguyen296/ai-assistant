export interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
  _id?: unknown;
}

export interface ScoredChunk extends TextChunk {
  score?: number;
  rawScore?: number;
  matchedWords?: number;
  finalScore?: number;
}

export const chunkText = (
  text: string,
  chunkSize = 500,
  overlap = 50,
): TextChunk[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();

  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);

  const chunks: TextChunk[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex,
      pageNumber: 0,
    });
  }

  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

export const findRelevantChunksTest = (
  chunks: TextChunk[],
  query: string,
  maxChunks = 3,
): ScoredChunk[] => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
  ]);

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    for (const word of queryWords) {
      const exactMatches = (
        content.match(new RegExp(`\\b${word}\\b`, "g")) || []
      ).length;
      score += exactMatches * 3;

      const partialMatches = (content.match(new RegExp(word, "g")) || [])
        .length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    const uniqueWordsFound = queryWords.filter((word) =>
      content.includes(word),
    ).length;
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    const normalizedScore = score / Math.sqrt(contentWords);
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound,
    };
  });

  return scoredChunks
    .filter((chunk) => (chunk.score || 0) > 0)
    .sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) {
        return (b.score || 0) - (a.score || 0);
      }
      if ((b.matchedWords || 0) !== (a.matchedWords || 0)) {
        return (b.matchedWords || 0) - (a.matchedWords || 0);
      }
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};

export const findRelevantChunks = (
  chunks: TextChunk[],
  query: string,
  maxChunks = 15,
): TextChunk[] => {
  if (!chunks || chunks.length === 0) return [];
  if (!query) return chunks.slice(0, 3);

  const totalLength = chunks.reduce(
    (acc, chunk) => acc + chunk.content.length,
    0,
  );
  if (totalLength < 30000) {
    console.log("Tài liệu ngắn, gửi toàn bộ context cho AI.");
    return chunks.map((c) => ({
      content: c.content,
      chunkIndex: c.chunkIndex,
      pageNumber: c.pageNumber,
      _id: c._id,
    }));
  }

  const queryLower = query.toLowerCase().trim();
  const queryTerms = queryLower.split(/\s+/).filter((w) => w.length > 1);

  const scoredChunks: ScoredChunk[] = chunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    if (contentLower.includes(queryLower)) {
      score += 10;
    }

    queryTerms.forEach((term) => {
      if (contentLower.includes(term)) {
        score += 1;
      }
    });

    return {
      ...chunk,
      score,
      finalScore: score + 1 / (chunk.chunkIndex + 1),
    };
  });

  let result = scoredChunks
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    .slice(0, maxChunks);

  const hasMatch = result.some((r) => (r.score || 0) > 0);
  if (!hasMatch) {
    console.log("Không khớp từ khóa, dùng fallback chunks đầu tiên.");
    return chunks.slice(0, 5);
  }

  const hasFirstChunk = result.some((r) => r.chunkIndex === 0);
  if (!hasFirstChunk && chunks.length > 0) {
    result.push(chunks[0]);
  }

  return result.sort((a, b) => a.chunkIndex - b.chunkIndex);
};
