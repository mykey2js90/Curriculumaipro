# CurriculumAI — Vercel Deployment Guide

This guide walks you through deploying the CurriculumAI project to Vercel from scratch. The project is a **React 19 + Vite + Node.js (Express + tRPC)** application with Stripe payments, a blog, newsletter system, and Google AdSense.

---

## Architecture Overview

| Layer | Technology | Vercel mapping |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind 4 | Static files in `dist/public/` |
| Backend API | Express + tRPC | Serverless function at `api/index.ts` |
| Database | MySQL (PlanetScale / TiDB / AWS RDS) | External managed DB |
| Payments | Stripe Checkout + Webhooks | `/api/stripe/webhook` |
| Auth | Manus OAuth (or replace with NextAuth) | `/api/oauth/callback` |
| Storage | S3-compatible (AWS / R2 / MinIO) | `/manus-storage/*` proxy |

---

## Prerequisites

Before deploying, you need:

1. **A Vercel account** — [vercel.com](https://vercel.com)
2. **A MySQL-compatible database** — recommended options:
   - [PlanetScale](https://planetscale.com) (free tier available, serverless-friendly)
   - [TiDB Cloud](https://tidbcloud.com) (free tier, MySQL-compatible)
   - [AWS RDS MySQL](https://aws.amazon.com/rds/mysql/)
3. **A Stripe account** with live (or test) API keys
4. **Node.js 20+** and **pnpm** installed locally for the initial setup

---

## Step 1 — Clone / Download the Project

If you received this as a ZIP file, extract it. Then:

```bash
cd curriculumaipro-vercel-export
pnpm install
```

---

## Step 2 — Set Up the Database

### Option A: PlanetScale (recommended for Vercel)

1. Create a new database at [app.planetscale.com](https://app.planetscale.com)
2. Go to **Connect** → select **Node.js** → copy the connection string
3. The connection string looks like:
   ```
   mysql://username:password@aws.connect.psdb.cloud/curriculumaipro?ssl={"rejectUnauthorized":true}
   ```

### Option B: TiDB Cloud

1. Create a free cluster at [tidbcloud.com](https://tidbcloud.com)
2. Copy the connection string from the **Connect** dialog

### Run Migrations

Once you have a `DATABASE_URL`, create a local `.env` file (do not commit it):

```bash
# .env (local only — never commit this file)
DATABASE_URL=mysql://...
JWT_SECRET=some-random-32-char-string
```

Then push the schema:

```bash
pnpm db:push
```

This creates all tables: `users`, `blog_posts`, `newsletter_subscribers`, `sponsors`, `subscriptions`.

---

## Step 3 — Configure Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers** → **API keys**
2. Copy your **Secret key** (`sk_live_...`) and **Publishable key** (`pk_live_...`)
3. After deploying to Vercel (Step 5), create a webhook:
   - Go to **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://your-vercel-domain.vercel.app/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
4. Copy the **Signing secret** (`whsec_...`)

---

## Step 4 — Deploy to Vercel

### Option A: Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow the prompts)
vercel

# For production deployment
vercel --prod
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (create new)
- **Project name** → `curriculumaipro` (or your choice)
- **In which directory is your code located?** → `./` (current directory)
- **Want to modify settings?** → No (vercel.json handles everything)

### Option B: GitHub + Vercel Dashboard

1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial CurriculumAI deployment"
   gh repo create curriculumaipro --private
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel will auto-detect the `vercel.json` settings — click **Deploy**

---

## Step 5 — Add Environment Variables

In the Vercel Dashboard → **Your Project** → **Settings** → **Environment Variables**, add:

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | Your MySQL connection string | ✅ |
| `JWT_SECRET` | Random 32+ char string | ✅ |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ✅ |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ✅ |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` | ✅ (for AI) |
| `BUILT_IN_FORGE_API_KEY` | Your Manus API key | ✅ (for AI) |
| `VITE_FRONTEND_FORGE_API_URL` | `https://api.manus.im` | ✅ |
| `VITE_FRONTEND_FORGE_API_KEY` | Your frontend API key | ✅ |
| `VITE_APP_ID` | Your Manus OAuth App ID | ✅ (for auth) |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | ✅ |
| `VITE_OAUTH_PORTAL_URL` | `https://manus.im` | ✅ |
| `OWNER_OPEN_ID` | Your Manus user OpenID | ✅ (for admin) |
| `OWNER_NAME` | Your display name | Optional |
| `VITE_ADSENSE_PUBLISHER_ID` | `ca-pub-...` | Optional |

After adding variables, trigger a **Redeploy** from the Vercel dashboard.

---

## Step 6 — Custom Domain

1. In Vercel Dashboard → **Your Project** → **Settings** → **Domains**
2. Add `curriculumaipro.com`
3. Update your DNS at your registrar:
   - Add a **CNAME** record: `www` → `cname.vercel-dns.com`
   - Add an **A** record: `@` → `76.76.21.21`
4. Vercel will automatically provision an SSL certificate

---

## Step 7 — Verify Deployment

After deploying, test these endpoints:

```bash
# API health check
curl https://your-domain.vercel.app/api/trpc/auth.me

# Newsletter subscribe
curl -X POST https://your-domain.vercel.app/api/trpc/newsletter.subscribe \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"test@example.com"}}'

# Blog list
curl https://your-domain.vercel.app/api/trpc/blog.list
```

---

## Replacing the AI Provider

The curriculum generation uses the Manus LLM proxy (`server/_core/llm.ts`). To use OpenAI directly on Vercel:

1. Install the OpenAI SDK: `pnpm add openai`
2. Edit `server/routers.ts` — replace the `invokeLLM` call with:
   ```typescript
   import OpenAI from "openai";
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   const completion = await openai.chat.completions.create({
     model: "gpt-4o",
     messages: [...],
     response_format: { type: "json_object" },
   });
   ```
3. Add `OPENAI_API_KEY` to your Vercel environment variables

---

## Replacing the Auth Provider

The app uses Manus OAuth by default. To switch to a standard provider:

- **NextAuth.js / Auth.js** — replace `server/_core/oauth.ts` with Auth.js routes
- **Clerk** — replace the OAuth flow with Clerk's Express middleware
- **Custom JWT** — implement your own `/api/auth/login` endpoint

---

## Local Development

```bash
# Install dependencies
pnpm install

# Create .env with your DATABASE_URL and JWT_SECRET
# Then push the schema
pnpm db:push

# Start the dev server (Vite + Express on port 3000)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
client/src/
  pages/          ← All page components (Home, Blog, Generate, etc.)
  components/     ← Shared UI (Navbar, Footer, shadcn/ui)
  lib/trpc.ts     ← tRPC client binding
  App.tsx         ← Route definitions

server/
  routers.ts      ← All tRPC procedures (blog, newsletter, curriculum, sponsors, Stripe)
  db.ts           ← Database query helpers
  stripeWebhook.ts ← Stripe webhook handler
  storage.ts      ← S3 file storage helpers

drizzle/
  schema.ts       ← Database schema (users, blog_posts, newsletter_subscribers, sponsors, subscriptions)

api/
  index.ts        ← Vercel serverless function entry point

vercel.json       ← Vercel routing configuration
```

---

## Troubleshooting

**Build fails with "Cannot find module" errors**
→ Run `pnpm install` before building. Ensure all dependencies are in `package.json`.

**Database connection errors on Vercel**
→ PlanetScale requires `?ssl={"rejectUnauthorized":true}` in the connection string. TiDB Cloud requires `?ssl=true`.

**Stripe webhooks not received**
→ Ensure the webhook URL in Stripe Dashboard matches your Vercel domain exactly. Check the signing secret is correct.

**Auth redirects to wrong URL**
→ The OAuth callback URL must be added to your Manus OAuth app's allowed redirect URIs. Add `https://your-domain.vercel.app/api/oauth/callback`.

**"Function size limit exceeded" on Vercel**
→ The serverless function bundle must be under 250 MB compressed. If you hit this, consider moving the LLM call to a separate Edge Function or using a lighter AI SDK.
