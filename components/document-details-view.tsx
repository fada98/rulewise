"use client";

import { ArrowLeft, Calendar, FileText, Layers3, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { documents, recentQuestions } from "../lib/demo-data";
import { listStoredDocuments, type StoredDocument } from "../lib/demo-document-store";
import { PageHeader } from "./page-header";
import Link from "./safe-link";
import { StatusPill } from "./status-pill";

export function DocumentDetailsView({ id }: { id: string }) {
  const builtIn = documents.find(document => document.id === id);
  const [stored, setStored] = useState<StoredDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(!builtIn);

  useEffect(() => {
    if (builtIn) return;
    let active = true;
    let objectUrl = "";
    void listStoredDocuments().then(items => {
      if (!active) return;
      const match = items.find(document => document.id === id) ?? null;
      setStored(match);
      if (match) {
        objectUrl = URL.createObjectURL(match.blob);
        setPreviewUrl(objectUrl);
      }
      setLoading(false);
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [builtIn, id]);

  if (loading) return <main className="dashboard-page"><div className="searching-state" role="status"><span className="search-pulse"/><div><b>Opening document</b><small>Loading the PDF saved on this device…</small></div></div></main>;

  if (!builtIn && !stored) return <main className="dashboard-page">
    <Link href="/dashboard/documents" className="back-link"><ArrowLeft size={15}/> Back to documents</Link>
    <section className="panel empty-state"><FileText size={25}/><b>Document not found on this device</b><p>Upload the PDF again so RuleWise can index it for questions.</p></section>
  </main>;

  const document = builtIn ?? { ...stored!, status: "Ready" as const };
  const askUrl = `/dashboard/ask?document=${encodeURIComponent(document.id)}`;

  return <main className="dashboard-page">
    <Link href="/dashboard/documents" className="back-link"><ArrowLeft size={15}/> Back to documents</Link>
    <PageHeader eyebrow="DOCUMENT DETAILS" title={document.name} description={document.file} actions={<Link href={askUrl} className="primary-button"><MessageSquareText size={16}/> Ask this document</Link>}/>
    <div className="detail-grid">
      <section className="document-summary"><div className="detail-file-icon"><FileText size={28}/></div><div><StatusPill status={document.status}/><p>{stored ? "Saved to your private account and ready for questions." : "Indexed and available for questions across your workspace."}</p></div></section>
      <section className="detail-facts"><article><Calendar/><span>Uploaded<b>{document.uploaded}</b></span></article><article><FileText/><span>Page count<b>{document.pages} pages</b></span></article><article><Layers3/><span>Searchable chunks<b>{document.chunks}</b></span></article></section>
    </div>
    {stored && previewUrl && <section className="document-preview detail-pdf-preview" aria-label="PDF preview"><div><p className="page-eyebrow">DOCUMENT PREVIEW</p><span>{stored.file}</span></div><iframe src={`${previewUrl}#toolbar=1&navpanes=0`} title={`Preview of ${stored.name}`}/></section>}
    <section className="panel detail-section"><div className="panel-heading"><div><h2>Recent questions</h2><p>Answers that used this document as evidence</p></div></div>{stored ? <div className="empty-state compact"><MessageSquareText size={20}/><b>No questions yet</b><p>Choose “Ask this document” to start.</p></div> : recentQuestions.slice(0,2).map(question => <div className="question-row" key={question.question}><MessageSquareText size={16}/><span className="question-content"><b>{question.question}</b><small>{question.time} · {question.sources} sources</small></span></div>)}</section>
    <details className="chunk-details"><summary>Inspect extracted text <span>Developer view</span></summary><div>{stored ? stored.textChunks.slice(0,3).map((chunk, index) => <div className="extracted-chunk" key={`${chunk.pageNumber}-${index}`}><p className="page-eyebrow">CHUNK {index + 1} · PAGE {chunk.pageNumber}</p><p>{chunk.content}</p></div>) : <><p className="page-eyebrow">CHUNK 47 · PAGE 24 · SIMILARITY 0.932</p><p>The player taking the restart must not touch the ball a second time until it has touched another player.</p></>}</div></details>
  </main>;
}
