"use client";

import type { StoredDocument } from "./demo-document-store";
import type { TextChunk } from "./rag/chunking";

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
const MODEL_ID = "Xenova/distilbert-base-cased-distilled-squad";

type AnswerOutput = { answer: string; score: number };
type QuestionAnswerer = (question: string, context: string) => Promise<AnswerOutput>;
type PipelineFactory = (
  task: "question-answering",
  model: string,
  options?: { progress_callback?: (progress: { status?: string; progress?: number }) => void },
) => Promise<QuestionAnswerer>;

export type GroundedSource = {
  id: number;
  document: string;
  page: number;
  section: string;
  score: number;
  excerpt: string;
};

let answererPromise: Promise<QuestionAnswerer> | null = null;

async function getAnswerer(onProgress?: (message: string) => void) {
  if (!answererPromise) {
    answererPromise = (async () => {
      onProgress?.("Downloading the local question-answering model…");
      const moduleUrl = TRANSFORMERS_URL;
      const transformers = await import(/* @vite-ignore */ moduleUrl) as { pipeline: PipelineFactory };
      return transformers.pipeline("question-answering", MODEL_ID, {
        progress_callback: progress => {
          if (progress.status === "progress" && typeof progress.progress === "number") {
            onProgress?.(`Loading local model… ${Math.round(progress.progress)}%`);
          }
        },
      });
    })();
  }
  return answererPromise;
}

function tokens(value: string) {
  return value.toLocaleLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
}

function lexicalScore(question: string, chunk: TextChunk) {
  const queryTokens = [...new Set(tokens(question))];
  const text = chunk.content.toLocaleLowerCase();
  if (!queryTokens.length) return 0;
  const matches = queryTokens.reduce((score, token) => score + (text.includes(token) ? 1 : 0), 0);
  return matches / queryTokens.length;
}

export async function answerStoredDocuments(
  question: string,
  documents: StoredDocument[],
  onProgress?: (message: string) => void,
) {
  const candidates = documents
    .flatMap(document => document.textChunks.map(chunk => ({ document, chunk, retrievalScore: lexicalScore(question, chunk) })))
    .sort((left, right) => right.retrievalScore - left.retrievalScore)
    .slice(0, 3);

  if (!candidates.length || candidates[0].retrievalScore === 0) {
    return { answer: "I couldn't find enough information in the selected documents to answer this reliably.", noAnswer: true, sources: [] as GroundedSource[] };
  }

  const answerer = await getAnswerer(onProgress);
  onProgress?.("Reading the strongest matching passages…");
  const evaluated = await Promise.all(candidates.map(async candidate => ({
    ...candidate,
    model: await answerer(question, candidate.chunk.content),
  })));
  evaluated.sort((left, right) => right.model.score - left.model.score);
  const best = evaluated[0];

  if (!best.model.answer.trim() || best.model.score < 0.08) {
    return { answer: "I couldn't find enough information in the selected documents to answer this reliably.", noAnswer: true, sources: [] as GroundedSource[] };
  }

  const sources = evaluated.slice(0, 2).map((item, index) => ({
    id: index + 1,
    document: item.document.name,
    page: item.chunk.pageNumber,
    section: "Uploaded document",
    score: Math.max(item.retrievalScore, item.model.score),
    excerpt: item.chunk.content.length > 260 ? `${item.chunk.content.slice(0, 257)}…` : item.chunk.content,
  }));
  return { answer: best.model.answer.trim(), noAnswer: false, sources };
}
