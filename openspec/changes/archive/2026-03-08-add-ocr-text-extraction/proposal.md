# Enable copyable full text from photos (OCR-style extraction)

## Why

### Summary
Today the app’s analysis flow is optimized for “describe/analyze a product/object”, which is great for groceries but not for “I want the text that’s on this image”. When taking a photo of a book page, label, or document, users often want a transcription they can copy/paste, not commentary.

Adding a first-class “extract text” scenario keeps the existing photo → analyze → history workflow intact while enabling a new high-value use case: quickly digitizing text from a single page.

### Original user request (verbatim)
>I want us to add a possibility to this app so that one can have all text that is on the image extracted. And it should match the existing flow. Just the so-called analysis result should contain all text identified on the image. The idea here is to, for example, take a photo of one page of a book to get the text.

## What Changes

- Add a new built-in scenario: “Text Extraction (OCR)”.
- When this scenario is selected, the app sends OCR-focused instructions (verbatim transcription, preserve line breaks, no extra commentary) to the existing `/api/analyze` endpoint.
- Keep all existing flows and endpoints unchanged (no new API fields, no backend mode switches).

## Capabilities

### New Capabilities
- `image-text-extraction`: Provide an OCR-oriented scenario so users can extract/copy text from an image via the existing analysis flow.

### Modified Capabilities
- 

## Impact

- Frontend only: add one new default scenario in `src/lib/stores/scenarioStore.ts`.
- No backend/API changes required for the first version (we accept that the model may sometimes translate/paraphrase depending on global prompting).
