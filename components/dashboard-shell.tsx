"use client";
import Link from "./safe-link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, FileText, HelpCircle, History, LogOut, Menu, MessageSquareText, Settings, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "./brand";
import { getSupabaseClient } from "../lib/supabase/client";

const primary = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/ask", label: "Ask", icon: MessageSquareText },
  { href: "/dashboard/history", label: "History", icon: History },
];
const secondary = [
  { href: "/dashboard/feedback", label: "Feedback", icon: ShieldCheck },
  { href: "/dashboard/evaluation", label: "Evaluation", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<{ fullName: string; email: string } | null>(null);
  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return window.location.assign("/signin");
      const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", data.user.id).maybeSingle();
      setAccount({ fullName: profile?.full_name || data.user.user_metadata.full_name || data.user.email?.split("@")[0] || "User", email: profile?.email || data.user.email || "" });
    });
  }, []);
  async function signOut() { await getSupabaseClient().auth.signOut(); window.location.assign("/signin"); }
  const item = ({ href, label, icon: Icon }: (typeof primary)[number]) => {
    const active = href === "/dashboard" ? path === href : path.startsWith(href);
    return <Link key={href} href={href} className={active ? "side-link active" : "side-link"} onClick={() => setOpen(false)}><Icon size={17} strokeWidth={1.8}/><span>{label}</span></Link>;
  };
  if (!account) return <div className="auth-loading" role="status"><span className="search-pulse"/> Opening your workspace…</div>;
  return <div className="app-shell">
    <header className="mobile-header"><Brand/><button className="icon-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open?<X/>:<Menu/>}</button></header>
    <aside className={open ? "app-sidebar open" : "app-sidebar"}>
      <div className="sidebar-brand"><Brand/></div>
      <nav aria-label="Application navigation"><p className="nav-label">WORKSPACE</p>{primary.map(item)}<p className="nav-label nav-label-second">MANAGE</p>{secondary.map(item)}</nav>
      <div className="sidebar-bottom"><div className="workspace-switcher"><span className="avatar">{account.fullName.split(/\s+/).map(part => part[0]).join("").slice(0,2).toUpperCase()}</span><span><b>{account.fullName}</b><small>{account.email}</small></span><button className="account-signout" onClick={() => void signOut()} aria-label="Sign out"><LogOut size={15}/></button></div><a className="help-link" href="mailto:support@rulewise.app"><HelpCircle size={15}/> Help & documentation</a></div>
    </aside>
    {open && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <div className="app-content">{children}</div>
  </div>;
}
