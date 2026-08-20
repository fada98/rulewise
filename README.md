# RuleWise

RuleWise is a document knowledge assistant for rulebooks, policies, manuals, procedures, and internal documentation. It retrieves relevant passages and returns concise answers with document and page citations.

## Features

- PDF upload with file type and size validation
- Page-aware text extraction and overlapping chunking
- OpenAI embeddings with pgvector similarity search
- Answers restricted to retrieved document evidence
- Application-owned citation metadata
- Conversation history and document-level question scope
- Helpful/Incorrect feedback loop
- Inspection view for retrieved chunks and similarity scores
- Supabase Auth, Storage, PostgreSQL, and row-level security
- Responsive, accessible marketing and dashboard interfaces

## Architecture

PDF files are stored in Supabase Storage. Server-side processing extracts text per page, normalizes it, creates 1,200-character chunks with 180-character overlap, and embeds each chunk with `text-embedding-3-small`. This size is large enough to retain a complete rule while remaining focused for retrieval; the overlap keeps rules split at a boundary from losing context.

Questions are embedded server-side and passed to the `match_document_chunks` PostgreSQL function. The function restricts results to the authenticated user, applies a similarity threshold, and returns at most six chunks. Answers are generated only when useful evidence is present. Citation labels are built from the retrieved database rows, not from generated answer text.

## Stack

- TypeScript, React 19, Tailwind CSS
- Vinext's Next.js-compatible application and route interface
- Supabase Auth, Storage, PostgreSQL, and pgvector
- OpenAI Responses and Embeddings APIs
- Zod validation
- Lucide React icons
- Node test runner

## Setup

Requirements: Node.js 22.13 or later, a Supabase project, and an OpenAI API key.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add the required values.
3. Run `supabase/migrations/20260820000000_rulewise.sql` in the Supabase SQL editor or with the Supabase CLI.
4. Create a private Supabase Storage bucket named `documents`.
5. Start development with `npm run dev`.

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to browser code. The checked-in environment example contains names only.

## Database and security

The migration enables pgvector, creates the RuleWise data model and search function, and enables row-level security on every user-owned table. Retrieval validates ownership both through RLS and an authenticated user filter. Upload and question endpoints derive the user from the access token and never accept a client-supplied user ID.

## Development

```bash
npm run dev
npm run lint
npm test
npm run build
```

## Demo

The interface includes synthetic fictional competition content so the product workflow can be reviewed without private documents. A five-page source file is included at `public/demo/fictional-competition-rules.pdf`; rebuild it with `python scripts/create_demo_pdf.py`. Connect Supabase and OpenAI credentials to exercise live upload, indexing, retrieval, answer generation, persistence, and authentication.

## Production

Set all four environment variables in the hosting environment, apply the database migration, create the private Storage bucket, then run `npm run build`. Review Supabase Auth redirect URLs and Storage policies for the production domain before accepting users.

## Screenshots

Add final landing page, document library, grounded answer, and evaluation-view screenshots here after production deployment.
