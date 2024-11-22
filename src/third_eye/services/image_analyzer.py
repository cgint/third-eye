import io
from typing import Optional

from PIL import Image
from pydantic import BaseModel, Field
import google.generativeai as genai
import google.ai.generativelanguage as glm


class ProcessedImage(BaseModel):
    mime_type: str
    data: bytes


class AnalysisResult(BaseModel):
    result_text: Optional[str] = Field(None, description="Comprehensive nutritional and product analysis results")


class ImageAnalyzer:
    def __init__(self, ai_model):
        self.ai_model = ai_model

    def process_image(self, image: Image.Image) -> ProcessedImage:
        """Process and optimize the image for AI analysis."""
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large while maintaining aspect ratio
            max_size = 1024
            if max(image.size) > max_size:
                ratio = max_size / max(image.size)
                new_size = tuple(int(dim * ratio) for dim in image.size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr.seek(0)
            
            return ProcessedImage(
                mime_type="image/jpeg",
                data=img_byte_arr.getvalue()
            )
        except Exception as e:
            raise ValueError(f"Error processing image: {str(e)}") from e

    def parse_ai_response(self, response_text: str) -> AnalysisResult:
        """Parse the AI response to extract structured information."""
        try:
            result = AnalysisResult(
                result_text=response_text
            )
            
            return result
        except Exception as e:
            raise ValueError(f"Error parsing AI response: {str(e)}") from e

    def analyze(self, image: Image.Image) -> AnalysisResult:
        """Analyze a product image using AI."""
        try:
            processed_image = self.process_image(image)
            
            # Generate prompt for AI
            prompt = """
            Analyze this product image and provide:
            1. Comprehensive nutritional information
            2. Any relevant product details
            
            Please be specific and concise in your response.
            """
            
            # Create a proper blob using google.ai.generativelanguage
            blob = glm.Blob(
                mime_type=processed_image.mime_type,
                data=processed_image.data
            )
            
            # Get AI response
            response = self.ai_model.generate_content([prompt, blob])
            
            # Ensure response is not a coroutine and has text
            if hasattr(response, 'text'):
                response_text = response.text
            elif hasattr(response, 'result'):
                response_text = response.result.text
            else:
                raise ValueError("Failed to analyze image - no response text")
            
            if not response_text:
                raise ValueError("Failed to analyze image - empty response text")
            
            # Parse and structure the response
            return self.parse_ai_response(response_text)
            
        except Exception as e:
            raise ValueError(f"Error analyzing image: {str(e)}") from e
