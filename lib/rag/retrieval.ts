import type { RetrievedChunk } from "./citations";
export function filterRetrievedChunks(chunks:RetrievedChunk[],userDocumentIds:Set<string>,threshold=.78,limit=6){return chunks.filter(chunk=>userDocumentIds.has(chunk.documentId)&&chunk.similarity>=threshold).sort((a,b)=>b.similarity-a.similarity).slice(0,limit)}
