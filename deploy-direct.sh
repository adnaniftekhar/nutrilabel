#!/bin/bash

set -e

PROJECT_ID="nutrilabel-mvp"
REGION="us-central1"
SERVICE_NAME="nutrilabel2-mvp"
AR_REPO="nutrilabel"

echo "🚀 Direct Cloud Build Deployment"
echo "=================================="
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo ""

# Set project
gcloud config set project ${PROJECT_ID}

# Grant Compute Engine SA permissions (if needed)
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Ensuring Compute Engine SA has storage permissions..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/storage.admin" \
    --condition=None 2>&1 | grep -E "Updated|ERROR" || true

echo ""
echo "Starting Cloud Build..."
echo ""

# Deploy with explicit project
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_REGION=${REGION},_SERVICE=${SERVICE_NAME},_AR_REPO=${AR_REPO} \
  --project=${PROJECT_ID}

echo ""
echo "✅ Build submitted!"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region=${REGION} \
  --project=${PROJECT_ID} \
  --format='value(status.url)' 2>/dev/null)

echo "Service URL: ${SERVICE_URL}"
echo ""

# Grant public access (allUsers)
echo "Granting public access (allUsers)..."
if gcloud run services add-iam-policy-binding ${SERVICE_NAME} \
  --region=${REGION} \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=${PROJECT_ID} 2>&1 | grep -E "Updated|already|ERROR"; then
  echo "✅ Public access granted!"
else
  echo "⚠️  Could not grant public access. This may be blocked by organization policy."
  echo "   If you need public access, you may need to modify organization policies."
  echo "   See: https://console.cloud.google.com/iam-admin/orgpolicies?project=${PROJECT_ID}"
fi
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your service is publicly accessible at:"
echo "   ${SERVICE_URL}"
echo ""
echo "Test it:"
echo "  curl ${SERVICE_URL}"
