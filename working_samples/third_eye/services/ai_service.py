import os
import google.generativeai as genai

def get_ai_model():
    """
    Initialize and return a Generative AI model for image analysis.
    
    This function configures the Gemini model with the API key from environment
    variables and returns an instance ready for image analysis.
    
    Returns:
        genai.GenerativeModel: Configured AI model for image analysis
    
    Raises:
        ValueError: If GEMINI_API_KEY environment variable is not set
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    
    # Configure the Gemini client with API key
    genai.configure(api_key=api_key)
    
    # Use the newer recommended model that supports image analysis
    return genai.GenerativeModel('gemini-1.5-flash')
