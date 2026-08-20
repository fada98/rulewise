import Link from "@/components/safe-link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { Brand } from "../../components/brand";
import { RegistrationForm } from "../../components/registration-form";
import { getAccount } from "../../lib/account";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";

export const metadata = { title: "Register" };
export const dynamic = "force-dynamic";

export default async function SignIn() {
  const user = await getChatGPTUser();
  if (user && await getAccount(user.userId)) redirect("/dashboard");
  return <main className="auth-page">
    <section className="auth-brand-panel"><Brand/><div><p className="eyebrow"><span/>DOCUMENT-GROUNDED KNOWLEDGE</p><h1>Answers you can trace back to the page.</h1><p>Create your persistent RuleWise workspace and keep your profile across sessions.</p></div><small>© 2026 RuleWise</small></section>
    <section className="auth-form-panel"><Link href="/" className="back-link"><ArrowLeft size={15}/> Back to home</Link>{user ? <RegistrationForm email={user.email} initialName={user.fullName ?? ""}/> : <section className="auth-form"><p className="page-eyebrow">SECURE SIGN IN</p><h2>Continue to RuleWise</h2><p>Verify your identity before creating or opening your account.</p><a href={chatGPTSignInPath("/signin")} className="primary-button auth-submit">Continue securely</a></section>}</section>
  </main>;
}
