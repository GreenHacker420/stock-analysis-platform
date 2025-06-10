interface ErrorContext {
  userId?: string
  userRole?: string
  portfolioId?: string
  symbol?: string
  action?: string
  timestamp: Date
  userAgent?: string
  url?: string
}

interface ErrorReport {
  id: string
  message: string
  stack?: string
  level: 'error' | 'warning' | 'info'
  context: ErrorContext
  fingerprint?: string
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService
  private isInitialized = false
  private errorQueue: ErrorReport[] = []

  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService()
    }
    return ErrorTrackingService.instance
  }

  public initialize() {
    if (this.isInitialized) return

    // Initialize Sentry if DSN is provided
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      this.initializeSentry()
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers()
    
    this.isInitialized = true
    console.log('Error tracking service initialized')
  }

  private initializeSentry() {
    // This would be implemented with actual Sentry SDK
    // For now, we'll use a mock implementation
    console.log('Sentry would be initialized here with DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN)
  }

  private setupGlobalErrorHandlers() {
    if (typeof window !== 'undefined') {
      // Browser error handlers
      window.addEventListener('error', (event) => {
        this.captureError(event.error, {
          timestamp: new Date(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(new Error(event.reason), {
          timestamp: new Date(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        })
      })
    }

    if (typeof process !== 'undefined') {
      // Node.js error handlers
      process.on('uncaughtException', (error) => {
        this.captureError(error, {
          timestamp: new Date(),
          action: 'uncaughtException',
        })
      })

      process.on('unhandledRejection', (reason) => {
        this.captureError(new Error(String(reason)), {
          timestamp: new Date(),
          action: 'unhandledRejection',
        })
      })
    }
  }

  public captureError(error: Error, context: Partial<ErrorContext> = {}) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      level: 'error',
      context: {
        timestamp: new Date(),
        ...context,
      },
      fingerprint: this.generateFingerprint(error),
    }

    this.processError(errorReport)
  }

  public captureWarning(message: string, context: Partial<ErrorContext> = {}) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message,
      level: 'warning',
      context: {
        timestamp: new Date(),
        ...context,
      },
    }

    this.processError(errorReport)
  }

  public captureInfo(message: string, context: Partial<ErrorContext> = {}) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message,
      level: 'info',
      context: {
        timestamp: new Date(),
        ...context,
      },
    }

    this.processError(errorReport)
  }

  private processError(errorReport: ErrorReport) {
    // Add to queue for batch processing
    this.errorQueue.push(errorReport)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorReport.level.toUpperCase()}]`, errorReport.message, errorReport.context)
      if (errorReport.stack) {
        console.error(errorReport.stack)
      }
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorReport)
    }

    // Process queue if it gets too large
    if (this.errorQueue.length >= 10) {
      this.flushErrorQueue()
    }
  }

  private async sendToExternalService(errorReport: ErrorReport) {
    try {
      // This would send to Sentry, LogRocket, or other service
      // For now, we'll send to our own API endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      })
    } catch (error) {
      // Silently fail to avoid infinite loops
      console.error('Failed to send error report:', error)
    }
  }

  private flushErrorQueue() {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    // Send batch of errors
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      }).catch(() => {
        // Silently fail
      })
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFingerprint(error: Error): string {
    // Create a fingerprint based on error message and stack trace
    const message = error.message.replace(/\d+/g, 'X') // Replace numbers with X
    const stackLine = error.stack?.split('\n')[1] || ''
    return btoa(`${message}:${stackLine}`).substr(0, 16)
  }

  public setUserContext(userId: string, userRole: string) {
    // This would set user context in Sentry
    console.log('User context set:', { userId, userRole })
  }

  public addBreadcrumb(message: string, category: string, data?: any) {
    // This would add breadcrumbs in Sentry
    console.log('Breadcrumb:', { message, category, data, timestamp: new Date() })
  }

  public getErrorStats(): {
    totalErrors: number
    errorsByLevel: Record<string, number>
    recentErrors: ErrorReport[]
  } {
    const errorsByLevel = this.errorQueue.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalErrors: this.errorQueue.length,
      errorsByLevel,
      recentErrors: this.errorQueue.slice(-5),
    }
  }
}

// Export singleton instance
export const errorTracker = ErrorTrackingService.getInstance()

// Convenience functions
export function captureError(error: Error, context?: Partial<ErrorContext>) {
  errorTracker.captureError(error, context)
}

export function captureWarning(message: string, context?: Partial<ErrorContext>) {
  errorTracker.captureWarning(message, context)
}

export function captureInfo(message: string, context?: Partial<ErrorContext>) {
  errorTracker.captureInfo(message, context)
}

export function setUserContext(userId: string, userRole: string) {
  errorTracker.setUserContext(userId, userRole)
}

export function addBreadcrumb(message: string, category: string, data?: any) {
  errorTracker.addBreadcrumb(message, category, data)
}
