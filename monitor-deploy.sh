#!/bin/bash

PROJECT_ID="nutrilabel-mvp"

echo "🔍 Monitoring deployment..."
echo ""

while true; do
    clear
    echo "=== Deployment Status ==="
    echo ""
    
    # Check for builds
    BUILDS=$(gcloud builds list --limit=5 --format="table(id,status,createTime)" --project=${PROJECT_ID} 2>/dev/null)
    
    if [ -n "$BUILDS" ] && [ "$BUILDS" != "Listed 0 items." ]; then
        echo "$BUILDS"
        echo ""
        LATEST_BUILD=$(gcloud builds list --limit=1 --format="value(id)" --project=${PROJECT_ID} 2>/dev/null)
        STATUS=$(gcloud builds describe ${LATEST_BUILD} --format="value(status)" --project=${PROJECT_ID} 2>/dev/null)
        
        echo "Latest build: ${LATEST_BUILD}"
        echo "Status: ${STATUS}"
        echo ""
        
        if [ "$STATUS" = "SUCCESS" ]; then
            echo "✅ Build completed!"
            echo ""
            SERVICE_URL=$(gcloud run services describe nutrilabel2-mvp \
              --region=us-central1 \
              --project=${PROJECT_ID} \
              --format="value(status.url)" 2>/dev/null)
            if [ -n "$SERVICE_URL" ]; then
                echo "🌐 App URL: ${SERVICE_URL}"
            fi
            break
        elif [ "$STATUS" = "WORKING" ] || [ "$STATUS" = "QUEUED" ]; then
            echo "⏳ Still building... (refresh in 10 seconds)"
        else
            echo "❌ Build status: ${STATUS}"
            echo "Check logs: gcloud builds log ${LATEST_BUILD} --project=${PROJECT_ID}"
            break
        fi
    else
        echo "⏳ No builds yet. Waiting for deployment to start..."
        echo ""
        echo "If this takes too long, the deploy.sh script might be stuck."
        echo "Check the terminal where you ran ./deploy.sh"
    fi
    
    sleep 10
done
