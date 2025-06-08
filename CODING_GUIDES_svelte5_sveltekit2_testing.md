# TESTING_USE_CASES.md - Test Strategy and Best Practices for UI Testing

## Test Strategy based on USE_CASES.md

This document outlines a test strategy for implementing automatable UI tests for the Chatty application, based on the functionalities described in `USE_CASES.md`.

**1. Testing Framework:**

*   **Playwright** is recommended for end-to-end UI testing in this SvelteKit project. It provides excellent support for modern web applications, browser automation, assertions, and reporting.
*   **Alternative:** Cypress could also be used as another popular end-to-end testing framework.

**2. Test Case Structure:**

*   Organize test cases based on the "User Interface Functionalities" sections in `USE_CASES.md`.
*   Each functionality section (e.g., "Chat Functionality", "Settings Page") becomes a test suite.
*   Within each test suite, create individual test cases for each specific functionality (e.g., "Inputting and sending chat messages", "Saving settings").
*   Test case names should be descriptive and directly relate to the functionality being tested, mirroring the descriptions in `USE_CASES.md`.

**3. Test Types:**

*   **End-to-End (E2E) UI Tests:** Focus on simulating user interactions and verifying application behavior from a user perspective. This directly aligns with the goal of testing user interface functionalities.
*   **Component Tests (Optional):** Consider adding component tests for individual Svelte components for more granular testing, but E2E tests are prioritized for initial UI testing based on use cases.

**4. Test Case Implementation:**

*   Follow the Arrange-Act-Assert pattern for each test case:
    *   **Arrange:** Set up the initial application state.
    *   **Act:** Simulate user actions based on "Input Parameters" from `USE_CASES.md`.
    *   **Assert:** Verify "Expected Output" as described in `USE_CASES.md`.

**5. Test File Location:**

*   Use a `tests` directory at the project root for test files (SvelteKit convention).
*   Organize test files by feature or functionality area (e.g., `tests/chat.spec.ts`, `tests/settings.spec.ts`).

**6. Running Tests:**

*   Use `playwright test` (or Cypress CLI) to execute tests.
*   Integrate test execution into CI/CD pipelines for automation.

## API Key Handling in UI Tests

**1. Environment Variables (Recommended):**

*   Store API keys as environment variables.
*   **`.env.test` File:** Create a `.env.test` file in the project root (or `tests` directory) for test API keys. Add `.env.test` to `.gitignore`.
*   **Load Variables:** Use `dotenv` or SvelteKit's environment variable handling to load variables in the test environment.
*   **Access in Tests:** Access API keys in Playwright tests using `process.env.API_KEY_NAME`.

**2. Separate Test API Keys:**

*   Use dedicated API keys specifically for testing to isolate testing from production environments.

**3. Avoid Hardcoding and Git Commits:**

*   Never hardcode API keys in test files.
*   Ensure `.env.test` and similar files are excluded from Git.

## UI Test Stability Best Practices

**1. Stable Selectors: `data-testid` Attributes:**

*   **Add `data-testid`:**  Include `data-testid` attributes to important UI elements in Svelte components (e.g., `<button data-testid="send-button">Send</button>`).
*   **Prioritize `data-testid` Selectors:** Use `data-testid` selectors in Playwright tests for element location (e.g., `page.locator('[data-testid="send-button"]')`).

**2. Page Object Model (POM):**

*   **Implement POM:** Create Page Object classes to represent UI pages/components.
*   **Abstract Selectors:** Encapsulate UI selectors within Page Objects.
*   **Use Page Object Methods:** Interact with UI elements in tests through Page Object methods.

**3. Minimize UI Logic in Tests:**

*   **Focus on Behavior:** Test application behavior and functionality, not UI implementation details.
*   **Avoid UI-Specific Assertions:** Minimize assertions tied to UI styling or layout.

**4. Proper Test Synchronization:**

*   **Avoid Timed Waits:** DEFINITELY AVOID use of timed waiting instructions (like `page.waitForTimeout()`) as these tend to be flaky and can lead to inconsistent test results.
*   **Use Actionability Checks:** Leverage Playwright's built-in actionability checks that wait for elements to be visible, enabled, and stable before acting on them.
*   **Wait for State Changes:** Use explicit waits for specific conditions like `page.waitForSelector()`, `page.waitForLoadState()`, or `element.waitForElementState()`.
*   **Wait for Network Idle:** Use `page.waitForLoadState('networkidle')` when waiting for API responses or data loading.
*   **Custom State Indicators:** Add custom state indicators in the application when necessary to signal when complex operations have completed.

## Code Adaptations for Testability

**1. Add `data-testid` Attributes:**

*   Modify Svelte components to include `data-testid` attributes for testable elements.

**2. Component Structure:**

*   Structure components for testability. Break down complex components if needed. Ensure clear component responsibilities and isolation.

**3. Application Instrumentation for Testing:**

*   **State Indicators:** When application readiness is determined by internal JavaScript variables, add DOM attributes or properties that reflect these states (e.g., `<div data-loading-complete="true">` when a loading process finishes).
*   **Custom Events:** Emit custom events at key points in the application lifecycle that tests can listen for (e.g., `document.dispatchEvent(new CustomEvent('data-loaded'))`).
*   **Application-Specific Attributes:** Add attributes that indicate specific application states:
    * `data-loading-state="complete"` for loading indicators
    * `data-api-response-received="true"` when API responses are processed
    * `data-animation-complete="true"` when animations or transitions finish
*   **Make Careful Modifications:** When adding these testing hooks, ensure they don't affect the application's functionality or user experience. Keep changes minimal and focused on testability.

By following this test strategy and incorporating these best practices, you can create a robust, maintainable, and secure UI testing suite for the Chatty application that avoids flaky tests through proper synchronization techniques.