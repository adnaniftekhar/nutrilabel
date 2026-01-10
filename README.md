# NutriLabel MVP

A mobile-first Progressive Web App (PWA) that analyzes nutrition labels using Google Cloud Vision API for OCR and Google Gemini Developer API for AI-powered scoring.

## Features

- 📸 Capture or upload nutrition label images
- 🔍 OCR text extraction using Google Cloud Vision
- 🤖 AI-powered health scoring (General Health & Diabetes-Friendly)
- 📱 Mobile-first PWA design
- 💾 Local history storage (IndexedDB)
- ☁️ Deployed on Google Cloud Run

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js runtime
- **OCR**: Google Cloud Vision API (uses Application Default Credentials)
- **AI**: Google Gemini Developer API (`@google/genai`) with API key
- **Storage**: IndexedDB (via `idb-keyval`)
- **Deployment**: Docker, Google Cloud Build, Cloud Run
- **Testing**: Vitest

## Prerequisites

- Node.js 20+ (`node --version`)
- npm or yarn
- Google Cloud CLI (`gcloud`) installed and authenticated
- A Google Cloud billing account
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
MAX_IMAGE_BYTES=6000000
OCR_MIN_CHARS=40
```

**Getting Your Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Select or create a Google Cloud project
5. Copy the API key and add it to your `.env.local` file
6. **Important**: This API key is for the Gemini Developer API. Keep it secure and never commit it to version control.

**Setting Up Vision API Authentication:**

For local OCR testing, set up Application Default Credentials:

```bash
gcloud auth application-default login
```

**Important**: Use default scopes (or explicitly `cloud-platform` only). Do NOT request `aiplatform` scope - it's not needed for this MVP and will cause `invalid_scope` errors.

The Vision API will use:
- `GOOGLE_CLOUD_PROJECT` environment variable if set, OR
- The default project from your ADC credentials

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Tests

```bash
npm test
```

### 5. Type Checking and Linting

```bash
npm run typecheck
npm run lint
```

### 6. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
nutrilabel2-mvp/
├── app/
│   ├── api/
│   │   └── analyze/          # API route for image analysis
│   ├── history/               # History page
│   ├── layout.tsx             # Root layout with PWA metadata
│   ├── manifest.ts            # PWA manifest
│   └── page.tsx               # Main page
├── components/
│   └── LabelCapture.tsx      # Image capture/upload component
├── lib/
│   ├── __tests__/            # Test files
│   ├── gemini.ts              # Gemini Developer API client (API key)
│   ├── history.ts             # IndexedDB history management
│   ├── prompt.ts              # AI prompt builder
│   ├── schemas.ts             # Zod validation schemas
│   └── vision.ts              # Cloud Vision OCR client (ADC)
├── public/
│   └── icons/                 # PWA icons
├── scripts/
│   └── gcp/
│       └── bootstrap.sh       # GCP project setup script
├── cloudbuild.yaml            # Cloud Build configuration
├── Dockerfile                 # Container image definition
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Gemini Developer API key (required) | - |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.5-flash` |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID (optional, for Vision API) | ADC default |
| `MAX_IMAGE_BYTES` | Maximum image file size in bytes | `6000000` |
| `OCR_MIN_CHARS` | Minimum OCR characters before warning | `40` |

**Authentication:**
- **Vision API**: Uses Application Default Credentials (ADC). Run `gcloud auth application-default login` for local dev.
- **Gemini API**: Uses API key from `GEMINI_API_KEY` environment variable. No OAuth scopes needed.

## Latest AI Model Verification

**Current Default Model**: `gemini-2.5-flash`

This model was selected based on:
- Official Vertex AI documentation (verified January 2025)
- Balance of speed and accuracy for MVP use case
- Cost-effectiveness for production workloads

**Available Gemini Models (Vertex AI):**
- `gemini-2.5-flash` (default) - Fast, balanced, recommended for most use cases
- `gemini-2.5-flash-lite` - Fastest, most cost-efficient
- `gemini-2.0-flash` - Stable fallback
- `gemini-2.5-pro` - Most capable, slower

To verify or update the model:
1. Check [Google AI Studio](https://aistudio.google.com/) for latest available models
2. Update `GEMINI_MODEL` in `.env.local` or Cloud Run environment variables
3. Test with: `npm run dev` and analyze a sample label

**Note**: The model is configurable via the `GEMINI_MODEL` environment variable. The app uses the **Gemini Developer API** (not Vertex AI), so you need an API key from Google AI Studio.

## PWA Icons

The app includes PWA icons in `public/icons/`:
- `icon-192x192.png` - 192x192 pixel icon
- `icon-512x512.png` - 512x512 pixel icon

These are required for proper PWA installation experience.

## Deployment

See [docs/deploy-gcp.md](./docs/deploy-gcp.md) for detailed deployment instructions.

Quick summary:
1. Run the bootstrap script to create GCP project
2. Deploy via Cloud Build
3. Access the Cloud Run URL

## License

MIT
