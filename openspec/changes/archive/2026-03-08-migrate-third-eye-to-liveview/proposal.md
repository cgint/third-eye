# Reduce maintenance cost of Third Eye while keeping the UX stable

> Implementation note: the LiveView rewrite is implemented in the sister repo `../third-eye-liveview`.
> This SvelteKit repo keeps these change docs as the original planning record and UX reference.

## Why

### Summary
Third Eye is currently implemented as a SvelteKit (client-only) PWA with server endpoints for Gemini-based image analysis. In parallel, we already have multiple Phoenix LiveView apps in sibling repos (notably `../agent-coding-gui` and `../elix-live-chat`) that use a modern, consistent stack (BEAM/Elixir/Phoenix LiveView + Tailwind v4 + daisyUI) and have proven to be highly productive and durable.

Maintaining Third Eye on a separate SvelteKit/Cloudflare-centric stack increases long-term maintenance cost (duplicate patterns for state, realtime UI, styling, build tooling, deployment) and makes it harder to evolve the product consistently across our tool deck.

This change proposes a full rewrite of the Third Eye implementation to our established LiveView stack while preserving the user-visible behavior and flows as closely as possible (styling will shift slightly due to daisyUI).

### Original user request (verbatim)
We need to transfer this whole implementation to a more modern stack called Beam, Elixir, and LiveView. We already use it in quite some places and have awesome experience with it. 

you find projects under ../ - search for mix.exs and you will see which repositories I mean. Most important, for sure, are the agent coding GUI. And the elix live chat as I would say, they are the most modern tools I have on this deck done by me. I want us to leverage the stack and not port the solution one by one from the current svelte-kit .
It is important to distinguish between the functionality, which we have to keep one by one. From a user experience perspective, basically nothing should change. Besides, we are using a bit different styling due to daisy UI being used in the new stack. 
From an overall functionality and rough visibility perspective, not a lot should change for the user using that tool. 

But from a technological perspective, let's say basically everything changes because we really want to leverage the new stack and not be bound to how things were done in the current stack. 
I need you to really properly investigate the Elixir Live View stack and how we did it, and how the documentation tells us about best practices. use asks.sh and web search to gather information.

Create a proper plan that clearly distinguishes between initially and first and foremost getting to know what the UI does and what it does for the user, and how the user experiences the visualization and also the flows. 

And there's a separate one. We need a plan and a good idea of how we will implement this in the new stack. 


---


Please look around, make yourself comfortable and aware of the situation, then come back to me so that you can ask me maybe some questions if there are any clarities.

## What Changes

- Re-implement the Third Eye web app in Phoenix LiveView (Elixir/BEAM) while keeping the current user-facing flows and behavior:
  - consent gate
  - scenario selection + scenario management
  - camera capture + (re)analyze
  - analysis history (stored locally) including delete actions
  - follow-up questions per entry
  - compare multiple history entries
  - full-screen history image viewer
  - PWA shell (manifest, service worker, icons)
- Replace the current SvelteKit `/api/analyze` and `/api/compare` server endpoints with an Elixir-based Gemini client implementation.
- Update styling to the LiveView app’s Tailwind/daisyUI look-and-feel (minor visual differences are expected; functional UX should remain stable).

## Capabilities

### New Capabilities
- `third-eye-access-and-preferences`: Consent gate + password input + language selection and persistence.
- `third-eye-scenarios`: Scenario selection and scenario management (built-in + user-defined), including custom instructions.
- `third-eye-camera-capture`: Mobile-first camera access, camera selection/switching, capture + retake.
- `third-eye-analysis`: Gemini-based analysis for captured images, including follow-up questions and comparison prompts.
- `third-eye-analysis-history`: Local persistence and UI for analysis history entries (including follow-up chat history), and integration points for existing viewer/ocr specs.
- `third-eye-pwa-shell`: Installable PWA shell (manifest, icons, service worker) and safe-area friendly layout.

### Modified Capabilities
- 

## Impact

- Major tech stack shift: from SvelteKit/TypeScript runtime-centric implementation to Phoenix LiveView/Elixir.
- Build/tooling: introduce `mix`, Phoenix asset pipeline (Tailwind + esbuild), and daisyUI-based styling.
- Deployment/runtime: move away from Cloudflare Pages/Workers assumptions; choose a BEAM-friendly deployment/packaging approach.
- Significant refactor/rewrite risk: requires a clear UX parity checklist and staged rollout to avoid regressions.
