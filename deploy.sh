#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nutrilabel-mvp}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="nutrilabel2-mvp"
AR_REPO="nutrilabel"
SERVICE_ACCOUNT="${SERVICE_NAME}-runtime@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${GREEN}Deploying NutriLabel to Cloud Run${NC}"
echo "=================================="
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Service: ${SERVICE_NAME}"
echo ""

# Set project
gcloud config set project ${PROJECT_ID}

# Check if service account exists
if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT} &> /dev/null; then
    echo -e "${YELLOW}Service account doesn't exist. Creating it...${NC}"
    
    # Create service account
    gcloud iam service-accounts create ${SERVICE_NAME}-runtime \
        --display-name="NutriLabel Cloud Run Runtime" \
        --project=${PROJECT_ID} || true
    
    # Grant permissions
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="roles/vision.annotator" \
        --condition=None || true
    
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="roles/aiplatform.user" \
        --condition=None || true
fi

# Check if Artifact Registry repo exists
if ! gcloud artifacts repositories describe ${AR_REPO} \
    --location=${REGION} \
    --project=${PROJECT_ID} &> /dev/null; then
    echo -e "${YELLOW}Artifact Registry repo doesn't exist. Creating it...${NC}"
    gcloud artifacts repositories create ${AR_REPO} \
        --repository-format=docker \
        --location=${REGION} \
        --description="Docker repository for NutriLabel" \
        --project=${PROJECT_ID} || true
fi

# Enable required APIs
echo -e "${GREEN}Ensuring required APIs are enabled...${NC}"
gcloud services enable cloudbuild.googleapis.com --project=${PROJECT_ID} || true
gcloud services enable run.googleapis.com --project=${PROJECT_ID} || true
gcloud services enable artifactregistry.googleapis.com --project=${PROJECT_ID} || true
gcloud services enable vision.googleapis.com --project=${PROJECT_ID} || true
gcloud services enable aiplatform.googleapis.com --project=${PROJECT_ID} || true

echo ""
echo -e "${GREEN}Starting Cloud Build deployment...${NC}"
echo ""

# Deploy via Cloud Build
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=${REGION},_SERVICE=${SERVICE_NAME},_AR_REPO=${AR_REPO} \
  --project=${PROJECT_ID}

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Getting service URL..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region=${REGION} \
  --project=${PROJECT_ID} \
  --format="value(status.url)" 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo ""
    echo -e "${GREEN}🌐 Your app is live at:${NC}"
    echo "${SERVICE_URL}"
    echo ""
    echo "Open it in your browser to test!"
else
    echo -e "${YELLOW}⚠️  Could not get service URL. Check Cloud Run console.${NC}"
fi
