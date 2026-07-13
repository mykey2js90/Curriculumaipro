# CurriculumAI Vercel Export — TODO

## Database Schema
- [ ] Extend drizzle/schema.ts: users table (already exists), add newsletters, blog_posts, sponsors, subscriptions tables

## Backend (tRPC + Express)
- [ ] Newsletter router: subscribe, unsubscribe, list (admin), analytics
- [ ] Blog router: list posts, get post by slug, create/update/delete (admin)
- [ ] Curriculum router: generate curriculum via LLM
- [ ] Stripe router: create checkout session, subscription status
- [ ] Stripe webhook handler at /api/stripe/webhook
- [ ] Sponsors router: list, create, update, delete (admin), analytics
- [ ] OAuth callback already wired via _core

## Frontend Pages
- [ ] Home page (hero, features, testimonials, FAQ, newsletter CTA)
- [ ] Blog listing page (/blog)
- [ ] Blog post detail page (/blog/:slug)
- [ ] Resources page (/resources)
- [ ] About page (/about)
- [ ] Contact page (/contact)
- [ ] Privacy Policy page (/privacy)
- [ ] Terms of Service page (/terms)
- [ ] Subscription success page (/subscription-success)
- [ ] Subscription cancel page (/subscription-cancel)
- [ ] Newsletter preferences page (/newsletter/preferences)
- [ ] Newsletter analytics page (/newsletter/analytics) — admin only
- [ ] Admin newsletter page (/admin/newsletter) — admin only
- [ ] Admin sponsors page (/admin/sponsors) — admin only
- [ ] Admin sponsors analytics page (/admin/sponsors/analytics) — admin only
- [ ] 404 page (already exists)

## Navigation & Layout
- [ ] Public top navigation (logo, Blog, Resources, About, Contact, Sign In)
- [ ] Footer (links, social, copyright)
- [ ] App.tsx routes wired for all pages

## Vercel Configuration
- [ ] vercel.json with rewrites for SPA + API routes
- [ ] .env.example with all required environment variables documented
- [ ] DEPLOYMENT.md with step-by-step Vercel deployment instructions

## Tests
- [ ] Newsletter subscribe/unsubscribe vitest
- [ ] Curriculum generate vitest (mock LLM)
- [ ] Stripe checkout session vitest (mock Stripe)
