# Spec: Access gating and user preferences

## ADDED Requirements

### Requirement: User must consent before camera access and local persistence
The system SHALL require explicit user consent before enabling camera capture and storing Third Eye data (such as scenarios and analysis history) in browser local storage.

#### Scenario: First visit shows consent screen
- **WHEN** the user opens the app without previously stored consent
- **THEN** the system shows the consent screen and does not start camera capture

#### Scenario: Consent enables the main flow
- **WHEN** the user accepts the consent prompt
- **THEN** the system transitions to the main screen and begins initializing the camera

### Requirement: User can revoke consent and clear local data
The system SHALL allow the user to revoke consent at any time and SHALL clear all locally stored Third Eye data.

#### Scenario: Revoke consent returns to consent screen
- **WHEN** the user activates the revoke-consent action
- **THEN** the system clears all locally stored Third Eye data and returns to the consent screen

### Requirement: User can set a password used to authorize analysis requests
The system SHALL provide a password input that is used to authorize analysis-related requests.

#### Scenario: Incorrect password prevents analysis
- **WHEN** the user triggers analysis with an incorrect password
- **THEN** the system shows an access-denied error and does not add a new history entry

#### Scenario: Password is persisted locally
- **WHEN** the user enters a non-empty password
- **THEN** the system persists it in browser local storage and restores it on the next visit

### Requirement: User can select response language for analysis
The system SHALL let the user select a response language (English or German) that is applied to analysis, follow-up answers, and comparison results.

#### Scenario: Selected language affects analysis output
- **WHEN** the user triggers an analysis with language X selected
- **THEN** the system requests the analysis result in language X and shows the returned text

#### Scenario: Language selection persists
- **WHEN** the user changes the language selection
- **THEN** the system persists it in browser local storage and restores it on the next visit
