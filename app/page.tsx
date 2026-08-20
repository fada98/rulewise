import Link from "@/components/safe-link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "RuleWise | Answers Grounded in Your Documents" },
  description: "Upload rulebooks, policies, manuals and procedures. Ask questions and receive evidence-based answers with clear source citations.",
};

const EvidenceMark = () => <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;

export default function Home() {
  return (
    <main className="landing">
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" className="brand"><EvidenceMark />RuleWise</Link>
        <div className="nav-links">
          <a href="#workflow">How it works</a><a href="#use-cases">Use cases</a><Link href="/signin">Sign in</Link>
          <Link href="/dashboard" className="button button-small">Open workspace</Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> DOCUMENT-GROUNDED KNOWLEDGE</p>
          <h1>Ask your documents.<br />Get answers you can <em>verify.</em></h1>
          <p className="hero-lede">Upload rulebooks, policies, manuals, and procedures. RuleWise finds the relevant evidence and returns concise answers with source citations.</p>
          <div className="hero-actions">
            <Link href="/dashboard/documents" className="button">Start with a document <span>→</span></Link>
            <a href="#workflow" className="text-link">See how it works <span>↓</span></a>
          </div>
          <div className="trust-note"><span>✓</span> Answers stay within your sources</div>
        </div>
        <div className="product-preview" aria-label="RuleWise product preview">
          <div className="preview-topbar"><div className="preview-brand"><EvidenceMark /> RuleWise</div><span className="preview-user">JD</span></div>
          <div className="preview-body">
            <aside className="preview-sidebar"><span className="active">⌂ <b>Overview</b></span><span>▤ Documents</span><span>◌ Ask</span><span>↺ History</span></aside>
            <div className="preview-main">
              <div className="preview-context"><span>ASKING ACROSS</span><b>3 selected documents</b></div>
              <div className="question-bubble">Can a player touch the ball twice after taking a restart?</div>
              <article className="answer-card">
                <header><span className="answer-icon">R</span><b>Grounded answer</b><span className="confidence">HIGH CONFIDENCE</span></header>
                <p>No. The player taking the restart may not touch the ball again until another player has touched it.</p>
                <div className="source-list"><b>Sources</b>
                  <div><span className="source-number">1</span><p><strong>Competition Rules 2026</strong><small>Page 24 · Restart procedures</small></p><span>↗</span></div>
                  <div><span className="source-number">2</span><p><strong>Official Procedures</strong><small>Page 11 · Ball in play</small></p><span>↗</span></div>
                </div>
              </article>
            </div>
          </div>
          <div className="preview-caption"><span>VERIFIABLE BY DESIGN</span><p>Every response traces back to the exact document and page.</p></div>
        </div>
      </section>
      <section className="principles-strip" aria-label="RuleWise principles"><span>01 <b>Evidence first</b></span><span>02 <b>Precise retrieval</b></span><span>03 <b>Clear citations</b></span><span>04 <b>Honest uncertainty</b></span></section>
      <section className="landing-section workflow" id="workflow"><div className="section-intro"><p className="eyebrow"><span/>HOW IT WORKS</p><h2>From document to defensible answer.</h2><p>A focused retrieval process turns dense reference material into answers your team can check.</p></div><div className="workflow-steps"><article><span>01</span><h3>Upload your sources</h3><p>Add the rulebooks, policies, procedures, and manuals your work depends on.</p></article><article><span>02</span><h3>RuleWise indexes them</h3><p>Text is organized into searchable passages while preserving document and page references.</p></article><article><span>03</span><h3>Ask and verify</h3><p>Receive a concise response alongside the exact evidence used to support it.</p></article></div></section>
      <section className="evidence-showcase"><div><p className="eyebrow"><span/>EVIDENCE, NOT ASSERTIONS</p><h2>The source is part of the answer.</h2><p>Every response preserves its relationship to the underlying document, page, and passage. When the evidence is weak, RuleWise says so.</p><Link href="/dashboard/ask" className="text-link">Explore the answer workspace <span>→</span></Link></div><article><header><span className="answer-icon">R</span><b>Grounded answer</b><small>2 SOURCES</small></header><p>A written appeal must be submitted within five business days of the decision notice.</p><div><span>1</span><p><b>Competition Rules 2026</b><small>Page 38 · Appeals</small></p></div><div><span>2</span><p><b>Official Procedures</b><small>Page 19 · Decision notices</small></p></div></article></section>
      <section className="landing-section use-cases" id="use-cases"><div className="section-intro"><p className="eyebrow"><span/>BUILT FOR REFERENCE-HEAVY WORK</p><h2>When the exact wording matters.</h2></div><div className="use-case-grid"><article><span>01</span><h3>Sporting rulebooks</h3><p>Resolve edge cases with the relevant clause at hand.</p></article><article><span>02</span><h3>Company policies</h3><p>Give employees consistent answers without guesswork.</p></article><article><span>03</span><h3>Compliance manuals</h3><p>Connect operational questions to approved guidance.</p></article><article><span>04</span><h3>Technical procedures</h3><p>Find critical steps across long, dense manuals.</p></article></div></section>
      <section className="reliability"><p className="page-eyebrow">RELIABILITY BY DESIGN</p><h2>It is better to say “not found”<br/>than to invent an answer.</h2><p>RuleWise only answers from retrieved document evidence. If the selected sources do not contain enough information, you get a clear, honest response—not a plausible guess.</p><div><span>Restricted to your documents</span><span>Source metadata outside the model</span><span>Feedback and evaluation loop</span></div></section>
      <section className="landing-cta"><div><p className="eyebrow"><span/>START WITH THE SOURCE</p><h2>Turn your documents into answers you can trust.</h2></div><Link href="/dashboard/documents" className="button">Upload your first document <span>→</span></Link></section>
      <footer className="site-footer"><BrandFooter/><p>Knowledge Assistant for Rules, Policies & Documentation</p><div><Link href="/signin">Sign in</Link><a href="#workflow">How it works</a><span>© 2026 RuleWise</span></div></footer>
    </main>
  );
}

function BrandFooter(){return <Link href="/" className="brand"><EvidenceMark/>RuleWise</Link>}
