# AetherQ

Enterprise AI workspace: **Supabase auth + RLS**, **Groq** LLM, **Hugging Face** embeddings (384-dim), **Postgres** analytics, document vault and chat.

## Quick start

1. Copy environment template and fill secrets:

   ```bash
   cp .env.example .env.local
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000), sign in, then use **Workspace** routes under `/workspace`.

4. **Health check** (after env is set): [http://localhost:3000/api/health](http://localhost:3000/api/health) — JSON shows which subsystems have keys configured (no secret values).

## Configuration

All variables are documented in **`.env.example`**. Minimum for a full local demo:

| Area | Variables |
|------|-----------|
| Auth & data plane | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Chat / SQL / QA | `GROQ_API_KEY` |
| Search & indexing | `HUGGINGFACE_API_KEY` |
| Analytics dashboard & Text-to-SQL | `DATABASE_URL` (same or separate Postgres with enterprise schema) |
| SQL audit rows in Supabase | `SUPABASE_SERVICE_ROLE_KEY` (optional) |

Optional: `NEXT_PUBLIC_SITE_URL`, `GROQ_CHAT_MODEL`, `HUGGINGFACE_EMBEDDING_URL`, `DATABASE_SSL_DISABLE`, `DATABASE_POOL_MAX`, upload size vars.

## Database migrations (Supabase SQL editor)

Run SQL files **in order** on your Supabase project (Extensions + SQL). Adjust if a table already exists.

1. `supabase-documents-schema.sql` — documents metadata + storage-oriented RLS (superseded later by isolation script).
2. `supabase-document-extractions-schema.sql` — extraction status.
3. `supabase-vector-schema.sql` — `vector` extension + `document_chunks` (384-dim).
4. `supabase-conversations-schema.sql` — conversations + messages + RLS.
5. `supabase-enterprise-schema.sql` — warehouse tables + `query_audit_logs`.
6. `supabase-add-user-isolation.sql` — **critical**: per-user RLS, `user_id` columns, `match_document_chunks_for_user`, storage policies.
7. `supabase-messages-delete-policy.sql` — allows replacing message rows when syncing chat history.

Create a **Storage** bucket named `documents` (or align app + policies with your bucket name). Configure **Auth** redirect URLs for your deployed origin (e.g. `https://app.example.com/auth/callback`).

## Scripts

- `npm run dev` — development
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint

## Deploy

Use the structured checklist in the project maintainer / Cursor handoff: set env on the host (e.g. Vercel), run migrations on Supabase, set `NEXT_PUBLIC_SITE_URL` and auth redirect URLs to that host, then `npm run build` and deploy.
