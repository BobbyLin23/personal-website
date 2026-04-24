# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

Personal website built with **Nuxt 4** (Vue 3). Content-driven (blog, weekly notes, projects) using `@nuxt/content`, with `@nuxt/ui` for UI primitives, `@nuxt/image` for images, `motion-v` for animations, and `nuxt-studio` for content editing. Styled with **Tailwind CSS v4**.

## Tech Stack

- **Framework**: Nuxt ^4.4.2, Vue ^3.5
- **Language**: TypeScript (strict, via Nuxt's generated tsconfigs)
- **Styling**: Tailwind CSS v4 (`app/assets/css/main.css`)
- **Content**: `@nuxt/content` v3 with Zod-validated collections
- **UI**: `@nuxt/ui` v4, Iconify (`lucide`, `simple-icons`)
- **Validation**: `zod` v4
- **DB (content SQLite)**: `better-sqlite3`
- **Package manager**: `pnpm@10.33.2` (enforced via `packageManager` field)
- **Linter**: ESLint with `@antfu/eslint-config` (vue + typescript + markdown)

## Directory Structure

```
app/                    # Nuxt app (srcDir-style)
  app.vue               # Root component
  app.config.ts         # App-level config
  assets/css/main.css   # Tailwind entry
  components/           # Global Vue components (AppHeader, AppFooter, SafeMotion)
  layouts/              # Nuxt layouts
  pages/                # File-based routes (index, blog, weekly, projects)
content/                # Markdown + YAML content
  blog/*.md
  weekly/*.md
  projects/*.yml
server/                 # Nitro server
  routes/rss.xml.get.ts # RSS endpoints (prerendered)
  routes/rss/
  utils/
content.config.ts       # Zod schemas for content collections
nuxt.config.ts          # Nuxt configuration
public/                 # Static assets
```

## Commands

```bash
pnpm install            # install deps (runs `nuxt prepare` postinstall)
pnpm dev                # dev server
pnpm build              # production build
pnpm generate           # static site generation
pnpm preview            # preview built output
```

There are no test or lint scripts defined in `package.json`. To lint manually:

```bash
pnpm exec eslint .
```

## Content Collections (see `content.config.ts`)

- `blog` (`blog/*.md`, page): `title`, `description`, `date`, `tags?`, `draft`
- `weekly` (`weekly/*.md`, page): `title`, `description`, `date`, `week`, `year`, `commits`, `prs`, `blogs`, `books`
- `projects` (`projects/*.yml`, data): `name`, `description`, `icon`, `iconBg`, `iconColor`, `language`, `languageColor`, `stars`, `forks`, `url?`, `github?`, `demo?`, `featured`

When adding/modifying content, keep frontmatter compliant with these Zod schemas.

## Coding Conventions

- **Formatting**: follow `.editorconfig` — 2-space indent, LF, UTF-8, trim trailing whitespace, final newline. Markdown preserves trailing whitespace.
- **ESLint**: Antfu style — single quotes, no semicolons, trailing commas as configured by the preset. Do not fight the linter; run ESLint before finalizing.
- **Vue**: Use `<script setup lang="ts">` SFCs. Prefer Composition API.
- **TypeScript**: Rely on Nuxt auto-imports (`ref`, `computed`, `useRoute`, `useAsyncData`, content helpers, etc.). Do not import them manually unless required.
- **Imports**: `~/` / `@/` map to `app/` (Nuxt default). Use them for intra-app references.
- **Styling**: Tailwind utility classes; keep global CSS minimal in `app/assets/css/main.css`.
- **Icons**: Use Iconify names from the installed collections (`lucide:*`, `simple-icons:*`) via `@nuxt/ui`'s `UIcon` or equivalent.
- **Animations**: Use `motion-v` via the `SafeMotion` wrapper component when available.

## Nuxt Specifics

- `compatibilityDate`: `2025-07-15`.
- Prerendered routes: `/rss.xml`, `/rss/blog.xml`, `/rss/weekly.xml`. If you add new static endpoints, update `nitro.prerender.routes` in `nuxt.config.ts`.
- `minimark` is force-inlined via `nitro.externals.inline`.
- `nuxt-studio` is wired to the `BobbyLin23/personal-website` GitHub repo, `master` branch.
- Runtime config exposes `public.siteUrl` from `NUXT_PUBLIC_SITE_URL`.

## Branching & Commits

- Default branch: `master`. Current feature branches follow patterns like `feat/<ticket>-<slug>`.
- Commit messages follow a loose conventional style seen in history: `feat:`, `perf:`, `doc:`, `chore:`. Keep them short and lowercase.

## Agent Do / Don't

- Do keep changes minimal and focused on the requested task.
- Do match existing file/component style; prefer editing existing files over creating new ones.
- Do run ESLint on touched files before concluding.
- Don't add new top-level dependencies unless necessary; check `package.json` first.
- Don't commit build artifacts (`.nuxt/`, `.output/`, `.data/`).
- Don't modify `pnpm-lock.yaml` manually — let pnpm manage it.
- Don't introduce a different package manager (npm/yarn); this repo is pnpm-only.
- Don't expose secrets from `.env`; use `runtimeConfig`.
