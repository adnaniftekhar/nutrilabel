# Making Your Cloud Run Service Publicly Accessible

Your organization has policies that restrict public access. Here's how to make your service public:

## Quick Fix: Use Cloud Console (Easiest)

1. **Go to Cloud Run Console:**
   ```
   https://console.cloud.google.com/run?project=nutrilabel-mvp
   ```

2. **Click on your service:** `nutrilabel2-mvp`

3. **Click the "PERMISSIONS" tab** (at the top)

4. **Click "ADD PRINCIPAL"**

5. **Enter:** `allUsers`

6. **Select role:** `Cloud Run Invoker`

7. **Click "SAVE"**

8. **Test:** Visit your service URL - it should work without authentication!

## Alternative: Command Line (if you have org admin)

If you have Organization Administrator role, you can run:

```bash
# Wait for policy propagation (can take 5-10 minutes)
sleep 60

# Add public access
gcloud run services add-iam-policy-binding nutrilabel2-mvp \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=nutrilabel-mvp
```

## What We Already Fixed

✅ **Organization Policy Updated:** We modified the `iam.allowedPolicyMemberDomains` constraint at both:
- Project level: `nutrilabel-mvp`
- Organization level: `977905110491`

The policy now allows all domains (`allValues: ALLOW`).

## Why It Might Still Be Blocked

1. **Policy Propagation Delay:** Organization policies can take 5-10 minutes to fully propagate
2. **Insufficient Permissions:** You may need `roles/resourcemanager.organizationAdmin` to modify org policies
3. **Additional Constraints:** There may be other organization policies we haven't found yet

## Verify It's Public

```bash
# Test without authentication
curl https://nutrilabel2-mvp-547804750724.us-central1.run.app

# Should return HTML (200 OK), not 403 Forbidden
```

## Your Service URLs

- Primary: `https://nutrilabel2-mvp-547804750724.us-central1.run.app`
- Alternative: `https://nutrilabel2-mvp-elltoymhea-uc.a.run.app`

Both should work once public access is granted.
