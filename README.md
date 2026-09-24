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

## 🏗 System Architecture & Folder Structure

This repository is built on a **unified Next.js 15 App Router** architecture, meaning both the high-performance client and the secure server backend reside seamlessly in the same repository.

```bash
aetherq/
├── src/
│   ├── app/                 # Frontend UI, Layouts, and React Client Components
│   ├── app/api/             # Backend Node.js API Routes (Serverless Functions)
│   ├── components/          # Reusable UI elements, Charts, and Chat Modals
│   ├── lib/                 # Core utilities, Supabase clients, and Model configurations
│   └── store/               # Global state management via Zustand
├── database/                # PostgreSQL schema definitions and migration scripts
├── public/                  # Static assets
└── .github/workflows/       # CI/CD pipelines (Automated Linting)
```

> **Note on Environment Variables**: Because this is a unified Next.js repository, a single `.env.local` file at the root correctly provisions both the frontend (via `NEXT_PUBLIC_` prefixes) and the backend serverless routes.

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
