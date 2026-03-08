# image-text-extraction Specification

## Purpose
TBD - created by archiving change add-ocr-text-extraction. Update Purpose after archive.
## Requirements
### Requirement: User can select a text-extraction scenario
The system SHALL provide a built-in scenario that indicates the user’s intent is to extract/transcribe all readable text from the image.

#### Scenario: OCR scenario is available in scenario selection
- **WHEN** the user opens the main page and views the scenario dropdown
- **THEN** a scenario for text extraction is available for selection

### Requirement: OCR scenario provides transcription-focused instructions
When the text-extraction scenario is selected, the system SHALL send instructions to the analysis endpoint that ask for transcription-focused output:
- return only the extracted text (no commentary)
- preserve line breaks/reading order best effort

#### Scenario: OCR instructions are used during analysis
- **WHEN** the user submits an image for analysis with the text-extraction scenario selected
- **THEN** the analysis request includes OCR-oriented instructions suitable for text transcription

### Requirement: OCR output is stored in analysis history like other analyses
The system SHALL store OCR extraction results in the same history mechanism used for other analysis results.

#### Scenario: OCR result is visible in history
- **WHEN** an OCR analysis completes successfully
- **THEN** the captured image and the returned `result_text` are added to the analysis history and shown in the UI

