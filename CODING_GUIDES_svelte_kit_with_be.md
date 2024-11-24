Here are coding guidelines and best practices for a SvelteKit application with a web frontend and REST API backend using server-side rendering:

## Project Structure

* Organize your project using SvelteKit's file-based routing system[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Create a `src/lib` directory for shared components and utilities[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Use a `src/routes` directory for pages and API routes[1](https://cursor.directory/svelte5-sveltekit-development-guide).

## TypeScript Usage

* Enable strict mode in TypeScript for better type safety[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Use interfaces over types for better readability[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Avoid enums; use const objects instead[1](https://cursor.directory/svelte5-sveltekit-development-guide).

## Component Development

* Create `.svelte` files for Svelte components[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Use `.svelte.ts` files for component logic and state machines[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Implement proper component composition and reusability[1](https://cursor.directory/svelte5-sveltekit-development-guide).

## Server-Side Rendering (SSR)

* Leverage SvelteKit's SSR capabilities for improved performance and SEO[2](https://daily.dev/blog/svelte-for-beginners-a-guide).
* Use `load` functions in `+page.server.ts` files for server-side data fetching[2](https://daily.dev/blog/svelte-for-beginners-a-guide).

## REST API Backend

* Create API routes in `src/routes/api` directory[4](https://svelte.dev/docs/kit/creating-a-project).
* Use TypeScript for type-safe API implementations[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Implement proper error handling and status codes.

## State Management

* Use Svelte stores for global state management[2](https://daily.dev/blog/svelte-for-beginners-a-guide).
* Prefer local component state when possible[1](https://cursor.directory/svelte5-sveltekit-development-guide).

## Testing

* Write comprehensive unit tests for components and utilities.
* Implement integration tests for API routes and server-side logic.
* Use end-to-end tests to verify critical user flows.
* Consider using testing libraries like Jest and Cypress.

## Code Style and Structure

* Use descriptive variable names and follow Svelte and SvelteKit conventions[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Prefer functional and declarative programming patterns[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Use modular code structure to improve maintainability[1](https://cursor.directory/svelte5-sveltekit-development-guide).

## Performance Optimization

* Implement code splitting and lazy loading for optimal performance[2](https://daily.dev/blog/svelte-for-beginners-a-guide).
* Use SvelteKit's static site generation (SSG) for static content[1](https://cursor.directory/svelte5-sveltekit-development-guide).

## Security

* Implement proper input validation and sanitization.
* Use environment variables for sensitive information[1](https://cursor.directory/svelte5-sveltekit-development-guide).

## Accessibility

* Ensure proper semantic HTML structure in Svelte components[1](https://cursor.directory/svelte5-sveltekit-development-guide).
* Implement ARIA attributes where necessary[1](https://cursor.directory/svelte5-sveltekit-development-guide).

Remember to keep your code modular, structured, and readable without over-engineering. Prioritize writing well-tested code, using tests as specifications for new features and changes

[5](https://dev.to/braide/building-progressive-web-applications-using-sveltekit-58gj)

.