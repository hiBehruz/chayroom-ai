o'zing# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chayroom AI** — Nuxt 4-based AI education platform with Telegram integration. Key tech: Drizzle ORM + PostgreSQL, Telegram Web App SDK, Nuxt UI v4, S3-compatible storage, optional Redis caching.

## Commands

```bash
# Development
pnpm dev                    # Start dev server on localhost:3000
pnpm build                  # Production build (uses 8GB memory allocation)
pnpm preview                # Preview production build locally

# Database (Drizzle ORM)
pnpm db:generate            # Generate migrations from schema changes
pnpm db:migrate             # Apply migrations to database
pnpm db:studio              # Open Drizzle Studio (GUI for database)

# Testing
pnpm test                   # Run all tests
pnpm test:unit              # Run unit tests only
pnpm test:integration       # Run integration tests only
pnpm test:nuxt              # Run Nuxt-specific tests
pnpm test:production        # Test production build

# Code Quality
pnpm lint                   # Run ESLint
pnpm typecheck              # Run TypeScript type checking
```

## Architecture

**Directory Structure:**

- `app/` — Nuxt 4 application layer (pages, components, composables, middleware, stores)
- `server/` — Nitro server (API routes, database, server utilities)
- `server/db/` — Drizzle ORM schema and migrations
- `server/api/` — API endpoints organized by domain (auth, courses, guides, admin, telegram, tribute, upload)
- `server/routes/` — Server routes (distinct from API endpoints)
- `public/` — Static assets

**Component Organization:**

- `app/components/app/` — App shell components (Nav, Footer, etc.)
- `app/components/landing/` — Landing page components
- `app/components/mini-app/` — Telegram Mini App components
- `app/components/ui/` — Reusable UI components
- `app/components/guides/` — Guide-specific components

**Data Layer:**

- Database: PostgreSQL via Drizzle ORM
- Schema: `server/db/schema.ts` (single source of truth)
- Migrations: Auto-generated in `server/db/migrations/`
- Access: Import `db` from `~/server/db` in server code

**Auth & Integrations:**

- Telegram OAuth for authentication
- Telegram Web App SDK (`@twa-dev/sdk`) for Mini App features
- JWT-based sessions
- Tribute payment integration

**Storage:**

- S3-compatible (AWS S3 or Cloudflare R2)
- Config via `runtimeConfig.storageProvider` (defaults to 's3')
- Upload endpoints in `server/api/upload/`

**Caching:**

- Route-level SWR: `/catalog`, `/community`, `/about-me` (1h), `/guides/**` (10m)
- Nitro storage: Redis (if `REDIS_URL` set) or in-memory fallback

**State Management:**

- Pinia stores in `app/stores/`

**Import Aliases:**

- `~` or `@` → `app/`
- `#server` → `server/`
- Prefer aliases over relative `../` imports

---

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

### 5. Tailwind-Only Styling

**No custom CSS in components. Custom utilities belong in the global file.**

- Use only Tailwind CSS v4.x utility classes in component templates.
- If a utility class doesn't exist in Tailwind (e.g., `scrollbar-none`), add it to `app/assets/css/main.css` under `@layer utilities`.
- Never add `<style>` blocks to page or component files for utilities — they won't be reusable and will cause inconsistency.

### 6. UI Language

**All new UI text in Uzbek.**

- New strings, labels, buttons, and messages must be written in Uzbek.
- Pre-existing Russian strings are a known issue — flag them if noticed, but don't change them unless explicitly asked.

### 7. CSS Positioning Contexts

**`sticky` and `fixed` already create positioning contexts.**

- Elements with `position: sticky` or `position: fixed` establish a positioning context for `absolute` children — do not add `relative` to the same element.
- Adding `relative` alongside `sticky`/`fixed` overrides the positioning behavior and breaks the stacking context.

### 8. Responsive Changes Are Additive

**Never remove desktop classes when adding mobile support.**

- Mobile responsiveness is achieved by adding `max-md:` overrides on top of existing desktop classes.
- Do not rewrite or replace existing class strings — append mobile overrides.
- The test: every desktop class present before your edit should still be present after.

### 9. Cross-Tool Instructions

**Keep shared guidance tool-neutral and avoid duplicate sources of truth.**

- When updating project instructions, keep `CLAUDE.md` and `AGENTS.md` aligned. `CLAUDE.md` is the source of truth; `AGENTS.md` is the Codex-facing adapter.
- Do not maintain two full copies of the same instructions. Put detailed shared guidance here and keep adapters short.
- When creating a Claude skill that Codex should use, also copy it to `.agents/skills/` with its `SKILL.md` and supporting files kept together.
- When creating a Claude agent that Codex should spawn, also create `.codex/agents/<name>.toml` and put the converted instructions in `developer_instructions`.
- When adding shared knowledge, put it in `docs/`, `references/`, or `templates/` so every tool can read the same source.
