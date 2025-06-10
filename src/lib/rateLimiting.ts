import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
  onLimitReached?: (req: NextRequest) => void
}

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => this.getClientIP(req),
      ...config,
    }

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIP = req.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }

    return 'unknown'
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  public async checkLimit(req: NextRequest): Promise<{
    allowed: boolean
    limit: number
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const key = this.config.keyGenerator!(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let entry = this.store.get(key)

    // Create new entry if doesn't exist or window has expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      }
      this.store.set(key, entry)
    }

    // Increment request count
    entry.count++

    const allowed = entry.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)

    if (!allowed && this.config.onLimitReached) {
      this.config.onLimitReached(req)
    }

    return {
      allowed,
      limit: this.config.maxRequests,
      remaining,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  onLimitReached: (req) => {
    console.warn('API rate limit exceeded:', {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent'),
      url: req.url,
      timestamp: new Date(),
    })
  },
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  onLimitReached: (req) => {
    console.warn('Auth rate limit exceeded:', {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date(),
    })
  },
})

export const analysisRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 analysis requests per hour
  onLimitReached: (req) => {
    console.warn('Analysis rate limit exceeded:', {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date(),
    })
  },
})

export const stockDataRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
})

// Middleware function to apply rate limiting
export function withRateLimit(
  rateLimiter: RateLimiter,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const result = await rateLimiter.checkLimit(req)

      // Add rate limit headers
      const headers = new Headers()
      headers.set('X-RateLimit-Limit', result.limit.toString())
      headers.set('X-RateLimit-Remaining', result.remaining.toString())
      headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

      if (!result.allowed) {
        headers.set('Retry-After', result.retryAfter!.toString())
        
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers,
          }
        )
      }

      // Call the original handler
      const response = await handler(req)

      // Add rate limit headers to successful responses
      for (const [key, value] of headers.entries()) {
        response.headers.set(key, value)
      }

      return response
    } catch (error) {
      console.error('Rate limiting error:', error)
      // If rate limiting fails, allow the request to proceed
      return handler(req)
    }
  }
}

// Helper function to create custom rate limiters
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config)
}

// Advanced rate limiting with different limits for different user types
export function createUserBasedRateLimiter(
  configs: {
    default: RateLimitConfig
    analyst?: RateLimitConfig
    investor?: RateLimitConfig
  }
) {
  const limiters = {
    default: new RateLimiter(configs.default),
    analyst: configs.analyst ? new RateLimiter(configs.analyst) : new RateLimiter(configs.default),
    investor: configs.investor ? new RateLimiter(configs.investor) : new RateLimiter(configs.default),
  }

  return {
    checkLimit: async (req: NextRequest, userRole?: string) => {
      const limiter = limiters[userRole as keyof typeof limiters] || limiters.default
      return limiter.checkLimit(req)
    }
  }
}
