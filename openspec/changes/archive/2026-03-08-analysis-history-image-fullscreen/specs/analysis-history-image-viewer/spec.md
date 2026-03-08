# Capability: Analysis history image viewer

## ADDED Requirements

### Requirement: User can open a history image in a full-screen viewer
The system SHALL allow the user to open any image rendered inside an analysis history entry in a full-screen viewer.

#### Scenario: Open regular history entry image
- **WHEN** the user taps/clicks the image of a regular (single-image) history entry
- **THEN** the system shows a full-screen viewer displaying that image

#### Scenario: Open comparison history entry image
- **WHEN** the user taps/clicks one specific image inside a comparison (multi-image) history entry
- **THEN** the system shows a full-screen viewer displaying the tapped image

### Requirement: Viewer maximizes usable space on mobile
The full-screen viewer SHALL display the image using the maximum available viewport space on mobile devices, including correct handling of safe-area insets.

#### Scenario: Image is contained within viewport
- **WHEN** the viewer is shown
- **THEN** the image is fully visible without being cropped, using a contain-style layout (max-width/max-height constrained to the viewport)

#### Scenario: Controls do not overlap unsafe areas
- **WHEN** the viewer is shown on a device with display cutouts (safe areas)
- **THEN** the viewer’s close/back control is reachable and not placed under the unsafe area

### Requirement: User can close the viewer and return to where they were
The system SHALL provide an explicit close/back control in the viewer and SHALL return the user to the previously visible analysis history state.

#### Scenario: Close viewer returns to history
- **WHEN** the user activates the viewer’s close/back control
- **THEN** the system returns to the analysis history view

#### Scenario: Return preserves user context
- **WHEN** the user closes the viewer
- **THEN** the analysis history remains at (or returns to) the prior scroll position so the user can continue where they left off

### Requirement: Invalid viewer targets are handled gracefully
If a viewer target cannot be resolved (missing history entry or invalid index), the system SHALL show an error state with a way to return.

#### Scenario: History entry not found
- **WHEN** the viewer is opened for a timestamp that does not exist in analysis history
- **THEN** the system shows a not-found/error message and provides a back/close action

#### Scenario: Comparison image index out of range
- **WHEN** the viewer is opened with an index that is not valid for the comparison entry
- **THEN** the system shows a not-found/error message and provides a back/close action
