# AGENTS.md

This file is the Codex-facing adapter for the project. Treat `CLAUDE.md` as the source of project knowledge and use this file to translate that guidance into Codex workflow expectations.

Do not duplicate long sections from `CLAUDE.md` here. When instructions conflict, follow the more specific user request first, then `CLAUDE.md`, then this adapter.

## Start Here

- Read `CLAUDE.md` before making code changes.
- Follow `CLAUDE.md` section 9 for cross-tool instruction, skill, agent, and shared-knowledge maintenance.
- Keep changes surgical and goal-driven.
- Use Tailwind CSS v4 utility classes for component styling.
- Put custom reusable utilities in `app/assets/css/main.css` under `@layer utilities`.
- Write all new UI text in Uzbek.
- Preserve desktop classes when adding responsive behavior; append `max-md:` overrides instead.
- Do not add `relative` to elements that are already `sticky` or `fixed`.

## Project Map

- `app/app.vue` - root Nuxt shell, global layout wiring, page transitions, Telegram back button handling, SEO metadata.
- `app/pages/` - route views for landing, auth, dashboard, profile, catalog, courses, guides, and admin creation screens.
- `app/components/` - shared UI and feature components.
- `app/components/app/` - app-wide navigation, footer, loader, access modal, and avatar pieces.
- `app/components/landing/` - landing page sections.
- `app/components/ui/` - small reusable presentation primitives.
- `app/composables/` - Nuxt/Vue composables, including Telegram app integration.
- `app/stores/` - Pinia stores for auth, courses, and guides.
- `app/middleware/` - route middleware.
- `app/plugins/` - client plugins.
- `app/assets/css/main.css` - Tailwind import and global utilities.
- `app/assets/fonts/`, `app/assets/icons/`, `app/assets/images/` - static design assets used by the UI.
- `nuxt.config.ts` - Nuxt modules, runtime config, route rules, Vite dev server settings, and lint style settings.
- `package.json` - scripts and dependencies; package manager is `pnpm`.
- `.claude/` - Claude Code settings. No project-local Claude skills or agents are present in this checkout.
- `.agents/skills/` - Codex-compatible skill location for copied Claude skills when they exist.
- `.codex/` - Codex project adapter config and agent definitions.

## Commands

- Install dependencies: `pnpm install`
- Run dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`

## Codex Notes

- Use `rg`/`rg --files` for project search.
- Check `git status --short` before editing and avoid touching unrelated dirty files.
- If Claude skills are later added under `.claude/skills/`, copy important skill directories into `.agents/skills/` with each `SKILL.md` and its supporting files kept together.
- If Claude agents are later added under `.claude/agents/*.md`, convert important ones into `.codex/agents/*.toml` with the original instructions placed in `developer_instructions`.
