# Quick Deploy to Cloud Run

## Option 1: If you already ran bootstrap

If you have a `.gcp.env` file:

```bash
source .gcp.env
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=${REGION},_SERVICE=${SERVICE_NAME},_AR_REPO=${AR_REPO}
```

## Option 2: First time setup (run bootstrap first)

```bash
# Set your billing account
export BILLING_ACCOUNT=YOUR_BILLING_ACCOUNT_ID

# Run bootstrap
bash scripts/gcp/bootstrap.sh

# Then deploy
source .gcp.env
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=${REGION},_SERVICE=${SERVICE_NAME},_AR_REPO=${AR_REPO}
```

## Option 3: Manual deployment (if you know your project)

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_SERVICE=nutrilabel2-mvp,_AR_REPO=nutrilabel
```

After deployment, get your URL:
```bash
gcloud run services describe nutrilabel2-mvp \
  --region=us-central1 \
  --format="value(status.url)"
```
