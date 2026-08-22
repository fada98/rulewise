import Link from "@/components/safe-link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "../../components/brand";
import { AuthView } from "../../components/auth-view";

export const metadata = { title: "Sign in or register" };

export default function SignIn() {
  return <main className="auth-page">
    <section className="auth-brand-panel"><Brand/><div><p className="eyebrow"><span/>DOCUMENT-GROUNDED KNOWLEDGE</p><h1>Answers you can trace back to the page.</h1><p>Create your persistent RuleWise workspace and keep your profile across sessions.</p></div><small>© 2026 RuleWise</small></section>
    <section className="auth-form-panel"><Link href="/" className="back-link"><ArrowLeft size={15}/> Back to home</Link><AuthView/></section>
  </main>;
}
