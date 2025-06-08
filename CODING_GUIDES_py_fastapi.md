You are an expert in Python, FastAPI, and scalable API development.

# Key Principles

* Write concise, technical responses with accurate Python examples.
* Use functional, declarative programming; avoid classes where possible.
* Follow separation of concerns principles to make it easier to replace parts of the system with other implementations as the task at hand will evolve.
* Prefer iteration and modularization over code duplication.
* Use descriptive variable names with auxiliary verbs (e.g., is_active, has_permission).
* Use lowercase with underscores for directories and files (e.g., routers/user_routes.py).
* Favor named exports for routes and utility functions.
* Use the Receive an Object, Return an Object (RORO) pattern.

# Python/FastAPI

* Use pyproject.toml for project configuration.
* Use poetry for dependency management.
* Specify python-version as "3.11.*"
* Specify all dependencies as "*" to get the newest packages
* Store python files in the `<service-name-with-underscored>/` directory and create a package structure if needed.
* Store python tests in the `tests/` directory and create a package structure if needed.
* Store static web files in the `web/` directory as e.g. index.html, script.js, style.css.
  * Deliver these files from web through the FastAPI-Routing so we have cache-control and such
* Use Pydantic v2 for data validation and schema definition.
* For dict parameters and return types use Pydantic models to have more clarity and type safety.
* Use def for pure functions and async def for asynchronous operations.
* Use type hints for all function signatures. Prefer Pydantic models over raw dictionaries for input validation.
* File structure: exported router, sub-routes, utilities, static content, types (models, schemas).
* Avoid unnecessary curly braces in conditional statements.
* For single-line statements in conditionals, omit curly braces.
* Use concise, one-line syntax for simple conditional statements (e.g., if condition: do_something()).

## Example pyproject.toml

```toml
[tool.poetry]
name = " --- enter your project name here --- "
version = "0.1.0"
package-mode = false
description = ""

[tool.poetry.dependencies]
python = "3.11.*"
pydantic = "*"
fastapi = "*"
uvicorn = "*"
python-dotenv = "*"

[tool.poetry.group.dev.dependencies]
pytest = "*"
pytest-asyncio = "*"
ruff = "*"
mypy = "*"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```

# Error Handling and Validation

* Prioritize error handling and edge cases:
* Handle errors and edge cases at the beginning of functions.
* Use early returns for error conditions to avoid deeply nested if statements.
* Place the happy path last in the function for improved readability.
* Avoid unnecessary else statements; use the if-return pattern instead.
* Use guard clauses to handle preconditions and invalid states early.
* Implement proper error logging and user-friendly error messages.
* Use custom error types or error factories for consistent error handling.

# Dependencies

* FastAPI
* Pydantic v2
* In case of storing data think well and start by storing in memory

# FastAPI-Specific Guidelines

* Use functional components (plain functions) and Pydantic models for input validation and response schemas.
* Use declarative route definitions with clear return type annotations.
* Use def for synchronous operations and async def for asynchronous ones.
* Minimize @app.on_event("startup") and @app.on_event("shutdown"); prefer lifespan context managers for managing startup and shutdown events.
* Use middleware for logging, error monitoring, and performance optimization.
* Optimize for performance using async functions for I/O-bound tasks, caching strategies, and lazy loading.
* Use HTTPException for expected errors and model them as specific HTTP responses.
* Use middleware for handling unexpected errors, logging, and error monitoring.
* Use Pydantic's BaseModel for consistent input/output validation and response schemas.

# Performance Optimization

* Minimize blocking I/O operations; use asynchronous operations for all database calls and external API requests.
* Implement caching for static and frequently accessed data using tools like Redis or in-memory stores.
* Optimize data serialization and deserialization with Pydantic.
* Use lazy loading techniques for large datasets and substantial API responses.

# Key Conventions

1. Rely on FastAPI’s dependency injection system for managing state and shared resources.
2. Prioritize API performance metrics (response time, latency, throughput).
3. Limit blocking operations in routes:

* Favor asynchronous and non-blocking flows.
* Use dedicated async functions for database and external API operations.
* Structure routes and dependencies clearly to optimize readability and maintainability.

Refer to FastAPI documentation for Data Models, Path Operations, and Middleware for best practices.
