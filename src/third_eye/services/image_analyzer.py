import io
import re
from typing import Optional

from PIL import Image
import google.generativeai as genai
import google.ai.generativelanguage as glm
from pydantic import BaseModel, Field


class ProcessedImage(BaseModel):
    mime_type: str
    data: bytes


class AnalysisResult(BaseModel):
    fat_content: Optional[str] = Field(None, description="Fat content of the product")
    gluten_free: Optional[str] = Field(None, description="Whether the product is gluten-free")
    additional_info: Optional[str] = Field(None, description="Additional nutritional information")


class ImageAnalyzer:
    def __init__(self, ai_model: genai.GenerativeModel):
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
                fat_content=None,
                gluten_free=None,
                additional_info=response_text
            )
            
            # Extract fat content
            text_lower = response_text.lower()
            if "fat" in text_lower:
                for line in text_lower.split('\n'):
                    if "fat" in line:
                        # Look for patterns like "10g fat" or "fat: 10g" or "10% fat"
                        fat_matches = re.findall(r'(\d+(?:\.\d+)?(?:g|%)?)\s*(?:of\s*)?fat', line)
                        if fat_matches:
                            result.fat_content = fat_matches[0]
                            break
            
            # Determine if gluten-free
            gluten_indicators = {
                "gluten-free": True,
                "no gluten": True,
                "contains gluten": False,
                "not gluten-free": False
            }
            
            for indicator, is_gluten_free in gluten_indicators.items():
                if indicator in text_lower:
                    result.gluten_free = "Yes" if is_gluten_free else "No"
                    break
            
            return result
        except Exception as e:
            raise ValueError(f"Error parsing AI response: {str(e)}") from e

    def analyze(self, image: Image.Image) -> AnalysisResult:
        """Analyze a product image using Google's Generative AI."""
        try:
            processed_image = self.process_image(image)
            
            # Generate prompt for AI
            prompt = """
            Analyze this product image and provide:
            1. Fat content (if visible)
            2. Whether it's gluten-free
            3. Any other relevant nutritional information
            
            Please be specific and concise in your response.
            """
            
            # Create Blob for image
            blob = glm.Blob(
                mime_type=processed_image.mime_type,
                data=processed_image.data
            )
            
            # Get AI response
            response = self.ai_model.generate_content([prompt, blob])
            
            if not response.text:
                raise ValueError("Failed to analyze image - no response text")
            
            # Parse and structure the response
            return self.parse_ai_response(response.text)
            
        except Exception as e:
            raise ValueError(f"Error analyzing image: {str(e)}") from e
