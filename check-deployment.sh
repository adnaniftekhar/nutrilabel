#!/bin/bash

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nutrilabel-mvp}"

echo "🔍 Checking deployment status..."
echo ""

# Get latest build
LATEST_BUILD=$(gcloud builds list --limit=1 --format="value(id)" --project=${PROJECT_ID} 2>/dev/null)

if [ -z "$LATEST_BUILD" ]; then
    echo "⚠️  No builds found. Deployment may not have started yet."
    exit 1
fi

echo "Latest build ID: ${LATEST_BUILD}"
echo ""

# Get build status
BUILD_STATUS=$(gcloud builds describe ${LATEST_BUILD} --project=${PROJECT_ID} --format="value(status)" 2>/dev/null)

echo "Status: ${BUILD_STATUS}"
echo ""

case "$BUILD_STATUS" in
    "SUCCESS")
        echo "✅ Build completed successfully!"
        echo ""
        echo "Getting service URL..."
        SERVICE_URL=$(gcloud run services describe nutrilabel2-mvp \
          --region=us-central1 \
          --project=${PROJECT_ID} \
          --format="value(status.url)" 2>/dev/null)
        
        if [ -n "$SERVICE_URL" ]; then
            echo ""
            echo "🌐 Your app is live at:"
            echo "${SERVICE_URL}"
        fi
        ;;
    "WORKING"|"QUEUED")
        echo "⏳ Build is still running..."
        echo ""
        echo "View live logs:"
        echo "gcloud builds log ${LATEST_BUILD} --project=${PROJECT_ID}"
        echo ""
        echo "Or watch in console:"
        echo "https://console.cloud.google.com/cloud-build/builds/${LATEST_BUILD}?project=${PROJECT_ID}"
        ;;
    "FAILURE"|"CANCELLED"|"TIMEOUT"|"INTERNAL_ERROR")
        echo "❌ Build failed!"
        echo ""
        echo "View error logs:"
        echo "gcloud builds log ${LATEST_BUILD} --project=${PROJECT_ID}"
        echo ""
        echo "Or check in console:"
        echo "https://console.cloud.google.com/cloud-build/builds/${LATEST_BUILD}?project=${PROJECT_ID}"
        ;;
    *)
        echo "Status: ${BUILD_STATUS}"
        ;;
esac
