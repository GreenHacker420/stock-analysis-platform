# 3D Visualizations & Advanced Charts Guide

This guide covers all the advanced 3D visualizations and interactive charts implemented in the Stock Analysis Platform.

## 🎨 3D Visualizations

### 1. Portfolio 3D Chart (`Portfolio3DChart.tsx`)
**Location**: `src/components/charts/3D/Portfolio3DChart.tsx`

**Features**:
- Interactive 3D donut chart showing portfolio allocation
- Hover effects with detailed tooltips
- Smooth animations and auto-rotation
- Glassmorphism design with theme support
- Real-time data updates

**Usage**:
```tsx
<Portfolio3DChart 
  data={portfolioData} 
  totalValue={200000}
  className="lg:col-span-1"
/>
```

**Data Format**:
```typescript
interface PortfolioData {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  sector: string;
}
```

### 2. Stock Performance Cubes (`StockPerformanceCubes.tsx`)
**Location**: `src/components/charts/3D/StockPerformanceCubes.tsx`

**Features**:
- 3D bar charts with cube representations
- Height based on performance magnitude
- Color coding (green=positive, red=negative)
- Floating animations and hover effects
- Grid layout with proper spacing

**Usage**:
```tsx
<StockPerformanceCubes 
  data={stockPerformanceData}
/>
```

### 3. Interactive Market Globe (`MarketGlobe.tsx`)
**Location**: `src/components/charts/3D/MarketGlobe.tsx`

**Features**:
- 3D globe with market data points
- Geographic positioning of exchanges
- Auto-rotation with orbit controls
- Performance indicators with color coding
- Global market statistics

**Usage**:
```tsx
<MarketGlobe 
  data={marketData}
/>
```

### 4. Risk Assessment Pyramid (`RiskPyramid.tsx`)
**Location**: `src/components/charts/3D/RiskPyramid.tsx`

**Features**:
- Multi-level 3D pyramid structure
- Risk-based layering (low to high)
- Interactive hover with detailed info
- Percentage distribution display
- Auto-rotation and scaling effects

**Usage**:
```tsx
<RiskPyramid 
  data={riskData}
  totalValue={200000}
/>
```

### 5. 3D Scatter Plot (`ScatterPlot3D.tsx`)
**Location**: `src/components/charts/3D/ScatterPlot3D.tsx`

**Features**:
- Three-dimensional data relationships
- Risk vs Return vs Market Cap visualization
- Sector-based color coding
- Interactive data points with tooltips
- Axis labels and grid lines

**Usage**:
```tsx
<ScatterPlot3D 
  data={scatterData}
/>
```

## 📊 Advanced 2D Charts

### 1. Candlestick Chart (`CandlestickChart.tsx`)
**Location**: `src/components/charts/CandlestickChart.tsx`

**Features**:
- Interactive candlestick visualization
- Technical indicators overlay (RSI, MACD, Bollinger Bands)
- Zoom and pan functionality
- Volume bars
- Crosshair with detailed tooltips
- Time range selection

**Usage**:
```tsx
<CandlestickChart
  data={candlestickData}
  indicators={technicalIndicators}
  symbol="AAPL"
  height={500}
/>
```

### 2. Animated Line Chart (`AnimatedLineChart.tsx`)
**Location**: `src/components/charts/AnimatedLineChart.tsx`

**Features**:
- Smooth line animations
- Gradient fills
- Multiple data series support
- Interactive legend
- Real-time data updates
- Crosshair and tooltips

**Usage**:
```tsx
<AnimatedLineChart
  lines={lineData}
  title="Portfolio Performance"
  yAxisLabel="Value ($)"
  showVolume={true}
/>
```

### 3. Heatmap Chart (`HeatmapChart.tsx`)
**Location**: `src/components/charts/HeatmapChart.tsx`

**Features**:
- Color-coded performance matrix
- Sector vs metric visualization
- Interactive cell selection
- Color scheme customization
- Statistical summaries

**Usage**:
```tsx
<HeatmapChart
  data={heatmapData}
  title="Sector Performance Heatmap"
  colorScheme="performance"
/>
```

### 4. Correlation Matrix (`CorrelationMatrix.tsx`)
**Location**: `src/components/charts/CorrelationMatrix.tsx`

**Features**:
- Stock correlation visualization
- Significance indicators
- Filter controls (all, moderate, strong)
- Interactive tooltips
- Statistical analysis

**Usage**:
```tsx
<CorrelationMatrix
  data={correlationData}
  stocks={['AAPL', 'MSFT', 'GOOGL', 'TSLA']}
  showSignificance={true}
/>
```

## 🛠 Utility Components

### 1. Chart Export (`ChartExport.tsx`)
**Location**: `src/components/charts/ChartExport.tsx`

**Features**:
- Export as PNG, PDF, or SVG
- Customizable export options
- Quality and dimension controls
- Background and title options

**Usage**:
```tsx
<ChartExport 
  chartRef={chartRef} 
  filename="dashboard" 
  title="Stock Analysis Dashboard"
/>
```

### 2. Theme Toggle (`ThemeToggle.tsx`)
**Location**: `src/components/ui/ThemeToggle.tsx`

**Features**:
- Smooth dark/light mode transition
- Animated toggle switch
- System preference detection
- Persistent theme storage

**Usage**:
```tsx
<ThemeToggle showLabel size="md" />
```

## 🎯 Theme System

### Theme Context (`ThemeContext.tsx`)
**Location**: `src/contexts/ThemeContext.tsx`

**Features**:
- Global theme state management
- Local storage persistence
- System preference detection
- Smooth transitions

**Usage**:
```tsx
const { theme, toggleTheme, isDark } = useTheme();
```

## 🚀 Performance Optimizations

### 1. 3D Rendering
- **React Three Fiber**: Efficient 3D rendering with React
- **Instanced Rendering**: For multiple similar objects
- **LOD (Level of Detail)**: Reduced complexity at distance
- **Frustum Culling**: Only render visible objects

### 2. Animation Performance
- **Framer Motion**: Hardware-accelerated animations
- **RequestAnimationFrame**: Smooth 60fps animations
- **Memoization**: Prevent unnecessary re-renders
- **Lazy Loading**: Load charts only when needed

### 3. Data Processing
- **Web Workers**: Heavy calculations off main thread
- **Debounced Updates**: Prevent excessive re-renders
- **Efficient Algorithms**: Optimized data transformations
- **Caching**: Store processed results

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile devices
- **Progressive Enhancement**: Add features for larger screens
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Interactions**: Mobile-friendly controls

### 3D Chart Adaptations
- **Reduced Complexity**: Fewer polygons on mobile
- **Touch Controls**: Pan, zoom, and rotate gestures
- **Simplified UI**: Streamlined interface elements
- **Performance Modes**: Automatic quality adjustment

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical navigation sequence
- **Focus Indicators**: Clear visual feedback
- **Keyboard Shortcuts**: Quick access to features
- **Screen Reader Support**: ARIA labels and descriptions

### Visual Accessibility
- **High Contrast**: Dark mode support
- **Color Blind Friendly**: Alternative visual cues
- **Scalable Text**: Respects user font preferences
- **Motion Preferences**: Reduced motion support

## 🔧 Customization Options

### Chart Theming
```typescript
const chartTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    background: isDark ? '#1f2937' : '#ffffff',
    text: isDark ? '#f3f4f6' : '#111827'
  },
  animations: {
    duration: 800,
    easing: 'easeInOut'
  }
};
```

### Export Settings
```typescript
const exportOptions = {
  format: 'png' | 'pdf' | 'svg',
  quality: 1-3,
  dimensions: { width: 1920, height: 1080 },
  includeBackground: true,
  includeTitle: true
};
```

## 🐛 Troubleshooting

### Common Issues

1. **3D Charts Not Rendering**
   - Check WebGL support in browser
   - Verify Three.js dependencies
   - Check console for errors

2. **Performance Issues**
   - Reduce data points for large datasets
   - Enable performance mode
   - Check browser hardware acceleration

3. **Export Failures**
   - Verify canvas support
   - Check file permissions
   - Ensure sufficient memory

### Browser Compatibility
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Limited WebGL features
- **Edge**: Full support
- **Mobile**: Reduced feature set

## 📈 Future Enhancements

### Planned Features
- **VR/AR Support**: Immersive data exploration
- **Real-time Collaboration**: Multi-user chart editing
- **AI-Powered Insights**: Automated pattern recognition
- **Advanced Animations**: Physics-based interactions
- **Custom Chart Builder**: Drag-and-drop interface

This comprehensive guide covers all aspects of the advanced visualization system. Each component is designed to be modular, performant, and accessible while providing stunning visual experiences for financial data analysis.
