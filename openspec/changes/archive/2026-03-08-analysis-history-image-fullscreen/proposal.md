# Make analysis history images viewable full-screen on mobile

## Why

### Summary
In the analysis history, images are currently constrained to their cell/card layout, which makes them hard to inspect—especially on phones. Users need a fast way to expand an image to use the full available screen space, then return to where they were in the history.

### Original user request (verbatim)
"I want us to add a new feature that, when I click on an image in the analysis history, it should be opened full screen. Please propose if a new tab would be best, or if there is a simple way to overlay, but we need to use maximum space on a cell phone. That's why maybe a new tab is easiest."

## What Changes

- Images shown in **analysis history entries** become tappable/clickable.
- Activating an image opens a **full-screen image viewer** that maximizes usable space on mobile (safe-area aware).
- The viewer provides an obvious way to **close / go back** to the analysis history at the same scroll position.
- Non-goals (for this change): editing, annotations, downloading, or multi-image galleries.

## Capabilities

### New Capabilities
- `analysis-history-image-viewer`: Define how history images are opened and displayed in a mobile-friendly full-screen viewer, including navigation/close behavior.

### Modified Capabilities
- (none)

## Impact

- Frontend UI: analysis history list/cell components (make images interactive).
- Navigation/routing: add a viewer route/screen (or equivalent navigation state).
- Rendering/perf: ensure large images display efficiently (e.g., proper sizing, optional zoom behavior later).
- No backend/API changes expected.
