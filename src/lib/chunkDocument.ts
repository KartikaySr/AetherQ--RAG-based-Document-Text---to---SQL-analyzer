export type DocumentChunk = {
  chunkIndex: number;
  text: string;
};

const DEFAULT_CHUNK_SIZE = 700;
const DEFAULT_OVERLAP = 120;
const MIN_CHUNK_LENGTH = 40;

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitIntoSentences(text: string) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  return normalized.match(/[^.!?]+[.!?]+["')\]]?|[^.!?]+$/g) ?? [normalized];
}

function getOverlapText(text: string, overlap: number) {
  if (text.length <= overlap) {
    return text;
  }

  const tail = text.slice(-overlap);
  const firstSpace = tail.indexOf(" ");

  return firstSpace >= 0 ? tail.slice(firstSpace + 1).trim() : tail.trim();
}

function splitLongSentence(sentence: string, chunkSize: number) {
  const words = sentence.split(" ");
  const parts: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length > chunkSize && current) {
      parts.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

export function chunkDocument(
  rawText: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): DocumentChunk[] {
  if (chunkSize <= overlap) {
    throw new Error("Chunk size must be greater than overlap.");
  }

  const sentences = splitIntoSentences(rawText).flatMap((sentence) => {
    const trimmed = sentence.trim();
    return trimmed.length > chunkSize
      ? splitLongSentence(trimmed, chunkSize)
      : [trimmed];
  });

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length > chunkSize && current) {
      chunks.push(current);
      const overlapText = getOverlapText(current, overlap);
      current = overlapText ? `${overlapText} ${sentence}` : sentence;
    } else {
      current = candidate;
    }
  }

  if (current.trim().length >= MIN_CHUNK_LENGTH || chunks.length === 0) {
    chunks.push(current.trim());
  }

  return chunks
    .map((text) => normalizeText(text))
    .filter(Boolean)
    .map((text, index) => ({
      chunkIndex: index,
      text,
    }));
}
