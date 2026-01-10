# Manual GCP Deployment Guide

If the automated script fails, follow these manual steps in the Google Cloud Console.

## Step 1: Enable Required APIs

1. Go to [APIs & Services](https://console.cloud.google.com/apis/library?project=nutrilabel-mvp)
2. Enable these APIs (search and click "Enable"):
   - **Cloud Build API**
   - **Cloud Run API**
   - **Artifact Registry API**
   - **Cloud Vision API**
   - **Vertex AI API**

## Step 2: Create Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=nutrilabel-mvp)
2. Click **"Create Service Account"**
3. Fill in:
   - **Name**: `nutrilabel2-mvp-runtime`
   - **Description**: `NutriLabel Cloud Run Runtime`
4. Click **"Create and Continue"**
5. Grant these roles:
   - `ML Developer` (for Vision API)
   - `Vertex AI User` (for Gemini)
6. Click **"Continue"** then **"Done"**

## Step 3: Create Artifact Registry Repository

1. Go to [Artifact Registry](https://console.cloud.google.com/artifacts?project=nutrilabel-mvp)
2. Click **"Create Repository"**
3. Fill in:
   - **Name**: `nutrilabel`
   - **Format**: Docker
   - **Mode**: Standard
   - **Region**: `us-central1`
4. Click **"Create"**

## Step 4: Deploy via Cloud Build

### Option A: Using Cloud Build Console

1. Go to [Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers?project=nutrilabel-mvp)
2. Click **"Run Trigger"** or **"Create Trigger"**
3. Or use the command line:

```bash
cd /Users/aiftekhar/Desktop/nutrilabel/nutrilabel2-mvp
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_SERVICE=nutrilabel2-mvp,_AR_REPO=nutrilabel \
  --project=nutrilabel-mvp
```

### Option B: Direct Cloud Run Deployment

If Cloud Build is having issues, you can build locally and deploy:

```bash
# Build Docker image locally
docker build -t gcr.io/nutrilabel-mvp/nutrilabel2-mvp:latest .

# Tag for Artifact Registry
docker tag gcr.io/nutrilabel-mvp/nutrilabel2-mvp:latest \
  us-central1-docker.pkg.dev/nutrilabel-mvp/nutrilabel/nutrilabel2-mvp:latest

# Push to Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
docker push us-central1-docker.pkg.dev/nutrilabel-mvp/nutrilabel/nutrilabel2-mvp:latest

# Deploy to Cloud Run
gcloud run deploy nutrilabel2-mvp \
  --image us-central1-docker.pkg.dev/nutrilabel-mvp/nutrilabel/nutrilabel2-mvp:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --service-account nutrilabel2-mvp-runtime@nutrilabel-mvp.iam.gserviceaccount.com \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=nutrilabel-mvp,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_MODEL=gemini-2.5-flash,MAX_IMAGE_BYTES=6000000,OCR_MIN_CHARS=40" \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60 \
  --max-instances 10
```

## Step 5: Verify Deployment

1. Go to [Cloud Run](https://console.cloud.google.com/run?project=nutrilabel-mvp)
2. Find your service `nutrilabel2-mvp`
3. Click on it to see the URL
4. Click the URL to open your app

## Step 6: Test the App

1. Open the Cloud Run URL in your browser
2. Test the full flow:
   - Upload/capture a nutrition label
   - Click "Analyze"
   - Verify results display
   - Check history page

## Troubleshooting

### Service Account Permissions

If you see permission errors:
1. Go to [IAM & Admin > IAM](https://console.cloud.google.com/iam-admin/iam?project=nutrilabel-mvp)
2. Find `nutrilabel2-mvp-runtime@nutrilabel-mvp.iam.gserviceaccount.com`
3. Click the pencil icon to edit
4. Ensure these roles are assigned:
   - `ML Developer` (for Vision API)
   - `Vertex AI User` (for Gemini)

### Build Failures

1. Go to [Cloud Build > History](https://console.cloud.google.com/cloud-build/builds?project=nutrilabel-mvp)
2. Click on the failed build
3. Check the logs for specific errors
4. Common issues:
   - Missing APIs (enable them in Step 1)
   - Docker build errors (check Dockerfile)
   - Permission errors (check service account)

### Deployment Errors

1. Go to [Cloud Run](https://console.cloud.google.com/run?project=nutrilabel-mvp)
2. Click on your service
3. Go to "Logs" tab
4. Check for runtime errors

## Quick Links

- [Cloud Run Console](https://console.cloud.google.com/run?project=nutrilabel-mvp)
- [Cloud Build Console](https://console.cloud.google.com/cloud-build/builds?project=nutrilabel-mvp)
- [Artifact Registry](https://console.cloud.google.com/artifacts?project=nutrilabel-mvp)
- [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=nutrilabel-mvp)
- [APIs & Services](https://console.cloud.google.com/apis/dashboard?project=nutrilabel-mvp)
