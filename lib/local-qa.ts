"use client";

import type { StoredDocument } from "./demo-document-store";
import type { TextChunk } from "./rag/chunking";

export type GroundedSource = {
  id: number;
  document: string;
  page: number;
  section: string;
  score: number;
  excerpt: string;
};

const STOP_WORDS = new Set([
  "about", "are", "does", "for", "from", "how", "is", "that", "the", "this", "was", "were", "what", "when", "where", "which", "who", "with",
  "был", "была", "были", "быть", "где", "для", "есть", "как", "какой", "когда", "кто", "что", "это",
  "бути", "для", "коли", "хто", "цей", "ця", "це", "що", "який", "яка", "яке", "є",
]);

function rawTokens(value: string) {
  return value.toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? [];
}

function stem(token: string) {
  if (/^\d+$/.test(token) || token.length <= 4) return token;
  return token
    .replace(/(иями|ями|ами|ого|ему|ими|ий|ый|ая|ое|ие|ых|их|ую|юю|ом|ем|ам|ям|ах|ях|ів|ами|ями|ого|ому|ими|ий|а|я|и|ы|у|ю|е|о|і|ї|є)$/u, "")
    .replace(/(ing|edly|ed|es|s)$/u, "");
}

function tokens(value: string) {
  return rawTokens(value).filter(token => !STOP_WORDS.has(token)).map(stem).filter(token => token.length >= 2);
}

function overlapScore(query: string[], text: string) {
  if (!query.length) return 0;
  const textTokens = new Set(tokens(text));
  const matches = query.filter(token => textTokens.has(token)).length;
  return matches / query.length;
}

function lexicalScore(question: string, chunk: TextChunk) {
  const query = [...new Set(tokens(question))];
  const base = overlapScore(query, chunk.content);
  const normalizedQuestion = rawTokens(question).join(" ");
  const normalizedChunk = rawTokens(chunk.content).join(" ");
  const phraseBoost = normalizedQuestion.length >= 6 && normalizedChunk.includes(normalizedQuestion) ? 0.35 : 0;
  return Math.min(1, base + phraseBoost);
}

function sentences(value: string) {
  const matches = value.replace(/\s+/g, " ").trim().match(/[^.!?\n]+(?:[.!?]+|$)/g);
  return (matches ?? [value]).map(sentence => sentence.trim()).filter(Boolean);
}

function bestPassage(question: string, content: string) {
  const query = [...new Set(tokens(question))];
  const options = sentences(content).map((sentence, index, all) => {
    const score = overlapScore(query, sentence);
    let answer = sentence;
    for (let offset = 1; offset <= 4; offset += 1) {
      const next = all[index + offset];
      if (!next || /^\d+(?:\.\d+)*\.\s/u.test(next)) break;
      const fileExtension = /«[^»]*[_/\\][^»]*\.$/u.test(answer) && /^[\p{L}\p{N}]{1,8}[»"')\]]*[.!?]?$/u.test(next);
      const separator = fileExtension ? "" : " ";
      const combinedLength = answer.length + next.length + separator.length;
      if (combinedLength > 460) break;
      answer += `${separator}${next}`;
      const openQuotes = (answer.match(/«/g) ?? []).length;
      const closeQuotes = (answer.match(/»/g) ?? []).length;
      if (answer.length >= 220 && openQuotes === closeQuotes && /[.!?]$/u.test(answer)) break;
    }
    return { answer, score };
  }).sort((left, right) => right.score - left.score || left.answer.length - right.answer.length);
  return options[0] ?? { answer: content.slice(0, 420), score: 0 };
}

export async function answerStoredDocuments(
  question: string,
  documents: StoredDocument[],
  onProgress?: (message: string) => void,
) {
  onProgress?.("Searching the extracted PDF text on this device…");
  const candidates = documents
    .flatMap(document => document.textChunks.map(chunk => ({ document, chunk, retrievalScore: lexicalScore(question, chunk) })))
    .sort((left, right) => right.retrievalScore - left.retrievalScore)
    .slice(0, 4);

  if (!candidates.length || candidates[0].retrievalScore < 0.12) {
    return { answer: "I couldn't find enough matching information in the selected PDF. Try using terms that appear in the document or ask in the document's language.", noAnswer: true, sources: [] as GroundedSource[] };
  }

  const evaluated = candidates.map(candidate => ({ ...candidate, passage: bestPassage(question, candidate.chunk.content) }))
    .sort((left, right) => (right.passage.score + right.retrievalScore) - (left.passage.score + left.retrievalScore));
  const best = evaluated[0];
  const sources = evaluated
    .filter((item, index, all) => index === all.findIndex(other => other.document.id === item.document.id && other.chunk.pageNumber === item.chunk.pageNumber))
    .slice(0, 2)
    .map((item, index) => ({
      id: index + 1,
      document: item.document.name,
      page: item.chunk.pageNumber,
      section: "Uploaded document",
      score: Math.min(0.99, Math.max(item.retrievalScore, item.passage.score)),
      excerpt: item.chunk.content.length > 260 ? `${item.chunk.content.slice(0, 257)}…` : item.chunk.content,
    }));

  return { answer: best.passage.answer, noAnswer: false, sources };
}
