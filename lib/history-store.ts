"use client";

import type { GroundedSource } from "./local-qa";
import { getSupabaseClient } from "./supabase/client";

export type HistoryItem = { id: string; question: string; answer: string; sources: GroundedSource[]; createdAt: string };

export async function saveHistory(question: string, answer: string, sources: GroundedSource[]) {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const { error } = await supabase.from("question_history").insert({ user_id: data.user.id, question, answer, sources });
  if (error) throw error;
}

export async function listHistory() {
  const supabase = getSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sign in to view history.");
  const { data, error } = await supabase.from("question_history").select("id,question,answer,sources,created_at").eq("user_id", userData.user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({ id: row.id, question: row.question, answer: row.answer, sources: Array.isArray(row.sources) ? row.sources : [], createdAt: row.created_at })) as HistoryItem[];
}

export async function deleteHistory(id: string) {
  const { error } = await getSupabaseClient().from("question_history").delete().eq("id", id);
  if (error) throw error;
}
