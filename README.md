# AetherQ

AetherQ is an Enterprise AI workspace combining the power of Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and advanced data analytics. Designed for scale and security, it provides a centralized platform for document intelligence, natural language querying (Text-to-SQL), and secure team collaboration.

## 🌟 Key Features

- **Enterprise Document Vault**: Securely store, process, and retrieve documents.
- **Advanced RAG Capabilities**: Hugging Face sentence transformers (384-dimensional embeddings) paired with Supabase Vector for highly accurate semantic search.
- **Lightning-Fast AI Inference**: Integrated with Groq's LPU inference engine for rapid natural language processing and real-time chat capabilities.
- **Text-to-SQL Analytics**: Translate natural language questions into complex PostgreSQL queries for deep, actionable data insights.
- **Multi-tenant Security**: Built-in Row Level Security (RLS) via Supabase ensures strict data isolation across users and workspaces.
- **Voice-Enabled Interface**: Interactive and hands-free operations using integrated voice recognition hooks.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Next.js API Routes, Supabase (PostgreSQL, Storage, Auth)
- **AI/ML Infrastructure**:
  - LLM Inference: [Groq](https://groq.com/)
  - Embeddings: [Hugging Face](https://huggingface.co/)
  - Vector Store: `pgvector`
- **State Management**: Zustand
- **Document Processing**: pdf-parse, mammoth (for rich text extraction)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
- Node.js (v18 or higher)
- npm or pnpm
- A [Supabase](https://supabase.com/) Project
- API Keys for Groq and Hugging Face

### 1. Environment Setup

Copy the example environment variables file and populate it with your secure credentials. 
> **Important**: Never commit your `.env.local` file to version control. Keep your keys strictly confidential.

```bash
cp .env.example .env.local
```

The minimum required variables to run the application locally include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`
- `HUGGINGFACE_API_KEY`
- `DATABASE_URL`

### 2. Database Migrations

Set up your Supabase database by running the following SQL scripts (located in the `/database` directory) in sequential order via the Supabase SQL Editor:

1. `supabase-documents-schema.sql` - Core document metadata tables.
2. `supabase-document-extractions-schema.sql` - Document processing statuses.
3. `supabase-vector-schema.sql` - Enables the `vector` extension and creates the `document_chunks` table for embeddings.
4. `supabase-conversations-schema.sql` - Chat and messaging schema.
5. `supabase-enterprise-schema.sql` - Analytical warehouse and comprehensive audit logs.
6. `supabase-add-user-isolation.sql` - **CRITICAL**: Enforces per-user RLS, linking records to `user_id`, updating storage policies, and vector match functions.
7. `supabase-messages-delete-policy.sql` - Policies allowing message state synchronization.

Additionally, create a Supabase Storage bucket named `documents` and configure your Auth redirect URLs to match your application's origin (e.g. `http://localhost:3000/auth/callback`).

### 3. Installation & Local Development

Install the project dependencies and start the development server:

```bash
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000). You can check system health at `/api/health`.

## 🛡 Security & Privacy

AetherQ is built with enterprise-grade security principles:
- **Zero Data Leakage Environment**: API keys and service roles (`SUPABASE_SERVICE_ROLE_KEY`) remain strictly server-side. The frontend only communicates using safe anonymous keys and user-specific JWTs.
- **Row Level Security (RLS)**: PostgreSQL policies isolate user data directly at the database level, ensuring that users can only access their own workspaces and documents.
- **Comprehensive Audit Logging**: Sensitive enterprise actions, including generated SQL queries, are logged for compliance and security auditing.

## 📜 License

Copyright © AetherQ. All rights reserved.
