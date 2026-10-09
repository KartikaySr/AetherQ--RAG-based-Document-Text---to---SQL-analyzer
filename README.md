# AetherQ

A modular workspace for document retrieval, warehouse analytics, and conversational AI. Built with Next.js, Supabase, Groq, and local MiniLM embeddings (Transformers.js/ONNX). Messaging integrations are planned; there is no multi-agent execution engine.

## Local development

Use Node.js 22 or newer. Install dependencies with `npm ci`. Copy `.env.example` to `.env.local` and configure Supabase and Groq. Documents use local CPU embeddings; no paid embedding API key is required. Run `npm run dev`. The first embedding request downloads approximately 90 MB of model weights; later requests reuse the cached model. Run `npm run warm:embeddings` before a demo or during server provisioning. Set `EMBEDDING_CACHE_DIR` to a persistent writable directory on deployed servers.

Verification: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

## Application database

For a **new** Supabase project, apply these files in order:

1. `database/supabase-documents-schema.sql`
2. `database/supabase-document-extractions-schema.sql`
3. `database/supabase-vector-schema.sql`
4. `database/supabase-conversations-schema.sql`
5. `database/supabase-add-user-isolation.sql`
6. `database/supabase-messages-delete-policy.sql`
7. `database/008-platform-hardening.sql`

Finish the complete sequence before exposing the application: early historical migrations contain permissive policies that the final migration replaces. Existing installations that already ran the historical sequence should apply only `008-platform-hardening.sql`. Historical migrations are not all idempotent. Root `schema.sql` is legacy reference material and must not be applied over this sequence.

The final migration creates a private `documents-private` bucket with a 10 MB limit. New object paths begin with the authenticated user's UUID. To preserve old uploads, use a separately reviewed storage migration to copy existing objects from `documents/documents/<userId>/…` to `documents-private/<userId>/…` and update metadata only after each copy succeeds. Keep originals until verified. Unowned/shared-guest data needs an explicit owner decision; do not assign it to the next guest. No automatic destructive storage migration is included.

OAuth and confirmation redirects must allow `<site-origin>/auth/callback`. Password recovery must allow `<site-origin>/auth/callback?next=/auth/reset-password`. Use Supabase's PKCE-compatible confirmation flow. Enable anonymous sign-ins for isolated guest sessions; otherwise users must sign in normally. Configure Supabase CAPTCHA and anonymous signup rate limits before public launch. Anonymous accounts persist by session and need a retention policy. Retire the old shared guest account and revoke its sessions in Supabase; changing the frontend does not revoke existing credentials.

## Analytics database

Analytics uses a separate, explicitly authorized warehouse connection. There is no fallback to `DATABASE_URL` or a service-role connection. Guest accounts cannot query it. Add permitted user UUIDs to `ANALYTICS_ALLOWED_USER_IDS`.

The five supported relations are `departments`, `employees`, `sales`, `logistics`, and `inventory`. Use `database/supabase-enterprise-schema.sql` **only in a disposable demo database**: it drops these tables and seeds synthetic data. Never run it on a production warehouse. Run `database/009-analytics-reader.sql` on that database, set a strong password for `aetherq_reader` separately, and configure `ANALYTICS_DATABASE_URL` with that login. Audit inherited/PUBLIC permissions and keep application/auth tables out of this database. Use TLS certificate verification. For Supabase, the public CA is included in `config/supabase-ca.crt`; use `sslmode=verify-full&sslrootcert=config%2Fsupabase-ca.crt` in the connection URL. The certificate was obtained from Supabase’s official download endpoint; verify updates against your project dashboard. On IPv4-only networks, copy the session-pooler host and custom-role username from the project Connect dialog.

Queries are parsed against an allowlist, executed in a read-only transaction with timeouts, and capped at 200 result rows. All authorized users see the same warehouse; this is explicit workspace access, **not per-user warehouse row isolation**. Do not grant access to people who should not see all five tables. KPI failures produce an error, never invented fallback values. Demo seeds remain synthetic even though their values are fetched from a real database.

## Known deployment requirements

Apply migrations and provision provider credentials before testing live flows. Document extraction is synchronous and supports text-bearing PDF, DOCX, TXT, MD, CSV, and JSON; scanned PDF OCR is not implemented. Extracted text is capped at 400,000 characters. Upload failures attempt metadata and storage cleanup; operational monitoring is still needed for interrupted processes. Hosted request limits may be lower than 10 MB; configure hosting appropriately or implement signed direct uploads before accepting larger files there.

The code changes do not establish production certification. Validate auth redirects, two-user data isolation, private storage, embedding dimensions, provider failure behavior, SQL permissions, and concurrent conversation saves against a staging deployment. AI endpoints enforce a shared database quota of 60 requests per user per hour (10 for anonymous sessions). Configure IP-level signup/request protection and CAPTCHA before public launch to prevent attackers creating many anonymous accounts. Periodically delete expired rows from `ai_request_limits`.

## Runtime and verification

Deploy on a Node server/container that supports the native ONNX runtime, writable model caching, and sufficient memory (start with at least 1 GB and measure under load). Edge runtimes are unsupported. Package native dependencies and prewarm embeddings for predictable first-response latency. The 384-dimensional MiniLM vectors use normalized mean pooling for both uploads and queries.

Conversation writes are atomic and use optimistic version checks to prevent stale tabs overwriting newer saves. Queries use a small PostgreSQL connection pool. The API does not run through auth middleware twice.

The document comparison mockup and simulated collaborators have been removed. Document QA and citations are live; multi-document comparison and real-time collaboration are not implemented.

## Dependency advisories

The release updates Next.js and overrides PostCSS to a patched release. The runtime audit has no high or critical findings. Three moderate audit entries remain in Mammoth’s command-line dependency chain (`argparse` → `sprintf-js`); the web app calls Mammoth’s document API and does not invoke that CLI. Five high audit entries remain in the ESLint build-tool chain (`braces` → `micromatch` → `fast-glob` → Next ESLint); those tools process repository files during development/CI, not user document requests. Do not use a forced downgrade to obsolete Next.js/Mammoth versions to clear these reports. Revisit when upstream fixes are available.
