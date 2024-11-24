# Third Eye - AI-Powered Grocery Product Analyzer

STATUS: This is the python original code. It will be migrated to a SvelteKit application.

Third Eye is a web application that helps users analyze grocery products using their smartphone camera and Google's Generative AI technology. By simply taking a photo of a product, users can instantly receive information about its nutritional content, including fat content, gluten-free status, and other relevant details.

## Features

- **Real-time Camera Integration**: Uses the device's camera (preferably rear-facing) to capture product images
- **AI-Powered Analysis**: Leverages Google's Gemini Pro 1.5 AI model to analyze product images
- **Nutritional Information Extraction**: 
  - Fat content detection
  - Gluten-free status identification
  - Additional nutritional information parsing
- **Responsive Web Interface**: Works on both desktop and mobile devices
- **Real-time Results**: Provides instant analysis results after photo capture

## Technical Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML, CSS, JavaScript
- **AI Model**: Google Generative AI (Gemini Pro 1.5)
- **Image Processing**: PIL (Python Imaging Library)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/third-eye.git
cd third-eye
```

2. Create a `.env` file based on `.env.example` and add your Google Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

3. Install dependencies using Poetry:
```bash
poetry install
```

4. Run the application:
```bash
poetry run uvicorn third_eye.main:app --reload
```

The application will be available at `http://localhost:8000`

## Usage

1. Open the application in your web browser
2. Grant camera access when prompted
3. Point your camera at a grocery product
4. Click "Take Photo" to capture the image
5. Wait for the AI analysis results
6. Review the extracted nutritional information
7. Use "Retake Photo" if needed to analyze another product

## API Endpoints

- `GET /`: Serves the main application interface
- `GET /health`: Health check endpoint
- `POST /api/analyze`: Analyzes product images
  - Accepts: Multipart form data with an image file
  - Returns: JSON with fat content, gluten-free status, and additional information

## Development

The project structure is organized as follows:

```
third-eye/
├── src/
│   └── third_eye/
│       ├── routers/
│       │   └── analysis.py    # API endpoints for image analysis
│       ├── static/
│       │   └── index.html     # Frontend interface
│       └── main.py            # FastAPI application setup
├── tests/                     # Test files
├── poetry.lock               # Poetry dependency lock file
└── pyproject.toml           # Project configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]
