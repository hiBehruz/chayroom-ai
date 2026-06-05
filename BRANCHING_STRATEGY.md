# Branching Strategy

How branches are organized in this repository (Chayroom AI — Nuxt 4 app, hosted on
GitHub, deployed by Vercel). This is a **solo-developer** project, so the model is
deliberately lightweight: two permanent branches and short-lived topic branches.

For day-to-day commands, commit conventions, PR rules, and merge mechanics, see
[GIT_WORKFLOW.md](./GIT_WORKFLOW.md). This file defines **which branches exist and why**.

---

## 1. Branch overview

| Branch       | Role                     | Branched from | Merges into        | Lifetime    | Deploys to          |
| ------------ | ------------------------ | ------------- | ------------------ | ----------- | ------------------- |
| `master`     | Production / stable      | —             | —                  | permanent   | Vercel **production** |
| `dev`        | Integration / staging    | `master`      | `master` (releases) | permanent   | Vercel preview      |
| `feature/*`  | New feature              | `dev`         | `dev`              | short-lived | per-branch preview  |
| `fix/*`      | Non-urgent bug fix       | `dev`         | `dev`              | short-lived | per-branch preview  |
| `hotfix/*`   | Urgent production fix    | `master`      | `master` **and** `dev` | short-lived | per-branch preview |

> **Vercel mapping (confirm once in the Vercel dashboard):** the **Production Branch**
> must be `master`. Every other branch and pull request gets an automatic **preview
> deployment** with its own URL — that is your staging environment, so you do not need
> extra long-lived branches to preview work.

---

## 2. The two permanent branches

### `master` — production

- Always deployable. Whatever is on `master` is (or can be) live in production.
- **Never commit directly to `master`.** It only ever receives:
  - **release merges** from `dev`, or
  - **`hotfix/*` merges** for emergencies.
- Every merge into `master` is a release and should be tagged (see
  [GIT_WORKFLOW.md → Releasing](./GIT_WORKFLOW.md#7-releasing-dev--master)).

### `dev` — integration

- The **default working branch** and the base for all `feature/*` and `fix/*` branches.
- Completed, self-reviewed features accumulate here and are tested together before being
  promoted to `master`.
- May be ahead of `master` between releases (e.g. it currently carries 3 finished commits
  not yet released). That is expected and healthy.
- Keep `dev` green: it should always pass CI (lint + typecheck) so a release is never blocked.

---

## 3. Short-lived branches

Topic branches isolate in-progress work so `dev` stays stable. They are **created from the
latest `dev`** (hotfixes from `master`), **merged back via a pull request**, and **deleted
immediately after merge**.

- `feature/*` — a new, self-contained capability. Use when work spans multiple sessions, is
  risky, touches many files, or you want an isolated preview URL before it lands.
- `fix/*` — a bug fix that is not an emergency.
- `hotfix/*` — a fix for something currently broken in production. Branches from `master`,
  ships to `master` fast, then is back-merged into `dev` so the fix is not lost.

Trivial one-liners (a typo, a doc tweak) may be committed straight to `dev` without a branch.
Anything larger gets a branch.

---

## 4. Naming conventions

```
<type>/<short-kebab-description>
```

- **`<type>`** is one of the prefixes below (they mirror our commit types).
- **`<short-kebab-description>`** is lowercase, hyphen-separated, 2–5 words, no spaces or
  underscores. Describe the change, not the file.
- Optionally prefix the description with an issue number: `feature/42-admin-panel`.

| Prefix      | Use for                          | Branched from |
| ----------- | -------------------------------- | ------------- |
| `feature/`  | New functionality                | `dev`         |
| `fix/`      | Non-urgent bug fix               | `dev`         |
| `hotfix/`   | Urgent production fix            | `master`      |
| `refactor/` | Restructuring, no behavior change | `dev`        |
| `chore/`    | Tooling, deps, config            | `dev`         |
| `docs/`     | Documentation only               | `dev`         |

### Examples (grounded in this project's history)

| Good                                | Bad                          | Why bad                         |
| ----------------------------------- | ---------------------------- | ------------------------------- |
| `feature/admin-panel`               | `admin`                      | no type prefix                  |
| `feature/tribute-subscriptions`     | `feature/Tribute_Subs`       | uppercase + underscore          |
| `fix/profile-subscription-badge`    | `fix/bug`                    | not descriptive                 |
| `hotfix/webhook-signature`          | `feature/webhook-fix`        | urgent prod fix ≠ feature       |
| `refactor/feature-folders`          | `refactor/move-stuff-around` | vague, too long                 |
| `feature/42-mini-app-tasks`         | `dev-local`                  | not a topic branch; looks permanent |

---

## 5. Branch lifecycle

```
  feature/*  ─┐
  fix/*      ─┤  squash-merge via PR
             ▼
           dev ───────── --no-ff release merge + tag vX.Y.Z ─────────► master ──► Vercel prod
             ▲                                                            │
             │                          back-merge                        │
             └──────────────────────────────────────────────── hotfix/*  ◄┘  (branched from master)
```

1. Branch a `feature/*` off the latest `dev`.
2. Commit, push, open a PR into `dev`; CI runs and Vercel builds a preview.
3. Self-review the diff and the preview, then squash-merge into `dev`; delete the branch.
4. When `dev` has a releasable set of changes, merge `dev` into `master` (`--no-ff`) and tag it.
5. Vercel deploys `master` to production.
6. For emergencies, branch `hotfix/*` from `master`, ship to `master`, then back-merge into `dev`.

---

## 6. What stays in `dev` (completed work)

`dev` holds work that is **finished and reviewed but not yet promoted to a production
release**. As of this writing, that is the three commits `dev` carries ahead of `master`:

```
3414d8d  feat(pricing): redesign card layout with aligned buttons and premium spacing
e687af3  fix typecheck issues and pricing layout
879dcea  chore: clean up repo lint issues
```

These belong on `dev` now and ship to `master` at the next release. The general rule:

> A change stays in `dev` once it is merged, preview-verified, and integration-tested with
> everything else on `dev` — until you cut a release to `master`.

Do **not** keep half-finished work sitting on `dev`. Unfinished work lives on its own
`feature/*` branch until it is done.

---

## 7. What becomes a feature branch (future work)

Make a `feature/*` (or `fix/*`) branch when **any** of these is true:

- The work spans more than one sitting.
- It is risky or could destabilize `dev`.
- It touches many files or several areas at once.
- You want an isolated Vercel preview URL to validate it before it lands.

### Immediate example in this repo: `feature/admin-panel`

The existing `feature/admin-panel` branch is the model case — 15 cohesive commits building
the Supabase + Notion CMS and admin surface:

```
64e74a0  feat: add supabase, notion, vitest dependencies and env config
76a20ae  feat: add supabase server client and admin verification utility
ce882fc  feat: add courses CRUD server API routes
7d55408  feat: add guides CRUD server API routes
9e05b7f  feat: add image upload and notion content API routes
9319f49  feat: add admin route middleware
399da97  feat: add admin list page with courses and guides tabs
02592f1  feat: add course form and admin course pages
62a27af  feat: add guide form and admin guide pages
1cdfbf9  feat: connect courses and guides pages to Supabase
b50edee  feat: add course detail page with Kinescope video embed
1fdb289  feat: add guide detail page with Notion content renderer
9fe8443  feat: add demo data fallback when Supabase/Notion not configured
```

It has drifted far behind `dev`, so it needs to be **rebased onto the latest `dev`** (or its
valuable commits cherry-picked), finished, and merged via PR — not abandoned. See the cleanup
checklist in [GIT_WORKFLOW.md](./GIT_WORKFLOW.md#9-one-time-repository-cleanup).

### Likely future feature branches (illustrative)

`feature/course-player`, `feature/mini-app-tasks`, `feature/notion-cms`,
`feature/payments-<provider>`, `refactor/<area>` — anything net-new and multi-step.

---

## 8. Current repository cleanup

The repo has accumulated stale branches. Target end-state and the action for each:

| Branch                              | State                              | Action                                  |
| ----------------------------------- | ---------------------------------- | --------------------------------------- |
| `master`                            | production trunk                   | **keep** (push unpushed commit)         |
| `dev`                               | integration, 3 ahead of `master`   | **keep** (push to origin)               |
| `feature/admin-panel`               | 15 unique commits, badly diverged  | **rebase onto `dev`, finish, then PR**  |
| `dev-local`                         | 0 unique commits, dead since May 20 | **delete**                              |
| `backup-before-restore-0215-2026-05-20` | restore-incident leftover      | **delete** (after `git log dev..<b>` check) |
| `backup-before-restore-0240-2026-05-20` | restore-incident leftover      | **delete** (after check)                |
| `backup-before-restore-2026-05-20-1430` | restore-incident leftover      | **delete** (after check)                |
| `backup-wrong-restore-2026-05-20-1412`  | restore-incident leftover      | **delete** (after check)                |

Commands for this cleanup are in
[GIT_WORKFLOW.md → One-time cleanup](./GIT_WORKFLOW.md#9-one-time-repository-cleanup).
Going forward, **commit + push is your backup** — stop creating `backup-*` branches.
