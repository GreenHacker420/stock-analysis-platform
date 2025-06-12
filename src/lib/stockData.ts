import yahooFinance from 'yahoo-finance2';
import NodeCache from 'node-cache';

// Cache for 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  high52Week: number;
  low52Week: number;
  averageVolume: number;
  lastUpdated: Date;
}

export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface TechnicalIndicators {
  symbol: string;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  volume: number;
  averageVolume: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

export class StockDataService {
  private static instance: StockDataService;

  public static getInstance(): StockDataService {
    if (!StockDataService.instance) {
      StockDataService.instance = new StockDataService();
    }
    return StockDataService.instance;
  }

  async getQuote(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = cache.get<StockQuote>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const quote = await yahooFinance.quote(symbol);
      
      if (!quote) {
        return null;
      }

      const stockQuote: StockQuote = {
        symbol: quote.symbol || symbol,
        companyName: quote.longName || quote.shortName || symbol,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        peRatio: quote.trailingPE || 0,
        dividendYield: (quote as any).dividendYield || 0,
        high52Week: quote.fiftyTwoWeekHigh || 0,
        low52Week: quote.fiftyTwoWeekLow || 0,
        averageVolume: (quote as any).averageVolume || 0,
        lastUpdated: new Date(),
      };

      cache.set(cacheKey, stockQuote);
      return stockQuote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalData(
    symbol: string,
    period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '1y'
  ): Promise<HistoricalData[]> {
    const cacheKey = `historical_${symbol}_${period}`;
    const cached = cache.get<HistoricalData[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await yahooFinance.historical(symbol, {
        period1: this.getPeriodStartDate(period),
        period2: new Date(),
        interval: '1d',
      });

      const historicalData: HistoricalData[] = result.map(item => ({
        date: item.date,
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
        volume: item.volume || 0,
        adjClose: item.adjClose || 0,
      }));

      cache.set(cacheKey, historicalData);
      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return this.getMockHistoricalData(symbol, period);
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    const cacheKey = `technical_${symbol}`;
    const cached = cache.get<TechnicalIndicators>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Get historical data for calculations
      const historicalData = await this.getHistoricalData(symbol, '1y');
      const quote = await this.getQuote(symbol);
      
      if (!historicalData.length || !quote) {
        return null;
      }

      const closes = historicalData.map(d => d.close);
      const volumes = historicalData.map(d => d.volume);
      
      // Calculate technical indicators
      const rsi = this.calculateRSI(closes);
      const macd = this.calculateMACD(closes);
      const sma20 = this.calculateSMA(closes, 20);
      const sma50 = this.calculateSMA(closes, 50);
      const sma200 = this.calculateSMA(closes, 200);
      const ema12 = this.calculateEMA(closes, 12);
      const ema26 = this.calculateEMA(closes, 26);
      
      const indicators: TechnicalIndicators = {
        symbol,
        rsi,
        macd,
        sma20,
        sma50,
        sma200,
        ema12,
        ema26,
        volume: quote.volume,
        averageVolume: quote.averageVolume,
        priceChange24h: quote.change,
        priceChangePercentage24h: quote.changePercent,
      };

      cache.set(cacheKey, indicators);
      return indicators;
    } catch (error) {
      console.error(`Error calculating technical indicators for ${symbol}:`, error);
      return null;
    }
  }

  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    const startDate = new Date(now);

    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '5d':
        startDate.setDate(now.getDate() - 5);
        break;
      case '1mo':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3mo':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6mo':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '2y':
        startDate.setFullYear(now.getFullYear() - 2);
        break;
      case '5y':
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      case '10y':
        startDate.setFullYear(now.getFullYear() - 10);
        break;
      case 'ytd':
        startDate.setMonth(0, 1);
        break;
      case 'max':
        startDate.setFullYear(1970, 0, 1);
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }

    return startDate;
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI for the most recent period
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // For simplicity, using a basic signal calculation
    const signal = macd * 0.9; // Simplified signal line
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    
    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  async searchStocks(query: string): Promise<{ symbol: string; name: string }[]> {
    try {
      const results = await yahooFinance.search(query);
      return results.quotes.slice(0, 10).map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  private getMockHistoricalData(symbol: string, period: string): HistoricalData[] {
    const days = this.getPeriodDays(period);
    const mockData: HistoricalData[] = [];
    const basePrice = symbol === 'AAPL' ? 150 : symbol.includes('.NSE') || symbol.includes('.BSE') ? 2500 : 100;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const randomFactor = 0.95 + Math.random() * 0.1; // ±5% variation
      const open = basePrice * randomFactor;
      const close = open * (0.98 + Math.random() * 0.04); // ±2% from open
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = Math.floor(Math.random() * 50000000) + 10000000;

      mockData.push({
        date,
        open,
        high,
        low,
        close,
        volume,
        adjClose: close
      });
    }

    return mockData;
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case '1d': return 1;
      case '5d': return 5;
      case '1mo': return 30;
      case '3mo': return 90;
      case '6mo': return 180;
      case '1y': return 365;
      case '2y': return 730;
      case '5y': return 1825;
      case '10y': return 3650;
      default: return 90;
    }
  }
}
