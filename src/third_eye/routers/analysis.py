from fastapi import APIRouter, File, UploadFile
from PIL import Image
import io

from ..services.image_analyzer import ImageAnalyzer, AnalysisResult
from ..services.ai_service import get_ai_model

router = APIRouter(prefix="/api")

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded image and return comprehensive product analysis.
    
    Args:
        file (UploadFile): The image file to analyze
    
    Returns:
        AnalysisResult: Comprehensive analysis results including nutritional and product details
    """
    # Read the uploaded file
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Initialize AI model and analyzer
    ai_model = get_ai_model()
    analyzer = ImageAnalyzer(ai_model)
    
    # Perform image analysis
    result = analyzer.analyze(image)
    
    return result
