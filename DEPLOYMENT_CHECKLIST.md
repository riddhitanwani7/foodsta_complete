# 🚀 Foodsta Deployment Checklist - GitHub + Vercel

## Pre-Deployment Verification

### Local Setup ✓
- [x] MongoDB Atlas account created
- [x] Connection string obtained: `mongodb+srv://riddhitanwani7_db_user:EAJWvVCSoQmjrp0q@foodsta.rkeykpd.mongodb.net/?appName=foodsta`
- [x] GitHub username: `riddhitanwani7`
- [x] Environment variables configured
- [x] CORS updated in server.js
- [x] Git repository initialized

---

## DEPLOYMENT PROCESS (DO THESE STEPS IN ORDER)

### ✅ STEP 1: Verify MongoDB Atlas IP Whitelist
**Why**: Vercel needs to connect to your MongoDB database

1. Go to https://cloud.mongodb.com
2. Select your project → Database Access → Network Access
3. Click "ADD IP ADDRESS"
4. Choose "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
   - Or add Vercel's IP range: `0.0.0.0/0`
5. Click "Confirm"

⏱️ **Time**: 2 minutes

---

### ✅ STEP 2: Push Code to GitHub

**Open Command Prompt/PowerShell and run:**

```bash
cd d:\foodsta_complete\foodsta_2
git status
```

**If clean, skip to next command. If dirty files:**
```bash
git add .
git commit -m "Final deployment preparation"
```

**Then push to GitHub:**
```bash
git push -u origin main
```

⏱️ **Time**: 5 minutes
✅ **Result**: Your code is now on https://github.com/riddhitanwani7/foodsta

---

### ✅ STEP 3: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Search for and select **"foodsta"** repository
5. Click **"Import"**

⏱️ **Time**: 2 minutes

---

### ✅ STEP 4: Configure Build Settings

In the Vercel project configuration screen:

1. **Project Name**: `foodsta` (or your preferred name)
2. **Root Directory**: Leave empty or set to `foodsta_2` (Vercel might auto-detect)
3. **Framework**: Select **"Other"** (since we have Express + React custom setup)
4. **Build Command**: 
   ```
   npm install && cd client && npm install && npm run build
   ```
5. **Output Directory**: 
   ```
   client/dist
   ```
6. **Install Command**:
   ```
   npm install && cd client && npm install
   ```

⏱️ **Time**: 3 minutes

---

### ✅ STEP 5: Add Environment Variables

Still in Vercel project setup, scroll down to **"Environment Variables"** section:

**Add each variable:**

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://riddhitanwani7_db_user:EAJWvVCSoQmjrp0q@foodsta.rkeykpd.mongodb.net/?appName=foodsta` |
| `JWT_SECRET` | `6ced15b1e1465bad6fcba7f0b0c9edc61e0ac190de67ed0ade48c2e371a6743e54c4352eaf31c1a1908858ded8ec72e276d2617fb3e8aeeb9e5cb9adbb05e064` |
| `JWT_REFRESH_SECRET` | `06f583dfb4d1511bd70fe9e3861f744b3faf18691a226cf99206fffc1d8efbe6eb91e67d87b30aa01a73afee677bb75ae294dd2a9d2306cc7a6d2bcc91394db3` |
| `IMAGEKIT_PUBLIC_KEY` | `public_W6iWsvdi1nkEE57IwKRsD8CVV8A=` |
| `IMAGEKIT_PRIVATE_KEY` | `private_wlGgshbvaEuZ5BYiKhUxKCZj96Y=` |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/tyalmquqc` |
| `NODE_ENV` | `production` |

**For each variable:**
- Paste the key
- Paste the value
- Click "Add"

⏱️ **Time**: 5 minutes

---

### ✅ STEP 6: Deploy!

1. Review all settings one final time
2. Click **"Deploy"** button
3. Wait for deployment to complete (usually 3-5 minutes)

✅ **Success**: You'll see a message: `🎉 Deployment Complete!`

⏱️ **Time**: 5-10 minutes

---

## Post-Deployment

### ✅ STEP 7: Test Your Deployment

1. Click the deployment URL (provided by Vercel)
2. Test these features:
   - Navigate to home page
   - Try login/register
   - Check browser console for errors (F12)
   - Test API calls (check Network tab)

### ✅ STEP 8: Verify API Connection

Open browser DevTools (F12) and check:

**In Console tab:**
```javascript
// Test API connectivity
fetch('/api/health').then(r => r.json()).then(console.log)
```

**Expected response:**
```json
{ "status": "ok", "timestamp": "2026-04-27T06:35:24.072Z" }
```

### ✅ STEP 9: Update Hardcoded Localhost References

If your client has any hardcoded `localhost` references:

Search for and update:
- `localhost:5000` → Remove (use `/api` which auto-routes to server)
- `localhost:3000` → `https://your-vercel-domain.vercel.app`
- `http://` → `https://` (Vercel uses HTTPS)

Then:
```bash
git add .
git commit -m "Update API endpoints for production"
git push origin main
```

Vercel will auto-redeploy.

---

## Troubleshooting

### ❌ Build Failed
**Solution:**
1. Check Vercel build logs (provided in dashboard)
2. Common issues:
   - Missing `npm install` for server dependencies
   - Client build errors
   - Environment variables not set

### ❌ Blank Page / 404
**Solution:**
1. Ensure `client/dist` exists
2. Check that build command ran successfully
3. Verify `vercel.json` configuration

### ❌ API Returns 500 Error
**Solution:**
1. Check MongoDB connection (MONGO_URI)
2. Verify IP whitelist in MongoDB Atlas
3. Check function logs in Vercel dashboard

### ❌ CORS Errors
**Solution:**
1. Your domain is already added to CORS in server.js
2. If issues persist, add to `.../server/server.js`:
   ```javascript
   origin: ['*'] // Not recommended for production, but for testing
   ```

---

## Final Checklist

- [ ] Code pushed to GitHub (main branch)
- [ ] Vercel project created and deployed
- [ ] All 7 environment variables set
- [ ] MongoDB Atlas IP whitelist allows 0.0.0.0/0
- [ ] Deployment shows green checkmark
- [ ] Can access home page at Vercel URL
- [ ] `/api/health` endpoint returns 200 OK
- [ ] Login/register works
- [ ] No console errors

---

## Your Deployment Details

| Item | Value |
|------|-------|
| **GitHub Repository** | https://github.com/riddhitanwani7/foodsta |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Vercel Project Link** | https://vercel.com/riddhitanwani7/foodsta_complete |
| **Your Live App** | https://foodsta-seven.vercel.app *(after deployment)* |
| **MongoDB Cluster** | foodsta.rkeykpd.mongodb.net |
| **Support** | Check Vercel logs + MongoDB Atlas logs |

---

## Future Deployments (After Changes)

Anytime you want to redeploy:

```bash
cd d:\foodsta_complete\foodsta_2
git add .
git commit -m "Your changes description"
git push origin main
# Vercel automatically redeploys!
```

**That's it!** ✅ Enjoy your deployed Foodsta app! 🎉
