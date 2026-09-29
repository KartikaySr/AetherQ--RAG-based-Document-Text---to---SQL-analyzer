<div align="center">

# 🌌 AetherQ
**Enterprise AI-Powered Document Intelligence & Data Analytics Platform**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aether-q-rag-based-document-text-to.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-LPU_Inference-F55036?style=for-the-badge)](https://groq.com/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**[🚀 LIVE DEMO: https://aether-q-rag-based-document-text-to.vercel.app/](https://aether-q-rag-based-document-text-to.vercel.app/)**

</div>

---

## 📖 Overview

**AetherQ** is a highly scalable, full-stack enterprise workspace that brings the power of **Large Language Models (LLMs)**, **Retrieval-Augmented Generation (RAG)**, and **Text-to-SQL Analytics** into a secure, unified environment. 

Engineered for absolute performance and security, AetherQ allows enterprises to securely upload documents, query their internal data warehouses via natural language, and collaborate in an isolated, multi-tenant environment.

## ✨ Key Features

- 🧠 **Conversational Intelligence**: Real-time chat powered by Groq's blazing-fast LPU inference engine, enabling ultra-low latency responses.
- 📚 **Advanced RAG Document Vault**: Securely process PDFs and Docs. Leverages `pgvector` and Hugging Face sentence transformers (384-dimensional) for extremely accurate semantic similarity searches.
- 📊 **Autonomous Data Analytics (Text-to-SQL)**: Translate complex natural language business questions into precise PostgreSQL queries, rendering automatic charts and insights.
- 🔒 **Enterprise-Grade Security**: Built on Supabase with strict Row Level Security (RLS) ensuring total data isolation per user/tenant. API keys remain strictly server-side.
- ⚡ **Modern UI/UX**: Crafted with React 19, Tailwind CSS v4, and Framer Motion for a luxurious, responsive, and tactile user experience.

---

## 🏗 Comprehensive System Architecture Walkthrough

AetherQ is built on a modern, unified full-stack architecture leveraging Next.js 15 (App Router). This design allows the high-performance React client and the secure Node.js backend to coexist in a single repository, ensuring tight type-safety, rapid development, and seamless deployment.

### 🧩 High-Level Data Flow

1.  **Client Layer (Next.js / React 19):** User interactions (chat messages, file uploads, SQL queries) are captured by React components. State is managed globally using **Zustand** for predictable updates.
2.  **API Layer (Next.js Serverless Routes):** Requests are securely routed to `/api/*` endpoints. This acts as an orchestration layer, interfacing with our AI providers (Groq, HuggingFace) and our database (Supabase).
3.  **Data & Vector Store (Supabase):** PostgreSQL handles relational data (users, messages, schemas) while `pgvector` stores and searches high-dimensional embeddings generated from uploaded documents for RAG.
4.  **AI Inference (Groq & HuggingFace):** Groq's LPU provides ultra-fast LLM inference for text generation and SQL translation, while HuggingFace sentence transformers handle semantic embeddings.

### 📂 Detailed Directory Structure

```bash
aetherq/
├── src/
│   ├── app/                    # 🚀 Next.js App Router root
│   │   ├── (auth)/             # Authentication routes (login, signup)
│   │   ├── api/                # ⚡ Serverless API endpoints (Backend)
│   │   │   ├── chat/           # Handles LLM conversations and Groq integration
│   │   │   ├── upload/         # Document parsing and chunking logic
│   │   │   └── query/          # Text-to-SQL processing and execution
│   │   ├── workspace/          # Core authenticated app interface
│   │   └── layout.tsx          # Root layout including global providers
│   ├── components/             # 🧩 Reusable React UI Components
│   │   ├── ui/                 # Base components (buttons, inputs) - Tailwind/Framer Motion
│   │   ├── chat/               # Chat interface, message bubbles, input areas
│   │   └── data/               # Data visualization (Recharts, tables)
│   ├── hooks/                  # 🪝 Custom React hooks for localized logic
│   ├── lib/                    # 🛠 Core utility functions & Configurations
│   │   ├── supabase/           # Supabase client instantiation (server & browser)
│   │   ├── ai/                 # Groq SDK and HuggingFace inference setup
│   │   └── utils.ts            # General helper functions (formatting, validation)
│   ├── providers/              # 🌐 React Context Providers (Auth, Theme)
│   ├── services/               # ⚙️ Business logic and external API wrappers
│   ├── store/                  # 📦 Global state management (Zustand slices)
│   └── types/                  # 🏷 TypeScript interfaces and type definitions
├── database/                   # 🗄 PostgreSQL schema definitions & migrations
├── public/                     # 🖼 Static assets (images, fonts, icons)
├── .env.local                  # 🔐 Environment variables (API keys, Supabase URLs)
├── tailwind.config.ts          # 🎨 Tailwind CSS v4 styling system configuration
└── next.config.ts              # ⚙️ Next.js framework configuration
```

### 🧠 Deep Dive: RAG (Retrieval-Augmented Generation) Pipeline

1.  **Ingestion:** When a user uploads a document (PDF/Doc), it is sent to a secure Next.js API route.
2.  **Processing:** The document is parsed and split into manageable semantic chunks using a text splitter.
3.  **Embedding:** Each chunk is passed to the Hugging Face inference API (`all-MiniLM-L6-v2`) to generate a 384-dimensional vector embedding.
4.  **Storage:** The original text and its vector embedding are stored in Supabase using the `pgvector` extension. Row Level Security (RLS) ensures chunks are tied to the specific user/tenant.
5.  **Retrieval:** When a user asks a question, the query is embedded into a vector. A cosine similarity search (`pgvector`) retrieves the most relevant document chunks.
6.  **Generation:** The retrieved context is injected into the prompt alongside the user's query and sent to Groq for ultra-low latency answer generation.

### 📊 Deep Dive: Text-to-SQL Engine

1.  **Intent Parsing:** User query is evaluated by an LLM to determine if it requires database access.
2.  **Schema Injection:** The relevant database schema is fetched and injected into the LLM context.
3.  **Query Generation:** The LLM translates the natural language into a precise, read-only PostgreSQL query.
4.  **Execution & Validation:** The query is executed against the Supabase database. Strict permissions ensure only authorized data is queried.
5.  **Visualization:** Results are returned to the frontend and automatically rendered into tables or charts (via Recharts).

### 🔒 Security Architecture

*   **Row Level Security (RLS):** Implemented at the database level in Supabase. Every query automatically filters data based on the authenticated user's ID, preventing horizontal privilege escalation.
*   **Server-Side Execution:** All sensitive operations (AI API calls, database mutations) occur in secure server environments (Next.js API routes), keeping API keys completely hidden from the browser.
*   **Unified Environment Variables:** A single `.env.local` file provisions both environments. Variables prefixed with `NEXT_PUBLIC_` are safely exposed to the browser, while all others remain strictly server-side.

---

## 🛠 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, Next.js 15 (App Router) |
| **Styling & Animation** | Tailwind CSS v4, Framer Motion, Recharts |
| **Backend & APIs** | Next.js API Routes (Node.js edge/serverless) |
| **Database & Auth** | Supabase (PostgreSQL), Supabase Auth, `pgvector` |
| **AI Inference** | Groq (`qwen/qwen3.6-27b` & Llama-3 models) |
| **Embeddings (RAG)** | Hugging Face (`all-MiniLM-L6-v2`) |
| **State Management** | Zustand |

---

## 🚀 Local Setup Instructions

Follow these instructions to run the AetherQ platform on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/KartikaySr/AetherQ--RAG-based-Document-Text---to---SQL-analyzer.git
cd AetherQ--RAG-based-Document-Text---to---SQL-analyzer
```

### 2. Install Dependencies
Ensure you have Node.js (v18+) installed.
```bash
npm install
```

### 3. Configure Environment Variables
Copy the provided example environment file to create your local configuration:
```bash
cp .env.example .env.local
```
*Open `.env.local` and populate it with your secure API credentials (Supabase URL/Keys, Groq API Key, Hugging Face API Key). Never commit your `.env.local` file.*

### 4. Provision the Database
Navigate to your Supabase project's SQL Editor and sequentially run the migration scripts located in the `database/` folder:
1. `supabase-documents-schema.sql`
2. `supabase-document-extractions-schema.sql`
3. `supabase-vector-schema.sql` (Enables `pgvector`)
4. `supabase-conversations-schema.sql`
5. `supabase-enterprise-schema.sql`
6. `supabase-add-user-isolation.sql`
7. `supabase-messages-delete-policy.sql`

*Also, ensure you create a Supabase Storage bucket named `documents`.*

### 5. Launch the Application
Start the development server:
```bash
npm run dev
```
The application will be running at [http://localhost:3000](http://localhost:3000).

---

## 👤 Author

**Kartikay Srivastava**
*Senior Full-Stack & AI Engineer*

Feel free to reach out or open an issue if you have any questions about the architecture or implementation details. 

<div align="center">
  <br />
  <i>Copyright © 2026 Kartikay Srivastava. All rights reserved.</i>
</div>
