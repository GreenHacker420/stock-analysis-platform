import { StockDataService } from '../stockData'
import yahooFinance from 'yahoo-finance2'
import NodeCache from 'node-cache'

// Mock yahoo-finance2
jest.mock('yahoo-finance2', () => ({
  quote: jest.fn(),
  historical: jest.fn(),
  search: jest.fn(),
}))

// Mock node-cache
jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }))
})

const mockedYahooFinance = yahooFinance as jest.Mocked<typeof yahooFinance>
const MockedNodeCache = NodeCache as jest.MockedClass<typeof NodeCache>

describe('StockDataService', () => {
  let stockService: StockDataService

  beforeEach(() => {
    stockService = StockDataService.getInstance()
    jest.clearAllMocks()
  })

  describe('getQuote', () => {
    it('should fetch stock quote successfully', async () => {
      const mockQuote = {
        symbol: 'AAPL',
        longName: 'Apple Inc.',
        regularMarketPrice: 150.0,
        regularMarketChange: 2.5,
        regularMarketChangePercent: 1.69,
        regularMarketVolume: 50000000,
        marketCap: 2500000000000,
        trailingPE: 25.5,
        dividendYield: 0.5,
        fiftyTwoWeekHigh: 180.0,
        fiftyTwoWeekLow: 120.0,
        averageVolume: 45000000,
      }

      mockedYahooFinance.quote.mockResolvedValue(mockQuote)

      const result = await stockService.getQuote('AAPL')

      expect(result).toEqual({
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        price: 150.0,
        change: 2.5,
        changePercent: 1.69,
        volume: 50000000,
        marketCap: 2500000000000,
        peRatio: 25.5,
        dividendYield: 0.5,
        high52Week: 180.0,
        low52Week: 120.0,
        averageVolume: 45000000,
        lastUpdated: expect.any(Date),
      })
    })

    it('should return null for invalid symbol', async () => {
      mockedYahooFinance.quote.mockResolvedValue(null)

      const result = await stockService.getQuote('INVALID')

      expect(result).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      mockedYahooFinance.quote.mockRejectedValue(new Error('API Error'))

      const result = await stockService.getQuote('AAPL')

      expect(result).toBeNull()
    })
  })

  describe('getHistoricalData', () => {
    it('should fetch historical data successfully', async () => {
      const mockHistoricalData = [
        {
          date: new Date('2023-01-01'),
          open: 145.0,
          high: 150.0,
          low: 144.0,
          close: 148.0,
          volume: 40000000,
          adjClose: 148.0,
        },
        {
          date: new Date('2023-01-02'),
          open: 148.0,
          high: 152.0,
          low: 147.0,
          close: 151.0,
          volume: 42000000,
          adjClose: 151.0,
        },
      ]

      mockedYahooFinance.historical.mockResolvedValue(mockHistoricalData)

      const result = await stockService.getHistoricalData('AAPL', '1mo')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        date: new Date('2023-01-01'),
        open: 145.0,
        high: 150.0,
        low: 144.0,
        close: 148.0,
        volume: 40000000,
        adjClose: 148.0,
      })
    })

    it('should return empty array on error', async () => {
      mockedYahooFinance.historical.mockRejectedValue(new Error('API Error'))

      const result = await stockService.getHistoricalData('AAPL', '1mo')

      expect(result).toEqual([])
    })
  })

  describe('getTechnicalIndicators', () => {
    it('should calculate technical indicators', async () => {
      const mockHistoricalData = Array.from({ length: 50 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        open: 100 + Math.random() * 10,
        high: 105 + Math.random() * 10,
        low: 95 + Math.random() * 10,
        close: 100 + Math.random() * 10,
        volume: 1000000 + Math.random() * 500000,
        adjClose: 100 + Math.random() * 10,
      }))

      const mockQuote = {
        symbol: 'AAPL',
        longName: 'Apple Inc.',
        regularMarketPrice: 150.0,
        regularMarketChange: 2.5,
        regularMarketChangePercent: 1.69,
        regularMarketVolume: 50000000,
        averageVolume: 45000000,
      }

      mockedYahooFinance.historical.mockResolvedValue(mockHistoricalData)
      mockedYahooFinance.quote.mockResolvedValue(mockQuote)

      const result = await stockService.getTechnicalIndicators('AAPL')

      expect(result).toEqual({
        symbol: 'AAPL',
        rsi: expect.any(Number),
        macd: {
          macd: expect.any(Number),
          signal: expect.any(Number),
          histogram: expect.any(Number),
        },
        sma20: expect.any(Number),
        sma50: expect.any(Number),
        sma200: expect.any(Number),
        ema12: expect.any(Number),
        ema26: expect.any(Number),
        volume: 50000000,
        averageVolume: 45000000,
        priceChange24h: 2.5,
        priceChangePercentage24h: 1.69,
      })
    })
  })

  describe('searchStocks', () => {
    it('should search stocks successfully', async () => {
      const mockSearchResults = {
        quotes: [
          { symbol: 'AAPL', longname: 'Apple Inc.' },
          { symbol: 'MSFT', longname: 'Microsoft Corporation' },
        ],
      }

      mockedYahooFinance.search.mockResolvedValue(mockSearchResults)

      const result = await stockService.searchStocks('apple')

      expect(result).toEqual([
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corporation' },
      ])
    })

    it('should return empty array on search error', async () => {
      mockedYahooFinance.search.mockRejectedValue(new Error('Search Error'))

      const result = await stockService.searchStocks('apple')

      expect(result).toEqual([])
    })
  })
})


