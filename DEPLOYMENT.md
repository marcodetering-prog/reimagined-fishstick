# Railway Deployment Guide

This guide will walk you through deploying the AI KPI Dashboard to Railway.

## Prerequisites

- A [Railway](https://railway.app) account
- Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Push to GitHub

First, commit and push your code to GitHub:

```bash
git add .
git commit -m "Initial commit: AI KPI Dashboard"
git push origin main
```

### 2. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Provision PostgreSQL"** (important: add the database first!)
4. After the PostgreSQL database is created, click **"New"** in your project
5. Select **"GitHub Repo"**
6. Choose your repository (reimagined-fishstick)
7. Railway will detect it as a Next.js project and configure automatically
8. Railway will automatically connect the database and set the `DATABASE_URL` environment variable

**Important:** Add the PostgreSQL database BEFORE deploying your app. The build process requires the DATABASE_URL environment variable to be available.

### 3. Configure Build Settings (Optional)

Railway should automatically detect the configuration from `railway.json`, but you can verify:

1. Click on your service (not the database)
2. Go to **"Settings"**
3. Under **"Build"**, verify:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start`

**Note:** The application includes fallback DATABASE_URL values in the build scripts to prevent build failures if the database isn't connected yet. However, the real DATABASE_URL from Railway is required for the app to actually run.

### 4. Deploy

1. Railway will automatically trigger a deployment when you connect the GitHub repo
2. Watch the build logs to ensure everything deploys successfully
3. Once deployed, Railway will provide a public URL

### 5. Run Database Migrations

The first deployment will automatically run migrations via the start command:
```bash
npx prisma migrate deploy
```

If you need to run migrations manually:
1. Go to your service settings
2. Click **"Variables"**
3. Make sure `DATABASE_URL` is set
4. Use the Railway CLI or dashboard shell to run:
```bash
npx prisma migrate deploy
```

### 6. Access Your App

1. In your Railway project dashboard, click on your service (the Next.js app)
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"** if a public URL hasn't been created yet
4. Click the URL to open your deployed application (should look like: `https://your-app.up.railway.app`)

## Troubleshooting

### Build Fails

If the build fails:
1. Check the build logs in Railway
2. Ensure all dependencies are in `package.json`
3. Verify `railway.json` configuration is correct

### Database Connection Issues

If the app can't connect to the database:
1. Verify the PostgreSQL service is running
2. Check that `DATABASE_URL` is set in your service variables
3. Ensure the database and app are in the same project

### Migration Errors

If migrations fail:
1. Check the deployment logs
2. Verify the Prisma schema is correct
3. You can manually run migrations using the Railway CLI:
```bash
railway run npx prisma migrate deploy
```

## Environment Variables

Railway automatically sets:
- `DATABASE_URL` - PostgreSQL connection string (from PostgreSQL service)
- `PORT` - The port your app should listen on

You can add additional variables in the service settings:
- `NODE_ENV=production` (optional, Railway sets this automatically)

## Updating Your App

To deploy updates:
1. Commit your changes to git
2. Push to GitHub
```bash
git add .
git commit -m "Your update message"
git push origin main
```
3. Railway will automatically detect the changes and redeploy

## Using Railway CLI (Alternative Method)

You can also deploy using the Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Deploy
railway up
```

## Database Management

### View Database with Prisma Studio

Locally:
```bash
npx prisma studio
```

On Railway (using Railway CLI):
```bash
railway run npx prisma studio
```

### Direct Database Access

1. In Railway, click on your PostgreSQL service
2. Go to **"Connect"**
3. Copy the connection URL
4. Use any PostgreSQL client (pgAdmin, DBeaver, etc.) to connect

## Cost

Railway offers:
- **Free tier**: $5 credit per month (suitable for development)
- **Hobby tier**: $5/month + usage
- PostgreSQL database included in both tiers

## Next Steps

1. Upload sample data using the [sample-data.csv](sample-data.csv) file
2. Configure custom domain (optional) in Railway settings
3. Set up monitoring and alerts
4. Consider adding authentication for production use

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/marcodetering-prog/reimagined-fishstick/issues
