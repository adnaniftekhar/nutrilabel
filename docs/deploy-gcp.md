# Deploying NutriLabel to Google Cloud Platform

This guide walks you through deploying the NutriLabel MVP to Google Cloud Run using Cloud Build.

## Prerequisites

1. **Google Cloud CLI** installed and authenticated:
   ```bash
   gcloud --version
   gcloud auth login
   ```

2. **Billing Account ID**: You need a GCP billing account
   ```bash
   gcloud billing accounts list
   ```

3. **Vertex AI Setup**: Vertex AI API enabled in your GCP project
   - Uses Application Default Credentials (no API key needed)
   - Requires service account with Vertex AI User role

## Step 1: Bootstrap GCP Project

The bootstrap script creates a new GCP project with all required resources.

### Set Required Environment Variables

```bash
export BILLING_ACCOUNT=YOUR_BILLING_ACCOUNT_ID
export ENV=prod  # Optional, defaults to 'prod'
export REGION=us-central1  # Optional, defaults to 'us-central1'
```

**Note**: Using Vertex AI, so no API key needed - uses Application Default Credentials.

### Run Bootstrap Script

```bash
cd /path/to/nutrilabel2-mvp
bash scripts/gcp/bootstrap.sh
```

The script will:
- ✅ Create a new GCP project with format: `nutrilabel2-mvp-prod-XXXX`
- ✅ Enable required APIs (Cloud Run, Cloud Build, Artifact Registry, Secret Manager, Vision, Vertex AI)
- ✅ Create Artifact Registry Docker repository
- ✅ Create Cloud Run service account with least-privilege permissions
- ✅ Configure Vertex AI API and service account permissions
- ✅ Generate `.gcp.env` file with project configuration

**Expected Output:**
```
✓ Bootstrap completed successfully!

Project ID: nutrilabel2-mvp-prod-A1B2
Region: us-central1
Service Account: nutrilabel2-mvp-runtime@nutrilabel2-mvp-prod-A1B2.iam.gserviceaccount.com

Vertex AI Configuration:
  - Vertex AI API: Enabled
  - Service Account Role: Vertex AI User
  - Authentication: Application Default Credentials (ADC)
```

## Step 2: Deploy via Cloud Build

### Option A: Using .gcp.env (Recommended)

```bash
source .gcp.env
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=${REGION},_SERVICE=${SERVICE_NAME},_AR_REPO=${AR_REPO}
```

### Option B: Manual Substitutions

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_SERVICE=nutrilabel2-mvp,_AR_REPO=nutrilabel
```

The Cloud Build process will:
1. Build the Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run with:
   - Unauthenticated access (MVP)
   - Environment variables configured
   - Service account with Vision API and Vertex AI permissions

### Monitor Build Progress

```bash
gcloud builds list --limit=1
```

View logs:
```bash
gcloud builds log <BUILD_ID>
```

## Step 3: Verify Deployment

### Get Cloud Run URL

```bash
gcloud run services describe nutrilabel2-mvp \
  --region=us-central1 \
  --format="value(status.url)"
```

### Online Smoke Test Checklist

After deployment, verify the app works correctly:

#### ✅ Basic Functionality
- [ ] Visit Cloud Run URL on your phone's browser
- [ ] App loads without errors (check browser console)
- [ ] Icons load correctly:
  - [ ] `/icons/icon-192x192.png` returns 200 (no 404)
  - [ ] `/icons/icon-512x512.png` returns 200 (no 404)
  - [ ] `/icons/apple-touch-icon.png` returns 200 (no 404)

#### ✅ PWA Features
- [ ] App is installable as PWA (look for "Add to Home Screen" prompt)
- [ ] Manifest loads: `/manifest.webmanifest` returns 200
- [ ] Theme color matches the green palette
- [ ] App icon appears correctly when installed

#### ✅ Core Features
- [ ] Upload/capture works:
  - [ ] Can tap to take photo (mobile)
  - [ ] Can select from gallery
  - [ ] Image preview displays correctly
- [ ] Analyze works:
  - [ ] "Analyze" button is accessible (sticky on mobile)
  - [ ] Loading state shows during analysis
  - [ ] Results display correctly (scores, justifications)
  - [ ] Warnings display if present
- [ ] History works:
  - [ ] Can navigate to History page
  - [ ] Past scans are listed
  - [ ] Can expand/collapse scan details
  - [ ] Can delete entries
  - [ ] Can clear all history

#### ✅ Mobile UX
- [ ] Bottom navigation works (Home/History)
- [ ] Sticky "Analyze" button doesn't overlap content
- [ ] Safe area padding works on iOS (no home indicator overlap)
- [ ] Responsive design works on different screen sizes
- [ ] Touch targets are appropriately sized

#### ✅ Error Handling
- [ ] Error messages display clearly
- [ ] "Try again" button works after errors
- [ ] Network errors are handled gracefully

### Test on Mobile Device

1. Open the Cloud Run URL on your phone's browser
2. The app should be installable as a PWA (look for "Add to Home Screen")
3. Test the full flow:
   - Capture a nutrition label
   - Submit for analysis
   - Verify scores are displayed
   - Check history page
   - Verify icons load (no 404s in network tab)

### Verify API Endpoint

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe nutrilabel2-mvp \
  --region=us-central1 \
  --format="value(status.url)")

# Test the API (requires a test image)
curl -X POST ${SERVICE_URL}/api/analyze \
  -F "image=@test-label.jpg" \
  -H "Content-Type: multipart/form-data"
```

## Step 4: Update Configuration (Optional)

### Change Gemini Model

Edit `cloudbuild.yaml` and update `_GEMINI_MODEL` substitution, or set it in Cloud Run:

```bash
gcloud run services update nutrilabel2-mvp \
  --region=us-central1 \
  --update-env-vars GEMINI_MODEL=gemini-2.5-pro
```

## Troubleshooting

### Build Fails

- Check Cloud Build logs: `gcloud builds log <BUILD_ID>`
- Verify Dockerfile builds locally: `docker build -t test .`
- Ensure all environment variables are set correctly

### Service Won't Start

- Check Cloud Run logs: `gcloud run services logs read nutrilabel2-mvp --region=us-central1`
- Verify service account has correct permissions
- Check that Vertex AI API is enabled

### OCR Not Working

- Verify service account has `roles/vision.annotator`
- Check Cloud Run logs for Vision API errors
- Ensure Vision API is enabled: `gcloud services enable vision.googleapis.com`

### AI Scoring Fails

- Check Cloud Run logs for Vertex AI errors
- Verify service account has `roles/aiplatform.user`
- Ensure Vertex AI API is enabled: `gcloud services enable aiplatform.googleapis.com`
- Check that the model name is available in your region

### Icons Not Loading (404)

- Verify icons exist in `public/icons/` directory
- Check that files are included in Docker build (not in `.dockerignore`)
- Verify paths in `app/manifest.ts` match actual file locations
- Check Cloud Run logs for static asset serving issues

### PWA Not Installable

- Verify manifest is accessible: `curl <SERVICE_URL>/manifest.webmanifest`
- Check that icons are properly sized (192x192, 512x512)
- Ensure `display: "standalone"` is set in manifest
- Check browser console for PWA installation errors

## Cost Optimization

- **Cloud Run**: Pay per request, scales to zero
- **Vision API**: $1.50 per 1,000 images (first 1,000 free/month)
- **Vertex AI**: Pay per token (check current pricing)
- **Artifact Registry**: $0.10/GB/month storage
- **Cloud Build**: Free tier includes 120 build-minutes/day

## Security Best Practices

1. **Secret Management**: API keys stored in Secret Manager, never in code
2. **Service Account**: Least-privilege IAM roles (Vision Annotator, Vertex AI User)
3. **HTTPS Only**: Cloud Run enforces HTTPS
4. **Input Validation**: Image size and type validation in API route
5. **Rate Limiting**: Consider adding rate limiting for production

## Next Steps

- Add authentication (Firebase Auth, Auth0, etc.)
- Implement rate limiting
- Add monitoring and alerting (Cloud Monitoring)
- Set up CI/CD pipeline
- Add custom domain
- Enable Cloud CDN for static assets

## Latest AI Model Verification

**Verified Models** (as of January 2025):
- `gemini-2.5-flash` (default) - Fast, balanced
- `gemini-2.5-flash-lite` - Fastest, cost-efficient
- `gemini-2.0-flash` - Stable fallback
- `gemini-2.5-pro` - Most capable

**Verification Date**: 2025-01-10

**Source**: 
- Official Vertex AI documentation: https://cloud.google.com/vertex-ai/generative-ai/docs/models
- Google Cloud Vertex AI release notes
- `@google-cloud/vertexai` package documentation

**Important Notes**:
- The app uses **Vertex AI** (not Gemini Developer API)
- Uses Application Default Credentials (ADC)
- No API key needed - authentication via service account
- Model availability may vary by region

To upgrade to a newer model:
1. Check [Vertex AI documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/models) for latest models
2. Update `_GEMINI_MODEL` in `cloudbuild.yaml` or set via Cloud Run env vars
3. Redeploy the service
4. Test with sample nutrition labels
