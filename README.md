# RuleWise

RuleWise is a document-grounded knowledge assistant that allows users to upload PDF documents, index them, ask questions, and receive evidence-based answers with source citations.

## Features

- PDF upload with file type and size validation
- Page-aware text extraction, chunking, and document processing states
- OpenAI embeddings and semantic retrieval
- PostgreSQL vector search with pgvector
- Document-grounded question answering with evidence thresholds
- Source citations with document, page, passage, and similarity metadata
- Per-user documents and conversation history
- Helpful / Incorrect feedback workflow
- Evaluation view for retrieved chunks and relevance scores
- Supabase authentication, private Storage, PostgreSQL, and row-level security
- Responsive landing page and authenticated workspace
- Explicit loading, empty, validation, insufficient-evidence, and failure states

## Screenshots

### Dashboard

![RuleWise Dashboard](public/portfolio/01-dashboard.png)

### Documents

![RuleWise Documents](public/portfolio/02-documents.png)

### Grounded Answer

![RuleWise Grounded Answer](public/portfolio/03-grounded-answer.png)

### Evaluation

![RuleWise Evaluation](public/portfolio/04-evaluation.png)

### Mobile

![RuleWise Mobile](public/portfolio/05-mobile.png)

### Landing Page

![RuleWise Landing Page](public/portfolio/06-landing.png)

## Demo Video

The repository includes a concise end-to-end product walkthrough at [`portfolio/rulewise-demo-final.webm`](portfolio/rulewise-demo-final.webm).

## Tech Stack

- Vinext with Next.js-compatible routing and server handlers
- React 19 and TypeScript
- Tailwind CSS 4
- Supabase Auth and private Storage
- PostgreSQL with pgvector and row-level security
- OpenAI Responses and Embeddings APIs
- PDF.js for browser-side PDF text extraction
- Zod for request validation
- Lucide React icons
- Node.js test runner and ESLint

## Architecture

```text
PDF upload
  → page-aware text extraction
  → overlapping chunks
  → OpenAI embeddings
  → pgvector storage
  → similarity search scoped to the authenticated user
  → grounded answer generation
  → document and page citations
```

RuleWise keeps citation metadata outside the generated answer. The retrieval function enforces both ownership and a similarity threshold before evidence reaches the answer model. Uploaded files are stored in a private Supabase bucket and all user-owned tables use row-level security.

The interface also contains a browser-side retrieval path for reviewing uploaded PDFs without invoking the hosted answer endpoint. This keeps the portfolio workflow usable while the complete Supabase and OpenAI environment is being configured.

## Getting Started

Requirements:

- Node.js 22.13 or later
- A Supabase project
- An OpenAI API key for the hosted embeddings and answer flow

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, replace the copy command with:

```powershell
Copy-Item .env.example .env.local
```

The development server prints the local URL after startup.

## Environment Variables

Copy [`.env.example`](.env.example) and provide values only in your local `.env.local` file or hosting environment:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

Never expose the service-role key or OpenAI key to browser code. Local environment files are ignored by Git.

## Database Setup

Apply the SQL migrations in order:

1. [`20260822000000_rulewise_accounts.sql`](supabase/migrations/20260822000000_rulewise_accounts.sql) creates profiles, per-user documents, extracted chunks, question history, private Storage policies, and row-level security.
2. [`20260823000000_rulewise_vector_search.sql`](supabase/migrations/20260823000000_rulewise_vector_search.sql) enables pgvector, adds embeddings and vector search, and creates conversations, messages, citations, indexes, grants, and ownership policies.

Use the Supabase CLI or run both files in the Supabase SQL editor. The first migration also creates the private `documents` Storage bucket.

## Testing

```bash
npm run lint
npm test
npm run build
```

These commands cover source linting, retrieval/grounding unit tests, and the production build.

## Demo Data

The interface uses synthetic competition-rule content for portfolio screenshots and UI review. A fictional source PDF is available at [`public/demo/fictional-competition-rules.pdf`](public/demo/fictional-competition-rules.pdf) and can be rebuilt with:

```bash
python scripts/create_demo_pdf.py
```

No private documents or production account data are included.

## Portfolio Note

RuleWise demonstrates full-stack development, authenticated data ownership, PDF ingestion, semantic search, retrieval-augmented generation, API integration, database design, evaluation tooling, and responsive product UI.
