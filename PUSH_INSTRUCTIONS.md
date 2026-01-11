# How to Push GitHub Actions Workflows

The workflow files are committed locally but need to be pushed with proper permissions.

## Option 1: Use GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not installed
brew install gh

# Authenticate
gh auth login

# Push
git push origin main
```

## Option 2: Update Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Create a new token or edit existing one
3. Check the **workflow** scope
4. Update your git credentials:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/adnaniftekhar/nutrilabel.git
   git push origin main
   ```

## Option 3: Push via GitHub Web Interface

1. Go to: https://github.com/adnaniftekhar/nutrilabel
2. Use the web editor or upload the files:
   - `.github/workflows/ci.yml`
   - `.github/workflows/deploy-cloud-run.yml`
   - `docs/github-deployment.md`

## Option 4: Use GitHub Desktop

If you have GitHub Desktop installed, you can push from there.

---

**Note:** The workflow files are already committed locally. You just need to push them with proper authentication.
