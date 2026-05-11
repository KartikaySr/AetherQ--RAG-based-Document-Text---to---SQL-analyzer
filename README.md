# AetherQ---RAG-Based-Document-Analyzer
# AetherQ

AetherQ is an enterprise AI intelligence workspace built for conversational analytics, semantic document retrieval, retrieval-augmented generation (RAG), and AI-powered SQL insights.

The platform combines modern AI workflows with enterprise-style analytics and document intelligence in a single unified workspace.

---

## Features

### Conversational AI Workspace

- Real-time AI streaming responses
- ChatGPT-style interface
- Markdown rendering
- Syntax-highlighted code blocks
- Regenerate response support
- Suggested prompts
- Sticky responsive chat input
- Conversation session management
- Toast notifications
- Mobile responsive layout

---

### Document Intelligence

Supports upload and analysis of:

- PDF
- DOCX
- TXT
- Markdown
- CSV
- JSON

Capabilities include:

- Multi-file upload
- Server-side extraction
- Metadata persistence
- Semantic chunking
- Embedding generation
- Vector indexing
- Semantic retrieval
- RAG-powered contextual QA
- Citation-aware responses
- Streaming document analysis

---

### Enterprise SQL Analytics

Natural-language-to-SQL analytics engine with:

- AI-generated SQL queries
- Read-only SQL validation
- Table allowlisting
- LIMIT enforcement
- SQL explanations
- KPI dashboards
- Interactive analytics charts
- Audit logging

Enterprise datasets include:

- Employees
- Departments
- Sales
- Logistics
- Inventory

---

### Semantic Retrieval Pipeline

```text
Upload
  ↓
Extraction
  ↓
Chunking
  ↓
Embedding Generation
  ↓
pgvector Storage
  ↓
Semantic Retrieval
  ↓
AI Response
```

---

## Tech Stack

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- React Markdown
- React Syntax Highlighter

### Backend

- Next.js API Routes
- Groq API
- Supabase
- PostgreSQL
- pgvector
- pg

### AI / ML

- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Local Embeddings
- Xenova Transformers
- Cosine Similarity Retrieval

### File Processing

- pdf-parse
- mammoth
- custom chunking pipeline

---

## System Architecture

### AI Workspace Flow

```text
User Query
   ↓
Intent Router
   ↓
General Chat / SQL Analytics / Document Retrieval
   ↓
Groq + Retrieval Context
   ↓
Streaming AI Response
```

### Document Intelligence Flow

```text
Upload Document
      ↓
Supabase Storage
      ↓
Text Extraction
      ↓
Chunking
      ↓
Embedding Generation
      ↓
pgvector Storage
      ↓
Semantic Retrieval
      ↓
RAG AI Response
```

### SQL Analytics Flow

```text
Natural Language Query
        ↓
Groq SQL Generation
        ↓
SQL Validator
        ↓
PostgreSQL Execution
        ↓
Analytics Response
```

---

## Project Structure

```text
src/
 ├── app/
 │   ├── api/
 │   ├── analytics/
 │   ├── chat/
 │   ├── documents/
 │   └── page.tsx
 │
 ├── components/
 │   ├── chat/
 │   ├── DocumentUploader.tsx
 │   ├── DocumentCard.tsx
 │   └── DataTable.tsx
 │
 ├── lib/
 │   ├── chunkDocument.ts
 │   ├── generateEmbedding.ts
 │   ├── sqlValidator.ts
 │   ├── dbPool.ts
 │   ├── intentRouter.ts
 │   └── auditLogger.ts
 │
 ├── services/
 │   └── conversationService.ts
 │
 └── store/
     └── useWorkspaceStore.ts
```

---

## Environment Variables

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
GROQ_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/aetherq.git
cd aetherq
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Application runs at:

```text
http://localhost:3000
```

---

## Database Setup

Run the following SQL schema files in Supabase SQL Editor:

- `supabase-documents-schema.sql`
- `supabase-document-extractions-schema.sql`
- `supabase-vector-schema.sql`
- `supabase-enterprise-schema.sql`

These configure:

- document metadata storage
- extraction pipeline
- vector embeddings
- enterprise analytics datasets
- audit logging
- pgvector indexing

---

## Deployment

### Deploy on Vercel

1. Push project to GitHub
2. Import repository into Vercel
3. Configure environment variables
4. Deploy

Recommended production domain:

```text
https://aetherq.mindineers.com
```

---

## Security

Implemented protections include:

- Read-only SQL enforcement
- SQL injection prevention
- Table allowlisting
- Server-side secret management
- RLS-enabled Supabase tables
- Secure vector storage
- Protected API routes

---

## Verification

The following checks were verified successfully:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Validated modules:

- AI streaming
- document uploads
- extraction pipeline
- vector embeddings
- semantic retrieval
- SQL analytics
- markdown rendering
- mobile responsiveness

---

## Future Enhancements

Planned improvements include:

- OCR for scanned PDFs
- authentication system
- role-based access control
- background job queues
- Redis caching
- multi-agent workflows
- voice interface
- multimodal AI
- collaborative workspaces

---

## Goal

The objective of AetherQ is to build a modern enterprise intelligence workspace capable of:

- understanding enterprise documents
- retrieving semantic context
- generating AI-powered insights
- enabling natural-language analytics
- supporting real-time enterprise reasoning

while maintaining scalability, security, performance, and production readiness.

---

## Author

Kartikay Srivastava  
B.Tech CSE AIML  
Mindineers Labs

---

## License

This project is intended for educational, research, portfolio, and enterprise experimentation purposes.
