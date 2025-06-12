# Security Implementation Guide

Comprehensive security implementation and best practices for the Stock Analysis Platform.

## 🔐 Security Overview

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal access rights for users and systems
- **Zero Trust**: Never trust, always verify
- **Security by Design**: Security built into every component
- **Continuous Monitoring**: Real-time security monitoring and alerting

### Security Domains
- **Authentication & Authorization**: User identity and access management
- **Data Protection**: Encryption and data security
- **API Security**: Secure API design and implementation
- **Infrastructure Security**: Platform and deployment security
- **Application Security**: Code-level security measures

## 🔑 Authentication & Authorization

### 1. Multi-Provider Authentication

#### NextAuth.js Configuration
```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await User.findOne({ 
          email: credentials.email.toLowerCase() 
        }).select('+password');

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password, 
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
};
```

#### Password Security
```typescript
// lib/passwordSecurity.ts
import bcrypt from 'bcryptjs';
import zxcvbn from 'zxcvbn';

export class PasswordSecurity {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_STRENGTH = 3; // 0-4 scale

  static async hashPassword(password: string): Promise<string> {
    this.validatePassword(password);
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const strength = zxcvbn(password);
    if (strength.score < this.MIN_STRENGTH) {
      throw new Error(`Password is too weak: ${strength.feedback.warning}`);
    }

    // Additional complexity requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
    }
  }
}
```

### 2. Role-Based Access Control (RBAC)

#### Authorization Middleware
```typescript
// lib/authorization.ts
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: 'analyst' | 'investor';
  };
}

export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || !token.userId) {
    throw new Error('Authentication required');
  }

  return {
    user: {
      id: token.userId as string,
      email: token.email as string,
      role: token.role as 'analyst' | 'investor'
    }
  };
}

export async function requireRole(req: NextRequest, allowedRoles: string[]): Promise<AuthContext> {
  const auth = await requireAuth(req);
  
  if (!allowedRoles.includes(auth.user.role)) {
    throw new Error('Insufficient permissions');
  }

  return auth;
}

export async function requireOwnership(
  req: NextRequest, 
  resourceUserId: string
): Promise<AuthContext> {
  const auth = await requireAuth(req);
  
  // Analysts can access any resource, investors only their own
  if (auth.user.role === 'investor' && auth.user.id !== resourceUserId) {
    throw new Error('Access denied: resource ownership required');
  }

  return auth;
}
```

#### API Route Protection
```typescript
// Example protected API route
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    
    // Get user's portfolios
    const portfolios = await Portfolio.find({ 
      investorId: auth.user.id 
    });

    return NextResponse.json({ success: true, portfolios });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

## 🛡️ Data Protection

### 1. Encryption

#### Data Encryption at Rest
```typescript
// lib/encryption.ts
import crypto from 'crypto';

export class DataEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY = process.env.ENCRYPTION_KEY!;

  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ALGORITHM, this.KEY);
    cipher.setAAD(Buffer.from('additional-data'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.ALGORITHM, this.KEY);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

#### Sensitive Data Handling
```typescript
// models/User.ts - Sensitive field encryption
import { DataEncryption } from '@/lib/encryption';

const UserSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  // Password is hashed, not encrypted
  password: { type: String, select: false },
  // Sensitive personal data encrypted
  personalInfo: {
    phone: {
      type: String,
      set: (value: string) => value ? DataEncryption.encrypt(value) : undefined,
      get: (value: any) => value ? DataEncryption.decrypt(value) : undefined
    }
  }
});
```

### 2. Data Validation and Sanitization

#### Input Validation with Zod
```typescript
// lib/validation.ts
import { z } from 'zod';

export const CreatePortfolioSchema = z.object({
  name: z.string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters in portfolio name'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  cash: z.number()
    .min(0, 'Cash amount must be positive')
    .max(10000000, 'Cash amount too large')
});

export const AddHoldingSchema = z.object({
  symbol: z.string()
    .regex(/^[A-Z]+\.(NSE|BSE)$/, 'Invalid stock symbol format'),
  shares: z.number()
    .int('Shares must be a whole number')
    .min(1, 'Must have at least 1 share')
    .max(1000000, 'Too many shares'),
  averageCost: z.number()
    .min(0.01, 'Average cost must be positive')
    .max(100000, 'Average cost too high')
});

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}
```

#### SQL Injection Prevention
```typescript
// MongoDB with Mongoose provides built-in protection
// Additional sanitization for user inputs
import mongoSanitize from 'express-mongo-sanitize';

export function sanitizeInput(input: any): any {
  return mongoSanitize.sanitize(input, {
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized input: ${key}`);
    }
  });
}
```

## 🔒 API Security

### 1. Rate Limiting

#### Advanced Rate Limiting
```typescript
// lib/rateLimiting.ts
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static async checkLimit(
    req: NextRequest, 
    config: RateLimitConfig,
    identifier?: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = identifier || this.getClientIdentifier(req);
    const now = Date.now();
    
    const record = this.requests.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset window
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      };
    }
    
    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }
    
    record.count++;
    
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  private static getClientIdentifier(req: NextRequest): string {
    // Use IP address and user agent for identification
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    return `${ip}:${userAgent}`;
  }
}

// Rate limiting configurations
export const RATE_LIMITS = {
  general: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 per 15 minutes
  auth: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
  aiAnalysis: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour
  stockData: { windowMs: 60 * 60 * 1000, maxRequests: 200 } // 200 per hour
};
```

### 2. CORS Configuration

#### Secure CORS Setup
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CORS handling
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': getAllowedOrigin(request),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS header for HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

function getAllowedOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://stock.greenhacker.tech',
    'https://stock-analysis-staging.vercel.app'
  ];
  
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000');
  }
  
  return allowedOrigins.includes(origin || '') ? origin! : allowedOrigins[0];
}
```

## 🔍 Security Monitoring

### 1. Security Event Logging

#### Security Logger
```typescript
// lib/securityLogger.ts
export class SecurityLogger {
  static logAuthAttempt(email: string, success: boolean, ip: string, userAgent: string) {
    const event = {
      type: 'auth_attempt',
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    };
    
    if (!success) {
      console.warn('Failed authentication attempt:', event);
    }
    
    this.sendToSecurityService(event);
  }
  
  static logSuspiciousActivity(userId: string, activity: string, metadata: any) {
    const event = {
      type: 'suspicious_activity',
      userId,
      activity,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    console.warn('Suspicious activity detected:', event);
    this.sendToSecurityService(event);
  }
  
  static logDataAccess(userId: string, resource: string, action: string) {
    const event = {
      type: 'data_access',
      userId,
      resource,
      action,
      timestamp: new Date().toISOString()
    };
    
    this.sendToSecurityService(event);
  }
  
  private static sendToSecurityService(event: any) {
    // Send to security monitoring service
    // e.g., SIEM, security analytics platform
  }
}
```

### 2. Intrusion Detection

#### Anomaly Detection
```typescript
// lib/anomalyDetection.ts
export class AnomalyDetector {
  static detectUnusualLoginPattern(userId: string, ip: string, userAgent: string) {
    // Check for unusual login patterns
    const recentLogins = this.getRecentLogins(userId);
    
    // Geographic anomaly
    if (this.isGeographicAnomaly(recentLogins, ip)) {
      SecurityLogger.logSuspiciousActivity(userId, 'geographic_anomaly', { ip });
    }
    
    // Device anomaly
    if (this.isDeviceAnomaly(recentLogins, userAgent)) {
      SecurityLogger.logSuspiciousActivity(userId, 'device_anomaly', { userAgent });
    }
    
    // Time-based anomaly
    if (this.isTimeAnomaly(recentLogins)) {
      SecurityLogger.logSuspiciousActivity(userId, 'time_anomaly', {});
    }
  }
  
  static detectAPIAbuse(ip: string, endpoint: string, requestCount: number) {
    const threshold = this.getThresholdForEndpoint(endpoint);
    
    if (requestCount > threshold) {
      SecurityLogger.logSuspiciousActivity('', 'api_abuse', {
        ip,
        endpoint,
        requestCount,
        threshold
      });
    }
  }
  
  private static getRecentLogins(userId: string) {
    // Implement recent login history retrieval
    return [];
  }
  
  private static isGeographicAnomaly(recentLogins: any[], ip: string): boolean {
    // Implement geographic anomaly detection
    return false;
  }
  
  private static isDeviceAnomaly(recentLogins: any[], userAgent: string): boolean {
    // Implement device anomaly detection
    return false;
  }
  
  private static isTimeAnomaly(recentLogins: any[]): boolean {
    // Implement time-based anomaly detection
    return false;
  }
  
  private static getThresholdForEndpoint(endpoint: string): number {
    const thresholds: Record<string, number> = {
      '/api/auth/signin': 10,
      '/api/portfolios': 100,
      '/api/analysis/generate': 20
    };
    
    return thresholds[endpoint] || 50;
  }
}
```

## 🔧 Security Best Practices

### 1. Secure Development Practices
- **Code Reviews**: All code changes reviewed for security issues
- **Static Analysis**: Automated security scanning in CI/CD
- **Dependency Scanning**: Regular vulnerability scanning of dependencies
- **Secrets Management**: No hardcoded secrets, use environment variables
- **Principle of Least Privilege**: Minimal permissions for all components

### 2. Regular Security Assessments
- **Penetration Testing**: Regular third-party security assessments
- **Vulnerability Scanning**: Automated vulnerability scanning
- **Security Audits**: Regular security architecture reviews
- **Compliance Checks**: Regular compliance verification

### 3. Incident Response Plan
- **Detection**: Automated security monitoring and alerting
- **Response**: Defined incident response procedures
- **Recovery**: Backup and recovery procedures
- **Lessons Learned**: Post-incident analysis and improvements

---

This comprehensive security implementation ensures the Stock Analysis Platform maintains the highest security standards while protecting user data and maintaining system integrity.
