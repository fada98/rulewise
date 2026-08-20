"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function RegistrationForm({ email, initialName }: { email: string; initialName: string }) {
  const [fullName, setFullName] = useState(initialName);
  const [organization, setOrganization] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!accepted || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/account/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, organization, accepted }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Account creation failed.");
      window.location.assign("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Account creation failed.");
      setLoading(false);
    }
  }

  return <form className="auth-form" onSubmit={submit}>
    <p className="page-eyebrow">CREATE YOUR ACCOUNT</p><h2>Register for RuleWise</h2><p>Your profile will be securely linked to your verified account.</p>
    <label>Email address<input type="email" value={email} readOnly aria-readonly="true"/></label>
    <label>Full name<input required minLength={2} maxLength={80} value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Your full name"/></label>
    <label>Organization <span className="optional-label">Optional</span><input maxLength={100} value={organization} onChange={event => setOrganization(event.target.value)} placeholder="Company or team"/></label>
    <label className="registration-consent"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)}/><span>I agree to create a persistent RuleWise profile for this account.</span></label>
    {error && <div className="auth-error" role="alert">{error}</div>}
    <button className="primary-button auth-submit" disabled={!accepted || loading}>{loading ? "Creating account…" : "Create account"}</button>
    <p className="verified-note"><CheckCircle2 size={14}/> Identity verified by the hosting platform</p>
  </form>;
}
