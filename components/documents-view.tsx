"use client";

import {
  Calendar,
  ExternalLink,
  FileText,
  Filter,
  Layers3,
  MoreHorizontal,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { documents as initialDocuments, type DocumentStatus } from "../lib/demo-data";
import { deleteStoredDocument, listStoredDocuments, saveStoredDocument } from "../lib/demo-document-store";
import { extractPdfSummary } from "../lib/pdf/browser-extract";
import { PageHeader } from "./page-header";
import Link from "./safe-link";
import { StatusPill } from "./status-pill";

type DocumentRow = {
  id: string;
  name: string;
  file: string;
  pages: number;
  chunks: number;
  status: DocumentStatus;
  uploaded: string;
  size: string;
  previewUrl?: string;
};

export function DocumentsView() {
  const [docs, setDocs] = useState<DocumentRow[]>(initialDocuments);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<DocumentRow | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const visible = docs.filter(document =>
    `${document.name} ${document.status}`.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    let active = true;
    void listStoredDocuments().then(stored => {
      if (!active) return;
      const restored: DocumentRow[] = stored.map(document => ({
        id: document.id,
        name: document.name,
        file: document.file,
        pages: document.pages,
        chunks: document.chunks,
        status: "Ready",
        uploaded: document.uploaded,
        size: document.size,
        previewUrl: URL.createObjectURL(document.blob),
      }));
      setDocs(current => [...restored, ...current.filter(document => !restored.some(item => item.id === document.id))]);
    }).catch(() => setNotice("Saved local documents could not be restored."));
    return () => { active = false; };
  }, []);

  async function accept(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf") return setNotice("Only PDF documents are supported.");
    if (file.size > 20 * 1024 * 1024) return setNotice("This PDF exceeds the 20 MB upload limit.");
    if (!file.size) return setNotice("The selected PDF is empty.");

    setUploading(true);
    setNotice(`Processing ${file.name}…`);
    try {
      const result = await extractPdfSummary(file);
      const displayName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[-_]+/g, " ")
        .trim() || "Uploaded document";
      const size = file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      const document: DocumentRow = {
        id: crypto.randomUUID(),
        name: displayName,
        file: file.name,
        pages: result.pageCount,
        chunks: result.chunkCount,
        status: "Ready",
        uploaded: "Just now",
        size,
        previewUrl: URL.createObjectURL(file),
      };
      await saveStoredDocument({
        id: document.id,
        name: document.name,
        file: document.file,
        pages: document.pages,
        chunks: document.chunks,
        uploaded: document.uploaded,
        size: document.size,
        blob: file,
        textChunks: result.chunks,
      });
      setDocs(current => [document, ...current]);
      setNotice(`${file.name} was processed and added to this demo session.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This PDF could not be read. Try a text-based PDF.");
    } finally {
      setUploading(false);
    }
  }

  function openDetails(document: DocumentRow) {
    setMenuId(null);
    if (document.previewUrl) {
      setSelected(document);
      return;
    }
    window.location.assign(`/dashboard/documents/${document.id}`);
  }

  function removeDocument(document: DocumentRow) {
    if (document.previewUrl) URL.revokeObjectURL(document.previewUrl);
    if (document.previewUrl) void deleteStoredDocument(document.id);
    setDocs(current => current.filter(item => item.id !== document.id));
    setMenuId(null);
    setSelected(current => current?.id === document.id ? null : current);
  }

  return <main className="dashboard-page">
    <PageHeader
      eyebrow="KNOWLEDGE BASE"
      title="Documents"
      description="Upload and manage the source material RuleWise can search."
      actions={<button className="primary-button" disabled={uploading} onClick={() => input.current?.click()}><Upload size={16}/> {uploading ? "Processing…" : "Upload PDF"}</button>}
    />
    <section
      className={dragging ? "upload-zone dragging" : "upload-zone"}
      onDragOver={event => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => { event.preventDefault(); setDragging(false); void accept(event.dataTransfer.files[0]); }}
      aria-busy={uploading}
    >
      <input ref={input} type="file" accept="application/pdf" hidden onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void accept(file); }}/>
      <span className="upload-icon"><Upload size={21}/></span>
      <div><b>Drop a PDF here, or <button disabled={uploading} onClick={() => input.current?.click()}>browse files</button></b><p>PDF only · Maximum file size 20 MB · <a href="/demo/fictional-competition-rules.pdf" target="_blank">Download demo rulebook</a></p></div>
    </section>
    {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
    <section className="panel document-table-panel">
      <div className="table-toolbar"><div className="search-field"><Search size={16}/><input aria-label="Search documents" placeholder="Search documents" value={query} onChange={event => setQuery(event.target.value)}/></div><button className="filter-button"><Filter size={15}/> All statuses</button><span>{visible.length} documents</span></div>
      <div className="data-table" role="table" aria-label="Documents">
        <div className="table-head" role="row"><span>DOCUMENT</span><span>STATUS</span><span>PAGES</span><span>CHUNKS</span><span>UPLOADED</span><span><span className="sr-only">Actions</span></span></div>
        {visible.map(document => <div className="table-row" role="row" key={document.id}>
          {document.previewUrl
            ? <button className="table-document table-document-button" onClick={() => openDetails(document)}><DocumentIdentity document={document}/></button>
            : <Link href={`/dashboard/documents/${document.id}`} className="table-document"><DocumentIdentity document={document}/></Link>}
          <span><StatusPill status={document.status}/></span>
          <span data-label="Pages">{document.pages || "—"}</span>
          <span data-label="Chunks">{document.chunks || "—"}</span>
          <span data-label="Uploaded">{document.uploaded}</span>
          <span className="row-actions">
            <button aria-label={`Delete ${document.name}`} onClick={() => removeDocument(document)}><Trash2 size={15}/></button>
            <button aria-label={`More options for ${document.name}`} aria-haspopup="menu" aria-expanded={menuId === document.id} onClick={() => setMenuId(current => current === document.id ? null : document.id)}><MoreHorizontal size={17}/></button>
            {menuId === document.id && <div className="row-menu" role="menu">
              <button role="menuitem" onClick={() => openDetails(document)}>View details</button>
              {document.previewUrl && <a role="menuitem" href={document.previewUrl} target="_blank" rel="noreferrer">Open original PDF <ExternalLink size={13}/></a>}
              <button role="menuitem" className="danger" onClick={() => removeDocument(document)}>Delete document</button>
            </div>}
          </span>
        </div>)}
      </div>
      {!visible.length && <div className="empty-state"><FileText size={25}/><b>No documents found</b><p>Try a different name or status.</p></div>}
    </section>

    {selected && <div className="document-modal-backdrop">
      <section className="document-modal" role="dialog" aria-modal="true" aria-labelledby="uploaded-document-title">
        <header><div><p className="page-eyebrow">DOCUMENT DETAILS</p><h2 id="uploaded-document-title">{selected.name}</h2><p>{selected.file}</p></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close document details"><X size={20}/></button></header>
        <div className="document-summary"><div className="detail-file-icon"><FileText size={28}/></div><div><StatusPill status={selected.status}/><p>Processed and available in this RuleWise demo session.</p></div></div>
        <div className="detail-facts">
          <article><Calendar/><span>Uploaded<b>{selected.uploaded}</b></span></article>
          <article><FileText/><span>Page count<b>{selected.pages} pages</b></span></article>
          <article><Layers3/><span>Searchable chunks<b>{selected.chunks}</b></span></article>
        </div>
        <section className="document-preview" aria-label="PDF preview">
          <div><p className="page-eyebrow">DOCUMENT PREVIEW</p><span>{selected.file}</span></div>
          <iframe src={`${selected.previewUrl}#toolbar=1&navpanes=0`} title={`Preview of ${selected.name}`}/>
        </section>
        <footer><button className="secondary-button" onClick={() => setSelected(null)}>Close</button><a className="primary-button" href={selected.previewUrl} target="_blank" rel="noreferrer">Open original PDF <ExternalLink size={15}/></a></footer>
      </section>
    </div>}
  </main>;
}

function DocumentIdentity({ document }: { document: DocumentRow }) {
  return <><span className="file-icon"><FileText size={18}/></span><span><b>{document.name}</b><small>{document.file} · {document.size}</small></span></>;
}
