@echo off
REM Quick Git Push Script for Foodsta
REM Run this after making changes to redeploy

cd /d d:\foodsta_complete\foodsta_2

echo.
echo ====================================================
echo   PUSHING CHANGES TO GITHUB
echo ====================================================
echo.

git status

echo.
echo Are you ready to commit and push? (You'll be asked for confirmation below)
echo.

git add .
git commit -m "Update: Foodsta deployment" 
git push origin main

echo.
echo ====================================================
echo ✓ Changes pushed! Vercel will auto-deploy...
echo ====================================================
echo.

pause
