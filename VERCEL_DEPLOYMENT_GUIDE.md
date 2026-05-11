# AetherQ - Vercel Deployment Guide

This guide provides step-by-step instructions to deploy AetherQ to Vercel production environment.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account** - Push your code to GitHub repository
3. **Environment Variables** - All required API keys and credentials
4. **Node.js 18+** - Required by Next.js 16
5. **Git** - Installed and configured

## Step 1: Prepare Your Repository

### 1.1 Ensure Everything is Committed

```bash
cd "/Users/kartikaymg57/Desktop/CPP Programs for CRT/aetherq"
git add .
git commit -m "Ready for Vercel deployment"
git push origin main  # or your main branch
```

### 1.2 Verify Build Works Locally

```bash
npm run build
npm run start
```

If the build succeeds locally, you're ready to proceed.

## Step 2: Connect GitHub to Vercel

### 2.1 Create/Connect Repository

1. Go to [github.com](https://github.com) and create a new public repository named `AetherQ-Production`
2. Push your code:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/AetherQ-Production.git
git push origin main
```

### 2.2 Link Vercel to GitHub

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Paste your GitHub repository URL or select from connected repos
5. Click **"Import"**

## Step 3: Configure Environment Variables

### 3.1 Environment Variables Required

In your Vercel project settings, add these environment variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq API (for LLM)
GROQ_API_KEY=your_groq_api_key

# Database Connection (for SQL queries)
DATABASE_URL=postgresql://user:password@host:port/database

# Document Processing
PDF_PARSE_API_KEY=your_pdf_parse_key

# OpenAI/Embedding Service (if using)
OPENAI_API_KEY=your_openai_api_key

# Custom Domain (optional)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3.2 Add Environment Variables to Vercel

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. For each variable:
   - **Name**: Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Enter the value
   - **Environments**: Select `Production`, `Preview`, `Development` as needed
   - Click **"Save"**

**Important**: Variables with `NEXT_PUBLIC_` prefix are exposed in browser - only use for public values!

### 3.3 Verify Sensitive Keys

Ensure these are ONLY set for Production environment:
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `DATABASE_URL`
- Any other sensitive credentials

## Step 4: Configure Build Settings

### 4.1 Verify Build Command

In Vercel project settings → **Build & Development Settings**:

- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build` (should auto-detect)
- **Output Directory**: `.next` (should auto-detect)
- **Install Command**: `npm ci` (recommended)

### 4.2 Optimize for Production

```bash
# Ensure package.json has correct Node.js version
# In package.json, add:
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

## Step 5: Deploy to Vercel

### 5.1 Manual Deployment

1. Return to the import flow if still there, or use dashboard
2. Review the configuration
3. Click **"Deploy"**
4. Wait for build to complete (typically 2-5 minutes)

### 5.2 Automatic Deployments (Recommended)

After initial deployment:

1. Enable **"Auto Deploy"** in Vercel project settings
2. Each push to your main branch will automatically deploy
3. Pull requests will create preview deployments

## Step 6: Post-Deployment Configuration

### 6.1 Domain Setup

#### Option A: Use Vercel's Free Domain
1. Go to **Settings** → **Domains**
2. Your deployment will have a `.vercel.app` domain

#### Option B: Connect Custom Domain
1. Go to **Settings** → **Domains**
2. Click **"Add"** and enter your domain
3. Follow DNS configuration instructions
4. Point nameservers to Vercel or add CNAME/A records

### 6.2 SSL/TLS Certificate

Vercel automatically provisions SSL certificates for all domains. No action needed.

### 6.3 API Routes Testing

Test critical endpoints after deployment:

```bash
# Test authentication
curl https://your-deployment.vercel.app/api/test

# Test document upload
curl -X POST https://your-deployment.vercel.app/api/documents \
  -H "Content-Type: application/json"

# Test chat endpoint
curl -X POST https://your-deployment.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## Step 7: Monitoring & Logs

### 7.1 View Deployment Logs

1. In Vercel dashboard, go to **Deployments**
2. Click the deployment you want to inspect
3. Click **"Functions"** or **"Runtime Logs"** to see execution logs

### 7.2 Monitor Performance

1. Go to **Analytics** in Vercel dashboard
2. Monitor:
   - Page load times
   - Error rates
   - API response times
   - Traffic patterns

### 7.3 Enable Error Tracking

1. In **Settings** → **Integrations**
2. Connect error tracking service (optional):
   - Sentry
   - Datadog
   - New Relic

## Step 8: Database Setup (Supabase)

### 8.1 Configure Supabase for Production

1. Go to your Supabase project
2. **Settings** → **Database**:
   - Enable row-level security (RLS)
   - Configure backup schedule
   - Set replica backup frequency

### 8.2 Run Migrations

```bash
# In your local environment
npm run migrate

# Or manually via Supabase SQL editor:
# 1. Go to Supabase Dashboard
# 2. SQL Editor
# 3. Run the schema SQL files:
#    - supabase-conversations-schema.sql
#    - supabase-documents-schema.sql
#    - supabase-vector-schema.sql
#    - supabase-enterprise-schema.sql
```

### 8.3 Set RLS Policies

Example RLS policy for `conversations` table:

```sql
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id);
```

## Step 9: Troubleshooting Common Issues

### Issue: Build Fails

**Error**: `npm ERR! code EWORKSPACES`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Update package-lock.json
rm package-lock.json
npm install

# Push and retry deployment
git add .
git commit -m "Update dependencies"
git push origin main
```

### Issue: Environment Variables Not Found

**Solution**:
1. Verify variable names exactly match (case-sensitive)
2. Use `NEXT_PUBLIC_` for client-side variables
3. Redeploy after adding environment variables

### Issue: Database Connection Fails

**Solution**:
```bash
# Test connection string format
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Ensure Supabase allows Vercel IP addresses:
# 1. Supabase Dashboard → Settings → Network
# 2. Add Vercel IP range or allow all IPs
```

### Issue: API Routes Timeout (>10 seconds)

**Solution**:
- Optimize database queries
- Add caching with Redis
- Break long operations into queue-based jobs (Bull, Inngest)
- Consider upgrading to Vercel Pro for longer timeouts (300s)

### Issue: Static Files Not Loading

**Solution**:
```bash
# Ensure files are in /public directory
# Verify next.config.ts for static optimization:

export default {
  staticPageGenerationTimeout: 300,
}
```

## Step 10: Security Best Practices

### 10.1 Environment Variables Security

- ✅ Use Vercel's encrypted environment variables
- ✅ Keep sensitive keys in Production only
- ✅ Rotate API keys regularly
- ❌ Never commit `.env.local` to Git

### 10.2 API Security

```javascript
// In your API routes, validate origin
if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = ['https://your-domain.com'];
  const origin = req.headers.origin;
  
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
}
```

### 10.3 Authentication

- Keep Supabase service role key secret (server-side only)
- Use JWT tokens for client authentication
- Enable Row Level Security (RLS) in Supabase

## Step 11: Performance Optimization

### 11.1 Enable Caching

```javascript
// In next.config.ts
export default {
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
}
```

### 11.2 Use Edge Functions (Optional)

For ultra-fast responses, migrate suitable API routes to Edge Functions:
- Authentication checks
- CORS handling
- Analytics collection

### 11.3 Optimize Images

```jsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority // for above-the-fold images
/>
```

## Deployment Checklist

Before going live, verify:

- [ ] All environment variables are set in Vercel
- [ ] Build succeeds locally: `npm run build`
- [ ] No console errors in development
- [ ] Database migrations are applied
- [ ] RLS policies are configured
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Error tracking is configured
- [ ] Backup strategy is in place
- [ ] Rate limiting is implemented

## Rollback Procedure

If deployment has critical issues:

1. Go to Vercel Dashboard → **Deployments**
2. Find the previous working deployment
3. Click the three dots → **Promote to Production**
4. Wait for promotion to complete (~30 seconds)

## Support & Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Deployment](https://supabase.com/docs/guides/hosting/overview)
- [Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables)

## Monthly Maintenance

- Review and rotate API keys
- Check error logs and fix bugs
- Monitor database performance
- Update dependencies: `npm update`
- Review Vercel analytics for performance trends
- Test critical user flows

---

**Last Updated**: May 2026
**AetherQ Version**: 1.0.0
**Next.js**: 16.2.5
