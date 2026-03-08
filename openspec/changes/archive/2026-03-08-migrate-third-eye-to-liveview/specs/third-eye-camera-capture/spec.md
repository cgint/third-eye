# Spec: Camera capture and retake

## ADDED Requirements

### Requirement: User can view a live camera preview after consent
After consent is granted, the system SHALL request camera access and display a live camera preview.

#### Scenario: Camera preview is shown
- **WHEN** the user is on the main screen after granting consent
- **THEN** the system shows a live camera preview (video feed)

#### Scenario: Camera access failure is shown as an error
- **WHEN** camera access cannot be obtained (permission denied or no camera available)
- **THEN** the system shows an error message and disables capture actions

### Requirement: User can switch camera source when multiple cameras are available
If multiple camera sources are available, the system SHALL provide a UI to switch between them.

#### Scenario: Switch UI appears when multiple cameras exist
- **WHEN** the device reports more than one video input
- **THEN** the UI provides a camera switching control

#### Scenario: Switching changes the active preview
- **WHEN** the user selects a different camera source
- **THEN** the live preview updates to the newly selected camera

### Requirement: User can capture an image and trigger analysis
The system SHALL allow the user to capture the current camera frame and trigger analysis.

#### Scenario: Capture stores a still image
- **WHEN** the user activates “Take Photo and Analyze”
- **THEN** the system captures a still image and displays it as the current captured photo

#### Scenario: Capture triggers analysis immediately
- **WHEN** the user captures a still image
- **THEN** the system starts analysis without requiring a second confirmation action

### Requirement: User can retake the photo
The system SHALL allow the user to discard the current captured photo and return to the live camera preview.

#### Scenario: Retake returns to preview
- **WHEN** the user activates “Retake Photo”
- **THEN** the system returns to the live camera preview and enables capturing again

### Requirement: User can re-run analysis for the captured photo
The system SHALL allow the user to re-run analysis on the currently captured photo without capturing a new one.

#### Scenario: Analyze again uses the same captured photo
- **WHEN** the user activates “Analyze Again” while a captured photo is displayed
- **THEN** the system triggers analysis using the same captured photo
