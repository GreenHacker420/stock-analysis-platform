interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: Date
  tags?: Record<string, string>
}

interface APIPerformanceData {
  endpoint: string
  method: string
  duration: number
  statusCode: number
  userId?: string
  timestamp: Date
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private apiMetrics: APIPerformanceData[] = []
  private timers: Map<string, number> = new Map()

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start timing an operation
  public startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  // End timing and record the metric
  public endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags,
    })

    return duration
  }

  // Record a custom metric
  public recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics.splice(0, this.metrics.length - 1000)
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && metric.unit === 'ms' && metric.value > 1000) {
      console.warn(`Slow operation detected: ${metric.name} took ${metric.value}ms`)
    }
  }

  // Record API performance data
  public recordAPICall(data: APIPerformanceData): void {
    this.apiMetrics.push(data)

    // Keep only last 500 API calls
    if (this.apiMetrics.length > 500) {
      this.apiMetrics.splice(0, this.apiMetrics.length - 500)
    }

    // Log slow API calls
    if (data.duration > 5000) { // 5 seconds
      console.warn(`Slow API call: ${data.method} ${data.endpoint} took ${data.duration}ms`)
    }
  }

  // Get performance statistics
  public getStats(): {
    metrics: {
      total: number
      byName: Record<string, { count: number; avgValue: number; maxValue: number }>
    }
    apiCalls: {
      total: number
      avgDuration: number
      slowestCalls: APIPerformanceData[]
      errorRate: number
    }
    systemMetrics: {
      memoryUsage?: NodeJS.MemoryUsage
      uptime?: number
    }
  } {
    // Calculate metric statistics
    const metricsByName = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = { values: [], count: 0 }
      }
      acc[metric.name].values.push(metric.value)
      acc[metric.name].count++
      return acc
    }, {} as Record<string, { values: number[]; count: number }>)

    const metricStats = Object.entries(metricsByName).reduce((acc, [name, data]) => {
      acc[name] = {
        count: data.count,
        avgValue: data.values.reduce((sum, val) => sum + val, 0) / data.values.length,
        maxValue: Math.max(...data.values),
      }
      return acc
    }, {} as Record<string, { count: number; avgValue: number; maxValue: number }>)

    // Calculate API statistics
    const totalAPICalls = this.apiMetrics.length
    const avgDuration = totalAPICalls > 0 
      ? this.apiMetrics.reduce((sum, call) => sum + call.duration, 0) / totalAPICalls 
      : 0
    
    const slowestCalls = [...this.apiMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)

    const errorCalls = this.apiMetrics.filter(call => call.statusCode >= 400).length
    const errorRate = totalAPICalls > 0 ? (errorCalls / totalAPICalls) * 100 : 0

    // System metrics (Node.js only)
    const systemMetrics: any = {}
    if (typeof process !== 'undefined') {
      systemMetrics.memoryUsage = process.memoryUsage()
      systemMetrics.uptime = process.uptime()
    }

    return {
      metrics: {
        total: this.metrics.length,
        byName: metricStats,
      },
      apiCalls: {
        total: totalAPICalls,
        avgDuration,
        slowestCalls,
        errorRate,
      },
      systemMetrics,
    }
  }

  // Get recent metrics for a specific name
  public getRecentMetrics(name: string, limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(metric => metric.name === name)
      .slice(-limit)
  }

  // Clear all metrics (useful for testing)
  public clearMetrics(): void {
    this.metrics = []
    this.apiMetrics = []
    this.timers.clear()
  }

  // Monitor a function's execution time
  public async monitor<T>(
    name: string, 
    fn: () => Promise<T>, 
    tags?: Record<string, string>
  ): Promise<T> {
    this.startTimer(name)
    try {
      const result = await fn()
      this.endTimer(name, tags)
      return result
    } catch (error) {
      this.endTimer(name, { ...tags, error: 'true' })
      throw error
    }
  }

  // Monitor synchronous function execution
  public monitorSync<T>(
    name: string, 
    fn: () => T, 
    tags?: Record<string, string>
  ): T {
    this.startTimer(name)
    try {
      const result = fn()
      this.endTimer(name, tags)
      return result
    } catch (error) {
      this.endTimer(name, { ...tags, error: 'true' })
      throw error
    }
  }

  // Web Vitals monitoring (browser only)
  public initWebVitals(): void {
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      // This would integrate with the web-vitals library
      console.log('Web Vitals monitoring initialized')
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        this.recordMetric({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
        })

        this.recordMetric({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
        })

        this.recordMetric({
          name: 'first_contentful_paint',
          value: navigation.responseEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
        })
      }
    })
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Convenience functions
export function startTimer(name: string): void {
  performanceMonitor.startTimer(name)
}

export function endTimer(name: string, tags?: Record<string, string>): number {
  return performanceMonitor.endTimer(name, tags)
}

export function recordMetric(metric: PerformanceMetric): void {
  performanceMonitor.recordMetric(metric)
}

export function recordAPICall(data: APIPerformanceData): void {
  performanceMonitor.recordAPICall(data)
}

export async function monitor<T>(
  name: string, 
  fn: () => Promise<T>, 
  tags?: Record<string, string>
): Promise<T> {
  return performanceMonitor.monitor(name, fn, tags)
}

export function monitorSync<T>(
  name: string, 
  fn: () => T, 
  tags?: Record<string, string>
): T {
  return performanceMonitor.monitorSync(name, fn, tags)
}

// Middleware for API performance monitoring
export function withPerformanceMonitoring(
  handler: (req: any) => Promise<any>
) {
  return async (req: any): Promise<any> => {
    const startTime = performance.now()
    const endpoint = req.url || 'unknown'
    const method = req.method || 'unknown'

    try {
      const response = await handler(req)
      const duration = performance.now() - startTime

      recordAPICall({
        endpoint,
        method,
        duration,
        statusCode: response.status || 200,
        timestamp: new Date(),
      })

      return response
    } catch (error) {
      const duration = performance.now() - startTime

      recordAPICall({
        endpoint,
        method,
        duration,
        statusCode: 500,
        timestamp: new Date(),
      })

      throw error
    }
  }
}
