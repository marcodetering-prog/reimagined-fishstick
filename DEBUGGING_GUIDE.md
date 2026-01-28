# Debugging Guide - Comprehensive Logging

This guide explains the logging system added to help diagnose Railway deployment crashes and runtime issues.

## What Was Added

### 1. **Startup Logging** ([instrumentation.ts](instrumentation.ts:1))

The application now logs detailed information when the server starts:

```
================================================================================
[STARTUP] AI KPI Dashboard - Server Starting
================================================================================
[STARTUP] Environment Information:
[STARTUP]   NODE_ENV: production
[STARTUP]   Next.js Version: 16.x.x
[STARTUP]   Node Version: v20.11.0
[STARTUP]   Platform: linux
[STARTUP]   Architecture: x64

[STARTUP] Database Configuration:
[STARTUP]   DATABASE_URL exists: true
[STARTUP]   Database Host: hostname.railway.internal
[STARTUP]   Database Port: 5432
[STARTUP]   Database Name: railway
[STARTUP]   Database User: postgres

[STARTUP] Memory Usage:
[STARTUP]   RSS: 128 MB
[STARTUP]   Heap Total: 64 MB
[STARTUP]   Heap Used: 32 MB

[STARTUP] Prisma Configuration:
[STARTUP]   Prisma Client Version: 5.22.0
================================================================================
```

### 2. **Database Connection Logging** ([lib/db.ts](lib/db.ts:1))

Logs database connection status and all queries:

```
[DB] Initializing Prisma Client...
[DB] NODE_ENV: production
[DB] DATABASE_URL exists: true
[DB] DATABASE_URL (masked): postgresql://postgre...ailway.app
[DB] ✅ Successfully connected to database
[DB] Query: SELECT * FROM "Conversation" WHERE...
[DB] Duration: 15 ms
```

### 3. **API Route Logging**

All API routes now log detailed request/response information:

#### Upload API ([app/api/upload/route.ts](app/api/upload/route.ts:1))
```
[API/Upload] POST request received
[API/Upload] Parsing form data...
[API/Upload] File received: { name: 'data.csv', size: 1024, type: 'text/csv' }
[API/Upload] File type detected: csv
[API/Upload] Parsing file...
[API/Upload] ✅ File parsed successfully: 100 records
[API/Upload] Creating upload history record...
[API/Upload] Upload record created: clxxx
[API/Upload] Grouping records by conversation...
[API/Upload] Found 25 unique conversations
[API/Upload] Processing conversations...
[API/Upload] Processing conversation 10/25
[API/Upload] All conversations processed successfully
[API/Upload] ✅ Upload completed successfully
```

#### KPIs API ([app/api/kpis/route.ts](app/api/kpis/route.ts:1))
```
[API/KPIs] GET request received
[API/KPIs] No date range specified, using all data
[API/KPIs] Calculating KPIs...
[API/KPIs] ✅ KPIs calculated: { totalConversations: 25, totalMessages: 100, activeTenants: 5 }
```

#### Conversations API ([app/api/conversations/route.ts](app/api/conversations/route.ts:1))
```
[API/Conversations] GET request received
[API/Conversations] Fetching conversations: { page: 1, limit: 10, skip: 0 }
[API/Conversations] ✅ Fetched 10 conversations out of 25
```

### 4. **Build Process Logging** ([scripts/build.js](scripts/build.js:1))

Enhanced build script with detailed progress:

```
================================================================================
[BUILD] Starting build process...
================================================================================
[BUILD] Environment: production
[BUILD] Node version: v20.11.0
[BUILD] Platform: linux
[BUILD] ✅ DATABASE_URL is set
[BUILD] Database host: hostname.railway.internal
[BUILD] Step 1/2: Generating Prisma Client...
[BUILD] Running: npx prisma generate
[BUILD] ✅ Prisma Client generated successfully
[BUILD] Step 2/2: Building Next.js application...
[BUILD] Running: npm run next:build
[BUILD] ✅ Next.js build completed in 45.23s
================================================================================
[BUILD] ✅ Build completed successfully!
================================================================================
```

### 5. **Error Handling**

All errors now log with full stack traces:

```
[API/Upload] ❌ Upload error: Database connection failed
[API/Upload] Error type: object
[API/Upload] Error stack: Error: Connection timeout...
[API/Upload] Error details: { message: "...", code: "P1001" }
```

### 6. **Unhandled Errors** ([lib/startup-logger.ts](lib/startup-logger.ts:1))

Global error handlers catch crashes:

```
[ERROR] ❌ Unhandled Rejection at: Promise { ... }
[ERROR] Reason: Database connection lost
[ERROR] Stack: ...

[ERROR] ❌ Uncaught Exception: ReferenceError: ...
[ERROR] Stack: ...
[ERROR] Application may need to restart
```

### 7. **Graceful Shutdown**

Logs when Railway stops the service:

```
[SHUTDOWN] ⚠️  SIGTERM received, starting graceful shutdown...
```

## How to View Logs on Railway

### Method 1: Railway Dashboard

1. Go to your Railway project
2. Click on your application service
3. Click on the "Deployments" tab
4. Click on the latest deployment
5. View the logs in the "Deploy Logs" and "Application Logs" sections

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs in real-time
railway logs
```

### Method 3: Railway API

```bash
# View logs via HTTP
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://backboard.railway.app/graphql/v2
```

## What to Look For When Debugging

### Application Won't Start

Look for these logs at the beginning:

1. **Environment Check**:
   ```
   [STARTUP] Environment Information:
   [STARTUP]   NODE_ENV: production
   ```

2. **Database URL**:
   ```
   [STARTUP]   DATABASE_URL exists: true  # Should be true!
   ```

3. **Database Connection**:
   ```
   [DB] ✅ Successfully connected to database  # Must see this!
   ```

   If you see:
   ```
   [DB] ❌ Failed to connect to database: ...
   ```
   The issue is with database connectivity.

### Application Crashes During Runtime

Look for:

1. **Unhandled Errors**:
   ```
   [ERROR] ❌ Unhandled Rejection
   ```

2. **Memory Issues**:
   ```
   [STARTUP] Memory Usage:
   [STARTUP]   Heap Used: 450 MB  # If close to limit, memory issue
   ```

3. **API Errors**:
   ```
   [API/Upload] ❌ Upload error: ...
   ```

### Database Issues

Look for:

1. **Connection Failures**:
   ```
   [DB] ❌ Failed to connect to database
   ```

2. **Query Errors**:
   ```
   [DB] Query: SELECT ...
   [DB] Duration: 5000 ms  # Very slow query
   ```

3. **Migration Issues** (in deploy logs):
   ```
   npx prisma migrate deploy
   Error: P3009: Failed to apply migration
   ```

## Common Issues and Solutions

### Issue: "DATABASE_URL is not set"

**Log:**
```
[STARTUP]   DATABASE_URL exists: false
[STARTUP]   ❌ DATABASE_URL is not set!
```

**Solution:**
- Ensure PostgreSQL database is added to Railway project
- Verify the database service is running
- Check that the services are linked

### Issue: "Failed to connect to database"

**Log:**
```
[DB] ❌ Failed to connect to database: P1001
```

**Solution:**
- PostgreSQL service may be down
- Network connectivity issue
- Check Railway service status

### Issue: "Migration failed"

**Log:**
```
[BUILD] ❌ Build failed!
Error: Migration failed to apply
```

**Solution:**
- Check `prisma/migrations/` directory exists
- Verify migration files are valid SQL
- Try manual migration: `railway run npx prisma migrate deploy`

### Issue: "Out of memory"

**Log:**
```
[STARTUP]   Heap Used: 480 MB
[ERROR] ❌ Uncaught Exception: JavaScript heap out of memory
```

**Solution:**
- Upgrade Railway plan for more memory
- Optimize database queries
- Check for memory leaks

## Performance Monitoring

Use these logs to monitor performance:

### Response Times
```
[DB] Duration: 150 ms  # Database query time
```

### Build Times
```
[BUILD] ✅ Next.js build completed in 45.23s
```

### API Processing
```
[API/Upload] Processing conversation 10/25  # Progress tracking
```

## Tips for Production

1. **Keep Logs Clean**: The logging is verbose for debugging. Once stable, you can reduce log levels.

2. **Monitor Patterns**: Look for recurring errors in the logs.

3. **Performance**: Watch for slow queries (>1000ms).

4. **Memory**: Monitor heap usage over time.

5. **Error Rates**: Track frequency of `[ERROR]` and `❌` markers.

## Next Steps

1. **Check Railway Logs**: After pushing this version, immediately check the Railway logs
2. **Look for Startup Logs**: Confirm you see the startup banner
3. **Verify Database Connection**: Look for the "Successfully connected" message
4. **Watch for Errors**: Any `❌` markers indicate issues
5. **Share Logs**: If problems persist, copy the relevant log sections

## Log Markers Reference

- `[STARTUP]` - Application initialization
- `[INSTRUMENTATION]` - Server instrumentation hooks
- `[DB]` - Database operations
- `[API/Upload]` - File upload endpoint
- `[API/KPIs]` - KPI calculation endpoint
- `[API/Conversations]` - Conversations endpoint
- `[BUILD]` - Build process
- `[POSTINSTALL]` - Post-installation scripts
- `[ERROR]` - Global error handler
- `[SHUTDOWN]` - Graceful shutdown
- `✅` - Success indicator
- `❌` - Error indicator
- `⚠️` - Warning indicator

---

**Last Updated**: 2026-01-28
**Commit**: f2a3885
