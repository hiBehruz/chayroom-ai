# Feature-Based Components Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the current root-level component outliers into a simple feature-based structure, update references safely, and keep all existing Nuxt 4 behavior intact.

**Architecture:** Preserve the existing page and route structure while making `app/components/` reflect ownership boundaries. Keep routes in `pages/`, keep shared shell pieces in `components/app`, keep shared mini-app UI in `components/mini-app`, and keep shared guide editing UI in `components/guides`.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Pinia, Nuxt UI 4, Tailwind CSS 4, Tiptap

---

### Task 1: Prepare Safe Move Targets

**Files:**
- Create: `app/components/mini-app/`
- Create: `app/components/guides/`
- Reuse: `app/components/app/`
- Reuse: `app/components/landing/`
- Verify: `app/components/MiniAppCatalog.vue`
- Verify: `app/components/MiniAppDashboard.vue`
- Verify: `app/components/GuideEditor.vue`

- [ ] **Step 1: Confirm the dirty worktree before moving files**

Run:

```bash
git status --short
```

Expected:

```text
M app/components/GuideEditor.vue
M app/components/MiniAppCatalog.vue
M app/components/MiniAppDashboard.vue
...
```

- [ ] **Step 2: Create only the missing feature directories**

Run:

```bash
mkdir -p app/components/mini-app app/components/guides
```

Expected:

```text
no output
```

- [ ] **Step 3: Verify the target directory layout**

Run:

```bash
find app/components -maxdepth 2 -type d | sort
```

Expected:

```text
app/components
app/components/app
app/components/guides
app/components/landing
app/components/mini-app
app/components/ui
```

- [ ] **Step 4: Commit the directory-prep checkpoint**

Run:

```bash
git add app/components
git commit -m "chore: prepare feature component folders"
```

Expected:

```text
[branch-name ...] chore: prepare feature component folders
```

### Task 2: Move App, Landing, and Mini-App Components Without Rewriting Logic

**Files:**
- Modify: `app/components/AppLogo.vue`
- Modify: `app/components/LandingHeroArt.vue`
- Modify: `app/components/MiniAppBottomNav.vue`
- Modify: `app/components/MiniAppCatalog.vue`
- Modify: `app/components/MiniAppDashboard.vue`
- Create via move: `app/components/app/Logo.vue`
- Create via move: `app/components/landing/HeroArt.vue`
- Create via move: `app/components/mini-app/BottomNav.vue`
- Create via move: `app/components/mini-app/Catalog.vue`
- Create via move: `app/components/mini-app/Dashboard.vue`

- [ ] **Step 1: Move the app logo into the app feature folder**

Run:

```bash
git mv app/components/AppLogo.vue app/components/app/Logo.vue
```

Expected:

```text
no output
```

- [ ] **Step 2: Move the landing artwork into the landing feature folder**

Run:

```bash
git mv app/components/LandingHeroArt.vue app/components/landing/HeroArt.vue
```

Expected:

```text
no output
```

- [ ] **Step 3: Move the shared mini-app navigation and content components**

Run:

```bash
git mv app/components/MiniAppBottomNav.vue app/components/mini-app/BottomNav.vue
git mv app/components/MiniAppCatalog.vue app/components/mini-app/Catalog.vue
git mv app/components/MiniAppDashboard.vue app/components/mini-app/Dashboard.vue
```

Expected:

```text
no output
```

- [ ] **Step 4: Verify the moved files landed in the intended locations**

Run:

```bash
find app/components/app app/components/landing app/components/mini-app -maxdepth 1 -type f | sort
```

Expected:

```text
app/components/app/AccessModal.vue
app/components/app/Footer.vue
app/components/app/Logo.vue
app/components/app/Nav.vue
app/components/app/PageLoader.vue
app/components/app/PixelAgentAvatar.vue
app/components/landing/HeroArt.vue
app/components/mini-app/BottomNav.vue
app/components/mini-app/Catalog.vue
app/components/mini-app/Dashboard.vue
```

- [ ] **Step 5: Commit the feature moves that do not require tag renames**

Run:

```bash
git add app/components/app/Logo.vue app/components/landing/HeroArt.vue app/components/mini-app
git commit -m "refactor: move shared components into feature folders"
```

Expected:

```text
[branch-name ...] refactor: move shared components into feature folders
```

### Task 3: Move the Guide Editor and Update Its Component Name

**Files:**
- Modify: `app/components/GuideEditor.vue`
- Create via move: `app/components/guides/Editor.vue`
- Modify: `app/pages/guides/[slug].vue`
- Modify: `app/pages/admin/guides/new.vue`
- Modify: `app/pages/admin/courses/new.vue`

- [ ] **Step 1: Move the guide editor into the guides feature folder**

Run:

```bash
git mv app/components/GuideEditor.vue app/components/guides/Editor.vue
```

Expected:

```text
no output
```

- [ ] **Step 2: Update the public guide page to the new auto-import name**

Change [app/pages/guides/[slug].vue](/Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/guides/[slug].vue:531) from:

```vue
<GuideEditor v-model="editContent" />
```

to:

```vue
<GuidesEditor v-model="editContent" />
```

- [ ] **Step 3: Update the admin guide create page to the new auto-import name**

Change [app/pages/admin/guides/new.vue](/Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/admin/guides/new.vue:639) from:

```vue
<GuideEditor v-model="content" />
```

to:

```vue
<GuidesEditor v-model="content" />
```

- [ ] **Step 4: Update the admin course create page to the new auto-import name**

Change [app/pages/admin/courses/new.vue](/Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/app/pages/admin/courses/new.vue:691) from:

```vue
<GuideEditor v-model="content" />
```

to:

```vue
<GuidesEditor v-model="content" />
```

- [ ] **Step 5: Verify no stale `GuideEditor` references remain**

Run:

```bash
rg -n "<GuideEditor|GuideEditor" app
```

Expected:

```text
no matches
```

- [ ] **Step 6: Commit the guide editor rename and reference updates**

Run:

```bash
git add app/components/guides/Editor.vue app/pages/guides/[slug].vue app/pages/admin/guides/new.vue app/pages/admin/courses/new.vue
git commit -m "refactor: move guide editor into guides feature"
```

Expected:

```text
[branch-name ...] refactor: move guide editor into guides feature
```

### Task 4: Tighten `.gitignore` for Local Agent Artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append the missing local artifact ignore rules**

Add these lines to the end of [.gitignore](/Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/.gitignore:1):

```gitignore
coverage/
pnpm-debug.log*
.pnpm-store/
.claude/*.lock
.claude/*.log
.claude/logs/
.ai/
.agent/
.secrets/
```

- [ ] **Step 2: Verify the new ignore rules are present exactly once**

Run:

```bash
tail -n 20 .gitignore
```

Expected:

```text
coverage/
pnpm-debug.log*
.pnpm-store/
.claude/*.lock
.claude/*.log
.claude/logs/
.ai/
.agent/
.secrets/
```

- [ ] **Step 3: Commit the ignore-file update**

Run:

```bash
git add .gitignore
git commit -m "chore: ignore local agent artifacts"
```

Expected:

```text
[branch-name ...] chore: ignore local agent artifacts
```

### Task 5: Verify the Refactor End-to-End

**Files:**
- Verify: `app/app.vue`
- Verify: `app/pages/catalog.vue`
- Verify: `app/pages/dashboard.vue`
- Verify: `app/pages/profile.vue`
- Verify: `app/pages/mini/about.vue`
- Verify: `app/pages/mini/guides.vue`
- Verify: `app/pages/mini/rules.vue`
- Verify: `app/pages/guides/[slug].vue`
- Verify: `app/pages/admin/guides/new.vue`
- Verify: `app/pages/admin/courses/new.vue`

- [ ] **Step 1: Verify the feature-based component tree matches the plan**

Run:

```bash
find app/components -maxdepth 2 -type f | sort
```

Expected excerpt:

```text
app/components/app/Logo.vue
app/components/guides/Editor.vue
app/components/landing/HeroArt.vue
app/components/mini-app/BottomNav.vue
app/components/mini-app/Catalog.vue
app/components/mini-app/Dashboard.vue
app/components/TemplateMenu.vue
```

- [ ] **Step 2: Check that the mini-app and guide component tags still resolve**

Run:

```bash
rg -n "MiniAppBottomNav|MiniAppCatalog|MiniAppDashboard|GuidesEditor" app
```

Expected excerpt:

```text
app/app.vue:...:        <MiniAppBottomNav />
app/pages/catalog.vue:...:  <MiniAppCatalog />
app/pages/dashboard.vue:...:  <MiniAppDashboard v-if="isMiniApp" />
app/pages/guides/[slug].vue:...:              <GuidesEditor v-model="editContent" />
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected:

```text
Lint completes without new errors caused by the refactor.
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected:

```text
Typecheck completes without new errors caused by the refactor.
```

- [ ] **Step 5: Run build**

Run:

```bash
pnpm build
```

Expected:

```text
Nuxt build completes successfully.
```

- [ ] **Step 6: Perform manual smoke checks for the affected flows**

Check these routes in the browser:

```text
/dashboard
/catalog
/profile
/mini/about
/mini/guides
/mini/rules
/guides/<existing-slug>
/admin/guides/new
/admin/courses/new
```

Expected:

```text
All routes render with the same UI and behavior as before the refactor.
```

- [ ] **Step 7: Commit the verified refactor state**

Run:

```bash
git add app/components app/pages .gitignore
git commit -m "refactor: reorganize components by feature"
```

Expected:

```text
[branch-name ...] refactor: reorganize components by feature
```
