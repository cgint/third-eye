# Spec: Installable PWA shell

## ADDED Requirements

### Requirement: App provides a web manifest and icons
The system SHALL serve a web app manifest and app icons so the app can be installed as a PWA.

#### Scenario: Manifest is available
- **WHEN** the browser requests the manifest
- **THEN** the system serves a valid `manifest.json` that identifies the app name and icons

#### Scenario: Icons are available
- **WHEN** the browser requests the configured app icons
- **THEN** the system serves the icon assets successfully

### Requirement: App registers a service worker when supported
The system SHALL register a service worker in browsers that support service workers.

#### Scenario: Service worker registration succeeds
- **WHEN** the app is loaded in a browser that supports service workers
- **THEN** the app attempts to register the service worker

### Requirement: PWA shell is safe-area friendly on mobile
The system SHALL render its main UI using safe-area insets on devices with display cutouts.

#### Scenario: Main UI avoids unsafe areas
- **WHEN** the app is displayed on a notched device
- **THEN** the main UI content is not obscured by the safe area
