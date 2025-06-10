import { apiRateLimiter, createRateLimiter, withRateLimit } from '../rateLimiting'

// Mock NextRequest
function createMockRequest(ip: string = '127.0.0.1') {
  return {
    headers: {
      get: jest.fn((key: string) => {
        const headers: Record<string, string> = {
          'x-forwarded-for': ip,
          'user-agent': 'test-agent',
        }
        return headers[key] || null
      }),
    },
    url: 'http://localhost:3000/api/test',
  }
}

describe('RateLimiting', () => {
  beforeEach(() => {
    // Clear any existing rate limit data
    jest.clearAllMocks()
  })

  describe('RateLimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        maxRequests: 5,
      })

      const req = createMockRequest()

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = await limiter.checkLimit(req)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should block requests exceeding limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        maxRequests: 3,
      })

      const req = createMockRequest()

      // First 3 requests should be allowed
      for (let i = 0; i < 3; i++) {
        const result = await limiter.checkLimit(req)
        expect(result.allowed).toBe(true)
      }

      // 4th request should be blocked
      const result = await limiter.checkLimit(req)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should reset limit after window expires', async () => {
      const limiter = createRateLimiter({
        windowMs: 100, // 100ms
        maxRequests: 2,
      })

      const req = createMockRequest()

      // Use up the limit
      await limiter.checkLimit(req)
      await limiter.checkLimit(req)
      
      const blockedResult = await limiter.checkLimit(req)
      expect(blockedResult.allowed).toBe(false)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should be allowed again
      const allowedResult = await limiter.checkLimit(req)
      expect(allowedResult.allowed).toBe(true)
    })

    it('should handle different IPs separately', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      })

      const req1 = createMockRequest('192.168.1.1')
      const req2 = createMockRequest('192.168.1.2')

      // Use up limit for first IP
      await limiter.checkLimit(req1)
      await limiter.checkLimit(req1)
      const blockedResult = await limiter.checkLimit(req1)
      expect(blockedResult.allowed).toBe(false)

      // Second IP should still be allowed
      const allowedResult = await limiter.checkLimit(req2)
      expect(allowedResult.allowed).toBe(true)
    })
  })

  describe('withRateLimit middleware', () => {
    it('should call handler when within limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      })

      const mockHandler = jest.fn().mockResolvedValue(
        new Response('success', { status: 200 })
      )

      const middleware = withRateLimit(limiter, mockHandler)
      const req = createMockRequest()

      const response = await middleware(req)

      expect(mockHandler).toHaveBeenCalledWith(req)
      expect(response.status).toBe(200)
    })

    it('should return 429 when limit exceeded', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      })

      const mockHandler = jest.fn().mockResolvedValue(
        new Response('success', { status: 200 })
      )

      const middleware = withRateLimit(limiter, mockHandler)
      const req = createMockRequest()

      // First request should succeed
      const response1 = await middleware(req)
      expect(response1.status).toBe(200)

      // Second request should be rate limited
      const response2 = await middleware(req)
      expect(response2.status).toBe(429)
      expect(mockHandler).toHaveBeenCalledTimes(1)

      const body = await response2.json()
      expect(body.error).toBe('Too many requests')
      expect(body.retryAfter).toBeGreaterThan(0)
    })

    it('should add rate limit headers to responses', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      })

      const mockHandler = jest.fn().mockResolvedValue(
        new Response('success', { status: 200 })
      )

      const middleware = withRateLimit(limiter, mockHandler)
      const req = createMockRequest()

      const response = await middleware(req)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })
  })

  describe('Pre-configured limiters', () => {
    it('should have correct configuration for API limiter', async () => {
      const req = createMockRequest()
      const result = await apiRateLimiter.checkLimit(req)

      expect(result.limit).toBe(100) // 100 requests per 15 minutes
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
    })
  })
})
