# Tasting Night - Deployment Guide

## Architecture

- **Frontend + SSR**: Next.js on Vercel
- **Database + Auth + Realtime**: Supabase (managed PostgreSQL)
- **AI Beverage Search**: DeepInfra API (called from Next.js Route Handlers)

## Prerequisites

1. **Supabase account** - [supabase.com](https://supabase.com) (free tier: 2 projects)
2. **Vercel account** - [vercel.com](https://vercel.com) (free tier for personal projects)
3. **GitHub account** - for repo hosting and Vercel integration
4. **DeepInfra API key** - [deepinfra.com](https://deepinfra.com) (for AI beverage search)
5. **Node.js 18.17+** installed locally
6. **Supabase CLI** installed: `npm install -g supabase`

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New project"
3. Select organization, enter project name (e.g., "tasting-night"), set database password, choose region
4. Wait for project provisioning (~2 minutes)
5. Under **Project Settings > API**, note:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon (public) key**: `eyJhb...` (safe to expose client-side)
   - **service_role key**: `eyJhb...` (server-only, NEVER expose to browser)
6. Note the **Project Reference** (the `xxx` part of the URL)

## Step 2: Configure Supabase Auth

1. In Supabase Dashboard > **Authentication > Providers**:
   - **Email** is enabled by default
   - Optionally disable "Confirm email" for faster development (re-enable for production)
2. In **Authentication > URL Configuration**:
   - Set **Site URL** to your production domain (e.g., `https://tasting-night.vercel.app`)
   - Add **Redirect URLs**:
     - `http://localhost:3000/callback` (development)
     - `https://your-domain.com/callback` (production)

## Step 3: Apply Database Migrations

```bash
# Link CLI to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Push migrations to remote database
npx supabase db push
```

This applies:
- `00001_init.sql` - Creates tables (profiles, beverages, tastings), triggers, indexes, and enables Realtime
- `00002_rls.sql` - Enables Row Level Security with appropriate policies

## Step 4: Push Code to GitHub

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin git@github.com:your-username/tasting-night.git
git push -u origin main
```

## Step 5: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. Add the following **Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhb...` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhb...` | Supabase service role key (server-only) |
| `DEEPINFRA_API_KEY` | `your-key` | DeepInfra API key for beverage search |
| `DEEPINFRA_BASE_URL` | `https://api.deepinfra.com/v1/openai` | DeepInfra API base URL |
| `DEEPINFRA_MODEL` | `meta-llama/Llama-4-Scout-17B-16E-Instruct` | AI model for beverage search |

5. Click **Deploy**

## Step 6: Update Supabase Redirect URLs

After Vercel assigns your domain:
1. Go to Supabase Dashboard > **Authentication > URL Configuration**
2. Update **Site URL** to your Vercel domain
3. Add your Vercel domain to **Redirect URLs**: `https://your-app.vercel.app/callback`

## Environment Variables Reference

### Client-Side (safe to expose)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (RLS enforces security)

### Server-Side Only (NEVER expose to browser)
- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses all RLS, used for guest operations
- `DEEPINFRA_API_KEY` - AI API authentication
- `DEEPINFRA_BASE_URL` - AI API endpoint (default: `https://api.deepinfra.com/v1/openai`)
- `DEEPINFRA_MODEL` - AI model name (default: `meta-llama/Llama-4-Scout-17B-16E-Instruct`)

## CI/CD: Automated Deployments

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
1. Runs migrations on push to `main`
2. Vercel auto-deploys from GitHub (no extra config needed)

### Required GitHub Secrets

Set these in your repo's **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token from [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Your project reference (the `xxx` in `https://xxx.supabase.co`) |

## Custom Domain

### Vercel
1. Dashboard > Settings > Domains > Add domain
2. Add a CNAME record pointing to `cname.vercel-dns.com`

### Supabase (Pro plan)
1. Dashboard > Settings > Custom Domains
2. Set up a vanity domain for API calls

## Local Development

```bash
# Install dependencies
npm install

# Start local Supabase (requires Docker)
npx supabase start

# The output shows local URLs and keys. Set them in .env.local:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
# SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>

# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

### Local Supabase Studio

Open `http://127.0.0.1:54323` for a local Supabase Dashboard with table editor, SQL editor, auth user management, and storage browser.

### Database Changes

```bash
# Create a new migration
npx supabase migration new <name>

# Apply migrations locally
npx supabase db reset

# Push to remote
npx supabase db push

# Regenerate TypeScript types
npm run types
```

## Monitoring

- **Supabase Dashboard > Reports** - Query performance
- **Supabase Dashboard > Logs** - Auth and API errors
- **Vercel Dashboard > Analytics** - Page performance and usage
- **Vercel Dashboard > Functions** - Server-side function logs

## Production Checklist

- [ ] Supabase project created with production region
- [ ] Database migrations applied (`npx supabase db push`)
- [ ] RLS enabled on all tables (included in migrations)
- [ ] Email confirmation enabled in Supabase Auth settings
- [ ] Redirect URLs configured for production domain
- [ ] Environment variables set in Vercel dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] `.env.local` is in `.gitignore` (it is by default)
- [ ] `.env.example` is committed (it is)
- [ ] GitHub Actions secrets configured for CI/CD
- [ ] Custom domain configured (optional)
- [ ] Vercel Analytics enabled (optional)

## Cost Estimates

### Free Tier
- **Supabase Free**: 500MB database, 1GB storage, 50K auth users
- **Vercel Free**: 100GB bandwidth, serverless functions
- **DeepInfra**: Pay-per-use (~$0.001 per beverage search)

### Production
- **Supabase Pro**: $25/month (8GB database, always-on, daily backups)
- **Vercel Pro**: $20/month (1TB bandwidth, analytics)
- **Total**: ~$45/month + DeepInfra usage
