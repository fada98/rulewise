"use client";

import { chunkPages } from "../rag/chunking";

export async function extractPdfSummary(file: File) {
  const [{ getDocument }, { WorkerMessageHandler }] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ]);
  const pdfjsGlobal = globalThis as typeof globalThis & {
    pdfjsWorker?: { WorkerMessageHandler: typeof WorkerMessageHandler };
  };
  pdfjsGlobal.pdfjsWorker ??= { WorkerMessageHandler };

  const loadingTask = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map(item => ("str" in item ? item.str : ""))
        .join(" ");
      pages.push({ pageNumber, text });
    }

    const chunks = chunkPages(pages);
    if (!chunks.length) throw new Error("No selectable text was found in this PDF.");
    return { pageCount: pages.length, chunkCount: chunks.length };
  } finally {
    if (typeof loadingTask.destroy === "function") {
      await loadingTask.destroy();
    }
  }
}
