# Tasting Night

A collaborative beverage tasting app for hosting guided tasting sessions. The host creates a session, adds beverages (looked up via AI), and guests join via QR code to rate and take notes in real time.

Built with Next.js, Supabase, and DeepInfra.

## What it does

- **Host flow**: Sign in, create a tasting session with a name, search for beverages using AI-generated suggestions, and start the session.
- **Guest flow**: Scan a QR code, enter a name, and join the session to rate each beverage as the host steps through them.
- **Real-time sync**: All participants see the current beverage and guest ratings update live via Supabase Realtime — no polling, no page refreshes.
- **AI beverage details**: When you search for a beverage, the app queries DeepInfra (Llama 4) to generate tasting notes, serving suggestions, and a description, which are cached in the database for future sessions.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Backend | Supabase (Postgres, Auth, Realtime) |
| AI | DeepInfra — `meta-llama/Llama-4-Scout-17B-16E-Instruct` |
| Validation | Zod |
| Testing | Vitest (unit), Playwright (e2e) |

## Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (required by Supabase local dev)
- A [DeepInfra](https://deepinfra.com) account and API key

## Installation

```bash
git clone <repo-url>
cd beverage-app-versup
npm install
```

### 1. Start local Supabase

```bash
npx supabase start
```

This starts a local Postgres instance, Auth server, and Realtime service. After it starts, it prints your local `ANON KEY` and `SERVICE_ROLE KEY` — copy them.

### 2. Configure environment variables

Copy `.env.local` (already present) and fill in your values:

```env
# Supabase - use the values printed by `supabase start`
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# DeepInfra
DEEPINFRA_API_KEY=<your-deepinfra-api-key>
DEEPINFRA_BASE_URL=https://api.deepinfra.com/v1/openai
DEEPINFRA_MODEL=meta-llama/Llama-4-Scout-17B-16E-Instruct
```

### 3. Apply database migrations

```bash
npx supabase db reset
```

This runs all migrations in `supabase/migrations/` and the seed file. The schema creates three tables: `profiles`, `beverages`, and `tastings`.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests (single run) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run e2e` | Playwright end-to-end tests |
| `npm run types` | Regenerate Supabase TypeScript types from linked project |

## Project structure

```
src/
├── actions/          # Next.js Server Actions (tastings.ts, auth.ts)
├── app/
│   ├── (auth)/       # Sign in / sign up pages
│   ├── dashboard/    # Host's session list
│   ├── tasting/      # Host session management
│   │   ├── new/      # Create a tasting
│   │   └── [id]/
│   │       ├── guests/   # Guest management view
│   │       ├── taste/    # Live tasting control (host)
│   │       └── wait/     # Waiting room
│   ├── tasting-public/   # Public read-only result view
│   ├── guest/            # Guest join + rating flow
│   └── api/
│       └── beverages/
│           ├── search/   # AI beverage search endpoint
│           └── details/  # AI beverage detail fetch + cache
├── components/       # UI components (shadcn/ui + custom)
├── hooks/
│   └── use-tasting-realtime.ts  # Supabase Realtime subscription
├── lib/              # Supabase clients, DeepInfra client, validation schemas
├── types/            # TypeScript types and Supabase generated types
└── test/             # Vitest unit tests
supabase/
├── migrations/
│   ├── 00001_init.sql   # Tables, triggers, functions
│   └── 00002_rls.sql    # Row Level Security policies
└── seed.sql
```

## Database schema

**`profiles`** — extends Supabase auth users. Auto-created on signup via a Postgres trigger.

**`beverages`** — AI-generated beverage cache. Keyed on `(name, type)` to avoid duplicates across sessions.

**`tastings`** — a single tasting session owned by a user. Stores the beverage list, guest names, and all guest ratings as JSONB. Subscribed to Supabase Realtime so all clients receive live updates.

### Session states

A tasting moves through three statuses:

```
setup → in_progress → completed
```

Guests can only join during `setup`. Ratings can only be submitted during `in_progress`.

## Row Level Security

RLS is enabled on all tables. Key policies:

- Guests submit ratings using the **service role key** (via `supabaseAdmin`) since they are unauthenticated — the guest join and rating server actions bypass RLS deliberately.
- Hosts can only read, update, and delete their own tastings.
- Beverage data is publicly readable; only authenticated users can insert or update it.

## Regenerating Supabase types

After changing the schema (locally or on a linked Supabase project):

```bash
# Linked remote project
npm run types

# Local instance
npx supabase gen types typescript --local > src/types/supabase.ts
```

## Deploying

### Supabase (remote)

1. Create a project at [supabase.com](https://supabase.com).
2. Link it: `npx supabase link --project-ref <ref>`
3. Push migrations: `npx supabase db push`
4. Copy the project URL and keys from the Supabase dashboard into your production environment variables.

### Next.js

Deploy to Vercel or any Node.js host. Set the three environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) plus the `DEEPINFRA_*` variables in your host's settings.

## Developer notes

- **Server Actions vs API Routes**: Most mutations go through Next.js Server Actions in `src/actions/`. The two API routes (`/api/beverages/search` and `/api/beverages/details`) exist because they are called client-side during the beverage search flow before the form is submitted.
- **AI caching**: Beverage details returned by DeepInfra are written to the `beverages` table on first fetch. Subsequent sessions with the same beverage skip the AI call and read from the cache.
- **Realtime**: `use-tasting-realtime.ts` subscribes to Postgres changes on the `tastings` table filtered by `id`. The hook uses a stable callback ref pattern to avoid re-subscribing on every render.
- **Guest auth**: Guests are unauthenticated. Their identity is a plain name string stored in the session's `guests` array. Guest ratings are written server-side using the service role key, which bypasses RLS.
- **`SUPABASE_SERVICE_ROLE_KEY` is sensitive**: Never expose it client-side. It is only used in server actions and is intentionally not prefixed with `NEXT_PUBLIC_`.
- **Supabase local ports**: API on `54321`, DB on `54322`, Studio on `54323`, Inbucket (email testing) on `54324`.
