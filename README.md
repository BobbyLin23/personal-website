# Personal Website

## Publish from Notion

`POST /api/publish` converts a Notion database page into markdown, commits it to GitHub (`content/blog` or `content/weekly`), and relies on the normal host rebuild.

Notion **Send webhook** is a paid-plan feature. Use a **database button**, not a page-body button — page-body buttons cannot send the page id.

### 1. Integration and database

1. Create an internal Notion integration with **Read content** (and read properties).
2. Copy the integration secret into `NUXT_NOTION_TOKEN`.
3. Share your Posts database with the integration.
4. Add a **Publish** database button whose action is **Send webhook**:
   - URL: `https://<your-site>/api/publish`
   - Custom header: `X-Publish-Secret` = `NUXT_PUBLISH_SECRET`

### 2. Suggested properties

Shared: Title, Description, Date, Language (`en-US`, `zh-CN`, …), Type (`blog` | `weekly`), Slug (optional), Draft (blog), Tags (blog).

Weekly extra: Week, Year, Commits, PRs, Blogs, Books. Filename fallback is `YYYY-wWW.md`.

Optional: `NUXT_NOTION_DATABASE_IDS` (comma-separated) to allow only those databases.

### 3. GitHub

Create a PAT (or GitHub App token) with `contents:write` on this repo. Do not reuse Studio OAuth client secrets.

```
NUXT_PUBLISH_SECRET=
NUXT_NOTION_TOKEN=
NUXT_NOTION_DATABASE_IDS=
NUXT_GITHUB_TOKEN=
NUXT_GITHUB_OWNER=BobbyLin23
NUXT_GITHUB_REPO=personal-website
NUXT_GITHUB_BRANCH=master
```

Manual test:

```bash
curl -X POST "$NUXT_PUBLIC_SITE_URL/api/publish" \
  -H "Content-Type: application/json" \
  -H "X-Publish-Secret: $NUXT_PUBLISH_SECRET" \
  -d '{"pageId":"<notion-page-id-or-url>"}'
```
