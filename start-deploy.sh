#!/bin/bash

set -e

PROJECT_ID="nutrilabel-mvp"
REGION="us-central1"
SERVICE_NAME="nutrilabel2-mvp"
AR_REPO="nutrilabel"

echo "🚀 Starting Cloud Build deployment..."
echo "Project: ${PROJECT_ID}"
echo "This will take 5-10 minutes..."
echo ""

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Start the build
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_REGION=${REGION},_SERVICE=${SERVICE_NAME},_AR_REPO=${AR_REPO} \
  --project=${PROJECT_ID}

echo ""
echo "✅ Build submitted! Check status with:"
echo "   gcloud builds list --limit=1 --project=${PROJECT_ID}"
echo ""
echo "Or watch logs:"
echo "   ./check-deployment.sh"
