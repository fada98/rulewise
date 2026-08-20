import { extractPdfPages, safeFilename } from "../../../../lib/pdf/extract";
import { chunkPages } from "../../../../lib/rag/chunking";
import { validatePdf } from "../../../../lib/validation";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Select a PDF to upload." }, { status: 400 });
  }

  const valid = validatePdf(file);
  if (!valid.ok) {
    return Response.json({ error: valid.error }, { status: 400 });
  }

  try {
    const pages = await extractPdfPages(new Uint8Array(await file.arrayBuffer()));
    const chunks = chunkPages(pages);

    if (!chunks.length) {
      return Response.json(
        { error: "No selectable text was found in this PDF." },
        { status: 422 },
      );
    }

    return Response.json(
      {
        id: crypto.randomUUID(),
        filename: safeFilename(file.name),
        originalName: file.name,
        pageCount: pages.length,
        chunkCount: chunks.length,
        status: "Ready",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Demo PDF processing failed", error);
    return Response.json(
      { error: "This PDF could not be read. Try a text-based PDF." },
      { status: 422 },
    );
  }
}
