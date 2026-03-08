# Tasks: Full-screen analysis history image viewer

## 1. Prep & test scaffolding

- [x] 1.1 Review existing test setup and add/adjust tests using TDD for any new pure-logic utilities needed by the viewer
- [x] 1.2 Add a small utility (and unit tests) to resolve the selected image from an `AnalysisEntry` + optional comparison index (including error cases)

## 2. Viewer route/page

- [x] 2.1 Add a new SvelteKit route for the full-screen viewer (timestamp param + optional index via query param)
- [x] 2.2 Implement client-side loading of the target history entry from `analysisHistoryStore` (guarded for `browser`)
- [x] 2.3 Implement full-screen viewer layout (mobile-first): safe-area aware close/back button and image constrained with contain-style sizing
- [x] 2.4 Implement graceful error UI when the timestamp is missing/not found or the comparison index is invalid

## 3. Wire up history images

- [x] 3.1 Update `Camera.svelte` so regular history entry images are clickable and navigate to the viewer route
- [x] 3.2 Update `Camera.svelte` so each comparison image is clickable and navigates to the viewer route with the correct index
- [x] 3.3 Ensure basic accessibility: clickable element has an accessible name and is keyboard-activatable

## 4. Verification

- [x] 4.1 Verify on a mobile-sized viewport that the viewer uses the full screen and close/back returns to the same history context (scroll position preserved)
- [x] 4.2 Verify both regular entries and comparison entries open the correct image
- [x] 4.3 Run automated tests and type checks (vitest + svelte-check) and ensure the build succeeds

## 5. Final verification by the user

- [x] 5.1 On your phone, open a history entry image and confirm it opens full-screen and is easy to inspect
- [x] 5.2 Close the viewer and confirm you return to the same spot in history
- [x] 5.3 Repeat for a comparison entry and confirm each image opens the correct full-screen view
