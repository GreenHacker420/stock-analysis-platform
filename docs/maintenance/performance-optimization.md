# Performance Optimization Guide

Comprehensive guide for optimizing the performance of the Stock Analysis Platform across all layers of the application.

## 🚀 Performance Overview

### Current Performance Metrics
- **Page Load Time**: < 2 seconds (target)
- **API Response Time**: < 500ms average
- **AI Analysis Time**: < 10 seconds
- **Database Query Time**: < 100ms
- **Time to Interactive**: < 3 seconds

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Real User Monitoring**: Vercel Analytics
- **Synthetic Monitoring**: Lighthouse CI
- **API Monitoring**: Response time and error rate tracking

## 🎯 Frontend Performance Optimization

### 1. Next.js Optimizations

#### Image Optimization
```typescript
// Use Next.js Image component for automatic optimization
import Image from 'next/image';

export function StockLogo({ symbol, alt }: { symbol: string; alt: string }) {
  return (
    <Image
      src={`/logos/${symbol}.png`}
      alt={alt}
      width={32}
      height={32}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
}
```

#### Code Splitting and Lazy Loading
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const Chart3D = dynamic(() => import('@/components/charts/Chart3D'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Disable SSR for client-only components
});

const AIAnalysisModal = dynamic(() => import('@/components/analysis/AIAnalysisModal'), {
  loading: () => <ModalSkeleton />
});
```

#### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false
      };
    }
    
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        charts: {
          test: /[\\/]node_modules[\\/](chart\.js|d3|three)[\\/]/,
          name: 'charts',
          chunks: 'all'
        }
      }
    };
    
    return config;
  }
};
```

### 2. React Performance Optimizations

#### Component Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const PortfolioChart = memo(({ data, options }: ChartProps) => {
  const chartData = useMemo(() => {
    return processChartData(data);
  }, [data]);

  const handleChartClick = useCallback((event: ChartEvent) => {
    // Handle chart interactions
  }, []);

  return <Chart data={chartData} onClick={handleChartClick} />;
});

// Memoize expensive calculations
export function usePortfolioMetrics(portfolio: Portfolio) {
  return useMemo(() => {
    return {
      totalValue: calculateTotalValue(portfolio.holdings),
      gainLoss: calculateGainLoss(portfolio.holdings),
      riskScore: calculateRiskScore(portfolio.holdings)
    };
  }, [portfolio.holdings]);
}
```

#### Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList as List } from 'react-window';

export function StockList({ stocks }: { stocks: Stock[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <StockRow stock={stocks[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={stocks.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### 3. CSS and Styling Optimizations

#### Tailwind CSS Optimization
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Only include used utilities
    }
  },
  plugins: [],
  // Enable JIT mode for faster builds
  mode: 'jit',
  // Purge unused styles
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,ts,jsx,tsx}']
  }
};
```

#### Critical CSS Inlining
```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); }
            .chart-container { min-height: 400px; }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 🔧 Backend Performance Optimization

### 1. API Route Optimizations

#### Response Caching
```typescript
// lib/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    cache.set(key, data, ttl);
    return data;
  });
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const cacheKey = `stocks:indian:${Date.now() - (Date.now() % 300000)}`;
  
  const stocks = await withCache(cacheKey, async () => {
    return await fetchIndianStocks();
  }, 300); // 5 minutes

  return NextResponse.json({ stocks });
}
```

#### Request Optimization
```typescript
// Batch API requests
export async function batchStockQuotes(symbols: string[]) {
  const chunks = chunkArray(symbols, 10); // Process in chunks of 10
  
  const results = await Promise.allSettled(
    chunks.map(chunk => 
      Promise.all(chunk.map(symbol => fetchStockQuote(symbol)))
    )
  );

  return results.flatMap(result => 
    result.status === 'fulfilled' ? result.value : []
  );
}

// Parallel processing with concurrency limit
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent requests

export async function fetchMultipleStocks(symbols: string[]) {
  return Promise.all(
    symbols.map(symbol => 
      limit(() => fetchStockData(symbol))
    )
  );
}
```

### 2. Database Performance Optimization

#### Query Optimization
```typescript
// Efficient aggregation pipelines
export async function getPortfolioPerformance(userId: string) {
  return await Portfolio.aggregate([
    { $match: { investorId: new ObjectId(userId) } },
    {
      $lookup: {
        from: 'stocks',
        localField: 'holdings.symbol',
        foreignField: 'symbol',
        as: 'stockData'
      }
    },
    {
      $project: {
        name: 1,
        totalValue: 1,
        performanceMetrics: 1,
        holdingsCount: { $size: '$holdings' }
      }
    }
  ]);
}

// Use lean() for read-only queries
export async function getPortfolioSummary(portfolioId: string) {
  return await Portfolio
    .findById(portfolioId)
    .select('name totalValue totalGainLoss performanceMetrics')
    .lean(); // Returns plain JavaScript objects
}
```

#### Index Optimization
```typescript
// Create compound indexes for common queries
PortfolioSchema.index({ investorId: 1, isActive: 1 });
PortfolioSchema.index({ 'holdings.symbol': 1 });
AnalysisReportSchema.index({ portfolioId: 1, createdAt: -1 });
UserSchema.index({ email: 1 }, { unique: true });

// Use sparse indexes for optional fields
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
```

#### Connection Pool Optimization
```typescript
// lib/mongodb.ts
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
};
```

### 3. External API Optimization

#### Request Batching and Caching
```typescript
// lib/stockService.ts
class StockService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getStockQuote(symbol: string) {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const data = await this.fetchStockQuote(symbol);
    this.cache.set(symbol, { data, timestamp: Date.now() });
    return data;
  }

  async batchGetQuotes(symbols: string[]) {
    const uncachedSymbols = symbols.filter(symbol => {
      const cached = this.cache.get(symbol);
      return !cached || Date.now() - cached.timestamp >= this.CACHE_TTL;
    });

    if (uncachedSymbols.length > 0) {
      const freshData = await this.fetchMultipleQuotes(uncachedSymbols);
      freshData.forEach(quote => {
        this.cache.set(quote.symbol, { data: quote, timestamp: Date.now() });
      });
    }

    return symbols.map(symbol => this.cache.get(symbol)?.data);
  }
}
```

## 📊 3D Graphics Performance

### 1. Three.js Optimizations

#### Geometry and Material Optimization
```typescript
// Reuse geometries and materials
const geometryCache = new Map<string, THREE.BufferGeometry>();
const materialCache = new Map<string, THREE.Material>();

export function createOptimizedMesh(type: string, color: string) {
  let geometry = geometryCache.get(type);
  if (!geometry) {
    geometry = new THREE.BoxGeometry(1, 1, 1);
    geometryCache.set(type, geometry);
  }

  let material = materialCache.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color });
    materialCache.set(color, material);
  }

  return new THREE.Mesh(geometry, material);
}

// Use instanced rendering for multiple similar objects
export function createInstancedPortfolioChart(holdings: Holding[]) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial();
  
  const instancedMesh = new THREE.InstancedMesh(geometry, material, holdings.length);
  
  holdings.forEach((holding, index) => {
    const matrix = new THREE.Matrix4();
    matrix.setPosition(index * 2, holding.value / 1000, 0);
    instancedMesh.setMatrixAt(index, matrix);
  });
  
  return instancedMesh;
}
```

#### Level of Detail (LOD)
```typescript
// Implement LOD for complex 3D scenes
export function createLODPortfolioVisualization() {
  const lod = new THREE.LOD();
  
  // High detail (close view)
  const highDetail = createDetailedPortfolioMesh();
  lod.addLevel(highDetail, 0);
  
  // Medium detail
  const mediumDetail = createMediumDetailMesh();
  lod.addLevel(mediumDetail, 50);
  
  // Low detail (far view)
  const lowDetail = createSimpleMesh();
  lod.addLevel(lowDetail, 100);
  
  return lod;
}
```

### 2. Chart Performance

#### Canvas Optimization
```typescript
// Use canvas for better performance with large datasets
export function HighPerformanceChart({ data }: { data: ChartData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use requestAnimationFrame for smooth animations
    let animationId: number;
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawChart(ctx, data);
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, [data]);
  
  return <canvas ref={canvasRef} width={800} height={400} />;
}
```

## 🔍 Performance Monitoring

### 1. Real User Monitoring

#### Web Vitals Tracking
```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function trackWebVitals() {
  getCLS(metric => sendToAnalytics('CLS', metric));
  getFID(metric => sendToAnalytics('FID', metric));
  getFCP(metric => sendToAnalytics('FCP', metric));
  getLCP(metric => sendToAnalytics('LCP', metric));
  getTTFB(metric => sendToAnalytics('TTFB', metric));
}

function sendToAnalytics(name: string, metric: any) {
  // Send to your analytics service
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta
    });
  }
}
```

#### Performance API Usage
```typescript
// Monitor API performance
export function measureAPIPerformance(apiName: string, fn: () => Promise<any>) {
  return async function(...args: any[]) {
    const start = performance.now();
    
    try {
      const result = await fn.apply(this, args);
      const duration = performance.now() - start;
      
      // Log performance metrics
      console.log(`API ${apiName} took ${duration.toFixed(2)}ms`);
      
      // Send to monitoring service
      sendMetric(`api.${apiName}.duration`, duration);
      sendMetric(`api.${apiName}.success`, 1);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      sendMetric(`api.${apiName}.duration`, duration);
      sendMetric(`api.${apiName}.error`, 1);
      throw error;
    }
  };
}
```

### 2. Performance Budgets

#### Bundle Size Monitoring
```javascript
// webpack-bundle-analyzer configuration
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html'
        })
      );
    }
    return config;
  }
};
```

#### Performance Budgets
```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2mb",
      "maximumError": "5mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "6kb"
    }
  ]
}
```

## 🚀 Optimization Strategies

### 1. Progressive Enhancement
- Load critical features first
- Lazy load secondary features
- Graceful degradation for older browsers
- Progressive image loading

### 2. Resource Optimization
- Compress images and assets
- Use WebP format where supported
- Implement service worker for caching
- Optimize font loading

### 3. Network Optimization
- Use CDN for static assets
- Implement HTTP/2 server push
- Optimize API payload sizes
- Use compression (gzip/brotli)

---

This performance optimization guide provides comprehensive strategies to ensure the Stock Analysis Platform delivers excellent user experience with fast load times and smooth interactions.
