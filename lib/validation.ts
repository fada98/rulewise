import { z } from "zod";
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export const questionSchema = z.object({ question: z.string().trim().min(3).max(1500), documentId: z.string().uuid().optional(), conversationId: z.string().uuid().optional() });
export const feedbackSchema = z.object({ messageId: z.string().uuid(), rating: z.enum(["helpful", "incorrect"]), comment: z.string().trim().max(1000).optional() });
export const registrationSchema = z.object({ fullName: z.string().trim().min(2).max(80), organization: z.string().trim().max(100).default(""), accepted: z.literal(true) });
export function validatePdf(file: { type: string; size: number; name: string }) { if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) return { ok: false as const, error: "Only PDF documents are supported." }; if (file.size <= 0) return { ok:false as const,error:"The selected file is empty."}; if(file.size>MAX_PDF_BYTES)return{ok:false as const,error:"PDF files must be 20 MB or smaller."}; return{ok:true as const}; }
