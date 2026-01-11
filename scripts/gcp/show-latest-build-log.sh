#!/bin/bash
set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nutrilabel-mvp}"

echo "Fetching latest Cloud Build log for project: $PROJECT_ID"
echo ""

BUILD_ID=$(gcloud builds list --project="$PROJECT_ID" --sort-by=~createTime --limit=1 --format='value(id)' 2>/dev/null || echo "")

if [ -z "$BUILD_ID" ]; then
    echo "❌ No builds found"
    exit 1
fi

echo "Latest build ID: $BUILD_ID"
echo "Build details:"
gcloud builds describe "$BUILD_ID" --project="$PROJECT_ID" --format="table(id,status,createTime,logUrl)" 2>&1
echo ""
echo "--- Build Log ---"
gcloud builds log "$BUILD_ID" --project="$PROJECT_ID" 2>&1 | tail -200
