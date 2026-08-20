import Link from "@/components/safe-link";
import { ArrowRight, CircleAlert, FileText, MessageSquareText, MoreHorizontal, Plus, ThumbsUp } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { StatusPill } from "../../components/status-pill";
import { documents, recentQuestions } from "../../lib/demo-data";

export default function OverviewPage() {
  return <main className="dashboard-page">
    <PageHeader eyebrow="THURSDAY, 20 AUGUST" title="Good morning, Alex" description="Here’s what is happening across your document workspace." actions={<><Link href="/dashboard/ask" className="secondary-button"><MessageSquareText size={16}/> Ask a question</Link><Link href="/dashboard/documents" className="primary-button"><Plus size={16}/> Add document</Link></>}/>
    <section className="metric-row" aria-label="Workspace metrics">
      <article><p>Documents indexed</p><strong>8</strong><span className="metric-delta">+2 this month</span></article>
      <article><p>Questions asked</p><strong>142</strong><span>Last 30 days</span></article>
      <article><p>Helpful answers</p><strong>91<small>%</small></strong><span className="metric-delta">↑ 4.2%</span></article>
      <article><p>Needs review</p><strong>7</strong><span className="metric-alert"><CircleAlert size={13}/> 3 new</span></article>
    </section>
    <div className="overview-grid">
      <section className="panel recent-documents"><div className="panel-heading"><div><h2>Recent documents</h2><p>Latest additions to your knowledge base</p></div><Link href="/dashboard/documents">View all <ArrowRight size={14}/></Link></div>
        <div className="document-list">{documents.slice(0,4).map((doc)=><Link href={`/dashboard/documents/${doc.id}`} className="document-row" key={doc.id}><span className="file-icon"><FileText size={18}/></span><span className="document-name"><b>{doc.name}</b><small>{doc.pages ? `${doc.pages} pages · `:""}{doc.uploaded}</small></span><StatusPill status={doc.status}/><span className="chunk-count">{doc.status === "Ready" ? `${doc.chunks} chunks` : "Indexing…"}</span><MoreHorizontal size={17}/></Link>)}</div>
      </section>
      <aside className="processing-panel"><div className="processing-top"><span className="process-icon"><FileText size={20}/></span><div><p>INDEXING IN PROGRESS</p><h3>Venue Safety Protocol</h3></div></div><div className="progress-track"><i /></div><div className="progress-meta"><span>Extracting page 19 of 31</span><b>61%</b></div><p className="processing-note">You can leave this page. We’ll notify you when the document is ready.</p></aside>
      <section className="panel recent-questions"><div className="panel-heading"><div><h2>Recent questions</h2><p>Latest answers across your workspace</p></div><Link href="/dashboard/history">View history <ArrowRight size={14}/></Link></div>
        <div>{recentQuestions.map((item,i)=><Link href="/dashboard/ask" className="question-row" key={item.question}><span className="question-index">{String(i+1).padStart(2,"0")}</span><span className="question-content"><b>{item.question}</b><small>{item.sources} sources · {item.time}</small></span>{item.helpful ? <span className="helpful"><ThumbsUp size={13}/> Helpful</span>:<span className="incorrect"><CircleAlert size={13}/> Review</span>}<ArrowRight size={16}/></Link>)}</div>
      </section>
      <aside className="feedback-summary"><p className="page-eyebrow">QUALITY SIGNAL</p><strong>91%</strong><h3>Answers marked helpful</h3><p>Based on 54 responses collected in the last 30 days.</p><div className="feedback-bar"><i /></div><Link href="/dashboard/feedback">Review feedback <ArrowRight size={14}/></Link></aside>
    </div>
  </main>;
}
