import io
import pytest
from PIL import Image
import google.ai.generativelanguage as glm
from third_eye.services.image_analyzer import ImageAnalyzer, ProcessedImage, AnalysisResult

class MockAIModel:
    def generate_content(self, inputs):
        # Verify inputs format
        assert len(inputs) == 2
        assert isinstance(inputs[0], str)  # prompt
        assert isinstance(inputs[1], glm.Blob)  # image blob
        return MockResponse("Test analysis result")

class MockResponse:
    def __init__(self, text):
        self.text = text

@pytest.fixture
def mock_ai_model():
    return MockAIModel()

@pytest.fixture
def test_image():
    return Image.new('RGB', (100, 100), color='red')

@pytest.fixture
def test_rgba_image():
    return Image.new('RGBA', (100, 100), color=(255, 0, 0, 128))

@pytest.fixture
def test_large_image():
    return Image.new('RGB', (2048, 2048), color='blue')

class TestProcessedImage:
    def test_processed_image_creation(self):
        processed = ProcessedImage(mime_type="image/jpeg", data=b"test data")
        assert processed.mime_type == "image/jpeg"
        assert processed.data == b"test data"

class TestAnalysisResult:
    def test_analysis_result_with_text(self):
        result = AnalysisResult(result_text="Test result")
        assert result.result_text == "Test result"

    def test_analysis_result_without_text(self):
        result = AnalysisResult()
        assert result.result_text is None

class TestImageAnalyzer:
    def test_process_image_rgb(self, test_image):
        analyzer = ImageAnalyzer(None)
        processed = analyzer.process_image(test_image)
        
        assert isinstance(processed, ProcessedImage)
        assert processed.mime_type == "image/jpeg"
        assert len(processed.data) > 0
        
        # Verify processed image can be loaded back
        img = Image.open(io.BytesIO(processed.data))
        assert img.mode == 'RGB'
        assert img.size == (100, 100)

    def test_process_image_rgba_conversion(self, test_rgba_image):
        analyzer = ImageAnalyzer(None)
        processed = analyzer.process_image(test_rgba_image)
        
        # Verify image was converted to RGB
        img = Image.open(io.BytesIO(processed.data))
        assert img.mode == 'RGB'

    def test_process_large_image_resize(self, test_large_image):
        analyzer = ImageAnalyzer(None)
        processed = analyzer.process_image(test_large_image)
        
        # Verify image was resized
        img = Image.open(io.BytesIO(processed.data))
        assert max(img.size) <= 1024

    def test_process_image_invalid(self):
        analyzer = ImageAnalyzer(None)
        
        with pytest.raises(ValueError) as exc_info:
            invalid_image = Image.new('RGB', (100, 100))
            invalid_image.close()  # Make image invalid
            analyzer.process_image(invalid_image)
        
        assert "Error processing image" in str(exc_info.value)

    def test_parse_ai_response_valid(self):
        analyzer = ImageAnalyzer(None)
        result = analyzer.parse_ai_response("Test result")
        
        assert isinstance(result, AnalysisResult)
        assert result.result_text == "Test result"

    def test_parse_ai_response_empty(self):
        analyzer = ImageAnalyzer(None)
        result = analyzer.parse_ai_response("")
        
        assert isinstance(result, AnalysisResult)
        assert result.result_text == ""

    def test_analyze_success(self, mock_ai_model, test_image):
        analyzer = ImageAnalyzer(mock_ai_model)
        result = analyzer.analyze(test_image)
        
        assert isinstance(result, AnalysisResult)
        assert result.result_text == "Test analysis result"

    def test_analyze_with_invalid_response(self, mock_ai_model, test_image):
        class MockEmptyResponse:
            pass
        
        mock_ai_model.generate_content = lambda _: MockEmptyResponse()
        analyzer = ImageAnalyzer(mock_ai_model)
        
        with pytest.raises(ValueError) as exc_info:
            analyzer.analyze(test_image)
        
        assert "Failed to analyze image - no response text" in str(exc_info.value)

    def test_analyze_with_empty_response(self, mock_ai_model, test_image):
        mock_ai_model.generate_content = lambda _: MockResponse("")
        analyzer = ImageAnalyzer(mock_ai_model)
        
        with pytest.raises(ValueError) as exc_info:
            analyzer.analyze(test_image)
        
        assert "Failed to analyze image - empty response text" in str(exc_info.value)

    def test_analyze_with_ai_error(self, mock_ai_model, test_image):
        def raise_error(*args):
            raise Exception("AI model error")
        
        mock_ai_model.generate_content = raise_error
        analyzer = ImageAnalyzer(mock_ai_model)
        
        with pytest.raises(ValueError) as exc_info:
            analyzer.analyze(test_image)
        
        assert "Error analyzing image" in str(exc_info.value)
