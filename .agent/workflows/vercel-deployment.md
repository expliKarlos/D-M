---
description: Deploy Next.js 16 App to Vercel (Production)
---

# Vercel Deployment Workflow

This workflow guides you through deploying the Next.js 16 application to Vercel (Plan Hobby).

## Prerequisites

1. **GitHub Repository**: Code must be pushed to GitHub
2. **Vercel Account**: Free account at [vercel.com](https://vercel.com)
3. **Environment Variables**: All secrets ready from `.env.local`

---

## Step 1: Prepare the Repository

### 1.1 Ensure `.gitignore` is correct

Verify that sensitive files are excluded:

```bash
cat .gitignore
```

Must include:
- `.env.local`
- `.env*.local`
- `service-account.json`
- `node_modules/`

### 1.2 Check Git status

```bash
git status
```

### 1.3 Commit and push latest changes

```bash
git add .
git commit -m "feat: prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Create Vercel Project

### 2.1 Login to Vercel

Visit [vercel.com/new](https://vercel.com/new) and sign in with GitHub.

### 2.2 Import GitHub Repository

1. Click "Add New Project"
2. Select your GitHub repository: `expliKarlos/digvijay_y_maria`
3. Click "Import"

### 2.3 Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (unless you have a monorepo)
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## Step 3: Configure Environment Variables (CRITICAL)

### 3.1 Add Public Variables

In Vercel dashboard → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://slgdlqhwupvymmalyoff.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_TPcc9y5ib3_8meEnNHRLrg_TaFpwTe3` | Production |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyD6qGT6hNc9_tPVeuz7fRga_Ic1215asxo` | Production |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `boda-digvijay-maria.firebaseapp.com` | Production |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `boda-digvijay-maria` | Production |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `boda-digvijay-maria.firebasestorage.app` | Production |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `585919126064` | Production |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:585919126064:web:528553c90c0264d6c22bf5` | Production |

### 3.2 Add Server-Only Secrets (CRITICAL)

⚠️ **NEVER expose these variables to the client**

| Variable | Value | Environment |
|----------|-------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | (from `.env.local`) | Production |
| `SERVICE_ACCOUNT_BASE64` | (from `.env.local`) | Production |
| `VERTEX_PROJECT_ID` | `boda-digvijay-maria` | Production |
| `VERTEX_LOCATION` | `europe-west1` | Production |

### 3.3 Add Google Auth Variables (if configured)

| Variable | Value | Environment |
|----------|-------|-------------|
| `GOOGLE_CLIENT_ID` | (your actual value) | Production |
| `GOOGLE_CLIENT_SECRET` | (your actual value) | Production |

> **Note**: If you haven't configured Google Auth yet, skip these for now.

---

## Step 4: Deploy

### 4.1 Initial Deployment

Click **"Deploy"** in Vercel dashboard.

Vercel will:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Run build (`next build`)
4. Deploy to production

### 4.2 Monitor Build Logs

Watch the build logs for:
- ✅ Successful build
- ❌ Build errors (missing env vars, TypeScript errors, etc.)

---

## Step 5: Verify Deployment

### 5.1 Check Production URL

Vercel will provide a URL like:
```
https://your-project-name.vercel.app
```

### 5.2 Test Critical Functionality

Visit the deployed app and verify:

- [ ] Home page loads correctly
- [ ] PWA manifest is accessible
- [ ] Login flow works (if Google Auth is configured)
- [ ] Protected routes redirect correctly
- [ ] AI Concierge responds (Vertex AI integration)
- [ ] Image gallery loads from Supabase Storage
- [ ] Firebase Analytics tracks events
- [ ] Mobile responsiveness

### 5.3 Check Browser Console

Open DevTools and verify:
- No authentication errors
- No CORS errors
- No 404s for critical resources

---

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain (e.g., `bodadigvijaymaria.com`)
3. Follow DNS configuration instructions

### 6.2 Update Firebase/Supabase Allowed Origins

Add your new domain to:
- **Firebase**: Authorized domains in Firebase Console
- **Supabase**: Site URL in Supabase dashboard

---

## Step 7: Enable Auto-Deployment

### 7.1 Configure GitHub Integration

In Vercel → Settings → Git:

- ✅ **Production Branch**: `main`
- ✅ **Auto-deploy**: Enabled

Every push to `main` will trigger automatic deployment.

### 7.2 Create Preview Deployments (Optional)

For feature branches:
- Pull requests automatically get preview URLs
- Test changes before merging to `main`

---

## Troubleshooting

### Build Fails with "Missing Environment Variables"

**Solution**: Verify all required env vars are set in Vercel dashboard (Step 3).

### "SERVICE_ACCOUNT_BASE64 is not defined"

**Solution**: 
1. Go to Vercel → Settings → Environment Variables
2. Add `SERVICE_ACCOUNT_BASE64` with the exact value from `.env.local`
3. Redeploy

### "Failed to initialize Vertex AI"

**Solution**:
1. Verify `VERTEX_PROJECT_ID=boda-digvijay-maria`
2. Verify `VERTEX_LOCATION=europe-west1`
3. Verify `SERVICE_ACCOUNT_BASE64` is correctly set
4. Check that service account has Vertex AI permissions

### Supabase Storage Images Not Loading

**Solution**:
1. Check bucket policies in Supabase dashboard
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
3. Ensure images were uploaded to production bucket (not local)

### Firebase Auth Redirects Fail

**Solution**:
1. Add Vercel URL to Firebase Authorized Domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add `your-project-name.vercel.app`

### CORS Errors

**Solution**:
1. All API calls should go through Next.js API routes (`/api/*`)
2. Never call Firebase Admin/Vertex AI directly from client
3. Use Server Actions or Route Handlers

---

## Post-Deployment Checklist

- [ ] Production URL works and is accessible
- [ ] All environment variables are set correctly
- [ ] PWA can be installed on mobile
- [ ] Google Auth works (if configured)
- [ ] AI Concierge responds correctly
- [ ] Images load from Supabase Storage
- [ ] Analytics events are tracked
- [ ] Custom domain configured (if applicable)
- [ ] Auto-deployment is enabled
- [ ] Team has access to Vercel project

---

## Quick Redeploy

To trigger a new deployment after making changes:

```bash
git add .
git commit -m "fix: your change description"
git push origin main
```

Vercel will automatically detect the push and deploy.

---

## Emergency Rollback

If a deployment breaks production:

1. Go to Vercel dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

---

## Performance Optimization (Post-Launch)

### Enable Vercel Analytics

1. Go to Vercel dashboard → Analytics
2. Enable Web Analytics (free on Hobby plan)

### Monitor Performance

- Check Core Web Vitals in Vercel dashboard
- Review bundle size in build logs
- Consider enabling Edge Runtime for select routes

---

## Security Checklist

- [x] `.env.local` is in `.gitignore`
- [x] No secrets committed to GitHub
- [x] `SERVICE_ACCOUNT_BASE64` only accessible server-side
- [x] Supabase Service Role Key is server-only
- [x] All IA calls happen from server components/actions
- [x] Firebase Admin SDK only used server-side

---

## Support

If you encounter issues:

1. Check Vercel build logs
2. Review browser console for client-side errors
3. Check Vercel Functions logs for server-side errors
4. Consult Vercel documentation: https://vercel.com/docs
