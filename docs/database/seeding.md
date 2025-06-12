# 🌱 User Database Seeding Guide

## 📋 Overview

This guide explains how to seed the mock users into your database for demo login functionality. The system provides **12 comprehensive demo users** (5 analysts + 7 investors) with realistic profiles and secure authentication.

## 🚀 Quick Start

### Method 1: Command Line (Recommended)

```bash
# Install dependencies (if not already done)
npm install

# Seed all users into database
npm run db:seed

# Show demo login credentials
npm run db:demo

# Verify users can authenticate
npm run db:verify

# Clear all users (use with caution!)
npm run db:clear
```

### Method 2: Web Interface

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the admin page:**
   ```
   http://localhost:3000/admin/seed-users
   ```

3. **Sign in with any existing account** (or create one)

4. **Click "Seed Users"** to populate the database

5. **Click "Show Credentials"** to see demo login details

## 👥 Demo Users Created

### 🔍 **5 Analysts** (Financial Professionals)

| Name | Email | Password | Risk Tolerance | Specialization |
|------|-------|----------|----------------|----------------|
| Sarah Johnson | sarah.johnson@stockanalyzer.com | `analyst123!` | Medium | Growth & Income |
| Michael Chen | michael.chen@stockanalyzer.com | `analyst456!` | High | Growth & Speculation |
| Emily Rodriguez | emily.rodriguez@stockanalyzer.com | `analyst789!` | Low | Income & Preservation |
| David Kim | david.kim@stockanalyzer.com | `analyst101!` | Medium | Growth & Diversification |
| Lisa Thompson | lisa.thompson@stockanalyzer.com | `analyst202!` | High | Growth & Technology |

### 💼 **7 Investors** (Individual Clients)

| Name | Email | Password | Risk Tolerance | Investment Goals |
|------|-------|----------|----------------|------------------|
| John Doe | john.doe@email.com | `investor123!` | Medium | Retirement & Growth |
| Jane Smith | jane.smith@email.com | `investor456!` | Low | Income & Preservation |
| Robert Wilson | robert.wilson@email.com | `investor789!` | High | Growth & Speculation |
| Maria Garcia | maria.garcia@email.com | `investor101!` | Medium | Education & Growth |
| James Brown | james.brown@email.com | `investor202!` | Low | Retirement & Income |
| Susan Davis | susan.davis@email.com | `investor303!` | High | Growth & Technology |
| Thomas Anderson | thomas.anderson@email.com | `investor404!` | Medium | Diversification & Growth |

## 🔧 Environment Setup

### Required Environment Variables

Make sure your `.env.local` file contains:

```bash
# Database Connection
DATABASE_URL=mongodb://localhost:27017/stock-analysis-platform
# OR for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/stock-analysis-platform

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📊 Available Commands

### NPM Scripts

```bash
# Seed users into database
npm run db:seed

# Clear all users from database
npm run db:clear

# Verify seeded users can authenticate
npm run db:verify

# Show demo login credentials
npm run db:demo

# Run seeding script directly
npm run seed:users seed

# Run with custom environment file
npm run seed:users:dev seed
```

### Direct Script Usage

```bash
# Using tsx directly
npx tsx src/scripts/seedUsers.ts seed
npx tsx src/scripts/seedUsers.ts clear
npx tsx src/scripts/seedUsers.ts verify
npx tsx src/scripts/seedUsers.ts demo
```

## 🔐 Security Features

### Password Security
- **Bcrypt Hashing**: All passwords hashed with 12 salt rounds
- **Secure Storage**: Original passwords never stored in database
- **Validation**: Passwords meet security requirements (6+ chars, mixed case, numbers)

### Authentication Support
- **Email/Password**: Ready for credentials authentication
- **Google OAuth**: Profile images and email verification
- **Role-based Access**: Analysts can manage investor portfolios

## 🧪 Testing Authentication

### Test Login Process

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Navigate to sign-in page:**
   ```
   http://localhost:3000/auth/signin
   ```

3. **Test with demo credentials:**
   ```
   Email: john.doe@email.com
   Password: investor123!
   ```

4. **Verify role-based access:**
   - Investors see their portfolios
   - Analysts see client portfolios

### API Testing

```bash
# Test authentication API
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@email.com","password":"investor123!"}'
```

## 🛠️ Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
Error: Failed to connect to database
```
**Solution:** Check your `DATABASE_URL` in `.env.local`

**2. Permission Denied**
```bash
Error: Unauthorized - Please sign in
```
**Solution:** Sign in to access the admin seeding page

**3. Users Already Exist**
```bash
Warning: User already exists, updating...
```
**Solution:** This is normal - existing users are updated, not duplicated

**4. Password Hash Error**
```bash
Error: Failed to hash password
```
**Solution:** Ensure bcryptjs is installed: `npm install bcryptjs`

### Verification Steps

```bash
# 1. Check database connection
npm run db:verify

# 2. Verify user count
# Should show 12 users (5 analysts + 7 investors)

# 3. Test authentication
# Try logging in with demo credentials

# 4. Check user roles
# Verify analysts can see client portfolios
```

## 📈 Production Considerations

### Before Production Deployment

1. **Remove Demo Users:**
   ```bash
   npm run db:clear
   ```

2. **Disable Admin Seeding:**
   - Remove `/admin/seed-users` page
   - Remove `/api/admin/seed-users` endpoint

3. **Secure Environment:**
   - Use strong `NEXTAUTH_SECRET`
   - Secure database credentials
   - Enable proper authentication

### Data Relationships

The seeded users are connected to:
- **Portfolios**: 5 portfolios assigned to investors
- **Reports**: 4 analysis reports linking analysts to investors
- **Authentication**: All users ready for immediate login

## 🎯 Success Verification

After seeding, you should have:

✅ **12 users in database** (5 analysts + 7 investors)  
✅ **All passwords properly hashed** with bcrypt  
✅ **Role-based access working** (analyst/investor)  
✅ **Authentication functional** (email/password + Google OAuth)  
✅ **Realistic user profiles** with preferences and goals  
✅ **Connected portfolio data** for testing workflows  

## 🔄 Updating Mock Data

To modify the mock users:

1. **Edit the source file:**
   ```
   src/data/mockUsers.ts
   ```

2. **Re-run seeding:**
   ```bash
   npm run db:seed
   ```

3. **Verify changes:**
   ```bash
   npm run db:verify
   ```

## 📞 Support

If you encounter issues:

1. **Check the logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Ensure database is running** and accessible
4. **Test with a single user** before seeding all

---

**🎉 Your demo users are now ready for testing the complete authentication and role-based access system!**
