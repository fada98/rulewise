import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PageText } from "../rag/chunking";
export async function extractPdfPages(bytes:Uint8Array):Promise<PageText[]>{const pdf=await getDocument({data:bytes,useSystemFonts:true}).promise;const pages:PageText[]=[];for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){const page=await pdf.getPage(pageNumber);const content=await page.getTextContent();const text=content.items.map(item=>("str" in item?item.str:"")).join(" ");pages.push({pageNumber,text})}return pages}
export function safeFilename(name:string){const base=name.replace(/[^a-zA-Z0-9._-]/g,"-").replace(/-+/g,"-").replace(/^[-.]+/,"").slice(0,120);return base.toLowerCase().endsWith(".pdf")?base:`${base}.pdf`}
