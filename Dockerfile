# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

ENV \
  PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=1 \ 
  PIP_DISABLE_PIP_VERSION_CHECK=1 \
  PIP_DEFAULT_TIMEOUT=100 \
  # Poetry's configuration:
  POETRY_NO_INTERACTION=1 \
  POETRY_VIRTUALENVS_CREATE=false \
  POETRY_CACHE_DIR='/var/cache/pypoetry' \
  POETRY_HOME='/usr/local'
#  POETRY_VERSION=1.8.4 # if possible i do not want to specify the version

ENV PATH="${POETRY_HOME}/bin:$PATH"

# Install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Copy poetry files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN /usr/local/bin/poetry install --only=main --no-interaction --no-ansi --no-root --no-cache \
&& /usr/local/bin/poetry cache clear pypi --all

# Copy application code
COPY src/ ./src/

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser && chown -R appuser:appuser /app
USER appuser

# Set environment variables
ARG PORT
ENV PORT=${PORT:-8000}
ENV HOST=0.0.0.0

# Expose port
EXPOSE $PORT

# Run the application
CMD uvicorn src.third_eye.main:app --host 0.0.0.0 --port ${PORT}
