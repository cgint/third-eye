# Combined SvelteKit Coding Guidelines

This document combines best practices for developing a SvelteKit application with a web frontend and REST API backend using server-side rendering, drawing from the provided document and the linked resources.

## 1. Project Structure

*   **File-Based Routing:** Utilize SvelteKit's file-based routing system for organizing your project.
*   **src/lib Directory:** Store shared components and utility functions within the src/lib directory.
*   **src/routes Directory:** Place pages and API routes in the src/routes directory.
*   **+page.svelte:** Use +page.svelte files for your page components.
*   **+page.server.ts:** Use +page.server.ts files for server-side data loading.
*   **+layout.svelte:** Use +layout.svelte for layout components.
*   **+layout.server.ts:** Use +layout.server.ts for server-side layout data loading.
*   **src/routes/api:** Create API endpoints within the src/routes/api directory.
*   Recommended SvelteKit Structure:
```
- src/
- lib/
- routes/
- app.html
- static/
- svelte.config.js
- vite.config.js
```

## 2. TypeScript Usage

*   **Strict Mode:** Enable strict mode in TypeScript for enhanced type safety.
*   **Interfaces:** Prefer interfaces over types for improved readability.
*   **Const Objects:** Avoid enums; use const objects instead.
*   Use functional components with TypeScript interfaces for props.

## 3. Component Development

*   **.svelte Files:** Create .svelte files for Svelte components.
*   **.svelte.ts Files:** Use .svelte.ts files for component logic and state management.
*   **Component Composition:** Implement proper component composition and reusability.
*   Use Svelte's props for data passing.
*   Leverage Svelte's reactive declarations for local state management.
*   Structure files: component logic, markup, styles, helpers, types.

## 4. Server-Side Rendering (SSR)

*   **SvelteKit's SSR:** Leverage SvelteKit's SSR capabilities for better performance and SEO.
*   **load Functions:** Use load functions in +page.server.ts files for server-side data fetching.
*   Use the adapter-auto for automatic deployment configuration.

## 5. REST API Backend

*   **API Routes:** Create API routes in the src/routes/api directory.
*   **TypeScript:** Use TypeScript for type-safe API implementations.
*   **Error Handling:** Implement proper error handling and status codes.
*   Implement proper request handling and response formatting in API routes.
*   Use SvelteKit's hooks for global API middleware.

## 6. State Management

*   **Svelte Stores:** Use Svelte stores for global state management.
*   **Local Component State:** Prefer local component state when possible.
*   Use classes for complex state management (state machines).
*   Use readable stores for displaying data and writable stores for data that needs to be changed.

## 7. Testing

*   **Unit Tests:** Write comprehensive unit tests for components and utilities.
*   **Integration Tests:** Implement integration tests for API routes and server-side logic.
*   **End-to-End Tests:** Use end-to-end tests to verify critical user flows.
*   **Testing Libraries:** Consider using testing libraries like Jest and Cypress.
*   Test components and stores individually.
*   Use snapshot tests to catch changes in how your app looks.
*   For testing pages that are rendered on the server, tools like Playwright are handy.

## 8. Code Style and Structure

*   **Descriptive Names:** Use descriptive variable names and follow Svelte and SvelteKit conventions.
*   **Functional Programming:** Prefer functional and declarative programming patterns.
*   **Modular Code:** Use a modular code structure to improve maintainability.
*   Use lowercase with hyphens for component files (e.g., components/auth-form.svelte).
*   Use PascalCase for component names in imports and usage.
*   Use camelCase for variables, functions, and props.
*   Use a 2-space indent for nested elements.
*   When naming CSS classes, go with kebab-case.


## 9. Performance Optimization

*   **Code Splitting:** Implement code splitting and lazy loading for optimal performance.
*   **Static Site Generation (SSG):** Use SvelteKit's static site generation (SSG) for static content.
*   Leverage Svelte's compile-time optimizations.
*   Use `{#key}` blocks to force re-rendering of components when needed.
*   Profile and monitor performance using browser developer tools.
*   Use `$effect.tracking()` to optimize effect dependencies.
*   Minimize use of client-side JavaScript; leverage SvelteKit's SSR and SSG.
*   Implement proper lazy loading for images and other assets.


## 10. Security

*   **Input Validation:** Implement proper input validation and sanitization.
*   **Environment Variables:** Use environment variables for sensitive information.

## 11. Accessibility

*   **Semantic HTML:** Ensure proper semantic HTML structure in Svelte components.
*   **ARIA Attributes:** Implement ARIA attributes where necessary.
*   Ensure keyboard navigation support for interactive elements.
*   Use Svelte's `bind:this` for managing focus programmatically.


## 12. Svelte Runes

- `$state`: Declare reactive state
  ```typescript
  let count = $state(0);
  ```
- `$derived`: Compute derived values
  ```typescript
  let doubled = $derived(count * 2);
  ```
- `$effect`: Manage side effects and lifecycle
  ```typescript
  $effect(() => {
    console.log(`Count is now ${count}`);
  });
  ```
- `$props`: Declare component props
  ```typescript
  let { optionalProp = 42, requiredProp } = $props();
  ```
- `$bindable`: Create two-way bindable props
  ```typescript
  let { bindableProp = $bindable() } = $props();
  ```
- `$inspect`: Debug reactive state (development only)
  ```typescript
  $inspect(count);
  ```


## 13. UI and Styling

- Use Tailwind CSS for utility-first styling approach.
- Leverage Shadcn components for pre-built, customizable UI elements.
- Import Shadcn components from `$lib/components/ui`.
- Organize Tailwind classes using the `cn()` utility from `$lib/utils`.
- Use Svelte's built-in transition and animation features.
- Use `background` and `foreground` convention for colors.
- `--primary: 222.2 47.4% 11.2%;--primary-foreground: 210 40% 98%;`
- Key color variables:
  - `--background`, `--foreground`: Default body colors
  - `--muted`, `--muted-foreground`: Muted backgrounds
  - `--card`, `--card-foreground`: Card backgrounds
  - `--popover`, `--popover-foreground`: Popover backgrounds
  - `--border`: Default border color
  - `--input`: Input border color
  - `--primary`, `--primary-foreground`: Primary button colors
  - `--secondary`, `--secondary-foreground`: Secondary button colors
  - `--accent`, `--accent-foreground`: Accent colors
  - `--destructive`, `--destructive-foreground`: Destructive action colors
  - `--ring`: Focus ring color
  - `--radius`: Border radius for components


## 14. Key Conventions

1.  Embrace Svelte's simplicity and avoid over-engineering solutions.
2.  Use SvelteKit for full-stack applications with SSR and API routes.
3.  Prioritize Web Vitals (LCP, FID, CLS) for performance optimization.
4.  Use environment variables for configuration management.
5.  Follow Svelte's best practices for component composition and state management.
6.  Ensure cross-browser compatibility by testing on multiple platforms.
7.  Keep your Svelte and SvelteKit versions up to date.

## 15. Getting Started with SvelteKit

*   Use npx sv create my-app to create a new SvelteKit project.
*   Navigate to the project directory with cd my-app.
*   Install dependencies with npm install.
*   Start the development server with npm run dev.
*   Each page is a Svelte component in the src/routes directory.
*   SvelteKit uses file-based routing.

## 16. Editor Setup

*   Use Visual Studio Code with the Svelte extension for the best experience.
*   Support exists for numerous other editors as well.

## 17. Additional Notes

*   **Progressive Web Apps (PWAs):** SvelteKit is well-suited for building PWAs.
*   **Keep it Simple:** Prioritize writing well-tested code, using tests as specifications for new features and changes. Avoid over-engineering.
*   **SvelteKit Conventions:** Adhere to SvelteKit's conventions for file naming and project structure.
*   Svelte components automatically update when you change variables or props.
*   Use onMount to grab data when the component first appears.
*   Use onDestroy to clean up, like stopping a timer.
*   Use with a variable to decide which part to show dynamically.
*   SvelteKit Version 5 is the current version to use for features instead of older versions patterns
*   DO NOT USE slots to insert changing content into a fixed structure.


## 18. Cloudflare Pages Deployment

Here are parts of code that need to be implemented like this to conform to the cloudflare pages deployment.

### .env.example
```
VITE_GEMINI_API_KEY=${GEMINI_API_KEY}
VITE_TALK_PASSWORD=set some password
VITE_GEMINI_MODEL_NAME=gemini-1.5-flash-latest
VITE_REMOTE_LOGGER_BASE_URL=https://your-remote-logger-server.com
VITE_REMOTE_LOGGER_PASSWORD=set some password
```

### src/lib/constants.ts
```typescript
import { NoopLogger } from "./logging/RemoteRestLogger";
import { RemoteRestLogger } from "./logging/RemoteRestLogger";

export const APP_NAME = 'third-eye';

export const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;
export const GEMINI_MODEL_NAME: string = import.meta.env.VITE_GEMINI_MODEL_NAME;
export const TALK_PASSWORD: string = import.meta.env.VITE_TALK_PASSWORD;
export const REMOTE_LOGGER_BASE_URL: string = import.meta.env.VITE_REMOTE_LOGGER_BASE_URL;
export const REMOTE_LOGGER_PASSWORD: string = import.meta.env.VITE_REMOTE_LOGGER_PASSWORD;

export const IMAGE_MIME_TYPE = import.meta.env.VITE_IMAGE_MIME_TYPE || 'image/webp';
export const IMAGE_EXTENSION = import.meta.env.VITE_IMAGE_EXTENSION || 'webp';
export const IMAGE_QUALITY = import.meta.env.VITE_IMAGE_QUALITY || 0.8;
export const IMAGE_WIDTH = import.meta.env.VITE_IMAGE_WIDTH || 1024;
export const IMAGE_HEIGHT = import.meta.env.VITE_IMAGE_HEIGHT || 1024;

export const remote_logger = REMOTE_LOGGER_BASE_URL != "" ? new RemoteRestLogger(REMOTE_LOGGER_BASE_URL, REMOTE_LOGGER_PASSWORD, APP_NAME) : new NoopLogger();
```
