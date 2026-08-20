import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = {
  title: { default: "RuleWise | Answers Grounded in Your Documents", template: "%s | RuleWise" },
  description: "Upload rulebooks, policies, manuals and procedures. Ask questions and receive evidence-based answers with clear source citations.",
  metadataBase: new URL("https://rulewise.app"),
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "RuleWise | Answers Grounded in Your Documents", description: "Ask rulebooks, policies, manuals and procedures questions and verify every answer against its source.", type: "website", images: [{ url: "/og.png", width: 1732, height: 909, alt: "RuleWise — Answers grounded in your documents" }] },
  twitter: { card: "summary_large_image", title: "RuleWise | Answers Grounded in Your Documents", description: "Ask your documents. Get answers you can verify.", images: ["/og.png"] },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>; }
