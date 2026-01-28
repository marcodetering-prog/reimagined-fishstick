# Railway Deployment Checklist

## Pre-Deployment Verification

### Code Repository
- [x] Code pushed to GitHub main branch
- [x] Unnecessary files removed (Netlify configs, etc.)
- [x] `.gitignore` properly configured
- [x] All source files present (`app/`, `components/`, `lib/`, `prisma/`)

### Configuration Files
- [x] `package.json` with correct scripts and dependencies
  - Build script: `node scripts/build.js`
  - Start script: `npm run start`
  - Node.js engine: `>=20.11.0`
- [x] `railway.json` configured with:
  - Build command: `npm install && npm run build`
  - Start command: `npx prisma migrate deploy && npm run start`
- [x] `.env.example` file present
- [x] `prisma/schema.prisma` with database models
- [x] Build scripts with DATABASE_URL fallback
  - `scripts/build.js`
  - `scripts/postinstall.js`

### Application Files
- [x] Next.js configuration (`next.config.js`)
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind configuration (`tailwind.config.ts`)
- [x] Node version file (`.nvmrc`)

## Railway Deployment Steps

### 1. Create Railway Account
- [ ] Sign up at https://railway.app
- [ ] Verify email address
- [ ] Connect GitHub account

### 2. Create New Project
- [ ] Click "New Project" in Railway dashboard
- [ ] Select "Deploy from GitHub repo"
- [ ] Authorize Railway to access GitHub
- [ ] Select repository: `reimagined-fishstick`

### 3. Add PostgreSQL Database
**IMPORTANT: Do this BEFORE deploying the app**
- [ ] In Railway project, click "New"
- [ ] Select "Database" → "Add PostgreSQL"
- [ ] Wait for PostgreSQL to provision
- [ ] Verify `DATABASE_URL` environment variable is automatically created

### 4. Configure Application Service
Railway should auto-detect configuration from `railway.json`, but verify:
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npx prisma migrate deploy && npm run start`
- [ ] Environment: Node.js detected
- [ ] PostgreSQL linked to application service

### 5. Deploy
- [ ] Railway automatically starts deployment
- [ ] Monitor build logs for errors
- [ ] Wait for build to complete (typically 2-5 minutes)
- [ ] Check deployment logs for any errors

### 6. Generate Public Domain
- [ ] Click on your application service
- [ ] Go to "Settings" → "Networking"
- [ ] Click "Generate Domain"
- [ ] Copy the generated URL (e.g., `https://your-app.up.railway.app`)

### 7. Verify Deployment
- [ ] Visit the generated Railway URL
- [ ] Check that the app loads without errors
- [ ] Test the upload functionality
- [ ] Upload sample data from `sample-data.csv`
- [ ] Verify KPIs are calculated and displayed
- [ ] Check browser console for JavaScript errors

### 8. Database Verification
- [ ] Migrations ran successfully (check deploy logs)
- [ ] Tables created in PostgreSQL
- [ ] Data persists after upload

## Post-Deployment Configuration

### Optional: Custom Domain
- [ ] Go to "Settings" → "Networking"
- [ ] Click "Custom Domain"
- [ ] Add your domain and follow DNS instructions

### Optional: Environment Variables
If you need additional configuration:
- [ ] Go to "Variables" tab in Railway dashboard
- [ ] Add any custom environment variables
- [ ] Redeploy if needed

### Optional: Monitoring
- [ ] Set up Railway metrics monitoring
- [ ] Configure alerts for deployment failures
- [ ] Enable Railway Analytics (if available)

## Troubleshooting Checklist

### Build Fails
- [ ] Check build logs in Railway dashboard
- [ ] Verify all dependencies are in `package.json`
- [ ] Ensure Node.js version matches (20.11.0+)
- [ ] Check that `railway.json` is correctly formatted
- [ ] Verify build scripts are executable

### Database Connection Issues
- [ ] Verify PostgreSQL service is running
- [ ] Check that `DATABASE_URL` environment variable is set
- [ ] Ensure database and app are in the same Railway project
- [ ] Check database logs for connection errors

### Application Crashes
- [ ] Check application logs in Railway
- [ ] Verify all required environment variables are set
- [ ] Check for memory or CPU limits
- [ ] Review Prisma migration logs

### Migration Errors
- [ ] Check that `DATABASE_URL` is available during deployment
- [ ] Verify Prisma schema is valid
- [ ] Check migration logs in deploy output
- [ ] Ensure Prisma Client is generated correctly

## Environment Variables Reference

### Automatically Set by Railway
- `DATABASE_URL` - PostgreSQL connection string (from linked database)
- `PORT` - Port number for the application
- `NODE_ENV` - Set to "production" automatically

### Optional Variables
- None required for basic deployment
- Add custom variables as needed for your use case

## Important Notes

1. **Database First**: Always provision PostgreSQL database BEFORE deploying the application
2. **Build Scripts**: The application includes fallback DATABASE_URL values in build scripts to prevent build failures
3. **Migrations**: Migrations run automatically on each deployment via the start command
4. **File Uploads**: The application is configured for up to 10MB file uploads
5. **Sample Data**: Use `sample-data.csv` for testing after deployment

## Success Criteria

Your deployment is successful when:
- [x] Application builds without errors
- [x] Application starts and responds to HTTP requests
- [x] Database migrations complete successfully
- [x] Public URL is accessible
- [ ] File upload works correctly
- [ ] Dashboard displays KPIs after data upload
- [ ] No console errors in browser
- [ ] Data persists across page refreshes

## Next Steps After Deployment

1. Share the Railway URL with your team
2. Upload actual chat history data
3. Monitor application performance
4. Set up regular database backups (Railway's built-in backup feature)
5. Consider adding authentication for production use
6. Set up custom domain if needed
7. Monitor Railway usage and costs

## Support Resources

- Railway Documentation: https://docs.railway.app
- Railway Community: https://discord.gg/railway
- Project Documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)
- GitHub Repository: https://github.com/marcodetering-prog/reimagined-fishstick

---

**Deployment Date**: _________________

**Railway Project URL**: _________________

**Public Application URL**: _________________

**Deployed By**: _________________

**Notes**:
