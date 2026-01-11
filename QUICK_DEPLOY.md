# Quick Deploy to Cloud Run

## One-Command Deploy

```bash
./deploy.sh
```

This script will:
- ✅ Check/create service account
- ✅ Check/create Artifact Registry repo
- ✅ Enable required APIs
- ✅ Build Docker image
- ✅ Deploy to Cloud Run
- ✅ Show you the live URL

## Manual Deploy (if you prefer)

```bash
# Set your project
gcloud config set project nutrilabel-mvp

# Deploy
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_SERVICE=nutrilabel2-mvp,_AR_REPO=nutrilabel
```

## Get Your Live URL

After deployment:

```bash
gcloud run services describe nutrilabel2-mvp \
  --region=us-central1 \
  --format="value(status.url)"
```

## Accessing Your Service

**Important:** Your organization policy blocks public access (`allUsers`). The deployment script automatically grants access to your account.

### Option 1: Browser (Authenticated)
1. Make sure you're logged in: `gcloud auth login`
2. Visit the service URL in your browser
3. Your browser will use your gcloud credentials automatically

### Option 2: Command Line (Authenticated)
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe nutrilabel2-mvp \
  --region=us-central1 \
  --format="value(status.url)")

# Access with authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  "$SERVICE_URL"
```

### Granting Access to Other Users
```bash
gcloud run services add-iam-policy-binding nutrilabel2-mvp \
  --region=us-central1 \
  --member="user:email@example.com" \
  --role="roles/run.invoker" \
  --project=nutrilabel-mvp
```

## What Gets Deployed

- ✅ Next.js app with redesigned UI
- ✅ API routes for image analysis
- ✅ Vertex AI integration
- ✅ Cloud Vision OCR
- ✅ PWA icons and manifest
- ✅ All static assets

## Troubleshooting

If deployment fails:
1. Check you're authenticated: `gcloud auth list`
2. Check project: `gcloud config get-value project`
3. Check billing is enabled: `gcloud billing accounts list`
4. Check Cloud Build logs in GCP Console
