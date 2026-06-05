# Git Workflow

The day-to-day Git process for Chayroom AI (Nuxt 4, GitHub + Vercel, solo developer).
Read [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) first for **which branches exist and
why** — this file covers **how to work**: commits, pull requests, merges, releases, and
hotfixes.

**Model in one line:** work on `feature/*` branches off `dev` → PR into `dev` → release `dev`
into `master` → Vercel deploys `master` to production.

---

## 1. Principles

- **`master` is always releasable.** Only releases and hotfixes touch it.
- **`dev` is always green.** It must pass CI (lint + typecheck) at all times.
- **Branches are cheap and short-lived.** Open, merge, delete. Don't let them rot (the old
  `feature/admin-panel` fell 147 commits behind — avoid that).
- **Every merge goes through a PR.** Even solo: you get a Vercel preview, a CI gate, and a
  searchable record (more in [§5](#5-pull-request-rules)).
- **Commit + push is your backup.** No `backup-*` branches.

---

## 2. Daily workflow

```bash
# 1. Start from the latest dev
git switch dev
git pull --ff-only

# 2. Create a short-lived branch (naming: see BRANCHING_STRATEGY.md §4)
git switch -c feature/course-player

# 3. Work in small, logical commits (Conventional Commits — see §4)
git add -p
git commit -m "feat(courses): add lesson video player"
# ...repeat...

# 4. Push and open a PR into dev
git push -u origin feature/course-player
gh pr create --base dev --fill        # or open the PR in GitHub

# 5. Wait for CI (lint + typecheck) to pass, then review the Vercel preview URL

# 6. Merge into dev (squash) and delete the branch
gh pr merge --squash --delete-branch  # or use the GitHub "Squash and merge" button

# 7. Clean up locally
git switch dev
git pull --ff-only
```

Trivial changes (typo, comment, doc line) may be committed straight to `dev` and pushed —
skip the branch and PR. Use judgment; anything reviewable gets a branch.

---

## 3. Continuous integration

CI is defined in [.github/workflows/ci.yml](./.github/workflows/ci.yml) and runs on **every
push** (and therefore every PR):

- `pnpm run lint`
- `pnpm run typecheck`

**A PR may only be merged when CI is green.** Run both locally before pushing to avoid the
round-trip:

```bash
pnpm run lint && pnpm run typecheck
```

---

## 4. Commit messages — Conventional Commits

Format (matches the convention already used across this repo's history):

```
<type>(<optional-scope>): <imperative summary, lowercase, no trailing period>
```

**Types** (the five already in use here):

| Type       | When                                         | Example                                                        |
| ---------- | -------------------------------------------- | -------------------------------------------------------------- |
| `feat`     | New user-facing capability                   | `feat(pricing): redesign subscription card layout`             |
| `fix`      | Bug fix                                       | `fix(profile): show real subscription state`                   |
| `refactor` | Restructure, no behavior change               | `refactor: move shared components into feature folders`        |
| `chore`    | Tooling, deps, config, housekeeping           | `chore: clean up repo lint issues`                             |
| `docs`     | Documentation only                            | `docs: add Tribute subscription integration spec`             |

**Scope** is an optional area in parentheses — e.g. `auth`, `courses`, `guides`, `pricing`,
`tribute`, `mini-app`, `db`, `deploy`. Use one when it sharpens the message.

**Rules**

- Imperative mood: "add", "fix", "remove" — not "added"/"adds".
- One logical change per commit. If the summary needs "and", split the commit.
- Keep the subject ≤ ~70 chars; put detail in the body if needed.
- ❌ `fix typecheck issues and pricing layout` — two concerns, no type/scope.
- ✅ `fix(pricing): correct card alignment` + a separate `chore: fix typecheck errors`.

---

## 5. Pull request rules

A PR is the gate into `dev` (and into `master` for releases/hotfixes).

**When a PR is required**

- Every `feature/*`, `fix/*`, `refactor/*`, and `hotfix/*` branch.
- Releases (`dev` → `master`) — open a PR so CI and the preview run against the release set.
- Skip a PR only for trivial direct-to-`dev` commits (see [§2](#2-daily-workflow)).

**Rules**

1. **CI must pass** (lint + typecheck) before merging.
2. **`master` is protected by convention** — it only receives release PRs from `dev` and
   `hotfix/*` PRs. Never target `master` with feature work.
3. **PR title is a Conventional Commit** (see [§4](#4-commit-messages--conventional-commits)) —
   it becomes the squash-merge commit subject, so write it well.
4. **Self-review before merging.** Read your own diff and open the Vercel preview URL; treat
   it like reviewing someone else's code.
5. **Keep PRs small and focused** — one feature or fix. Easier to review, preview, and revert.
6. **Delete the branch on merge** (`--delete-branch` or the GitHub button).

**Why bother with PRs as a solo dev?** A preview deployment to click through, a CI gate that
catches lint/type breaks, a forced pause to self-review, and a permanent record of *why* a
change landed. The few seconds of ceremony pay for themselves the first time a preview shows a
broken layout before it reaches production.

---

## 6. Merge strategy

| Merge                     | Strategy                          | Result                                            |
| ------------------------- | --------------------------------- | ------------------------------------------------- |
| `feature/*` / `fix/*` → `dev` | **Squash** (default)          | One clean commit per feature on `dev`             |
| Large multi-part feature → `dev` | **Merge `--no-ff`**        | Preserves the meaningful commit history           |
| `dev` → `master`          | **Merge `--no-ff`** + **tag**     | Each release is a clear, revertible marker        |
| `hotfix/*` → `master`     | **Merge `--no-ff`** + **tag**     | Then back-merge `master` → `dev`                  |

**Guidance**

- **Squash** small/medium features so `dev` reads as one tidy commit per capability.
- Use a **`--no-ff` merge** when a branch's individual commits are worth keeping (e.g. a large
  feature like `feature/admin-panel` whose 15 commits document the build).
- **Never fast-forward `dev` into `master`** — always `--no-ff`, so every release is an
  explicit merge commit you can point a tag at and roll back to.
- **Avoid `git rebase` on `dev`/`master`** (shared, permanent). Rebase is fine on your own
  un-pushed topic branches to keep them current (see [§8](#8-keeping-branches-in-sync)).

---

## 7. Releasing (`dev` → `master`)

When `dev` holds a releasable set of changes:

```bash
git switch dev && git pull --ff-only          # make sure dev is current & green
git switch master && git pull --ff-only

git merge --no-ff dev -m "release: v1.2.0"     # explicit release merge commit
git tag -a v1.2.0 -m "Pricing redesign + lint cleanup"
git push origin master --follow-tags           # Vercel deploys master to production
```

**Versioning (lightweight SemVer):** `vMAJOR.MINOR.PATCH`

- `MINOR` bump when the release adds features (`feat`).
- `PATCH` bump for fix-only releases.
- `MAJOR` for breaking or large redesigns.

Tags give you the rollback markers the repo currently lacks (there are no tags yet). To roll
back production, point Vercel at the previous tag or `git revert` the release merge.

---

## 8. Hotfixes (urgent production fix)

When something is broken in production and can't wait for the normal `dev` cycle:

```bash
git switch master && git pull --ff-only
git switch -c hotfix/webhook-signature

# fix it, commit
git commit -am "fix(tribute): correct HMAC signature verification"
git push -u origin hotfix/webhook-signature
gh pr create --base master --fill              # PR straight into master

# after CI passes and you merge (squash or --no-ff) + tag a PATCH release:
git switch dev && git pull --ff-only
git merge master                               # back-merge so dev keeps the fix
git push
```

The **back-merge into `dev` is mandatory** — otherwise the next release would silently revert
the hotfix.

---

## 9. Keeping branches in sync

```bash
# Bring a long-running topic branch up to date with dev (rebase your own un-pushed work):
git switch feature/admin-panel
git fetch origin
git rebase origin/dev          # resolve conflicts, then continue
# (if already pushed, you'll need: git push --force-with-lease)

# Always pull permanent branches fast-forward only, to catch unexpected divergence early:
git pull --ff-only
```

---

## 10. One-time repository cleanup

Bring the repo to the target state described in
[BRANCHING_STRATEGY.md §8](./BRANCHING_STRATEGY.md#8-current-repository-cleanup). Review each
step before running — **documentation only; nothing here has been executed for you.**

```bash
# 0. Confirm Vercel's Production Branch is `master` (Vercel dashboard) before anything else.

# 1. Push the permanent branches so origin matches local
git switch master && git push
git switch dev     && git push

# 2. Salvage feature/admin-panel: rebase onto dev, finish it, PR into dev (do NOT delete)
git switch feature/admin-panel
git fetch origin && git rebase origin/dev      # expect conflicts; resolve or cherry-pick
#   ...finish the work, then open a PR into dev...

# 3. Delete dead branches (lowercase -d refuses to drop unmerged work — safe)
git branch -d dev-local
for b in \
  backup-before-restore-0215-2026-05-20 \
  backup-before-restore-0240-2026-05-20 \
  backup-before-restore-2026-05-20-1430 \
  backup-wrong-restore-2026-05-20-1412; do
    git log --oneline dev.."$b"   # inspect: empty output = nothing unique to lose
    git branch -d "$b"            # use -D only after confirming it's safe
done

# 4. Clear any stale stash (e.g. the old redesign/top-co-style WIP)
git stash list                    # review, then: git stash drop <id>
```

---

## 11. Quick reference

```bash
# Start work
git switch dev && git pull --ff-only
git switch -c feature/<name>

# Save work
git add -p
git commit -m "feat(<scope>): <summary>"
git push -u origin feature/<name>

# Land it
gh pr create --base dev --fill
gh pr merge --squash --delete-branch

# Release
git switch master && git pull --ff-only
git merge --no-ff dev -m "release: vX.Y.Z"
git tag -a vX.Y.Z -m "<notes>"
git push origin master --follow-tags
```

| I want to…                         | Branch from | Merge into          | Strategy            |
| ---------------------------------- | ----------- | ------------------- | ------------------- |
| Build a feature                    | `dev`       | `dev`               | squash via PR       |
| Fix a non-urgent bug               | `dev`       | `dev`               | squash via PR       |
| Fix production *now*               | `master`    | `master` + `dev`    | PR + tag, back-merge |
| Ship a release                     | —           | `master`            | `--no-ff` + tag     |
| Tiny typo/doc tweak                | (on `dev`)  | `dev`               | direct commit       |
