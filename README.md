# Third Eye - Grocery Product Analyzer

A SvelteKit application that uses your smartphone's camera to analyze grocery products using Google's Generative AI. Take a photo of any grocery product to get detailed nutritional information and product details.

## Features

- Real-time camera access using device's camera
- Image capture and analysis
- AI-powered product information extraction
- Responsive design for mobile use
- Cloudflare Pages deployment support

## Prerequisites

- Node.js (LTS version)
- Google Cloud Platform account with Generative AI API access
- Cloudflare account (for deployment)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your Google Generative AI API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
4. For local development:
   ```bash
   npm run dev
   ```

## Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Set up your API key as a secret:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```

4. Deploy to Cloudflare Pages:
   ```bash
   npm run deploy
   ```

## Development

The application is built with:
- SvelteKit for the frontend framework
- TypeScript for type safety
- Google's Generative AI for image analysis
- Cloudflare Pages for hosting and serverless functions

### Project Structure

```
src/
├── app.d.ts           # TypeScript declarations
├── app.html           # HTML template
└── routes/
    ├── +page.svelte   # Main page with camera interface
    └── api/
        └── analyze/   # Image analysis endpoint
            └── +server.ts
```

## License

MIT

# Appendix

## Secrets

```
npx wrangler pages secret put VITE_TALK_PASSWORD
npx wrangler pages secret put VITE_REMOTE_LOGGER_PASSWORD
npx wrangler pages secret put VITE_GEMINI_API_KEY  
```