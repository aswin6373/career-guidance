# PathFinder — AI Career Guidance Platform (Kerala / India)

**Live:** https://path-finder-ten-kappa.vercel.app

Guides Plus Two students toward suitable careers and courses. A guided AI
conversation builds a structured profile; a **deterministic scoring +
recommendation engine** makes the final decision; the AI only interviews,
extracts, and explains. A **verified knowledge base (130 careers)** is the
source of all facts.

> **Architecture rule:** AI = interviewer + extractor + explainer.
> Scoring engine + recommendation engine = final decision-makers.
> Knowledge base = source of facts. The AI never invents a career/course/fee/exam.

## Stack

- **Next.js 14 (App Router) + TypeScript** — full-stack (UI + API routes)
- **Tailwind CSS + shadcn/ui** — styling
- **Supabase PostgreSQL** — data, accessed via **service role only on the server**; RLS default-deny
- **Groq** (openai/gpt-oss-20b) — the AI model (server-only)
- **Vercel** — deployment

## Flow

Landing → Start quiz (name/stream/subjects/interests) → AI-guided follow-ups →
Onboarding (consent; minors get guardian consent per DPDP) → AI assessment
(personalised aptitude + interest questions) → **Result**: engine-ranked
careers with fit scores, confidence, caveats, and an AI-written explanation.

## Project structure

```
supabase/
  migrations/        15 migrations: core tables, knowledge base, admin/audit, RLS
src/
  app/               pages (/, start, chat, deeper, result, admin) + 13 API routes
  core/              profile-builder · scoring-engine · recommendation-engine ·
                     ai interviewer/extractor/explainer · assessment generator
  lib/               supabase clients (server/admin) · kb-loader · rate-limit ·
                     audit · env validation
  types/             onboarding · profile · kb · assessment · recommendation
```

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL/keys, Groq key, etc.
npm run dev                  # http://localhost:3000
npm run typecheck && npm test
```

Database: run `supabase/migrations/*.sql` in order (0001 → 0015) in the Supabase
SQL editor — includes the full 130-career knowledge base.

## Security & privacy

- Service-role + AI keys are **server-only** (`server-only` import guards)
- **RLS** default-deny; public read only on KB catalog tables
- IPs are **hashed**, never stored raw; `audit_log` records sensitive actions
- Minors (age < 18) require guardian consent (DPDP) — timestamped + versioned
- Every AI/PII route is **rate-limited**
