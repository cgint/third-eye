# Package Upgrade Instructions & Lessons Learned

This guide outlines the process for bringing a SvelteKit/Vite project up to date, based on a successful migration to Vite 7 and Vitest 4.

## 1. Execution Sequence

### Phase 1: Baseline
- **Command:** `./precommit.sh`
- **Goal:** Capture the "before" state (Build/Check).
- **Insight:** Ensure you know what was already broken so you don't chase old bugs.

### Phase 1.5: Runtime Environment (CRITICAL)
- **Check:** Ensure your local AND deployment environment (e.g., Cloudflare Pages, Netlify, Vercel) runs Node.js 20.19+ or 22.12+.
- **Action:**
    - Create a `.node-version` file containing `20.19.6` (or your target version).
    - Add `"engines": { "node": "^20.19.0 || >=22.12.0" }` to `package.json`.
- **Why:** Vite 7 and Vitest 4 **will fail** on Node 18 (Cloudflare's default in some contexts) with `SyntaxError: ... 'node:util' ... 'styleText'`.

### Phase 2: Minor/Patch Updates

### Phase 3: Major Version Upgrades
- **Command:** `npm outdated` (to identify the gaps).
- **Command:** `npm install -D vite@latest vitest@latest @sveltejs/vite-plugin-svelte@latest`
- **Command:** `npm install @sveltejs/adapter-cloudflare@latest wrangler@latest`
- **Command:** `npm install @types/node@latest` (Crucial for `svelte-check` accuracy).

### Phase 4: Full Validation
- **Command:** `npm test -- --run`
- **Command:** `./precommit.sh`
- **Insight:** **IMPORTANT:** In this architecture, `precommit.sh` may only run `build` and `check`. You MUST run `npm test` separately to verify logic.

---

## 2. Lessons Learned & Observations

### What Worked Immediately
- **Vite 7 Compatibility:** The transition from Vite 6 to 7 was seamless. No changes were required in `vite.config.ts` or `svelte.config.js`.
- **Vitest 4 Compatibility:** Unit tests passed without modification following the upgrade from version 2 to 4.
- **Svelte 5 Stability:** The project was already on Svelte 5; updates within the 5.x range were stable.

### What Needed Solving / Attention
- **Deployment Environment Mismatch:** The local environment was on Node 20+, but Cloudflare Pages defaulted to Node 18. This caused the build to fail *only* in deployment with `EBADENGINE` and `SyntaxError` (missing `styleText`). This required adding `.node-version` and updating `package.json` engines.
- **The "Invisible" Tests:** `precommit.sh` only verified that the project *could* build and was type-safe. It did not verify that it actually *worked*. Manually running the test suite revealed that dependency injections and AI interacts remained stable, but this step is non-optional.
- **Dependency Grouping:** Upgrading `wrangler` and the `adapter-cloudflare` together is recommended to avoid version mismatches in the deployment pipeline.
- **Type Definitions:** Don't forget `@types/node`. Outdated types can cause ghost errors in `svelte-check` even if the code is logically sound.

### Strategy for Future Repos
If `npm test` passes but `npm build` fails after a major Vite upgrade, check for deprecated plugins in `vite.config.ts`. In this specific stack, the standard SvelteKit plugins handled the transition perfectly.
