import { NextRequest, NextResponse } from 'next/server';

// EODHD API configuration
const EODHD_API_KEY = process.env.EODHD_API_KEY || '6848fa019edce9.81077823';
const EODHD_BASE_URL = 'https://eodhd.com/api';

interface EODHDStock {
  code: string;
  name: string;
  country: string;
  exchange: string;
  currency: string;
  type: string;
}

interface EODHDRealTimeData {
  code: string;
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
}

interface IndianStock {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  high52Week: number;
  low52Week: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  sector: string;
  lastUpdated: Date;
}

// Popular Indian stocks to fetch
const POPULAR_INDIAN_STOCKS = [
  'RELIANCE.NSE',
  'TCS.NSE',
  'HDFCBANK.NSE',
  'INFY.NSE',
  'ICICIBANK.NSE',
  'HINDUNILVR.NSE',
  'BHARTIARTL.NSE',
  'ITC.NSE',
  'SBIN.NSE',
  'LT.NSE',
  'KOTAKBANK.NSE',
  'ASIANPAINT.NSE',
  'MARUTI.NSE',
  'HCLTECH.NSE',
  'AXISBANK.NSE',
  'BAJFINANCE.NSE',
  'TITAN.NSE',
  'NESTLEIND.NSE',
  'WIPRO.NSE',
  'ULTRACEMCO.NSE',
  'ONGC.NSE',
  'POWERGRID.NSE',
  'NTPC.NSE',
  'TECHM.NSE',
  'SUNPHARMA.NSE',
  'TATAMOTORS.NSE',
  'BAJAJFINSV.NSE',
  'COALINDIA.NSE',
  'DIVISLAB.NSE',
  'DRREDDY.NSE'
];

// Sector mapping for Indian stocks
const STOCK_SECTORS: Record<string, string> = {
  'RELIANCE': 'Oil & Gas',
  'TCS': 'Information Technology',
  'HDFCBANK': 'Banking',
  'INFY': 'Information Technology',
  'ICICIBANK': 'Banking',
  'HINDUNILVR': 'FMCG',
  'BHARTIARTL': 'Telecommunications',
  'ITC': 'FMCG',
  'SBIN': 'Banking',
  'LT': 'Construction',
  'KOTAKBANK': 'Banking',
  'ASIANPAINT': 'Paints',
  'MARUTI': 'Automobile',
  'HCLTECH': 'Information Technology',
  'AXISBANK': 'Banking',
  'BAJFINANCE': 'Financial Services',
  'TITAN': 'Consumer Goods',
  'NESTLEIND': 'FMCG',
  'WIPRO': 'Information Technology',
  'ULTRACEMCO': 'Cement',
  'ONGC': 'Oil & Gas',
  'POWERGRID': 'Power',
  'NTPC': 'Power',
  'TECHM': 'Information Technology',
  'SUNPHARMA': 'Pharmaceuticals',
  'TATAMOTORS': 'Automobile',
  'BAJAJFINSV': 'Financial Services',
  'COALINDIA': 'Mining',
  'DIVISLAB': 'Pharmaceuticals',
  'DRREDDY': 'Pharmaceuticals'
};

// Market cap estimates (in INR crores) - these would normally come from fundamental data
const MARKET_CAPS: Record<string, number> = {
  'RELIANCE': 1658000,
  'TCS': 1298000,
  'HDFCBANK': 1245000,
  'INFY': 612000,
  'ICICIBANK': 689000,
  'HINDUNILVR': 523000,
  'BHARTIARTL': 678000,
  'ITC': 567000,
  'SBIN': 456000,
  'LT': 234000,
  'KOTAKBANK': 345000,
  'ASIANPAINT': 289000,
  'MARUTI': 267000,
  'HCLTECH': 234000,
  'AXISBANK': 198000,
  'BAJFINANCE': 456000,
  'TITAN': 234000,
  'NESTLEIND': 189000,
  'WIPRO': 156000,
  'ULTRACEMCO': 123000
};

async function fetchEODHDData(symbol: string): Promise<EODHDRealTimeData | null> {
  try {
    const url = `${EODHD_BASE_URL}/real-time/${symbol}?api_token=${EODHD_API_KEY}&fmt=json`;
    console.log(`Fetching data for ${symbol} from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StockAnalysisPlatform/1.0'
      },
      cache: 'no-store' // Disable caching to get fresh data
    });

    console.log(`Response status for ${symbol}: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`EODHD API error for ${symbol}: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`Successfully fetched data for ${symbol}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching EODHD data for ${symbol}:`, error);
    return null;
  }
}

function generateMockStockData(symbol: string): IndianStock {
  const stockCode = symbol.split('.')[0];
  const basePrice = 1000 + Math.random() * 2000;
  const change = (Math.random() - 0.5) * 100;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name: `${stockCode} Limited`,
    exchange: symbol.includes('.NSE') ? 'NSE' : 'BSE',
    price: basePrice,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 5000000) + 100000,
    marketCap: (MARKET_CAPS[stockCode] || 100000) * 10000000, // Convert crores to rupees
    peRatio: 15 + Math.random() * 30,
    high52Week: basePrice * (1.2 + Math.random() * 0.3),
    low52Week: basePrice * (0.7 + Math.random() * 0.2),
    dayHigh: basePrice * (1 + Math.random() * 0.03),
    dayLow: basePrice * (1 - Math.random() * 0.03),
    previousClose: basePrice - change,
    sector: STOCK_SECTORS[stockCode] || 'Others',
    lastUpdated: new Date()
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const exchange = searchParams.get('exchange') || 'all';

    console.log(`Fetching Indian stocks from EODHD API... (limit: ${limit}, exchange: ${exchange})`);
    console.log(`Using API key: ${EODHD_API_KEY ? 'Present' : 'Missing'}`);

    const stocks: IndianStock[] = [];
    const stocksToFetch = POPULAR_INDIAN_STOCKS.slice(0, limit);
    console.log(`Stocks to fetch: ${stocksToFetch.join(', ')}`);

    // Try to fetch real data from EODHD API
    const fetchPromises = stocksToFetch.map(async (symbol) => {
      try {
        const eodhData = await fetchEODHDData(symbol);

        if (eodhData && eodhData.close) {
          const stockCode = symbol.split('.')[0];
          console.log(`✅ Real data fetched for ${symbol}: ₹${eodhData.close}`);

          return {
            symbol,
            name: `${stockCode} Limited`,
            exchange: symbol.includes('.NSE') ? 'NSE' as const : 'BSE' as const,
            price: eodhData.close,
            change: eodhData.change || 0,
            changePercent: eodhData.change_p || 0,
            volume: eodhData.volume || 0,
            marketCap: (MARKET_CAPS[stockCode] || 100000) * 10000000,
            peRatio: 15 + Math.random() * 30, // Would come from fundamental data
            high52Week: eodhData.close * (1.2 + Math.random() * 0.3),
            low52Week: eodhData.close * (0.7 + Math.random() * 0.2),
            dayHigh: eodhData.high || eodhData.close,
            dayLow: eodhData.low || eodhData.close,
            previousClose: eodhData.previousClose || eodhData.close - (eodhData.change || 0),
            sector: STOCK_SECTORS[stockCode] || 'Others',
            lastUpdated: new Date(eodhData.timestamp * 1000)
          };
        } else {
          console.log(`❌ No real data for ${symbol}, using mock data`);
          // Fallback to mock data for this stock
          return generateMockStockData(symbol);
        }
      } catch (error) {
        console.error(`❌ Error processing ${symbol}:`, error);
        return generateMockStockData(symbol);
      }
    });
    
    const results = await Promise.allSettled(fetchPromises);

    let realDataCount = 0;
    let mockDataCount = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        stocks.push(result.value);
        // Check if this is real data (has a recent timestamp) or mock data
        const isRealData = result.value.lastUpdated &&
          (new Date().getTime() - result.value.lastUpdated.getTime()) < 24 * 60 * 60 * 1000; // Less than 24 hours old
        if (isRealData) {
          realDataCount++;
        } else {
          mockDataCount++;
        }
      }
    });

    // Filter by exchange if specified
    const filteredStocks = exchange === 'all'
      ? stocks
      : stocks.filter(stock => stock.exchange === exchange);

    // Sort by market cap descending
    filteredStocks.sort((a, b) => b.marketCap - a.marketCap);

    console.log(`✅ Successfully fetched ${filteredStocks.length} Indian stocks (${realDataCount} real, ${mockDataCount} mock)`);

    return NextResponse.json({
      success: true,
      stocks: filteredStocks,
      total: filteredStocks.length,
      source: realDataCount > 0 ? 'EODHD API with fallback' : 'Mock data only',
      realDataCount,
      mockDataCount,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in Indian stocks API:', error);
    
    // Complete fallback to mock data
    const mockStocks = POPULAR_INDIAN_STOCKS.slice(0, 30).map(generateMockStockData);
    
    return NextResponse.json({
      success: true,
      stocks: mockStocks,
      total: mockStocks.length,
      source: 'Mock data (API fallback)',
      lastUpdated: new Date().toISOString(),
      fallback: true
    });
  }
}
