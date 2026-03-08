# Spec: Image analysis, follow-ups, and comparisons

## ADDED Requirements

### Requirement: Captured images can be analyzed with scenario instructions
The system SHALL analyze a captured image using the currently selected scenario instructions and the selected response language.

#### Scenario: Successful analysis produces result text
- **WHEN** the user captures an image for analysis
- **THEN** the system returns an analysis result as text and displays it to the user

#### Scenario: Analysis failure is shown as an error
- **WHEN** analysis fails (network error, server error, or unauthorized)
- **THEN** the system shows an error message and does not create a new history entry

### Requirement: User can ask follow-up questions for an analysis entry
The system SHALL allow the user to ask a follow-up question for a specific analysis history entry and store the Q&A as chat history for that entry.

#### Scenario: Follow-up answer is appended to entry chat history
- **WHEN** the user submits a follow-up question for a history entry
- **THEN** the system obtains a follow-up answer and appends it to the entry’s chat history

### Requirement: User can compare multiple analysis entries
The system SHALL allow the user to select at least two non-comparison history entries and request a comparison analysis.

#### Scenario: Compare requires at least two entries
- **WHEN** the user opens the compare UI
- **THEN** the system prevents confirming comparison with fewer than two selected entries

#### Scenario: Comparison result is created as a comparison entry
- **WHEN** the user confirms comparison for N≥2 history entries
- **THEN** the system produces a comparison result and stores it as a new comparison history entry referencing the compared images
