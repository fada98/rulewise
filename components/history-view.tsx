"use client";

import { ArrowRight, MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteHistory, listHistory, type HistoryItem } from "../lib/history-store";
import { PageHeader } from "./page-header";
import Link from "./safe-link";

export function HistoryView() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { void listHistory().then(setItems).catch(cause => setError(cause instanceof Error ? cause.message : "History could not be loaded.")).finally(() => setLoading(false)); }, []);
  const visible = items.filter(item => `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase()));
  async function remove(id: string) { await deleteHistory(id); setItems(current => current.filter(item => item.id !== id)); }
  return <main className="dashboard-page"><PageHeader eyebrow="CONVERSATIONS" title="Question history" description="Your private questions and answers, saved only for this account." actions={<Link href="/dashboard/ask" className="primary-button"><Plus size={16}/> New conversation</Link>}/><div className="history-search search-field"><Search size={16}/><input aria-label="Search conversations" placeholder="Search questions and answers" value={query} onChange={event => setQuery(event.target.value)}/></div><section className="panel history-list">{loading && <div className="empty-state"><span className="search-pulse"/><b>Loading your history…</b></div>}{error && <div className="empty-state"><b>History unavailable</b><p>{error}</p></div>}{!loading && !error && !visible.length && <div className="empty-state"><MessageSquare size={22}/><b>No saved questions</b><p>Ask one of your documents to start a private history.</p></div>}{visible.map(item => <article className="history-row" key={item.id}><span className="history-icon"><MessageSquare size={17}/></span><div><Link href="/dashboard/ask">{item.question}</Link><p>{item.answer}</p><small>{new Date(item.createdAt).toLocaleString()} · {item.sources.length} cited sources</small></div><button aria-label="Delete conversation" onClick={() => void remove(item.id)}><Trash2 size={15}/></button><Link href="/dashboard/ask" aria-label="Open conversation"><ArrowRight size={16}/></Link></article>)}</section></main>;
}
