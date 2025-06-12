# Installation Guide

This guide will walk you through the complete installation process for the Stock Analysis Platform.

## 📋 Prerequisites

Before installing the Stock Analysis Platform, ensure you have the following:

### System Requirements
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Required Services
- **MongoDB Atlas Account**: For database hosting
- **Google Cloud Console Project**: For OAuth authentication
- **Google Gemini API Key**: For AI-powered analysis
- **EODHD API Key**: For Indian stock market data (optional)

## 🚀 Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stock-analysis-platform.git
cd stock-analysis-platform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 15 with App Router
- React 18 with TypeScript
- MongoDB and Mongoose
- NextAuth.js for authentication
- Tailwind CSS for styling
- Three.js for 3D visualizations
- Chart.js for data visualization

### 3. Environment Configuration

#### Create Environment File
```bash
cp .env.example .env.local
```

#### Configure Environment Variables

Edit `.env.local` with your specific configuration:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-analysis

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Stock Data APIs (Optional)
EODHD_API_KEY=your-eodhd-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
```

### 4. Database Setup

The application will automatically:
- Connect to MongoDB Atlas
- Create necessary collections
- Set up indexes for optimal performance
- Seed demo data on first run

No manual database setup is required.

### 5. API Keys Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to your `.env.local`

#### Google Gemini API Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your environment variables

#### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Get the connection string from "Connect" → "Connect your application"
5. Replace `<password>` with your database user password
6. Add your IP address to the IP whitelist

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 7. Verify Installation

#### Check Database Connection
- The application will automatically seed demo data on first run
- Check the console for successful database connection messages

#### Test Authentication
- Try logging in with Google OAuth
- Use demo credentials:
  - **Analyst**: `sarah.johnson@stockanalyzer.com` / `analyst123!`
  - **Investor**: `john.doe@email.com` / `investor123!`

#### Test Stock Data
- Navigate to the dashboard
- Verify that stock data is loading (may use mock data initially)

## 🔧 Development Tools Setup

### ESLint Configuration
The project includes ESLint configuration for code quality:

```bash
npm run lint
```

### TypeScript Configuration
TypeScript is pre-configured with strict mode enabled:

```bash
npm run type-check
```

### Testing Setup
Run the test suite to verify everything is working:

```bash
npm test
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

#### MongoDB Connection Issues
- Verify your connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

#### Google OAuth Issues
- Verify redirect URIs match exactly
- Check that Google+ API is enabled
- Ensure OAuth consent screen is configured

#### Environment Variables Not Loading
- Verify `.env.local` file exists in root directory
- Check for typos in variable names
- Restart the development server after changes

### Getting Help

If you encounter issues:
1. Check the [Troubleshooting Guide](../maintenance/troubleshooting.md)
2. Review the console logs for error messages
3. Verify all environment variables are set correctly
4. Create an issue in the GitHub repository

## ✅ Next Steps

After successful installation:
1. Review the [Configuration Guide](configuration.md)
2. Follow the [Quick Start Guide](quick-start.md)
3. Explore the [API Documentation](../api/api-documentation.md)
4. Check out the [Features Overview](../features/)

---

*Installation complete! You're ready to start using the Stock Analysis Platform.*
