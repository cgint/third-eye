import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import google.generativeai as genai

from .routers import analysis


# Configure Google Generative AI with environment variable
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the AI model
    app.state.ai_model = genai.GenerativeModel('gemini-1.5-flash')
    yield
    # Cleanup: Nothing to clean up for now


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Third Eye",
    description="A FastAPI application for analyzing grocery products using smartphone camera and Google Generative AI",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router)

# Mount static files
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


@app.get("/")
async def root():
    """Serve the main application page."""
    return FileResponse(str(static_path / "index.html"))


@app.get("/health")
async def health_check():
    """Check if the service is healthy."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("third_eye.main:app", host="0.0.0.0", port=8000, reload=True)
