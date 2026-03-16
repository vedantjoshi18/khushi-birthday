# Khushi Birthday - Clean Deployment Guide (Vercel + Spotify)

This guide is designed to help you deploy once and avoid common breakages.

---

## 1. What You Need Before Deploying

- A GitHub account
- A Vercel account (same email as GitHub is easiest)
- A Spotify Developer app
- Your production domain (or temporary `.vercel.app` URL)

---

## 2. Local Pre-Deployment Validation (Do This First)

Run from the project root:

```powershell
npm install
npm run build
```

Only continue if build succeeds.

If dev server behaved strangely earlier, run this once:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

Stop dev server before deploying.

---

## 3. Commit and Push to GitHub

```powershell
git add .
git commit -m "Prepare production deployment"
git push origin main
```

If your branch name is not `main`, push your active branch and deploy that in Vercel.

---

## 4. Create Spotify App Configuration (Critical)

1. Open Spotify Developer Dashboard.
2. Open your app.
3. Go to app settings.
4. In Redirect URIs, add:
   - `https://YOUR_DOMAIN/callback`
   - (optional) `https://YOUR_PROJECT.vercel.app/callback`
5. Save.

Important:
- Redirect URI must match exactly (including protocol, domain, and path).
- A mismatch is the most common Spotify deployment failure.

---

## 5. Import Project in Vercel

1. Open Vercel dashboard.
2. Click Add New Project.
3. Import your GitHub repository.
4. Confirm framework auto-detect is Next.js.
5. Keep build settings default:
   - Build Command: `next build`
   - Output: default Next.js output

---

## 6. Add Environment Variables in Vercel

In Project Settings -> Environment Variables, add:

- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` = your Spotify client id
- `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` = `https://YOUR_DOMAIN/callback`

Set both for:
- Production
- Preview (optional but recommended)
- Development (optional)

Then trigger a redeploy.

---

## 7. First Production Deploy

1. Click Deploy in Vercel.
2. Wait for build to complete.
3. Open the production URL.
4. Test these routes/features:
   - Home page loads fully
   - Bouquet section images load
   - Video section can play/rotate/fullscreen
   - Spotify connect opens auth and returns to `/callback`

---

## 8. Post-Deploy Smoke Test Checklist

Use this list every deploy:

- [ ] Page opens without server error
- [ ] No broken layout after refresh
- [ ] Bouquet images visible
- [ ] Video controls work (play/pause, seek, volume, rotate, fullscreen)
- [ ] Spotify login succeeds
- [ ] Spotify returns to app and player appears
- [ ] Mobile layout is usable

---

## 9. Zero-Surprise Redeploy Flow (Recommended Every Time)

1. Make code changes locally.
2. Run:

```powershell
npm run build
```

3. Commit and push.
4. Verify Vercel build logs.
5. Run smoke test checklist on production.

This keeps production stable and catches issues before users do.

---

## 10. Most Common Failures and Exact Fixes

### A) Spotify says redirect URI mismatch

Fix:
- Ensure `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` in Vercel equals Spotify dashboard URI exactly.
- Redeploy.

### B) App works locally but not on Vercel

Fix:
- Check Vercel env vars are set in Production scope.
- Redeploy after env var change.

### C) Bouquet images fail in dev with `fetchExternalImage` errors

Fix:
- Already mitigated by `unoptimized` on bouquet CDN images.
- If still seen, confirm internet/firewall allows the CDN host.

### D) Old/stale behavior after deploy

Fix:
- Force new deploy in Vercel.
- Hard refresh browser (Ctrl+Shift+R).
- Ensure you are on latest deployment URL.

### E) Spotify player not active after auth

Fix:
- Open app in a normal browser tab (not blocked popup window).
- Ensure you have a Spotify Premium account for Web Playback SDK.
- Reconnect Spotify from the music section.

---

## 11. Safe Production Practices

- Do not remove or rename `/callback` route.
- Do not change Spotify scopes unless needed.
- Keep Next.js and Spotify SDK updates deliberate (one upgrade at a time).
- Always run `npm run build` before pushing.

---

## 12. Optional: Custom Domain Without Breaking Spotify

If you move from `.vercel.app` to custom domain:

1. Add custom domain in Vercel.
2. Wait for DNS to verify.
3. Update Spotify Redirect URI to custom domain callback.
4. Update `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` in Vercel.
5. Redeploy.

Do all 5 together to avoid broken auth.

---

## 13. Final Quick Deploy Script (Local)

```powershell
npm install
npm run build
git add .
git commit -m "Deploy update"
git push origin main
```

Then in Vercel, confirm deployment succeeded and run smoke tests.

---

If you follow this file top-to-bottom, deployment should be stable with Spotify, videos, bouquet, and UI features working in production.
