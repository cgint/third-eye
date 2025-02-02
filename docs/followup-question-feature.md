# Followup Question Feature - Design Plan
       
## Overview
This document outlines a plan to add support for followup questions after an image analysis is performed. This enhancement will allow users to ask additional clarifying questions on the generated analysis, view chat history within the analysis card, and ask followups for older images stored in the analysis history.

## Motivation
- Enhance user interactivity and iterative refinement of analysis.
- Provide context-aware followup inquiries by displaying chat history below the analysis text.
- Allow re-examination of older images by converting stored base64 URLs back to Blob for followup analysis.

## Current Implementation
- Analysis is performed in `src/lib/services/imageAnalyzer.ts` using a single AI prompt.
- The result is processed and returned as `AnalysisResult` in `src/lib/models/analysis.ts`.

## Proposed Enhancements
1. Extend the analysis flow to support followup questions.
2. Update the UI in `src/lib/components/Camera.svelte`:
   - Display followup input fields and buttons within the analysis card where the image and answer are shown.
   - Display the chat history of followup interactions below the analysis text.
3. Update the API endpoint in `src/routes/api/analyze/+server.ts` to handle followup inquiries.
4. Introduce a new method in `ImageAnalyzer` (`analyzeFollowup`) to generate a followup prompt utilizing previous analysis context.
5. Support requesting followup for older images:
   - Convert stored base64 data back to Blob.
   - Send the Blob as input to the followup analysis process.

## Impacted Components
- **Analysis Model** (`src/lib/models/analysis.ts`): May be extended if additional fields are needed to track followup interactions.
- **ImageAnalyzer Service** (`src/lib/services/imageAnalyzer.ts`): Implements the `analyzeFollowup` method for followup question handling.
- **API Endpoint** (`src/routes/api/analyze/+server.ts`): Updated to support distinguishing initial analysis from followup requests.
- **UI Component** (`src/lib/components/Camera.svelte`): Enhanced to provide a followup question interface and display chat history. Also allows selection of older analysis entries for followup.

## Detailed Design
- Add an optional flag/parameter to indicate a followup request in API calls.
- In `Camera.svelte`, modify the analysis card to include:
  - An input field for entering followup questions.
  - A button to submit the followup.
  - A section below the analysis text that shows the history of followup questions and answers (chat history).
  - A mechanism to select older analysis entries, convert the base64 URL from history to a Blob, and send it for followup processing.
- Ensure backward compatibility by keeping the original analysis workflow for first-time analysis.

## Implementation Steps
1. Update the `AnalysisResult` interface if necessary to include chat history details.
2. Implement the `analyzeFollowup` method in `ImageAnalyzer`.
3. Modify the API endpoint in `src/routes/api/analyze/+server.ts` to handle followup parameters.
4. Enhance `Camera.svelte` to:
   - Insert a followup input field and button within the analysis card.
   - Display the conversation history beneath the analysis result.
   - Allow selection of an older image from the analysis history and convert its base64 image data back to a Blob for a followup request.
5. Update the analysis history store if session history tracking for followup questions is needed.
6. Test complete flows with and without followup questions.

## Conclusion
This update will significantly improve interactivity, allowing iterative refinement and deeper insights based on followup questions. Users can easily revisit older analyses, ask clarifying questions, and view complete conversation histories within the analysis card.