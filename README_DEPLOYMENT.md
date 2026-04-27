# Foodsta Deployment Setup

## Deployed Configuration

### Environment Variables (Set in Vercel Dashboard)
```
MONGO_URI=mongodb+srv://riddhitanwani7_db_user:EAJWvVCSoQmjrp0q@foodsta.rkeykpd.mongodb.net/?appName=foodsta
JWT_SECRET=6ced15b1e1465bad6fcba7f0b0c9edc61e0ac190de67ed0ade48c2e371a6743e54c4352eaf31c1a1908858ded8ec72e276d2617fb3e8aeeb9e5cb9adbb05e064
JWT_REFRESH_SECRET=06f583dfb4d1511bd70fe9e3861f744b3faf18691a226cf99206fffc1d8efbe6eb91e67d87b30aa01a73afee677bb75ae294dd2a9d2306cc7a6d2bcc91394db3
IMAGEKIT_PUBLIC_KEY=public_W6iWsvdi1nkEE57IwKRsD8CVV8A=
IMAGEKIT_PRIVATE_KEY=private_wlGgshbvaEuZ5BYiKhUxKCZj96Y=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/tyalmquqc
NODE_ENV=production
```

### Database
- **Provider**: MongoDB Atlas
- **Cluster**: foodsta.rkeykpd.mongodb.net
- **Database**: foodsta_complete

### Build Configuration
- **Framework**: React + Express (Custom)
- **Build Command**: `npm install && cd client && npm install && npm run build`
- **Root Directory**: `foodsta_2/`
- **Output Directory**: `client/dist`

### GitHub
- **Repository**: https://github.com/riddhitanwani7/foodsta_complete
- **Branch**: main
- **Auto-deploy**: Yes (on push to main)

## Quick Links
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub Repository: https://github.com/riddhitanwani7/foodsta

## Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Ensure all dependencies are in package.json
3. Verify environment variables are set

### API Connection Issues
1. Check CORS configuration in server.js
2. Update Vercel domain in CORS allowed origins
3. Test `/api/health` endpoint

### Database Connection Errors
1. Verify MONGO_URI is correct
2. Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0)
3. Test connection locally first

## Redeployment
```bash
git add .
git commit -m "Update message"
git push origin main
# Vercel will automatically redeploy
```
