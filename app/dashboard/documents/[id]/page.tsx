import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Layers3, MessageSquareText } from "lucide-react";
import { PageHeader } from "../../../../components/page-header";
import { StatusPill } from "../../../../components/status-pill";
import { documents, recentQuestions } from "../../../../lib/demo-data";

export default async function DocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const doc = documents.find(d=>d.id===id) ?? documents[0];
  return <main className="dashboard-page"><Link href="/dashboard/documents" className="back-link"><ArrowLeft size={15}/> Back to documents</Link>
    <PageHeader eyebrow="DOCUMENT DETAILS" title={doc.name} description={doc.file} actions={<Link href="/dashboard/ask" className="primary-button"><MessageSquareText size={16}/> Ask this document</Link>}/>
    <div className="detail-grid"><section className="document-summary"><div className="detail-file-icon"><FileText size={28}/></div><div><StatusPill status={doc.status}/><p>Indexed and available for questions across your workspace.</p></div></section>
      <section className="detail-facts"><article><Calendar/><span>Uploaded<b>{doc.uploaded}</b></span></article><article><FileText/><span>Page count<b>{doc.pages} pages</b></span></article><article><Layers3/><span>Searchable chunks<b>{doc.chunks}</b></span></article></section></div>
    <section className="panel detail-section"><div className="panel-heading"><div><h2>Recent questions</h2><p>Answers that used this document as evidence</p></div></div>{recentQuestions.slice(0,2).map(q=><div className="question-row" key={q.question}><MessageSquareText size={16}/><span className="question-content"><b>{q.question}</b><small>{q.time} · {q.sources} sources</small></span></div>)}</section>
    <details className="chunk-details"><summary>Inspect extracted text <span>Developer view</span></summary><div><p className="page-eyebrow">CHUNK 47 · PAGE 24 · SIMILARITY 0.932</p><p>The player taking the restart must not touch the ball a second time until it has touched another player.</p></div></details>
  </main>;
}
