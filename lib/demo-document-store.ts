"use client";

import { getSupabaseClient } from "./supabase/client";
import type { TextChunk } from "./rag/chunking";

export type StoredDocument = {
  id: string;
  name: string;
  file: string;
  pages: number;
  chunks: number;
  uploaded: string;
  size: string;
  blob: Blob;
  textChunks: TextChunk[];
};

async function currentUser() {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error || !data.user) throw new Error("Sign in to access your documents.");
  return data.user;
}

export async function saveStoredDocument(document: StoredDocument) {
  const supabase = getSupabaseClient();
  const user = await currentUser();
  const storagePath = `${user.id}/${document.id}-${document.file.replace(/[^a-zA-Z0-9._-]+/g, "-")}`;
  const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, document.blob, { contentType: "application/pdf", upsert: false });
  if (uploadError) throw uploadError;
  const { error: documentError } = await supabase.from("documents").insert({
    id: document.id,
    user_id: user.id,
    name: document.name,
    original_name: document.file,
    storage_path: storagePath,
    page_count: document.pages,
    chunk_count: document.chunks,
    size_label: document.size,
  });
  if (documentError) {
    await supabase.storage.from("documents").remove([storagePath]);
    throw documentError;
  }
  if (document.textChunks.length) {
    const { error: chunkError } = await supabase.from("document_chunks").insert(document.textChunks.map(chunk => ({
      document_id: document.id,
      user_id: user.id,
      page_number: chunk.pageNumber,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
    })));
    if (chunkError) {
      await supabase.from("documents").delete().eq("id", document.id);
      await supabase.storage.from("documents").remove([storagePath]);
      throw chunkError;
    }
  }
}

export async function listStoredDocuments() {
  const supabase = getSupabaseClient();
  const user = await currentUser();
  const { data: documentRows, error: documentError } = await supabase.from("documents")
    .select("id,name,original_name,storage_path,page_count,chunk_count,size_label,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (documentError) throw documentError;
  const ids = (documentRows ?? []).map(row => row.id);
  const { data: chunkRows, error: chunkError } = ids.length
    ? await supabase.from("document_chunks").select("document_id,page_number,chunk_index,content").in("document_id", ids).order("chunk_index")
    : { data: [], error: null };
  if (chunkError) throw chunkError;

  return Promise.all((documentRows ?? []).map(async row => {
    const { data: blob, error: downloadError } = await supabase.storage.from("documents").download(row.storage_path);
    if (downloadError) throw downloadError;
    return {
      id: row.id,
      name: row.name,
      file: row.original_name,
      pages: row.page_count,
      chunks: row.chunk_count,
      uploaded: new Date(row.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      size: row.size_label,
      blob,
      textChunks: (chunkRows ?? []).filter(chunk => chunk.document_id === row.id).map(chunk => ({ pageNumber: chunk.page_number, chunkIndex: chunk.chunk_index, content: chunk.content })),
    } satisfies StoredDocument;
  }));
}

export async function deleteStoredDocument(id: string) {
  const supabase = getSupabaseClient();
  const user = await currentUser();
  const { data } = await supabase.from("documents").select("storage_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (data?.storage_path) await supabase.storage.from("documents").remove([data.storage_path]);
  const { error } = await supabase.from("documents").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
}
