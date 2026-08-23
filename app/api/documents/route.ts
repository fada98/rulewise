import { createEmbeddings } from "../../../lib/openai/server";
import { chunkPages } from "../../../lib/rag/chunking";
import { extractPdfPages, safeFilename } from "../../../lib/pdf/extract";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { validatePdf } from "../../../lib/validation";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });

  const supabase = createSupabaseServerClient(auth);
  const { data: { user } } = await supabase.auth.getUser(auth);
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Select a PDF to upload." }, { status: 400 });
  const valid = validatePdf(file);
  if (!valid.ok) return Response.json({ error: valid.error }, { status: 400 });

  const documentId = crypto.randomUUID();
  const storagePath = `${user.id}/${documentId}-${safeFilename(file.name)}`;
  const displayName = file.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim() || "Uploaded document";
  const sizeLabel = file.size >= 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(file.size / 1024))} KB`;

  const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, file, { contentType: "application/pdf" });
  if (uploadError) return Response.json({ error: "The PDF could not be uploaded." }, { status: 500 });

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: user.id,
    name: displayName,
    original_name: file.name,
    storage_path: storagePath,
    page_count: 0,
    chunk_count: 0,
    size_label: sizeLabel,
    status: "Processing",
  });
  if (insertError) {
    await supabase.storage.from("documents").remove([storagePath]);
    return Response.json({ error: "Document metadata could not be saved." }, { status: 500 });
  }

  try {
    const pages = await extractPdfPages(new Uint8Array(await file.arrayBuffer()));
    const chunks = chunkPages(pages);
    if (!chunks.length) throw new Error("No extractable text found");
    const embedded = await createEmbeddings(chunks.map(chunk => chunk.content));
    const rows = chunks.map((chunk, index) => ({
      document_id: documentId,
      user_id: user.id,
      page_number: chunk.pageNumber,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: embedded[index],
    }));
    const { error: chunkError } = await supabase.from("document_chunks").insert(rows);
    if (chunkError) throw chunkError;
    await supabase.from("documents").update({ status: "Ready", page_count: pages.length, chunk_count: chunks.length }).eq("id", documentId).eq("user_id", user.id);
    return Response.json({ id: documentId, status: "Ready", pageCount: pages.length, chunkCount: chunks.length }, { status: 201 });
  } catch (error) {
    await supabase.from("documents").update({ status: "Failed" }).eq("id", documentId).eq("user_id", user.id);
    console.error("Document indexing failed", error);
    return Response.json({ error: "The PDF could not be indexed. Check that it contains selectable text." }, { status: 422 });
  }
}

export async function DELETE(request: Request) {
  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Document id is required." }, { status: 400 });

  const supabase = createSupabaseServerClient(auth);
  const { data: { user } } = await supabase.auth.getUser(auth);
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { data: document } = await supabase.from("documents").select("storage_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!document) return Response.json({ error: "Document not found." }, { status: 404 });
  await supabase.storage.from("documents").remove([document.storage_path]);
  const { error } = await supabase.from("documents").delete().eq("id", id).eq("user_id", user.id);
  if (error) return Response.json({ error: "Document could not be deleted." }, { status: 500 });
  return Response.json({ ok: true });
}
