# Let users inspect analysis history images at full-screen size (mobile-first)

## Context

The app shows an analysis history list in `src/lib/components/Camera.svelte`. Each history entry renders one image (regular entry) or multiple images (comparison entry). Today those images are displayed inline and are not interactive, making them hard to inspect on small screens.

Constraints / environment:
- SvelteKit + TypeScript, history data stored client-side in `localStorage` via `$lib/stores/analysisHistoryStore`.
- Full-screen viewing must work well on phones (use available viewport space, safe-area aware).
- Returning from the viewer should bring the user back to the history without losing their place.

## Goals / Non-Goals

**Goals:**
- Provide a single-tap/click way to open a history image in a full-screen viewer.
- Viewer UI uses (near) 100% of the viewport on mobile (`100dvh`, safe-area padding).
- Closing the viewer returns to the previous history scroll position.
- Support both regular history entries (single image) and comparison entries (multiple images).
- Keep implementation small and dependency-free.

**Non-Goals:**
- No annotation/editing.
- No downloading/sharing workflows (can be added later).
- No sophisticated zoom/pan gesture implementation in this change.

## Decisions

### Decision 1: Use an in-app dedicated viewer route (same tab) rather than opening a new browser tab
**Chosen:** Add a SvelteKit route (a dedicated page) that displays a single image full-screen.

**Rationale:**
- A dedicated route maximizes available space while staying in the same app shell.
- Back navigation is native and predictable; scroll restoration is typically handled by browser history/SvelteKit.
- Users who really want a “new tab” can still use long-press / “open in new tab” behavior once there is a route URL.

**Alternatives considered:**
- **Full-screen overlay/modal inside `Camera.svelte`:** Best at preserving scroll position because the underlying page never changes, but requires scroll-lock + focus management and can be tricky across devices.
- **`window.open(imageData)` to a new tab:** Simplest conceptually but can be blocked by popup blockers and provides the least control over UX and “close/back”.

### Decision 2: Route addressing: locate the entry by timestamp and optionally pick an index
**Chosen:** Route like `/history/image/[timestamp]` and use a query param `?i=<index>` for comparison entries.

**Rationale:**
- `timestamp` is already a stable identifier used for delete/update flows.
- Avoids putting large base64 data URLs into the address bar.
- Query param avoids optional path segment complexity.

### Decision 3: Data loading is client-side only
**Chosen:** The viewer page reads from `analysisHistoryStore` (which is backed by `localStorage`) on the client.

**Rationale:**
- History images are not available server-side.
- Keeps the viewer consistent with existing history behavior.

### Decision 4: Close behavior uses browser history first
**Chosen:** Provide an explicit close/back button that calls `history.back()` (or SvelteKit `goto(-1)`), falling back to navigating to the main page if needed.

**Rationale:**
- Preserves scroll position best.
- Aligns with “return to where I was”.

## Risks / Trade-offs

- **[Risk] Scroll restoration may not fully restore history position on all devices** → **Mitigation:** Verify on mobile; if needed, persist scroll position before navigation (e.g., in sessionStorage) and restore on return.
- **[Risk] SSR/accessing localStorage on viewer route** → **Mitigation:** Guard store access with `browser` and load entry in `onMount`.
- **[Trade-off] No custom zoom/pan gestures initially** → **Mitigation:** Ensure image uses `object-fit: contain` and fills the viewport; revisit zoom as a follow-up.
- **[Risk] Comparison entries require selecting correct image** → **Mitigation:** Make each thumbnail in the comparison grid navigable with an explicit index.
