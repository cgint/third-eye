import io
import traceback
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from PIL import Image
import google.generativeai as genai

from ..services.image_analyzer import ImageAnalyzer, AnalysisResult


# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create console handler and set level to DEBUG
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

# Create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Add formatter to ch
ch.setFormatter(formatter)

# Add ch to logger
logger.addHandler(ch)

router = APIRouter(prefix="/api", tags=["analysis"])


async def get_ai_model(request: Request):
    return request.app.state.ai_model


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_image(
    file: UploadFile = File(...),
    ai_model: genai.GenerativeModel = Depends(get_ai_model)
):
    """Analyze a product image using Google's Generative AI."""
    # Validate image type first
    if not file.content_type.startswith('image/'):
        logger.error(f"Invalid file type: {file.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        
        # Create analyzer and process image
        analyzer = ImageAnalyzer(ai_model)
        analysis_result = analyzer.analyze(img)
        
        return analysis_result
        
    except ValueError as ve:
        logger.error(f"ValueError in image analysis: {ve}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(ve)) from ve
    except Exception as e:
        logger.error(f"Unexpected error in image analysis: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}") from e
