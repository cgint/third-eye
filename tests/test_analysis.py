import io
from unittest.mock import AsyncMock, MagicMock
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from third_eye.main import app
from third_eye.services.image_analyzer import AnalysisResult


@pytest.fixture
def test_client():
    return TestClient(app)


@pytest.fixture
def mock_ai_model(monkeypatch):
    model = AsyncMock()
    app.state.ai_model = model
    return model


@pytest.fixture
def mock_image():
    # Create a small test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr


def test_analyze_image_success(test_client, mock_ai_model, mock_image):
    # Mock the AI model's response
    mock_ai_model.generate_content.return_value = MagicMock(
        text="Fat content: 10g\nGluten-free: Yes\nAdditional info: Contains vitamins"
    )
    
    # Create test file
    files = {
        "file": ("test.png", mock_image, "image/png")
    }
    
    # Make request
    response = test_client.post("/api/analyze", files=files)
    
    # Assert response
    assert response.status_code == 200
    result = response.json()
    assert isinstance(result, dict)
    assert "fat_content" in result
    assert "gluten_free" in result
    assert "additional_info" in result


def test_analyze_image_invalid_file_type(test_client, mock_ai_model):
    # Create invalid file (text instead of image)
    files = {
        "file": ("test.txt", "not an image", "text/plain")
    }
    
    # Make request
    response = test_client.post("/api/analyze", files=files)
    
    # Assert response
    assert response.status_code == 400
    assert response.json()["detail"] == "File must be an image"


def test_analyze_image_ai_error(test_client, mock_ai_model, mock_image):
    # Mock AI model to raise an error
    mock_ai_model.generate_content.side_effect = ValueError("AI model error")
    
    # Create test file
    files = {
        "file": ("test.png", mock_image, "image/png")
    }
    
    # Make request
    response = test_client.post("/api/analyze", files=files)
    
    # Assert response
    assert response.status_code == 500
    assert "AI model error" in response.json()["detail"]


def test_analyze_image_unexpected_error(test_client, mock_ai_model, mock_image):
    # Mock AI model to raise an unexpected error
    mock_ai_model.generate_content.side_effect = Exception("Unexpected error")
    
    # Create test file
    files = {
        "file": ("test.png", mock_image, "image/png")
    }
    
    # Make request
    response = test_client.post("/api/analyze", files=files)
    
    # Assert response
    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]
