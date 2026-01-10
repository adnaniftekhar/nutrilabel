# GitHub Actions Deployment Guide

This guide explains how to set up automatic deployment to Google Cloud Run using GitHub Actions.

## Prerequisites

1. **GCP Project Setup**: Complete the bootstrap process first (see [deploy-gcp.md](./deploy-gcp.md))
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **GCP Service Account**: A service account with deployment permissions

## Step 1: Create GCP Service Account for GitHub Actions

```bash
# Set your project ID
export PROJECT_ID=nutrilabel-mvp  # or your project ID

# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer" \
  --project=$PROJECT_ID

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com \
  --project=$PROJECT_ID

echo "✅ Service account key created: github-actions-key.json"
echo "⚠️  Keep this file secure - you'll need it for GitHub secrets"
```

## Step 2: Configure GitHub Secrets

1. Go to your GitHub repository: https://github.com/adnaniftekhar/nutrilabel
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

### Required Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `GCP_PROJECT_ID` | Your GCP project ID | From `.gcp.env` or `gcloud config get-value project` |
| `GCP_SA_KEY` | Service account JSON key | Contents of `github-actions-key.json` file |
| `GCP_SERVICE_ACCOUNT` | Cloud Run service account email | From `.gcp.env` or bootstrap output |

### Example Values

- `GCP_PROJECT_ID`: `nutrilabel-mvp` (or your project ID)
- `GCP_SA_KEY`: `{"type":"service_account","project_id":"...",...}` (full JSON)
- `GCP_SERVICE_ACCOUNT`: `nutrilabel2-mvp-runtime@nutrilabel-mvp.iam.gserviceaccount.com`

## Step 3: Verify Workflow Files

The workflow files are already in the repository:
- `.github/workflows/deploy-cloud-run.yml` - Deploys to Cloud Run on push to main
- `.github/workflows/ci.yml` - Runs tests and builds on PRs

## Step 4: Trigger Deployment

### Automatic Deployment

The workflow automatically runs when you:
- Push to the `main` branch
- Merge a pull request to `main`

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Cloud Run** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Step 5: Monitor Deployment

1. Go to **Actions** tab in GitHub
2. Click on the running workflow
3. Watch the deployment progress
4. Check the deployment summary for the service URL

## Workflow Details

### Deploy Workflow (`.github/workflows/deploy-cloud-run.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Authenticate to Google Cloud
3. Build Docker image
4. Push to Artifact Registry
5. Deploy to Cloud Run
6. Output service URL

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Pull requests to `main`
- Push to `main`

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run linter
5. Run type check
6. Run tests
7. Build application

## Troubleshooting

### Authentication Errors

If you see authentication errors:
- Verify `GCP_SA_KEY` secret contains valid JSON
- Check service account has correct permissions
- Ensure service account key hasn't expired

### Build Failures

If the build fails:
- Check GitHub Actions logs for specific errors
- Verify Dockerfile is correct
- Ensure all dependencies are in `package.json`

### Deployment Failures

If deployment fails:
- Check Cloud Run service account permissions
- Verify environment variables are correct
- Check Cloud Run logs: `gcloud run services logs read nutrilabel2-mvp --region=us-central1`

### Service Account Permissions

If you get permission errors, ensure the service account has:
- `roles/run.admin` - Deploy to Cloud Run
- `roles/iam.serviceAccountUser` - Use service accounts
- `roles/storage.admin` - Access Artifact Registry
- `roles/artifactregistry.writer` - Push Docker images

## Security Best Practices

1. **Never commit secrets**: All sensitive data should be in GitHub Secrets
2. **Rotate keys regularly**: Regenerate service account keys periodically
3. **Use least privilege**: Only grant necessary permissions
4. **Monitor deployments**: Review deployment logs regularly

## Next Steps

After successful deployment:
1. Visit the service URL from the deployment summary
2. Run the [Online Smoke Test Checklist](./deploy-gcp.md#online-smoke-test-checklist)
3. Set up monitoring and alerts
4. Configure custom domain (optional)
