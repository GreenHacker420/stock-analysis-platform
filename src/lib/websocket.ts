import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { StockDataService } from './stockData'

export interface StockUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  timestamp: Date
}

export interface PortfolioUpdate {
  portfolioId: string
  totalValue: number
  totalGainLoss: number
  totalGainLossPercentage: number
  timestamp: Date
}

export class WebSocketService {
  private io: SocketIOServer
  private stockService: StockDataService
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map()
  private subscribedSymbols: Set<string> = new Set()

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    })

    this.stockService = StockDataService.getInstance()
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Handle stock subscription
      socket.on('subscribe-stock', (symbol: string) => {
        socket.join(`stock-${symbol}`)
        this.subscribedSymbols.add(symbol)
        this.startStockUpdates(symbol)
        console.log(`Client ${socket.id} subscribed to ${symbol}`)
      })

      // Handle stock unsubscription
      socket.on('unsubscribe-stock', (symbol: string) => {
        socket.leave(`stock-${symbol}`)
        this.checkAndStopStockUpdates(symbol)
        console.log(`Client ${socket.id} unsubscribed from ${symbol}`)
      })

      // Handle portfolio subscription
      socket.on('subscribe-portfolio', (portfolioId: string) => {
        socket.join(`portfolio-${portfolioId}`)
        console.log(`Client ${socket.id} subscribed to portfolio ${portfolioId}`)
      })

      // Handle portfolio unsubscription
      socket.on('unsubscribe-portfolio', (portfolioId: string) => {
        socket.leave(`portfolio-${portfolioId}`)
        console.log(`Client ${socket.id} unsubscribed from portfolio ${portfolioId}`)
      })

      // Handle analysis updates
      socket.on('subscribe-analysis', (userId: string) => {
        socket.join(`analysis-${userId}`)
        console.log(`Client ${socket.id} subscribed to analysis updates for user ${userId}`)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
        // Clean up subscriptions if no other clients are listening
        this.cleanupSubscriptions()
      })
    })
  }

  private async startStockUpdates(symbol: string) {
    // Don't start if already updating
    if (this.updateIntervals.has(symbol)) {
      return
    }

    // Update every 30 seconds for real-time feel
    const interval = setInterval(async () => {
      try {
        const quote = await this.stockService.getQuote(symbol)
        if (quote) {
          const update: StockUpdate = {
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            timestamp: new Date(),
          }

          this.io.to(`stock-${symbol}`).emit('stock-update', update)
        }
      } catch (error) {
        console.error(`Error updating stock ${symbol}:`, error)
      }
    }, 30000) // 30 seconds

    this.updateIntervals.set(symbol, interval)
  }

  private checkAndStopStockUpdates(symbol: string) {
    // Check if any clients are still subscribed to this stock
    const room = this.io.sockets.adapter.rooms.get(`stock-${symbol}`)
    if (!room || room.size === 0) {
      const interval = this.updateIntervals.get(symbol)
      if (interval) {
        clearInterval(interval)
        this.updateIntervals.delete(symbol)
        this.subscribedSymbols.delete(symbol)
        console.log(`Stopped updates for ${symbol}`)
      }
    }
  }

  private cleanupSubscriptions() {
    // Clean up stock subscriptions with no listeners
    for (const symbol of this.subscribedSymbols) {
      this.checkAndStopStockUpdates(symbol)
    }
  }

  // Public methods for emitting updates from other parts of the application
  public emitPortfolioUpdate(portfolioId: string, update: PortfolioUpdate) {
    this.io.to(`portfolio-${portfolioId}`).emit('portfolio-update', update)
  }

  public emitAnalysisComplete(userId: string, reportId: string) {
    this.io.to(`analysis-${userId}`).emit('analysis-complete', {
      reportId,
      timestamp: new Date(),
    })
  }

  public emitMarketAlert(alert: {
    type: 'volatility' | 'news' | 'technical'
    symbol: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }) {
    this.io.emit('market-alert', {
      ...alert,
      timestamp: new Date(),
    })
  }

  public getConnectedClients(): number {
    return this.io.sockets.sockets.size
  }

  public getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols)
  }

  public close() {
    // Clean up all intervals
    for (const interval of this.updateIntervals.values()) {
      clearInterval(interval)
    }
    this.updateIntervals.clear()
    this.subscribedSymbols.clear()
    
    this.io.close()
  }
}

// Singleton instance
let websocketService: WebSocketService | null = null

export function initializeWebSocket(server: HTTPServer): WebSocketService {
  if (!websocketService) {
    websocketService = new WebSocketService(server)
  }
  return websocketService
}

export function getWebSocketService(): WebSocketService | null {
  return websocketService
}

// CommonJS exports for server.js compatibility
module.exports = {
  WebSocketService,
  initializeWebSocket,
  getWebSocketService,
}
