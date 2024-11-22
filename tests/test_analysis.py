from fastapi.testclient import TestClient
from PIL import Image
import io
import pytest
import unittest.mock

from third_eye.main import app
from third_eye.services.image_analyzer import AnalysisResult, ImageAnalyzer

client = TestClient(app)

class MockAIModel:
    def generate_content(self, inputs):
        return MockResponse("Mock analysis result for testing")

class MockResponse:
    def __init__(self, text):
        self.text = text

@pytest.fixture
def mock_ai_model():
    """Mock the AI model to return a predictable response."""
    return MockAIModel()

def test_analyze_image_endpoint(mock_ai_model):
    # Create a simple test image
    test_image = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    test_image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    # Mock the get_ai_model to return our mock model
    with (
        unittest.mock.patch('third_eye.services.ai_service.get_ai_model', return_value=mock_ai_model),
        unittest.mock.patch('third_eye.routers.analysis.get_ai_model', return_value=mock_ai_model)
    ):
        # Send the image to the analyze endpoint
        response = client.post(
            "/api/analyze", 
            files={"file": ("test_image.png", img_byte_arr, "image/png")}
        )

    # Check response
    assert response.status_code == 200
    
    # Validate response model
    result = AnalysisResult(**response.json())
    assert result.result_text is not None
    assert result.result_text == "Mock analysis result for testing"

def test_analysis_result_model():
    # Test the AnalysisResult model
    result = AnalysisResult(result_text="Comprehensive product analysis details")
    
    assert result.result_text == "Comprehensive product analysis details"
    assert result.model_dump() == {"result_text": "Comprehensive product analysis details"}

def test_analysis_result_empty_text():
    # Test AnalysisResult with empty text
    result = AnalysisResult(result_text=None)
    
    assert result.result_text is None
    assert result.model_dump() == {"result_text": None}

def test_image_analyzer_mock(mock_ai_model):
    # Test ImageAnalyzer with mock AI model
    analyzer = ImageAnalyzer(mock_ai_model)
    
    # Create a test image
    test_image = Image.new('RGB', (100, 100), color='red')
    
    # Analyze the image
    result = analyzer.analyze(test_image)
    
    assert result.result_text == "Mock analysis result for testing"
