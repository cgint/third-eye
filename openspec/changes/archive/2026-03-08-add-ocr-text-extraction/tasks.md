## 1. Baseline + TDD reminder

- [x] 1.1 Review current scenario flow (scenarioStore → dropdown → Camera sends `instructions` to `/api/analyze`) and confirm where to add a new default scenario
- [x] 1.2 (TDD) Check existing frontend test setup (Vitest) and decide the smallest meaningful test for the new scenario (e.g., scenario list contains the new default entry)

## 2. Frontend: add OCR scenario

- [x] 2.1 Add a new default scenario (e.g. id `text-extraction`, name “Text Extraction (OCR)”) in `src/lib/stores/scenarioStore.ts`
- [x] 2.2 Write OCR-focused scenario instructions that request ONLY the extracted text and preserve basic line breaks (best effort)

## 3. Verification

- [x] 3.1 Verify locally (manual): select “Text Extraction (OCR)”, photograph a page with text, and confirm the analysis result is mainly the extracted text (copy/paste friendly)
- [x] 3.2 Verify locally (manual): select existing scenarios (“Food Product Analysis”, “General Object Analysis”) and confirm behavior is unchanged

## 4. Final verification by the user

- [x] 4.1 User tests on a phone: take a photo of a book page and confirm the app returns usable text in the analysis result and the overall flow feels unchanged
