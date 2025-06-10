import { performanceMonitor, startTimer, endTimer, recordMetric, monitor, monitorSync } from '../performance'

// Mock performance.now()
const mockPerformanceNow = jest.fn()
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
})

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics()
    mockPerformanceNow.mockClear()
    mockPerformanceNow.mockReturnValue(1000) // Default mock time
  })

  describe('Timer functionality', () => {
    it('should start and end timers correctly', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1500) // End time

      startTimer('test-operation')
      const duration = endTimer('test-operation')

      expect(duration).toBe(500)
    })

    it('should handle missing timer gracefully', () => {
      const duration = endTimer('non-existent-timer')
      expect(duration).toBe(0)
    })

    it('should record metrics when timer ends', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1200)

      startTimer('api-call')
      endTimer('api-call', { endpoint: '/api/test' })

      const stats = performanceMonitor.getStats()
      expect(stats.metrics.total).toBe(1)
      expect(stats.metrics.byName['api-call']).toEqual({
        count: 1,
        avgValue: 200,
        maxValue: 200,
      })
    })
  })

  describe('Metric recording', () => {
    it('should record custom metrics', () => {
      recordMetric({
        name: 'memory-usage',
        value: 1024,
        unit: 'bytes',
        timestamp: new Date(),
        tags: { component: 'database' },
      })

      const stats = performanceMonitor.getStats()
      expect(stats.metrics.total).toBe(1)
      expect(stats.metrics.byName['memory-usage']).toEqual({
        count: 1,
        avgValue: 1024,
        maxValue: 1024,
      })
    })

    it('should limit stored metrics to prevent memory issues', () => {
      // Record more than the limit (1000)
      for (let i = 0; i < 1100; i++) {
        recordMetric({
          name: `metric-${i}`,
          value: i,
          unit: 'count',
          timestamp: new Date(),
        })
      }

      const stats = performanceMonitor.getStats()
      expect(stats.metrics.total).toBe(1000) // Should be capped at 1000
    })
  })

  describe('API performance tracking', () => {
    it('should record API call metrics', () => {
      performanceMonitor.recordAPICall({
        endpoint: '/api/portfolios',
        method: 'GET',
        duration: 250,
        statusCode: 200,
        userId: 'user123',
        timestamp: new Date(),
      })

      const stats = performanceMonitor.getStats()
      expect(stats.apiCalls.total).toBe(1)
      expect(stats.apiCalls.avgDuration).toBe(250)
      expect(stats.apiCalls.errorRate).toBe(0)
    })

    it('should calculate error rate correctly', () => {
      // Add successful call
      performanceMonitor.recordAPICall({
        endpoint: '/api/test',
        method: 'GET',
        duration: 100,
        statusCode: 200,
        timestamp: new Date(),
      })

      // Add error call
      performanceMonitor.recordAPICall({
        endpoint: '/api/test',
        method: 'POST',
        duration: 150,
        statusCode: 500,
        timestamp: new Date(),
      })

      const stats = performanceMonitor.getStats()
      expect(stats.apiCalls.total).toBe(2)
      expect(stats.apiCalls.errorRate).toBe(50) // 1 error out of 2 calls = 50%
    })

    it('should track slowest API calls', () => {
      const calls = [
        { duration: 100, statusCode: 200 },
        { duration: 500, statusCode: 200 },
        { duration: 200, statusCode: 200 },
        { duration: 800, statusCode: 200 },
        { duration: 150, statusCode: 200 },
        { duration: 1000, statusCode: 200 },
      ]

      calls.forEach((call, index) => {
        performanceMonitor.recordAPICall({
          endpoint: `/api/test${index}`,
          method: 'GET',
          duration: call.duration,
          statusCode: call.statusCode,
          timestamp: new Date(),
        })
      })

      const stats = performanceMonitor.getStats()
      expect(stats.apiCalls.slowestCalls).toHaveLength(5) // Top 5 slowest
      expect(stats.apiCalls.slowestCalls[0].duration).toBe(1000) // Slowest first
      expect(stats.apiCalls.slowestCalls[1].duration).toBe(800)
    })
  })

  describe('Monitoring functions', () => {
    it('should monitor async functions', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1300)

      const asyncFunction = jest.fn().mockResolvedValue('result')

      const result = await monitor('async-operation', asyncFunction, { type: 'database' })

      expect(result).toBe('result')
      expect(asyncFunction).toHaveBeenCalled()

      const stats = performanceMonitor.getStats()
      expect(stats.metrics.byName['async-operation']).toEqual({
        count: 1,
        avgValue: 300,
        maxValue: 300,
      })
    })

    it('should monitor sync functions', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1150)

      const syncFunction = jest.fn().mockReturnValue('sync-result')

      const result = monitorSync('sync-operation', syncFunction, { type: 'calculation' })

      expect(result).toBe('sync-result')
      expect(syncFunction).toHaveBeenCalled()

      const stats = performanceMonitor.getStats()
      expect(stats.metrics.byName['sync-operation']).toEqual({
        count: 1,
        avgValue: 150,
        maxValue: 150,
      })
    })

    it('should handle errors in monitored functions', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100)

      const errorFunction = jest.fn().mockRejectedValue(new Error('Test error'))

      await expect(monitor('error-operation', errorFunction)).rejects.toThrow('Test error')

      const stats = performanceMonitor.getStats()
      expect(stats.metrics.byName['error-operation']).toEqual({
        count: 1,
        avgValue: 100,
        maxValue: 100,
      })
    })
  })

  describe('Statistics and reporting', () => {
    it('should provide comprehensive statistics', () => {
      // Add some test data
      recordMetric({
        name: 'test-metric',
        value: 100,
        unit: 'ms',
        timestamp: new Date(),
      })

      recordMetric({
        name: 'test-metric',
        value: 200,
        unit: 'ms',
        timestamp: new Date(),
      })

      performanceMonitor.recordAPICall({
        endpoint: '/api/test',
        method: 'GET',
        duration: 150,
        statusCode: 200,
        timestamp: new Date(),
      })

      const stats = performanceMonitor.getStats()

      expect(stats).toEqual({
        metrics: {
          total: 2,
          byName: {
            'test-metric': {
              count: 2,
              avgValue: 150,
              maxValue: 200,
            },
          },
        },
        apiCalls: {
          total: 1,
          avgDuration: 150,
          slowestCalls: expect.any(Array),
          errorRate: 0,
        },
        systemMetrics: expect.any(Object),
      })
    })

    it('should get recent metrics for specific name', () => {
      // Add multiple metrics with same name
      for (let i = 0; i < 15; i++) {
        recordMetric({
          name: 'repeated-metric',
          value: i * 10,
          unit: 'count',
          timestamp: new Date(),
        })
      }

      const recentMetrics = performanceMonitor.getRecentMetrics('repeated-metric', 5)
      expect(recentMetrics).toHaveLength(5)
      expect(recentMetrics[4].value).toBe(140) // Last metric should be 14 * 10
    })
  })
})
