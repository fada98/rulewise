export type DocumentStatus = "Ready" | "Processing" | "Failed" | "Uploaded";

export const documents = [
  { id: "competition-rules", name: "Competition Rules 2026", file: "competition-rules-2026.pdf", pages: 42, chunks: 118, status: "Ready" as const, uploaded: "Today, 09:42", size: "1.8 MB" },
  { id: "official-procedures", name: "Official Procedures", file: "official-procedures.pdf", pages: 28, chunks: 76, status: "Ready" as const, uploaded: "Aug 18, 2026", size: "944 KB" },
  { id: "operations-handbook", name: "Operations Handbook", file: "operations-handbook.pdf", pages: 64, chunks: 164, status: "Ready" as const, uploaded: "Aug 15, 2026", size: "2.4 MB" },
  { id: "venue-safety", name: "Venue Safety Protocol", file: "venue-safety-protocol.pdf", pages: 31, chunks: 0, status: "Processing" as const, uploaded: "2 minutes ago", size: "1.2 MB" },
];

export const recentQuestions = [
  { question: "Can a player touch the ball twice after a restart?", answer: "No. The player taking the restart may not touch the ball again until another player has touched it.", time: "12 min ago", sources: 2, helpful: true },
  { question: "Who is responsible for the pre-event safety inspection?", answer: "The venue operations lead must complete and sign the inspection checklist before doors open.", time: "Yesterday", sources: 3, helpful: true },
  { question: "What is the appeal window after a disciplinary decision?", answer: "A written appeal must be submitted within five business days of the decision notice.", time: "Aug 18", sources: 1, helpful: false },
];

export const retrievedSources = [
  { id: 1, document: "Competition Rules 2026", page: 24, section: "Restart procedures", score: 0.932, excerpt: "The player taking the restart must not touch the ball a second time until it has touched another player." },
  { id: 2, document: "Official Procedures", page: 11, section: "Ball in play", score: 0.887, excerpt: "Following a restart, play continues when the ball is clearly moved. A second touch by the taker is not permitted." },
];
