# AetherQ Enterprise Security Upgrade - Implementation Guide

## Summary of Changes

This document summarizes all changes made to upgrade AetherQ from a single-user demo to a secure enterprise multi-tenant SaaS platform.

## 1. Database Schema Changes

### New SQL Migration: `supabase-add-user-isolation.sql`

Adds user isolation to the existing database:

- **Added `user_id` column** to:
  - `documents_metadata`
  - `document_chunks`
  - `document_extractions`
  - `access_audit_logs` (new table)

- **Enabled Row-Level Security (RLS)** on all user-scoped tables

- **Created RLS Policies** for:
  - SELECT: Users can only see their own data
  - INSERT: Users can only create records for themselves
  - UPDATE: Users can only modify their own records
  - DELETE: Users can only delete their own records

- **Created User-Scoped Functions**:
  - `match_document_chunks_for_user()`: Semantic search filtered by user_id
  - Supports vector similarity search with user isolation

- **Created Storage Policies** for private bucket access

### How to Apply:

1. In Supabase dashboard, go to SQL Editor
2. Copy contents of `supabase-add-user-isolation.sql`
3. Run the entire script
4. Verify tables have RLS enabled

## 2. Authentication System

### New Files:

- `middleware.ts`: Protects routes, redirects unauthenticated users
- `src/lib/supabase-browser.ts`: Client-side Supabase config for SSR
- `src/lib/supabase-server.ts`: Server-side Supabase config for SSR  
- `src/lib/auth-helpers.ts`: Helper functions for auth in API routes
- `src/providers/AuthProvider.tsx`: React context for auth state
- `src/app/login/page.tsx`: Login page with email/password + OAuth
- `src/app/signup/page.tsx`: Sign-up page with validation
- `src/app/auth/callback/route.ts`: OAuth callback handler

### Features:

- Google OAuth 2.0
- Email/password authentication
- Session persistence
- Automatic redirect for unauthenticated users
- Protected route middleware

## 3. Updated File Structure

### Workspace Layout:

```
/workspace (authenticated)
├── /chat (AI Workspace)
├── /documents (Document Intelligence) 
├── /analytics (Enterprise Analytics)
└── /layout.tsx (workspace layout)
```

Old routes (`/chat`, `/documents`, `/analytics`) still exist but are deprecated in favor of `/workspace/*` routes.

### Sidebar Component:

Updated `src/components/Sidebar.tsx`:
- Shows current user email
- Links point to `/workspace/*` routes
- Added logout button
- Active route highlighting

## 4. API Security Updates

### Updated Routes:

- `src/app/api/documents/route.ts` - Added auth check
- `src/app/api/search/route.ts` - Added auth check + uses `match_document_chunks_for_user`
- `src/app/api/documents/extract/route.ts` - Added auth check
- `src/app/api/documents/qa/route.ts` - Added auth check

### Auth Helper Functions:

```typescript
// Get authenticated user from request
const { user, supabase } = await getUserFromRequest(request);

if (!user) {
  return createAuthErrorResponse(); // 401 Unauthorized
}

// All queries filtered by user.id:
await supabase
  .from("documents_metadata")
  .select("*")
  .eq("user_id", user.id);
```

## 5. Updated Dependencies

Added to `package.json`:
```json
"@supabase/ssr": "^0.5.0"
```

This enables proper server-side session handling for Next.js App Router.

## 6. Environment Variables Required

The following environment variables must be set:

```bash
# Existing (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
GROQ_API_KEY=gsk_...
HUGGINGFACE_API_KEY=hf_...

# New (optional but recommended)
NEXT_PUBLIC_SITE_URL=https://aetherq.yoursite.com
```

## 7. Deployment Checklist

### Supabase Setup:

1. ✅ Create `/auth/users` table (automatic with Supabase)
2. ✅ Run `supabase-add-user-isolation.sql` migration
3. ✅ Enable Google OAuth:
   - Settings → Authentication → Providers → Google
   - Add your OAuth credentials
4. ✅ Create `documents-private` bucket (optional):
   - Storage → New bucket
   - Name: `documents-private`
   - Privacy: Private
5. ✅ Verify RLS policies are enabled on all tables

### Next.js / Vercel:

1. ✅ Update environment variables in Vercel dashboard
2. ✅ Set `NEXT_PUBLIC_SITE_URL` for OAuth callbacks
3. ✅ Deploy: `git push` to trigger Vercel deployment
4. ✅ Verify auth works by testing login/signup

### Manual Testing Steps:

1. **Sign Up**: Visit `/signup` → create account → verify email
2. **Log In**: Visit `/login` → enter credentials
3. **Dashboard**: After login, should redirect to `/workspace`
4. **Upload**: Visit `/workspace/documents` → upload a file
5. **Verify RLS**: 
   - Create second account
   - Verify second account cannot see first account's documents
6. **Search**: Visit `/workspace/chat` → ask question about uploaded doc
7. **Analytics**: Visit `/workspace/analytics` → run SQL query

## 8. Breaking Changes / Notes

### What Changed:

- Unauthenticated users no longer have access
- All data is now user-scoped
- Public routes: `/`, `/login`, `/signup`
- Protected routes: `/workspace/*`

### What Stayed the Same:

- All existing APIs continue to work
- Upload → Extraction → Embedding → Search pipeline unchanged
- Vector embeddings still use HuggingFace
- AI responses still use Groq
- SQL analytics still works
- Markdown rendering unchanged
- UI styling unchanged

### Backward Compatibility:

- Old URLs (`/chat`, `/documents`, `/analytics`) still work for logged-in users
- Direct access to APIs requires authentication (status 401)
- Anonymous access no longer possible

## 9. Security Considerations

### What's Protected:

- ✅ Row-Level Security on all tables
- ✅ Authenticated session middleware
- ✅ User_id validation in all API routes
- ✅ OAuth provider credentials never exposed client-side
- ✅ Service role key never used client-side (server-only)
- ✅ Private storage bucket for documents

### What's NOT Yet Protected:

- SQL analytics can still run any read-only query (by design)
- Admin functions may need additional RBAC (beyond this scope)

## 10. Troubleshooting

### "Unauthorized" on API calls:

Check:
- User is logged in (`/workspace` should work)
- Session cookie is valid
- Browser is sending credentials (check Network tab)

### Users can't log in:

Check:
- Supabase auth is enabled
- `NEXT_PUBLIC_SUPABASE_URL` and anon key are correct
- Google OAuth credentials are set (if using OAuth)

### "Policy missing" errors:

The RLS policies are enabled but missing. Run the migration again:
- Copy `supabase-add-user-isolation.sql` content
- Run in Supabase SQL editor
- Verify `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

### Old routes don't work:

They should still work. If not:
- Ensure you're logged in (middleware redirects to `/login` if not)
- Check that user exists in `auth.users` table

## 11. Next Steps for Production

1. **Add RBAC** (Role-Based Access Control) for admin users
2. **Add audit logging** for all data access
3. **Set up backups** in Supabase
4. **Enable email verification** enforcement
5. **Add MFA** (Multi-Factor Authentication) options
6. **Implement rate limiting** on APIs
7. **Set up monitoring/alerting** in Vercel
8. **Add API key management** for service integrations
9. **Create data retention policies**
10. **Set up GDPR compliance** (data export/deletion)

## 12. File Manifest

### New Files:
- `middleware.ts`
- `src/lib/supabase-browser.ts`
- `src/lib/supabase-server.ts`
- `src/lib/auth-helpers.ts`
- `src/providers/AuthProvider.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/workspace/page.tsx`
- `src/app/workspace/layout.tsx`
- `src/app/workspace/chat/page.tsx`
- `src/app/workspace/documents/page.tsx`
- `src/app/workspace/analytics/page.tsx`
- `supabase-add-user-isolation.sql`
- `SECURITY_UPGRADE.md` (this file)

### Modified Files:
- `package.json` - Added @supabase/ssr dependency
- `src/app/layout.tsx` - Added AuthProvider
- `src/lib/supabase.ts` - Added session configuration
- `src/components/Sidebar.tsx` - Updated with auth UI
- `src/app/api/documents/route.ts` - Added auth checks
- `src/app/api/search/route.ts` - Added auth checks
- `src/app/api/documents/extract/route.ts` - Added auth checks
- `src/app/api/documents/qa/route.ts` - Added auth checks

### Unchanged:
- All existing components (chat, documents, analytics)
- All existing services
- All existing hooks
- All existing types
- Store configuration
- CSS/styling

## 13. Support & Questions

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Check Next.js documentation: https://nextjs.org/docs
3. Review error messages in browser console and server logs
4. Check Supabase dashboard → Logs for database errors
5. Verify environment variables are set correctly in `.env.local`
