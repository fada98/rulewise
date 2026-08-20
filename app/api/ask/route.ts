import { createEmbeddings, createGroundedAnswer } from "../../../lib/openai/server";
import { mapCitations, type RetrievedChunk } from "../../../lib/rag/citations";
import { buildGroundedPrompt, hasSufficientEvidence, NO_ANSWER } from "../../../lib/rag/grounding";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { questionSchema } from "../../../lib/validation";

export async function POST(request: Request) {
  try {
    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!accessToken) return Response.json({ error: "Authentication required." }, { status: 401 });
    const input = questionSchema.parse(await request.json());
    const supabase = createSupabaseServerClient(accessToken);
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

    const [questionEmbedding] = await createEmbeddings(input.question);
    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: questionEmbedding,
      match_user_id: user.id,
      filter_document_id: input.documentId ?? null,
      match_threshold: 0.78,
      match_count: 6,
    });
    if (error) throw error;
    const chunks = (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id), documentId: String(row.document_id), documentName: String(row.document_name),
      pageNumber: Number(row.page_number), content: String(row.content), similarity: Number(row.similarity),
    })) as RetrievedChunk[];

    const citations = mapCitations(chunks);
    let answer = NO_ANSWER;
    if (hasSufficientEvidence(chunks)) {
      answer = await createGroundedAnswer(buildGroundedPrompt(input.question, chunks)) || NO_ANSWER;
    }

    let conversationId = input.conversationId;
    if (!conversationId) {
      const { data: conversation, error: conversationError } = await supabase.from("conversations").insert({ user_id: user.id, title: input.question.slice(0, 72) }).select("id").single();
      if (conversationError) throw conversationError;
      conversationId = conversation.id;
    }
    const { error: userMessageError } = await supabase.from("messages").insert({ conversation_id: conversationId, user_id: user.id, role: "user", content: input.question });
    if (userMessageError) throw userMessageError;
    const { data: answerMessage, error: answerMessageError } = await supabase.from("messages").insert({ conversation_id: conversationId, user_id: user.id, role: "assistant", content: answer }).select("id").single();
    if (answerMessageError) throw answerMessageError;
    if (citations.length) {
      const { error: sourceError } = await supabase.from("message_sources").insert(citations.map(citation => ({ message_id: answerMessage.id, document_id: citation.documentId, chunk_id: citation.chunkId, page_number: citation.pageNumber, similarity_score: citation.similarityScore })));
      if (sourceError) throw sourceError;
    }
    return Response.json({ answer, citations, conversationId, messageId: answerMessage.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return Response.json({ error: "Invalid question." }, { status: 400 });
    console.error("Question processing failed", error);
    return Response.json({ error: "The answer could not be generated. Please try again." }, { status: 500 });
  }
}
