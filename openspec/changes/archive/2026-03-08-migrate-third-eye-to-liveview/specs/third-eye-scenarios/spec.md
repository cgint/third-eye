# Spec: Scenario selection and scenario management

## ADDED Requirements

### Requirement: User can select a scenario before analyzing an image
The system SHALL provide a scenario dropdown that lets the user choose the intent/instructions used for analysis.

#### Scenario: Built-in scenarios are available
- **WHEN** the user opens the main screen
- **THEN** the scenario dropdown includes built-in scenarios for food-product analysis, general object analysis, and text extraction (OCR)

#### Scenario: Selected scenario is used for analysis
- **WHEN** the user captures an image while scenario S is selected
- **THEN** the analysis request uses scenario S’s instructions

### Requirement: Selected scenario persists across visits
The system SHALL persist the last selected scenario in browser local storage.

#### Scenario: Scenario selection is restored
- **WHEN** the user revisits or reloads the app
- **THEN** the scenario dropdown defaults to the previously selected scenario

### Requirement: User can manage custom scenarios
The system SHALL allow the user to create, edit, and delete user-defined scenarios consisting of a name and instructions.

#### Scenario: Create custom scenario
- **WHEN** the user opens “Manage Scenarios” and submits a new scenario with a name and instructions
- **THEN** the new scenario appears in the scenario dropdown and is available for selection

#### Scenario: Edit custom scenario
- **WHEN** the user edits a previously created custom scenario
- **THEN** the scenario’s name/instructions are updated in the dropdown and used for subsequent analyses

#### Scenario: Delete custom scenario
- **WHEN** the user deletes a custom scenario
- **THEN** the scenario is removed from the dropdown and is no longer selectable

### Requirement: User can provide ad-hoc custom instructions
The system SHALL provide a “Custom Instructions” scenario that lets the user input instructions directly.

#### Scenario: Custom instructions are editable and persisted
- **WHEN** the user selects the “Custom Instructions” scenario and enters instruction text
- **THEN** the instruction text is persisted in browser local storage and restored on the next visit

#### Scenario: Custom instructions are used for analysis
- **WHEN** the user captures an image while “Custom Instructions” is selected
- **THEN** the analysis request uses the user-provided instruction text
