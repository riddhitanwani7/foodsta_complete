@echo off
REM Foodsta Deployment Script - GitHub + Vercel
REM This script will initialize git, build, and prepare for GitHub push

cd /d d:\foodsta_complete\foodsta_2

echo.
echo ====================================================
echo   FOODSTA DEPLOYMENT SETUP
echo ====================================================
echo.

REM Step 1: Initialize Git
echo STEP 1: Initializing Git Repository...
if not exist .git (
    git init
    echo ✓ Git repository initialized
) else (
    echo ✓ Git repository already exists
)

echo.

REM Step 2: Configure Git (optional - remove if not needed)
echo STEP 2: Configuring Git User...
git config user.email "your-email@example.com" 2>nul || echo (Using global git config)
git config user.name "riddhitanwani7" 2>nul || echo (Using global git config)

echo.

REM Step 3: Add files to git
echo STEP 3: Staging files for commit...
git add .
echo ✓ Files staged

echo.

REM Step 4: Create initial commit
echo STEP 4: Creating initial commit...
git commit -m "Initial commit: Foodsta app ready for Vercel deployment" || echo (Already committed)
echo ✓ Commit created

echo.

REM Step 5: Set remote origin
echo STEP 5: Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/riddhitanwani7/foodsta.git
echo ✓ GitHub remote configured: https://github.com/riddhitanwani7/foodsta.git

echo.

REM Step 6: Set main branch
echo STEP 6: Setting main branch...
git branch -M main
echo ✓ Main branch set

echo.

echo ====================================================
echo   NEXT STEPS:
echo ====================================================
echo.
echo 1. ENSURE YOU HAVE CREATED THE GITHUB REPOSITORY:
echo    → Go to https://github.com/new
echo    → Create repository: foodsta
echo    → Leave it empty (don't add README)
echo.
echo 2. PUSH TO GITHUB:
echo    → Run: git push -u origin main
echo    → Enter your GitHub credentials if prompted
echo.
echo 3. CONFIGURE VERCEL:
echo    → Go to https://vercel.com/dashboard
echo    → Click "Add New" → "Project"
echo    → Import your GitHub repository
echo    → Configure environment variables:
echo.
echo      MONGO_URI=mongodb+srv://riddhitanwani7_db_user:EAJWvVCSoQmjrp0q@foodsta.rkeykpd.mongodb.net/?appName=foodsta
echo      JWT_SECRET=6ced15b1e1465bad6fcba7f0b0c9edc61e0ac190de67ed0ade48c2e371a6743e54c4352eaf31c1a1908858ded8ec72e276d2617fb3e8aeeb9e5cb9adbb05e064
echo      JWT_REFRESH_SECRET=06f583dfb4d1511bd70fe9e3861f744b3faf18691a226cf99206fffc1d8efbe6eb91e67d87b30aa01a73afee677bb75ae294dd2a9d2306cc7a6d2bcc91394db3
echo      IMAGEKIT_PUBLIC_KEY=public_W6iWsvdi1nkEE57IwKRsD8CVV8A=
echo      IMAGEKIT_PRIVATE_KEY=private_wlGgshbvaEuZ5BYiKhUxKCZj96Y=
echo      IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/tyalmquqc
echo      NODE_ENV=production
echo.
echo    → Build Command: npm install && cd client && npm install && npm run build
echo    → Output Directory: client/dist
echo    → Click Deploy
echo.
echo 4. AFTER DEPLOYMENT:
echo    → Test your app at the Vercel URL provided
echo    → Update any hardcoded localhost references
echo.
echo ====================================================

pause
