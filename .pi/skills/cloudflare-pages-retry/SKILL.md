---
name: cloudflare-pages-retry
description: Retry the doc-rocker Cloudflare Pages production deployment without local rebuilds or code changes, using Wrangler OAuth and the Cloudflare Pages retry API.
---

# Cloudflare Pages Retry Deploy

Use this skill when the user wants the equivalent of Cloudflare Dashboard **Retry deployment** for this repo, especially after changing Cloudflare Pages secrets or environment variables.

## Context

- Project name: `doc-rocker`
- Cloudflare account ID: `735a3c88ecec2d85387b21ade5331ac3`
- Production branch: `main`
- Important Perplexity secret for this app: `VITE_PERPLEXITY_API_KEY`
  - The code reads `import.meta.env.VITE_PERPLEXITY_API_KEY`.
  - `PERPLEXITY_API_KEY` alone is not sufficient for this repo.

## Important behavior

Wrangler does **not** currently provide a native `pages deployment retry` command. The closest exact equivalent to the UI retry is Cloudflare's API endpoint:

```text
POST /accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}/retry
```

This retries the selected deployment using the same Git commit/build settings, without local code changes or local asset upload.

## Safe workflow

1. Confirm Wrangler is logged in:

```bash
npx wrangler whoami
```

2. List production deployments and identify the latest deployment ID from the dashboard URL in the `Build` column:

```bash
npx wrangler pages deployment list --project-name doc-rocker --environment production
```

Example build URL ending:

```text
/pages/view/doc-rocker/cc2ef892-5bce-4d4a-9523-e030c2a8309c
```

The deployment ID is:

```text
cc2ef892-5bce-4d4a-9523-e030c2a8309c
```

3. Trigger retry using Wrangler OAuth token without printing the token:

```bash
ACCOUNT_ID="735a3c88ecec2d85387b21ade5331ac3"
PROJECT_NAME="doc-rocker"
DEPLOYMENT_ID="PASTE_DEPLOYMENT_ID_HERE"

WRANGLER_OAUTH_TOKEN="$(npx wrangler auth token 2>/dev/null | tr -d '\n')"

curl -sS -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$DEPLOYMENT_ID/retry" \
  -H "Authorization: Bearer $WRANGLER_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool
```

4. Success looks like:

```json
{
  "success": true,
  "errors": [],
  "messages": []
}
```

The response includes the new deployment `id`, `short_id`, `url`, stage status, commit metadata, and environment variable names.

## Token fallback on macOS

If `npx wrangler auth token` is unavailable, Wrangler OAuth config is commonly stored at:

```text
~/Library/Preferences/.wrangler/config/default.toml
```

Do not print the token. Read it only into a shell variable if needed.

## Verification

After retrying, check the deployment in Cloudflare Dashboard or list deployments again:

```bash
npx wrangler pages deployment list --project-name doc-rocker --environment production
```

Then test the app path that uses Perplexity.

## Safety notes

- Do not edit `.env` files.
- Do not redeploy with `wrangler pages deploy` when the user specifically wants a UI-style retry without local rebuild/upload.
- Do not echo or log OAuth/API tokens.
- If the Perplexity key still appears inactive, verify that `VITE_PERPLEXITY_API_KEY` was updated for the correct Cloudflare Pages environment, usually production.
