import { NextRequest, NextResponse } from 'next/server';
import { StockDataService } from '@/lib/stockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' || '1y';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching historical data for ${symbol} with period ${period}`);

    const stockService = StockDataService.getInstance();
    const historicalData = await stockService.getHistoricalData(symbol.toUpperCase(), period);

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found' },
        { status: 404 }
      );
    }

    // Transform data to match CandlestickChart interface
    const candlestickData = historicalData.map(item => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));

    return NextResponse.json({
      success: true,
      symbol: symbol.toUpperCase(),
      period,
      data: candlestickData,
      total: candlestickData.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
