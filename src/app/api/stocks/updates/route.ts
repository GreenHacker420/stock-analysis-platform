import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StockDataService } from '@/lib/stockData'
import { withRateLimit, stockDataRateLimiter } from '@/lib/rateLimiting'
import { captureError, addBreadcrumb } from '@/lib/errorTracking'

async function handleStockUpdates(request: NextRequest) {
  let session: any = null;

  try {
    session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    addBreadcrumb('Stock updates requested', 'api', { userId: session.user.id })

    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')
    
    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      )
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase())
    
    if (symbols.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 symbols allowed per request' },
        { status: 400 }
      )
    }

    const stockService = StockDataService.getInstance()
    const updates = []

    for (const symbol of symbols) {
      try {
        const quote = await stockService.getQuote(symbol)
        if (quote) {
          updates.push({
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            lastUpdated: quote.lastUpdated,
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch quote for ${symbol}:`, error)
        // Continue with other symbols
      }
    }

    return NextResponse.json({
      updates,
      timestamp: new Date().toISOString(),
      requestedSymbols: symbols,
      successCount: updates.length,
    })

  } catch (error) {
    captureError(error as Error, {
      userId: session?.user?.id,
      action: 'stock_updates',
      timestamp: new Date(),
    })

    console.error('Error fetching stock updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock updates' },
      { status: 500 }
    )
  }
}

// Apply rate limiting
export const GET = withRateLimit(stockDataRateLimiter, handleStockUpdates)
