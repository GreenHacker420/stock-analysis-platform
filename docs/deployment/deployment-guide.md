# Deployment Guide

This guide covers deploying the Stock Analysis Platform to various cloud providers.

## 🚀 Vercel Deployment (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

### Prerequisites
- GitHub account
- Vercel account
- All required API keys and credentials

### Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   
   Add the following environment variables in Vercel dashboard:
   
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-analysis
   
   # NextAuth Configuration
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret-key
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Google Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key
   
   # Alpha Vantage API
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
   
   # JWT Configuration
   JWT_SECRET=your-production-jwt-secret
   
   # Rate Limiting Configuration
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Cache Configuration
   CACHE_TTL_SECONDS=300
   
   # Application Configuration
   NODE_ENV=production
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-project.vercel.app`

### Step 3: Configure OAuth Redirect URLs

1. **Google OAuth Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your OAuth credentials
   - Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

### Step 4: Set Up Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to your project settings
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**
   - Update `NEXTAUTH_URL` to your custom domain
   - Update OAuth redirect URLs

## 🐳 Docker Deployment

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Set Environment Variables**
   - Add all required environment variables in Amplify console

### Using AWS ECS with Fargate

1. **Build and Push Docker Image**
   ```bash
   # Build image
   docker build -t stock-analysis-platform .
   
   # Tag for ECR
   docker tag stock-analysis-platform:latest 123456789012.dkr.ecr.region.amazonaws.com/stock-analysis-platform:latest
   
   # Push to ECR
   docker push 123456789012.dkr.ecr.region.amazonaws.com/stock-analysis-platform:latest
   ```

2. **Create ECS Task Definition**
3. **Create ECS Service**
4. **Configure Load Balancer**

## 🌐 Other Cloud Providers

### Netlify

1. **Connect Repository**
2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Add Environment Variables**
4. **Configure Redirects** (create `_redirects` file)

### Railway

1. **Connect GitHub Repository**
2. **Add Environment Variables**
3. **Deploy automatically**

### DigitalOcean App Platform

1. **Create New App**
2. **Connect Repository**
3. **Configure Environment Variables**
4. **Deploy**

## 🔧 Production Optimizations

### Performance

1. **Enable Compression**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
     poweredByHeader: false,
   }
   ```

2. **Optimize Images**
   - Use Next.js Image component
   - Configure image domains

3. **Enable Caching**
   - Configure Redis for session storage
   - Implement API response caching

### Security

1. **Security Headers**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY',
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff',
             },
             {
               key: 'Referrer-Policy',
               value: 'origin-when-cross-origin',
             },
           ],
         },
       ]
     },
   }
   ```

2. **Environment Variables**
   - Use strong secrets in production
   - Rotate API keys regularly
   - Use environment-specific configurations

### Monitoring

1. **Error Tracking**
   - Integrate Sentry or similar service
   - Set up error alerts

2. **Performance Monitoring**
   - Use Vercel Analytics
   - Monitor API response times
   - Track user interactions

3. **Logging**
   - Implement structured logging
   - Use log aggregation services

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📊 Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test OAuth authentication flow
- [ ] Verify database connectivity
- [ ] Test API endpoints
- [ ] Check error tracking setup
- [ ] Verify SSL certificate
- [ ] Test performance and load times
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategies
- [ ] Document deployment process

## 🆘 Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**
   - Verify redirect URLs in OAuth provider
   - Check NEXTAUTH_URL environment variable

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network connectivity
   - Ensure IP whitelist includes deployment platform

3. **API Key Issues**
   - Verify all API keys are valid
   - Check rate limits and quotas
   - Ensure keys have required permissions

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Getting Help

- Check deployment platform documentation
- Review application logs
- Test locally with production environment variables
- Contact support if issues persist
