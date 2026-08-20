"use client";

import { BookOpen, Check, ChevronDown, FileText, MessageSquarePlus, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { documents, retrievedSources } from "../lib/demo-data";
import { listStoredDocuments, type StoredDocument } from "../lib/demo-document-store";
import { answerStoredDocuments, type GroundedSource } from "../lib/local-qa";
import { PageHeader } from "./page-header";

type Message = {
  question: string;
  answer: string;
  noAnswer?: boolean;
  sources: GroundedSource[];
};

const examples = [
  "What are the requirements for a valid restart?",
  "Who completes the venue safety inspection?",
  "How long is the appeal window?",
];

export function AskView() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [localDocuments, setLocalDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Searching the extracted PDF text…");
  const [scope, setScope] = useState("all");
  const [feedback, setFeedback] = useState<"helpful" | "incorrect" | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const requestedDocument = new URLSearchParams(window.location.search).get("document");
    void listStoredDocuments().then(items => {
      setLocalDocuments(items);
      if (requestedDocument && (items.some(document => document.id === requestedDocument) || documents.some(document => document.id === requestedDocument))) {
        setScope(requestedDocument);
      }
    }).catch(() => setLocalDocuments([]));
  }, []);

  async function ask(value = question) {
    const currentQuestion = value.trim();
    if (!currentQuestion || loading) return;
    setQuestion("");
    setLoading(true);
    setLoadingMessage("Searching the extracted PDF text…");
    setFeedback(null);
    setSubmitted(false);

    try {
      const selectedLocalDocuments = scope === "all"
        ? localDocuments
        : localDocuments.filter(document => document.id === scope);
      const shouldUseLocalModel = selectedLocalDocuments.length > 0 &&
        (scope === "all" || selectedLocalDocuments.some(document => document.id === scope));

      if (shouldUseLocalModel) {
        const result = await answerStoredDocuments(currentQuestion, selectedLocalDocuments, setLoadingMessage);
        setMessages(current => [...current, {
          question: currentQuestion,
          answer: result.answer,
          noAnswer: result.noAnswer,
          sources: result.sources,
        }]);
      } else {
        const unknown = /parking|weather|salary/i.test(currentQuestion);
        setMessages(current => [...current, {
          question: currentQuestion,
          answer: unknown
            ? "I couldn’t find enough information in the selected documents to answer this reliably."
            : "No. The player taking the restart may not touch the ball again until another player has touched it.",
          noAnswer: unknown,
          sources: unknown ? [] : retrievedSources,
        }]);
      }
    } catch (error) {
      console.error("Local question answering failed", error);
      setMessages(current => [...current, {
        question: currentQuestion,
        answer: "The PDF text could not be searched. Re-upload the document and try again.",
        noAnswer: true,
        sources: [],
      }]);
    } finally {
      setLoading(false);
    }
  }

  const latestSources = messages.at(-1)?.sources ?? [];
  const selectedLocal = localDocuments.find(document => document.id === scope);
  const scopeSummary = scope === "all"
    ? `${documents.filter(document => document.status === "Ready").length + localDocuments.length} documents · ${358 + localDocuments.reduce((sum, document) => sum + document.chunks, 0)} searchable chunks`
    : selectedLocal
      ? `${selectedLocal.chunks} searchable chunks · on-device search`
      : "1 selected document";

  return <main className="dashboard-page ask-page">
    <PageHeader
      eyebrow="GROUNDED Q&A"
      title="Ask your documents"
      description="Get concise answers supported by exact source pages."
      actions={<button className="secondary-button" onClick={() => { setMessages([]); setFeedback(null); }}><MessageSquarePlus size={16}/> New conversation</button>}
    />
    <div className="ask-layout">
      <section className="chat-surface">
        <div className="scope-bar"><span>SEARCHING</span><label><BookOpen size={16}/><select value={scope} onChange={event => setScope(event.target.value)} aria-label="Documents to search"><option value="all">All ready documents</option>{localDocuments.length > 0 && <optgroup label="Uploaded on this device">{localDocuments.map(document => <option key={document.id} value={document.id}>{document.name}</option>)}</optgroup>}<optgroup label="Demo documents">{documents.filter(document => document.status === "Ready").map(document => <option key={document.id} value={document.id}>{document.name}</option>)}</optgroup></select><ChevronDown size={14}/></label><small>{scopeSummary}</small></div>
        {!messages.length && !loading
          ? <div className="ask-empty"><span className="ask-empty-icon"><BookOpen/></span><h2>What would you like to verify?</h2><p>{localDocuments.length ? "Your uploaded PDFs are ready for private, on-device question answering." : "Upload a PDF to search and ask questions without an API key."}</p><div className="example-questions">{examples.map(example => <button key={example} onClick={() => void ask(example)}>{example}<span>→</span></button>)}</div></div>
          : <div className="conversation">
            {messages.map((message, index) => <div className="message-group" key={`${message.question}-${index}`}><div className="user-message"><span>YOU</span><p>{message.question}</p></div><article className={message.noAnswer ? "assistant-message no-answer" : "assistant-message"}><header><span className="answer-icon">R</span><b>RuleWise</b><small>{message.noAnswer ? "INSUFFICIENT EVIDENCE" : `GROUNDED IN ${message.sources.length} SOURCE${message.sources.length === 1 ? "" : "S"}`}</small></header><p>{message.answer}</p>{message.sources.length > 0 && <div className="inline-citations">{message.sources.map(source => <button key={source.id}><span>{source.id}</span>{source.document} · p. {source.page}</button>)}</div>}<footer><span>Was this answer useful?</span><button className={feedback === "helpful" && index === messages.length - 1 ? "selected" : ""} onClick={() => setFeedback("helpful")}><ThumbsUp size={14}/> Helpful</button><button className={feedback === "incorrect" && index === messages.length - 1 ? "selected" : ""} onClick={() => setFeedback("incorrect")}><ThumbsDown size={14}/> Incorrect</button></footer>{index === messages.length - 1 && feedback === "incorrect" && !submitted && <div className="feedback-form"><label htmlFor="feedback-comment">What was wrong with this answer? <span>Optional</span></label><textarea id="feedback-comment" value={comment} onChange={event => setComment(event.target.value)} placeholder="The cited section does not address…"/><div><button onClick={() => setFeedback(null)}>Cancel</button><button className="primary-button" onClick={() => setSubmitted(true)}>Submit feedback</button></div></div>}{index === messages.length - 1 && submitted && <div className="feedback-thanks"><Check size={15}/> Feedback saved. Thank you.</div>}</article></div>)}
            {loading && <div className="searching-state" role="status"><span className="search-pulse"/><div><b>Running locally in your browser</b><small>{loadingMessage}</small></div></div>}
          </div>}
        <form className="ask-composer" onSubmit={event => { event.preventDefault(); void ask(); }}><label htmlFor="question" className="sr-only">Ask a question</label><textarea id="question" placeholder="Ask a question about your documents…" value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void ask(); } }}/><button disabled={!question.trim() || loading} aria-label="Send question"><Send size={17}/></button><small>Enter to send · Shift + Enter for a new line</small></form>
      </section>
      <aside className="evidence-rail"><div className="evidence-heading"><p className="page-eyebrow">EVIDENCE</p><h2>Retrieved sources</h2><p>The closest matching passages for the latest answer.</p></div>{latestSources.length > 0 ? latestSources.map(source => <article key={source.id} className="evidence-card"><header><span>{source.id}</span><div><b>{source.document}</b><small>Page {source.page} · {source.section}</small></div><FileText size={16}/></header><blockquote>“{source.excerpt}”</blockquote><footer><span>Relevance</span><b>{source.score.toFixed(3)}</b></footer></article>) : <div className="evidence-empty"><FileText/><p>Sources will appear here after you ask a question.</p></div>}</aside>
    </div>
  </main>;
}
