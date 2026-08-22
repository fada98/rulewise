"use client";

import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase/client";

export function AuthView() {
  const [mode, setMode] = useState<"signin" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void getSupabaseClient().auth.getSession().then(({ data }) => {
      if (data.session) window.location.assign("/dashboard");
    });
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const supabase = getSupabaseClient();
    try {
      if (mode === "register") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (authError) throw authError;
        if (data.session) window.location.assign("/dashboard");
        else setNotice("Account created. Check your email and confirm the registration link.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        window.location.assign("/dashboard");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return <form className="auth-form" onSubmit={submit}>
    <p className="page-eyebrow">{mode === "register" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</p>
    <h2>{mode === "register" ? "Register for RuleWise" : "Sign in to RuleWise"}</h2>
    <p>{mode === "register" ? "Your documents and question history will stay private to this account." : "Continue to your private document workspace."}</p>
    {mode === "register" && <label>Full name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your full name"/></label>}
    <label>Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label>
    <label>Password<div><input required minLength={8} type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters"/><button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div></label>
    {error && <div className="auth-error" role="alert">{error}</div>}
    {notice && <div className="auth-success" role="status"><CheckCircle2 size={15}/>{notice}</div>}
    <button className="primary-button auth-submit" disabled={loading}>{loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
    <p className="auth-switch">{mode === "register" ? "Already have an account?" : "New to RuleWise?"} <button type="button" onClick={() => { setMode(current => current === "register" ? "signin" : "register"); setError(""); setNotice(""); }}>{mode === "register" ? "Sign in" : "Create an account"}</button></p>
  </form>;
}
