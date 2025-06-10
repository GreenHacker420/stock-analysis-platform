import { useEffect, useRef, useState } from 'react'

// Types for real-time updates
export interface StockUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: Date
}

export interface PortfolioUpdate {
  portfolioId: string
  totalValue: number
  totalGainLoss: number
  totalGainLossPercentage: number
  timestamp: Date
}

interface UsePollingOptions {
  interval?: number
  enabled?: boolean
}

interface ConnectionState {
  connected: boolean
  connecting: boolean
  error: string | null
}

export function usePolling(options: UsePollingOptions = {}) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
  } = options

  const [state, setState] = useState<ConnectionState>({
    connected: enabled,
    connecting: false,
    error: null,
  })

  useEffect(() => {
    setState(prev => ({ ...prev, connected: enabled, error: null }))
  }, [enabled])

  return {
    ...state,
    interval,
  }
}

export function useStockUpdates(symbols: string[]) {
  const { connected, interval } = usePolling({ enabled: symbols.length > 0 })
  const [stockUpdates, setStockUpdates] = useState<Map<string, StockUpdate>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || symbols.length === 0) return

    const fetchStockUpdates = async () => {
      try {
        setLoading(true)
        setError(null)

        const symbolsParam = symbols.join(',')
        const response = await fetch(`/api/stocks/updates?symbols=${symbolsParam}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        if (data.updates) {
          const newUpdates = new Map(stockUpdates)
          data.updates.forEach((update: StockUpdate) => {
            newUpdates.set(update.symbol, {
              ...update,
              lastUpdated: new Date(update.lastUpdated),
            })
          })
          setStockUpdates(newUpdates)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock updates')
        console.error('Error fetching stock updates:', err)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchStockUpdates()

    // Set up polling
    const intervalId = setInterval(fetchStockUpdates, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [symbols, connected, interval])

  return { stockUpdates, loading, error }
}

export function usePortfolioUpdates(portfolioId: string | null) {
  const { connected, interval } = usePolling({ enabled: !!portfolioId })
  const [portfolioUpdate, setPortfolioUpdate] = useState<PortfolioUpdate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || !portfolioId) return

    const fetchPortfolioUpdate = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/portfolios/${portfolioId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        if (data.portfolio) {
          setPortfolioUpdate({
            portfolioId: data.portfolio._id,
            totalValue: data.portfolio.totalValue,
            totalGainLoss: data.portfolio.totalGainLoss,
            totalGainLossPercentage: data.portfolio.totalGainLossPercentage,
            timestamp: new Date(),
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio updates')
        console.error('Error fetching portfolio updates:', err)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchPortfolioUpdate()

    // Set up polling
    const intervalId = setInterval(fetchPortfolioUpdate, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [portfolioId, connected, interval])

  return { portfolioUpdate, loading, error }
}

export function useAnalysisUpdates(userId: string | null) {
  const { connected } = usePolling({ enabled: !!userId })
  const [analysisComplete, setAnalysisComplete] = useState<{
    reportId: string
    timestamp: Date
  } | null>(null)

  // For now, this is a placeholder
  // In a full implementation, this would poll for analysis status
  useEffect(() => {
    if (!connected || !userId) return

    // Placeholder for analysis status polling
    console.log('Analysis updates monitoring enabled for user:', userId)
  }, [connected, userId])

  return analysisComplete
}

export function useMarketAlerts() {
  const { connected } = usePolling({ interval: 60000 }) // Check every minute
  const [alerts, setAlerts] = useState<Array<{
    type: 'volatility' | 'news' | 'technical'
    symbol: string
    message: string
    severity: 'low' | 'medium' | 'high'
    timestamp: Date
  }>>([])

  useEffect(() => {
    if (!connected) return

    // Placeholder for market alerts polling
    // In a full implementation, this would fetch alerts from an API
    console.log('Market alerts monitoring enabled')
  }, [connected])

  const clearAlerts = () => setAlerts([])

  return { alerts, clearAlerts }
}

// Legacy export for backward compatibility
export const useWebSocket = usePolling
