# Monitoring and Logging Guide

Comprehensive monitoring and logging strategy for the Stock Analysis Platform to ensure optimal performance, reliability, and security.

## 📊 Monitoring Overview

### Monitoring Strategy
- **Application Performance Monitoring (APM)**: Track application health and performance
- **Infrastructure Monitoring**: Monitor server resources and availability
- **User Experience Monitoring**: Track real user interactions and performance
- **Business Metrics Monitoring**: Monitor key business indicators
- **Security Monitoring**: Track security events and threats

### Monitoring Stack
- **Platform**: Vercel Analytics (built-in)
- **Real User Monitoring**: Web Vitals tracking
- **Error Tracking**: Custom error boundaries and logging
- **Database Monitoring**: MongoDB Atlas monitoring
- **API Monitoring**: Custom API performance tracking

## 🔍 Application Monitoring

### 1. Health Check Endpoints

#### Application Health Check
```typescript
// app/api/health/route.ts
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    await connectDB();
    const dbStatus = 'connected';
    
    // Check external APIs
    const apiChecks = await Promise.allSettled([
      checkGeminiAPI(),
      checkEODHDAPI(),
      checkGoogleOAuth()
    ]);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      database: {
        status: dbStatus,
        responseTime: Date.now() - startTime
      },
      externalServices: {
        gemini: apiChecks[0].status === 'fulfilled' ? 'available' : 'unavailable',
        eodhd: apiChecks[1].status === 'fulfilled' ? 'available' : 'unavailable',
        googleOAuth: apiChecks[2].status === 'fulfilled' ? 'available' : 'unavailable'
      },
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024
      }
    };
    
    return Response.json(health);
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }, { status: 503 });
  }
}

async function checkGeminiAPI() {
  // Implement Gemini API health check
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
    headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` }
  });
  return response.ok;
}

async function checkEODHDAPI() {
  // Implement EODHD API health check
  const response = await fetch(`https://eodhd.com/api/real-time/AAPL.US?api_token=${process.env.EODHD_API_KEY}`);
  return response.ok;
}

async function checkGoogleOAuth() {
  // Check Google OAuth configuration
  const response = await fetch('https://accounts.google.com/.well-known/openid_configuration');
  return response.ok;
}
```

#### Detailed System Metrics
```typescript
// app/api/metrics/route.ts
export async function GET() {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    application: {
      activeConnections: await getActiveConnections(),
      requestsPerMinute: await getRequestsPerMinute(),
      errorRate: await getErrorRate(),
      averageResponseTime: await getAverageResponseTime()
    },
    database: {
      connectionCount: await getDBConnectionCount(),
      queryPerformance: await getQueryPerformance(),
      collectionStats: await getCollectionStats()
    }
  };
  
  return Response.json(metrics);
}
```

### 2. Performance Monitoring

#### API Performance Tracking
```typescript
// lib/monitoring.ts
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();
  
  static trackAPICall(endpoint: string, duration: number, success: boolean) {
    const key = `${endpoint}_${success ? 'success' : 'error'}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const values = this.metrics.get(key)!;
    values.push(duration);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
    
    // Log slow requests
    if (duration > 5000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }
  }
  
  static getMetrics(endpoint: string) {
    const successKey = `${endpoint}_success`;
    const errorKey = `${endpoint}_error`;
    
    const successTimes = this.metrics.get(successKey) || [];
    const errorTimes = this.metrics.get(errorKey) || [];
    
    return {
      successCount: successTimes.length,
      errorCount: errorTimes.length,
      averageResponseTime: successTimes.length > 0 
        ? successTimes.reduce((a, b) => a + b, 0) / successTimes.length 
        : 0,
      p95ResponseTime: this.calculatePercentile(successTimes, 95),
      errorRate: (errorTimes.length / (successTimes.length + errorTimes.length)) * 100
    };
  }
  
  private static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

// Middleware to track API performance
export function withPerformanceTracking(handler: Function, endpoint: string) {
  return async function(req: any, res: any) {
    const startTime = Date.now();
    let success = true;
    
    try {
      const result = await handler(req, res);
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackAPICall(endpoint, duration, success);
    }
  };
}
```

#### Frontend Performance Monitoring
```typescript
// lib/clientMonitoring.ts
export class ClientMonitor {
  static trackPageLoad(pageName: string) {
    if (typeof window === 'undefined') return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      page: pageName,
      timestamp: Date.now(),
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint()
    };
    
    this.sendMetrics('page_load', metrics);
  }
  
  static trackUserInteraction(action: string, element: string, duration?: number) {
    const metrics = {
      action,
      element,
      duration,
      timestamp: Date.now(),
      page: window.location.pathname
    };
    
    this.sendMetrics('user_interaction', metrics);
  }
  
  static trackError(error: Error, context?: string) {
    const metrics = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };
    
    this.sendMetrics('client_error', metrics);
  }
  
  private static getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }
  
  private static getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }
  
  private static getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }
  
  private static sendMetrics(type: string, data: any) {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      }).catch(console.error);
    }
  }
}
```

## 📝 Logging Strategy

### 1. Structured Logging

#### Logger Implementation
```typescript
// lib/logger.ts
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  userId?: string;
  requestId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private static currentLevel = process.env.NODE_ENV === 'production' 
    ? LogLevel.INFO 
    : LogLevel.DEBUG;
  
  static error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, { error: this.serializeError(error), ...metadata });
  }
  
  static warn(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, metadata);
  }
  
  static info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, metadata);
  }
  
  static debug(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, metadata);
  }
  
  private static log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    if (level > this.currentLevel) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };
    
    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      // Structured JSON for production
      console.log(JSON.stringify(entry));
    }
    
    // Send to external logging service if configured
    this.sendToExternalService(entry);
  }
  
  private static serializeError(error?: Error) {
    if (!error) return undefined;
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  
  private static sendToExternalService(entry: LogEntry) {
    // Implement external logging service integration
    // e.g., Datadog, New Relic, CloudWatch, etc.
  }
}
```

#### Request Logging Middleware
```typescript
// lib/requestLogger.ts
import { NextRequest } from 'next/server';
import { Logger } from './logger';

export function logRequest(req: NextRequest, startTime: number, statusCode: number, error?: Error) {
  const duration = Date.now() - startTime;
  const metadata = {
    method: req.method,
    url: req.url,
    statusCode,
    duration,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    requestId: req.headers.get('x-request-id')
  };
  
  if (error) {
    Logger.error(`Request failed: ${req.method} ${req.url}`, error, metadata);
  } else if (statusCode >= 400) {
    Logger.warn(`Request warning: ${req.method} ${req.url}`, metadata);
  } else {
    Logger.info(`Request completed: ${req.method} ${req.url}`, metadata);
  }
}
```

### 2. Error Tracking

#### Global Error Handler
```typescript
// lib/errorHandler.ts
export class ErrorHandler {
  static handleAPIError(error: Error, context: string, metadata?: Record<string, any>) {
    Logger.error(`API Error in ${context}`, error, {
      context,
      ...metadata
    });
    
    // Send to error tracking service
    this.reportError(error, context, metadata);
    
    return {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : error.message,
      code: this.getErrorCode(error)
    };
  }
  
  static handleDatabaseError(error: Error, operation: string, collection?: string) {
    Logger.error(`Database Error during ${operation}`, error, {
      operation,
      collection
    });
    
    return {
      success: false,
      error: 'Database operation failed',
      code: 'DB_ERROR'
    };
  }
  
  static handleExternalAPIError(error: Error, service: string, endpoint?: string) {
    Logger.error(`External API Error from ${service}`, error, {
      service,
      endpoint
    });
    
    return {
      success: false,
      error: `${service} service unavailable`,
      code: 'EXTERNAL_API_ERROR'
    };
  }
  
  private static getErrorCode(error: Error): string {
    if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
    if (error.name === 'CastError') return 'INVALID_ID';
    if (error.message.includes('duplicate key')) return 'DUPLICATE_ENTRY';
    return 'INTERNAL_ERROR';
  }
  
  private static reportError(error: Error, context: string, metadata?: Record<string, any>) {
    // Implement error reporting service integration
    // e.g., Sentry, Bugsnag, Rollbar, etc.
  }
}
```

#### React Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { Logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 📈 Business Metrics Monitoring

### 1. Key Performance Indicators

#### User Engagement Metrics
```typescript
// lib/analytics.ts
export class Analytics {
  static trackUserRegistration(userId: string, method: 'google' | 'credentials') {
    this.track('user_registration', {
      userId,
      method,
      timestamp: Date.now()
    });
  }
  
  static trackPortfolioCreation(userId: string, portfolioId: string) {
    this.track('portfolio_creation', {
      userId,
      portfolioId,
      timestamp: Date.now()
    });
  }
  
  static trackAIAnalysisGeneration(userId: string, portfolioId: string, duration: number) {
    this.track('ai_analysis_generation', {
      userId,
      portfolioId,
      duration,
      timestamp: Date.now()
    });
  }
  
  static trackFeatureUsage(userId: string, feature: string, metadata?: Record<string, any>) {
    this.track('feature_usage', {
      userId,
      feature,
      ...metadata,
      timestamp: Date.now()
    });
  }
  
  private static track(event: string, data: Record<string, any>) {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Implement analytics service integration
      console.log(`Analytics: ${event}`, data);
    }
  }
}
```

### 2. Custom Dashboards

#### Metrics Dashboard API
```typescript
// app/api/admin/metrics/route.ts
export async function GET() {
  const metrics = {
    users: {
      total: await User.countDocuments(),
      active: await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      newThisMonth: await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    },
    portfolios: {
      total: await Portfolio.countDocuments(),
      active: await Portfolio.countDocuments({ isActive: true }),
      averageValue: await Portfolio.aggregate([
        { $group: { _id: null, avgValue: { $avg: '$totalValue' } } }
      ])
    },
    reports: {
      total: await AnalysisReport.countDocuments(),
      thisWeek: await AnalysisReport.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
    },
    performance: PerformanceMonitor.getMetrics('/api/analysis/generate')
  };
  
  return Response.json(metrics);
}
```

## 🚨 Alerting and Notifications

### 1. Alert Configuration

#### Alert Rules
```typescript
// lib/alerting.ts
export interface AlertRule {
  name: string;
  condition: (metrics: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
}

export const alertRules: AlertRule[] = [
  {
    name: 'High Error Rate',
    condition: (metrics) => metrics.errorRate > 5,
    severity: 'high',
    cooldown: 15
  },
  {
    name: 'Slow API Response',
    condition: (metrics) => metrics.averageResponseTime > 2000,
    severity: 'medium',
    cooldown: 10
  },
  {
    name: 'Database Connection Issues',
    condition: (metrics) => metrics.database.status !== 'connected',
    severity: 'critical',
    cooldown: 5
  },
  {
    name: 'High Memory Usage',
    condition: (metrics) => metrics.memory.used / metrics.memory.total > 0.9,
    severity: 'high',
    cooldown: 10
  }
];

export class AlertManager {
  private static lastAlerts = new Map<string, number>();
  
  static checkAlerts(metrics: any) {
    alertRules.forEach(rule => {
      if (rule.condition(metrics)) {
        this.triggerAlert(rule, metrics);
      }
    });
  }
  
  private static triggerAlert(rule: AlertRule, metrics: any) {
    const now = Date.now();
    const lastAlert = this.lastAlerts.get(rule.name) || 0;
    
    // Check cooldown period
    if (now - lastAlert < rule.cooldown * 60 * 1000) {
      return;
    }
    
    this.lastAlerts.set(rule.name, now);
    
    Logger.error(`Alert triggered: ${rule.name}`, undefined, {
      rule: rule.name,
      severity: rule.severity,
      metrics
    });
    
    // Send notification
    this.sendNotification(rule, metrics);
  }
  
  private static sendNotification(rule: AlertRule, metrics: any) {
    // Implement notification service (email, Slack, etc.)
    console.log(`🚨 ALERT: ${rule.name} (${rule.severity})`);
  }
}
```

## 📊 Monitoring Best Practices

### 1. Monitoring Checklist
- [ ] Health check endpoints implemented
- [ ] Performance metrics tracked
- [ ] Error tracking configured
- [ ] Business metrics monitored
- [ ] Alerting rules defined
- [ ] Log aggregation set up
- [ ] Dashboard created
- [ ] Documentation updated

### 2. Regular Monitoring Tasks
- **Daily**: Review error logs and performance metrics
- **Weekly**: Analyze user engagement and feature usage
- **Monthly**: Review and update alert thresholds
- **Quarterly**: Audit monitoring coverage and effectiveness

---

This comprehensive monitoring and logging strategy ensures the Stock Analysis Platform maintains high availability, performance, and user satisfaction while providing valuable insights for continuous improvement.
