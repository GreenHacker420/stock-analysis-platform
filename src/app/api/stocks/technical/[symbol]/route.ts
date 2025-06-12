import { NextRequest, NextResponse } from 'next/server';
import { StockDataService } from '@/lib/stockData';

// Technical indicator calculation functions
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate RSI
  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);
  
  const macdLine: number[] = [];
  const startIndex = Math.max(ema12.length - ema26.length, 0);
  
  for (let i = 0; i < ema26.length; i++) {
    macdLine.push(ema12[startIndex + i] - ema26[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = [];
  
  const signalStartIndex = macdLine.length - signalLine.length;
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[signalStartIndex + i] - signalLine[i]);
  }
  
  return {
    line: macdLine,
    signal: signalLine,
    histogram: histogram
  };
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for first value
  let sum = 0;
  for (let i = 0; i < period && i < prices.length; i++) {
    sum += prices[i];
  }
  ema.push(sum / Math.min(period, prices.length));
  
  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    ema.push((prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier)));
  }
  
  return ema;
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(prices, period);
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    middle.push(mean);
    upper.push(mean + (standardDeviation * stdDev));
    lower.push(mean - (standardDeviation * stdDev));
  }
  
  return { upper, middle, lower };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '3mo';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    console.log(`Calculating technical indicators for ${symbol}`);

    const stockService = StockDataService.getInstance();
    const historicalData = await stockService.getHistoricalData(
      symbol.toUpperCase(), 
      period as '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max'
    );

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found for technical analysis' },
        { status: 404 }
      );
    }

    // Extract closing prices for calculations
    const closePrices = historicalData.map(item => item.close);
    
    // Calculate technical indicators
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const rsi = calculateRSI(closePrices, 14);
    const macd = calculateMACD(closePrices, 12, 26, 9);
    const bollinger = calculateBollingerBands(closePrices, 20, 2);

    // Prepare indicators object for the chart
    const indicators = {
      sma20: sma20,
      sma50: sma50,
      rsi: rsi,
      macd: macd,
      bollinger: bollinger
    };

    return NextResponse.json({
      success: true,
      symbol: symbol.toUpperCase(),
      period,
      indicators,
      dataPoints: historicalData.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating technical indicators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
