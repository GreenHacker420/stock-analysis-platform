/**
 * Environment variable validation utility
 */

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'MONGODB_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    } else if (value.includes('your-') || value.includes('example')) {
      warnings.push(`Environment variable ${varName} appears to be a placeholder`);
    }
  }

  // Validate NEXTAUTH_URL format
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    try {
      const url = new URL(nextAuthUrl);
      if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
        warnings.push('NEXTAUTH_URL should use HTTPS in production');
      }
      if (process.env.NODE_ENV === 'production' && url.hostname === 'localhost') {
        errors.push('NEXTAUTH_URL cannot be localhost in production');
      }
    } catch {
      errors.push('NEXTAUTH_URL is not a valid URL');
    }
  }

  // Validate MongoDB URI
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.startsWith('mongodb')) {
    errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  // Check optional but recommended variables
  const optionalVars = [
    'GEMINI_API_KEY',
    'EODHD_API_KEY',
  ];

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '' || value.includes('your-')) {
      warnings.push(`Optional environment variable ${varName} is not configured`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logEnvironmentStatus(): void {
  const validation = validateEnvironmentVariables();
  
  console.log('\n🔧 Environment Variables Status:');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
  
  if (validation.isValid) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.log('❌ Environment validation failed');
    validation.errors.forEach(error => console.log(`  ❌ ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
  }
  
  console.log('');
}
