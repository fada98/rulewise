"use client";
import Link from "./safe-link";
import { FileText, Filter, MoreHorizontal, Search, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { documents as initialDocuments, type DocumentStatus } from "../lib/demo-data";
import { extractPdfSummary } from "../lib/pdf/browser-extract";
import { PageHeader } from "./page-header";
import { StatusPill } from "./status-pill";

export function DocumentsView() {
  type DocumentRow = {
    id: string;
    name: string;
    file: string;
    pages: number;
    chunks: number;
    status: DocumentStatus;
    uploaded: string;
    size: string;
  };
  const [docs, setDocs] = useState<DocumentRow[]>(initialDocuments);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const visible = docs.filter(d => `${d.name} ${d.status}`.toLowerCase().includes(query.toLowerCase()));
  async function accept(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf") return setNotice("Only PDF documents are supported.");
    if (file.size > 20 * 1024 * 1024) return setNotice("This PDF exceeds the 20 MB upload limit.");
    if (!file.size) return setNotice("The selected PDF is empty.");

    setUploading(true);
    setNotice(`Processing ${file.name}…`);
    try {
      const result = await extractPdfSummary(file);

      const displayName = file.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim() || "Uploaded document";
      const size = file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      setDocs(current => [{
        id: crypto.randomUUID(),
        name: displayName,
        file: file.name,
        pages: result.pageCount,
        chunks: result.chunkCount,
        status: "Ready",
        uploaded: "Just now",
        size,
      }, ...current]);
      setNotice(`${file.name} was processed and added to this demo session.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This PDF could not be read. Try a text-based PDF.");
    } finally {
      setUploading(false);
    }
  }
  return <main className="dashboard-page">
    <PageHeader eyebrow="KNOWLEDGE BASE" title="Documents" description="Upload and manage the source material RuleWise can search." actions={<button className="primary-button" disabled={uploading} onClick={()=>input.current?.click()}><Upload size={16}/> {uploading ? "Processing…" : "Upload PDF"}</button>}/>
    <section className={dragging ? "upload-zone dragging" : "upload-zone"} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);void accept(e.dataTransfer.files[0])}} aria-busy={uploading}>
      <input ref={input} type="file" accept="application/pdf" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value="";void accept(file)}}/><span className="upload-icon"><Upload size={21}/></span><div><b>Drop a PDF here, or <button disabled={uploading} onClick={()=>input.current?.click()}>browse files</button></b><p>PDF only · Maximum file size 20 MB · <a href="/demo/fictional-competition-rules.pdf" target="_blank">Download demo rulebook</a></p></div>
    </section>
    {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
    <section className="panel document-table-panel">
      <div className="table-toolbar"><div className="search-field"><Search size={16}/><input aria-label="Search documents" placeholder="Search documents" value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="filter-button"><Filter size={15}/> All statuses</button><span>{visible.length} documents</span></div>
      <div className="data-table" role="table" aria-label="Documents">
        <div className="table-head" role="row"><span>DOCUMENT</span><span>STATUS</span><span>PAGES</span><span>CHUNKS</span><span>UPLOADED</span><span><span className="sr-only">Actions</span></span></div>
        {visible.map(doc=><div className="table-row" role="row" key={doc.id}><Link href={`/dashboard/documents/${doc.id}`} className="table-document"><span className="file-icon"><FileText size={18}/></span><span><b>{doc.name}</b><small>{doc.file} · {doc.size}</small></span></Link><span><StatusPill status={doc.status}/></span><span data-label="Pages">{doc.pages || "—"}</span><span data-label="Chunks">{doc.chunks || "—"}</span><span data-label="Uploaded">{doc.uploaded}</span><span className="row-actions"><button aria-label={`Delete ${doc.name}`} onClick={()=>setDocs(docs.filter(d=>d.id!==doc.id))}><Trash2 size={15}/></button><button aria-label={`More options for ${doc.name}`}><MoreHorizontal size={17}/></button></span></div>)}
      </div>
      {!visible.length && <div className="empty-state"><FileText size={25}/><b>No documents found</b><p>Try a different name or status.</p></div>}
    </section>
  </main>;
}
