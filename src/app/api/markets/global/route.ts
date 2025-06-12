import { NextRequest, NextResponse } from 'next/server';

// EODHD API configuration for international markets
const EODHD_API_KEY = process.env.EODHD_API_KEY || '6848fa019edce9.81077823';
const EODHD_BASE_URL = 'https://eodhd.com/api';

interface GlobalMarketData {
  country: string;
  exchange: string;
  performance: number;
  volume: number;
  position: [number, number, number];
  color: string;
  marketCap?: number;
  isOpen?: boolean;
  timezone?: string;
  currency?: string;
  lastUpdated?: string;
}

// Major global market indices and their details
const GLOBAL_MARKETS = [
  // US Markets
  { symbol: 'IXIC.INDX', country: 'USA', exchange: 'NASDAQ', lat: 37.4, lng: -122.1, marketCap: 22000000000000, timezone: 'PST', currency: 'USD' },
  { symbol: 'DJI.INDX', country: 'USA', exchange: 'NYSE', lat: 40.7, lng: -74.0, marketCap: 25000000000000, timezone: 'EST', currency: 'USD' },
  
  // European Markets
  { symbol: 'FTSE.INDX', country: 'UK', exchange: 'LSE', lat: 51.5, lng: -0.1, marketCap: 4000000000000, timezone: 'GMT', currency: 'GBP' },
  { symbol: 'GDAXI.INDX', country: 'Germany', exchange: 'DAX', lat: 50.1, lng: 8.7, marketCap: 2000000000000, timezone: 'CET', currency: 'EUR' },
  { symbol: 'FCHI.INDX', country: 'France', exchange: 'CAC 40', lat: 48.9, lng: 2.3, marketCap: 2800000000000, timezone: 'CET', currency: 'EUR' },
  
  // Asian Markets
  { symbol: 'N225.INDX', country: 'Japan', exchange: 'Nikkei', lat: 35.7, lng: 139.7, marketCap: 6000000000000, timezone: 'JST', currency: 'JPY' },
  { symbol: 'HSI.INDX', country: 'Hong Kong', exchange: 'HKEX', lat: 22.3, lng: 114.2, marketCap: 5000000000000, timezone: 'HKT', currency: 'HKD' },
  { symbol: 'KS11.INDX', country: 'South Korea', exchange: 'KOSPI', lat: 37.6, lng: 126.9, marketCap: 1600000000000, timezone: 'KST', currency: 'KRW' },
  
  // Indian Markets (Priority)
  { symbol: 'NSEI.INDX', country: 'India', exchange: 'NSE', lat: 19.1, lng: 72.9, marketCap: 3500000000000, timezone: 'IST', currency: 'INR' },
  { symbol: 'BSE.INDX', country: 'India', exchange: 'BSE', lat: 18.9, lng: 72.8, marketCap: 3200000000000, timezone: 'IST', currency: 'INR' },
  
  // Other Major Markets
  { symbol: 'GSPTSE.INDX', country: 'Canada', exchange: 'TSX', lat: 43.7, lng: -79.4, marketCap: 2500000000000, timezone: 'EST', currency: 'CAD' },
  { symbol: 'AXJO.INDX', country: 'Australia', exchange: 'ASX', lat: -33.9, lng: 151.2, marketCap: 1800000000000, timezone: 'AEST', currency: 'AUD' },
  { symbol: 'BVSP.INDX', country: 'Brazil', exchange: 'B3', lat: -23.5, lng: -46.6, marketCap: 1200000000000, timezone: 'BRT', currency: 'BRL' },
];

// Check if market is currently open based on timezone
function isMarketOpen(timezone: string): boolean {
  const now = new Date();
  const marketTime = new Date(now.toLocaleString("en-US", { timeZone: getTimezoneString(timezone) }));
  const hours = marketTime.getHours();
  const day = marketTime.getDay();
  
  // Weekend check
  if (day === 0 || day === 6) return false;
  
  // Basic market hours (9 AM - 4 PM local time)
  return hours >= 9 && hours < 16;
}

function getTimezoneString(timezone: string): string {
  const timezoneMap: { [key: string]: string } = {
    'EST': 'America/New_York',
    'PST': 'America/Los_Angeles',
    'GMT': 'Europe/London',
    'CET': 'Europe/Berlin',
    'JST': 'Asia/Tokyo',
    'IST': 'Asia/Kolkata',
    'HKT': 'Asia/Hong_Kong',
    'KST': 'Asia/Seoul',
    'AEST': 'Australia/Sydney',
    'BRT': 'America/Sao_Paulo',
    'CST': 'Asia/Shanghai'
  };
  return timezoneMap[timezone] || 'UTC';
}

// Convert lat/lng to 3D sphere coordinates
function convertToSphereCoordinates(lat: number, lng: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const radius = 1.08;

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

// Fetch real market data from EODHD API
async function fetchMarketData(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `${EODHD_BASE_URL}/real-time/${symbol}?api_token=${EODHD_API_KEY}&fmt=json`,
      {
        headers: {
          'User-Agent': 'StockAnalysisPlatform/1.0'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch data for ${symbol}:`, error);
    return null;
  }
}

// Generate mock data for fallback
function generateMockMarketData(market: any): GlobalMarketData {
  const basePerformance = (Math.random() - 0.5) * 6; // -3% to +3%
  const volume = Math.floor(Math.random() * 2000000000) + 500000000;
  const position = convertToSphereCoordinates(market.lat, market.lng);
  
  return {
    country: market.country,
    exchange: market.exchange,
    performance: basePerformance,
    volume,
    position,
    color: basePerformance > 0 ? '#10b981' : basePerformance < 0 ? '#ef4444' : '#6b7280',
    marketCap: market.marketCap,
    isOpen: isMarketOpen(market.timezone),
    timezone: market.timezone,
    currency: market.currency,
    lastUpdated: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching global market data...');
    
    const markets: GlobalMarketData[] = [];
    let realDataCount = 0;
    let mockDataCount = 0;

    // Try to fetch real data for each market
    const fetchPromises = GLOBAL_MARKETS.map(async (market) => {
      try {
        const marketData = await fetchMarketData(market.symbol);
        
        if (marketData && marketData.close) {
          realDataCount++;
          const change = marketData.change || 0;
          const changePercent = marketData.change_p || 0;
          const position = convertToSphereCoordinates(market.lat, market.lng);
          
          return {
            country: market.country,
            exchange: market.exchange,
            performance: changePercent,
            volume: marketData.volume || Math.floor(Math.random() * 2000000000) + 500000000,
            position,
            color: changePercent > 0 ? '#10b981' : changePercent < 0 ? '#ef4444' : '#6b7280',
            marketCap: market.marketCap,
            isOpen: isMarketOpen(market.timezone),
            timezone: market.timezone,
            currency: market.currency,
            lastUpdated: new Date(marketData.timestamp * 1000).toISOString()
          };
        } else {
          throw new Error('Invalid market data');
        }
      } catch (error) {
        console.warn(`Using mock data for ${market.exchange}:`, error);
        mockDataCount++;
        return generateMockMarketData(market);
      }
    });

    const results = await Promise.all(fetchPromises);
    markets.push(...results.filter(Boolean));

    console.log(`✅ Successfully fetched ${markets.length} global markets (${realDataCount} real, ${mockDataCount} mock)`);

    return NextResponse.json({
      success: true,
      markets,
      total: markets.length,
      source: realDataCount > 0 ? 'EODHD API with fallback' : 'Mock data only',
      realDataCount,
      mockDataCount,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in global markets API:', error);
    
    // Complete fallback to mock data
    const mockMarkets = GLOBAL_MARKETS.map(generateMockMarketData);
    
    return NextResponse.json({
      success: true,
      markets: mockMarkets,
      total: mockMarkets.length,
      source: 'Mock data (API fallback)',
      lastUpdated: new Date().toISOString(),
      fallback: true
    });
  }
}
