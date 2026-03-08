# Spec: Analysis history and local persistence

## ADDED Requirements

### Requirement: Analysis results are stored as history entries in the browser
The system SHALL store each analysis result in an analysis history persisted in browser local storage.

#### Scenario: New analysis adds a history entry
- **WHEN** an analysis completes successfully
- **THEN** the system adds a new history entry containing the captured image, the analysis result text, and a timestamp

#### Scenario: History is restored on next visit
- **WHEN** the user revisits or reloads the app
- **THEN** the system restores the stored history and displays the entries

### Requirement: History is displayed newest-first
The system SHALL display analysis history entries in descending timestamp order (newest first).

#### Scenario: Newest entry appears at the top
- **WHEN** multiple history entries exist
- **THEN** the entry with the most recent timestamp is displayed first

### Requirement: User can delete history entries
The system SHALL allow the user to delete a single history entry or clear the entire history.

#### Scenario: Delete single entry
- **WHEN** the user confirms deletion of a history entry
- **THEN** the system removes that entry from the history and local storage

#### Scenario: Delete all entries
- **WHEN** the user confirms deletion of all history
- **THEN** the system clears all history entries from the UI and local storage

### Requirement: History entries support full-screen image viewing
The system SHALL allow opening history entry images in a full-screen viewer.

#### Scenario: Regular entry image can be opened full-screen
- **WHEN** the user activates the image of a regular (single-image) history entry
- **THEN** the system opens a full-screen viewer for that image

#### Scenario: Comparison entry images can be opened full-screen
- **WHEN** the user activates one image within a comparison (multi-image) history entry
- **THEN** the system opens a full-screen viewer for the selected image

### Requirement: Follow-up chat history is displayed per entry
The system SHALL display the follow-up Q&A chat history associated with a history entry.

#### Scenario: Entry displays previous follow-up Q&A
- **WHEN** a history entry has follow-up questions and answers
- **THEN** the system displays the Q&A list under that entry
