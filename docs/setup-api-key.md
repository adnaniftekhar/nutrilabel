# Setting Up Gemini API Key from Google AI Studio

This guide explains how to get a Gemini API key from Google AI Studio for use with NutriLabel MVP.

## Why Google AI Studio?

NutriLabel uses the **Gemini Developer API** (not Vertex AI), which requires an API key from Google AI Studio. This is different from Google Cloud service account credentials.

## Step-by-Step Instructions

### 1. Go to Google AI Studio

Visit: https://aistudio.google.com/app/apikey

### 2. Sign In

- Sign in with your Google account
- If you don't have a Google account, create one at https://accounts.google.com

### 3. Create API Key

1. Click **"Create API Key"** or **"Get API Key"** button
2. You may be prompted to select a Google Cloud project:
   - You can use an existing project
   - Or create a new project (recommended for testing)
   - The project is used for billing/quota management
3. Click **"Create API key in new project"** or select an existing project
4. Your API key will be displayed (starts with `AIza...`)

### 4. Copy and Store the API Key

**Important Security Notes:**
- ⚠️ **Never commit the API key to version control**
- ⚠️ **Never share the API key publicly**
- ⚠️ **Store it securely in environment variables or Secret Manager**

### 5. Use the API Key

#### For Local Development:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your key:
   ```env
   GEMINI_API_KEY=AIza...your_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

3. The `.env.local` file is already in `.gitignore` and won't be committed

#### For GCP Deployment:

The bootstrap script (`scripts/gcp/bootstrap.sh`) will:
1. Read the `GEMINI_API_KEY` from your environment
2. Store it securely in Google Secret Manager
3. Configure Cloud Run to use it at runtime

Set it before running bootstrap:
```bash
export GEMINI_API_KEY=AIza...your_key_here
bash scripts/gcp/bootstrap.sh
```

## API Key Limits and Quotas

- Free tier: Check current limits at [Google AI Studio](https://aistudio.google.com/)
- Rate limits: Vary by model and usage tier
- Billing: Linked to your Google Cloud project

## Troubleshooting

### "API key not valid" error

1. Verify the key is correct (no extra spaces)
2. Check that the key hasn't been revoked in Google AI Studio
3. Ensure you're using the Developer API key (not Vertex AI credentials)

### "Quota exceeded" error

1. Check your usage in Google AI Studio
2. Verify billing is enabled on your Google Cloud project
3. Consider upgrading your quota if needed

### "Model not found" error

1. Verify the model name is correct: `gemini-2.0-flash`
2. Check that the model is available in your region
3. Some models may require specific API access levels

## Additional Resources

- [Google AI Studio Documentation](https://ai.google.dev/)
- [Gemini API Documentation](https://ai.google.dev/api)
- [API Key Best Practices](https://ai.google.dev/gemini-api/docs/api-key)

## Model Information

**Current Default Model**: `gemini-2.0-flash`

This is the latest Gemini 2.0 model, providing:
- Improved performance over Gemini 1.5
- Fast response times
- Cost-effective for production use

You can change the model by updating the `GEMINI_MODEL` environment variable.
