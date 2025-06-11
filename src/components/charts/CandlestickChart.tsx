'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as d3 from 'd3';

interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicator {
  rsi?: number[];
  macd?: { line: number[]; signal: number[]; histogram: number[] };
  bollinger?: { upper: number[]; middle: number[]; lower: number[] };
  sma20?: number[];
  sma50?: number[];
}

interface CandlestickChartProps {
  data: CandlestickData[];
  indicators?: TechnicalIndicator;
  symbol: string;
  className?: string;
  height?: number;
}

export default function CandlestickChart({ 
  data, 
  indicators, 
  symbol, 
  className = '',
  height = 400 
}: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['sma20']);
  const [timeRange, setTimeRange] = useState('3M');
  const [isZoomed, setIsZoomed] = useState(false);

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1D':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(d => d.date >= startDate);
  }, [data, timeRange]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !filteredData.length) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 60, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const candleHeight = chartHeight * 0.7;
    const volumeHeight = chartHeight * 0.15;
    const indicatorHeight = chartHeight * 0.15;

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => Math.max(d.high, d.low)) as [number, number])
      .range([candleHeight, 0]);

    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.volume) as number])
      .range([candleHeight + volumeHeight, candleHeight]);

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        const { transform } = event;
        setIsZoomed(transform.k > 1);
        
        const newXScale = transform.rescaleX(xScale);
        
        // Update candlesticks
        g.selectAll(".candlestick")
          .attr("transform", d => `translate(${newXScale((d as CandlestickData).date)},0)`);
        
        // Update volume bars
        g.selectAll(".volume-bar")
          .attr("transform", d => `translate(${newXScale((d as CandlestickData).date)},0)`);
        
        // Update axes
        g.select(".x-axis").call(d3.axisBottom(newXScale) as any);
      });

    svg.call(zoom);

    // Candlesticks
    const candlesticks = g.selectAll(".candlestick")
      .data(filteredData)
      .enter().append("g")
      .attr("class", "candlestick")
      .attr("transform", d => `translate(${xScale(d.date)},0)`);

    // Wicks
    candlesticks.append("line")
      .attr("class", "wick")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", d => yScale(d.high))
      .attr("y2", d => yScale(d.low))
      .attr("stroke", isDark ? "#6b7280" : "#374151")
      .attr("stroke-width", 1);

    // Candle bodies
    candlesticks.append("rect")
      .attr("class", "candle-body")
      .attr("x", -3)
      .attr("y", d => yScale(Math.max(d.open, d.close)))
      .attr("width", 6)
      .attr("height", d => Math.abs(yScale(d.open) - yScale(d.close)) || 1)
      .attr("fill", d => d.close > d.open ? "#10b981" : "#ef4444")
      .attr("stroke", d => d.close > d.open ? "#059669" : "#dc2626")
      .attr("stroke-width", 1);

    // Volume bars
    const volumeBars = g.selectAll(".volume-bar")
      .data(filteredData)
      .enter().append("g")
      .attr("class", "volume-bar")
      .attr("transform", d => `translate(${xScale(d.date)},0)`);

    volumeBars.append("rect")
      .attr("x", -2)
      .attr("y", d => volumeScale(d.volume))
      .attr("width", 4)
      .attr("height", d => candleHeight + volumeHeight - volumeScale(d.volume))
      .attr("fill", d => d.close > d.open ? "#10b981" : "#ef4444")
      .attr("opacity", 0.6);

    // Technical indicators
    if (indicators && selectedIndicators.length > 0) {
      selectedIndicators.forEach(indicator => {
        switch (indicator) {
          case 'sma20':
            if (indicators.sma20) {
              const line = d3.line<number>()
                .x((d, i) => xScale(filteredData[i].date))
                .y(d => yScale(d))
                .curve(d3.curveMonotoneX);

              g.append("path")
                .datum(indicators.sma20)
                .attr("fill", "none")
                .attr("stroke", "#f59e0b")
                .attr("stroke-width", 2)
                .attr("d", line);
            }
            break;
          case 'sma50':
            if (indicators.sma50) {
              const line = d3.line<number>()
                .x((d, i) => xScale(filteredData[i].date))
                .y(d => yScale(d))
                .curve(d3.curveMonotoneX);

              g.append("path")
                .datum(indicators.sma50)
                .attr("fill", "none")
                .attr("stroke", "#8b5cf6")
                .attr("stroke-width", 2)
                .attr("d", line);
            }
            break;
          case 'bollinger':
            if (indicators.bollinger) {
              const line = d3.line<number>()
                .x((d, i) => xScale(filteredData[i].date))
                .y(d => yScale(d))
                .curve(d3.curveMonotoneX);

              // Upper band
              g.append("path")
                .datum(indicators.bollinger.upper)
                .attr("fill", "none")
                .attr("stroke", "#06b6d4")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "3,3")
                .attr("d", line);

              // Lower band
              g.append("path")
                .datum(indicators.bollinger.lower)
                .attr("fill", "none")
                .attr("stroke", "#06b6d4")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "3,3")
                .attr("d", line);

              // Middle band
              g.append("path")
                .datum(indicators.bollinger.middle)
                .attr("fill", "none")
                .attr("stroke", "#06b6d4")
                .attr("stroke-width", 2)
                .attr("d", line);
            }
            break;
        }
      });
    }

    // Axes
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${candleHeight + volumeHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("fill", isDark ? "#d1d5db" : "#374151");

    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("fill", isDark ? "#d1d5db" : "#374151");

    // Crosshair
    const crosshair = g.append("g")
      .attr("class", "crosshair")
      .style("display", "none");

    const crosshairX = crosshair.append("line")
      .attr("class", "crosshair-x")
      .attr("y1", 0)
      .attr("y2", candleHeight + volumeHeight)
      .attr("stroke", isDark ? "#6b7280" : "#9ca3af")
      .attr("stroke-dasharray", "3,3");

    const crosshairY = crosshair.append("line")
      .attr("class", "crosshair-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", isDark ? "#6b7280" : "#9ca3af")
      .attr("stroke-dasharray", "3,3");

    // Tooltip
    const tooltip = d3.select(container)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", isDark ? "#1f2937" : "#ffffff")
      .style("border", `1px solid ${isDark ? "#374151" : "#d1d5db"}`)
      .style("border-radius", "8px")
      .style("padding", "12px")
      .style("font-size", "12px")
      .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
      .style("z-index", "1000");

    // Mouse events
    svg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => crosshair.style("display", null))
      .on("mouseout", () => {
        crosshair.style("display", "none");
        tooltip.style("visibility", "hidden");
      })
      .on("mousemove", function(event) {
        const [mouseX, mouseY] = d3.pointer(event);
        const adjustedX = mouseX - margin.left;
        const adjustedY = mouseY - margin.top;
        
        if (adjustedX >= 0 && adjustedX <= width && adjustedY >= 0 && adjustedY <= candleHeight + volumeHeight) {
          crosshairX.attr("x1", adjustedX).attr("x2", adjustedX);
          crosshairY.attr("y1", adjustedY).attr("y2", adjustedY);
          
          const date = xScale.invert(adjustedX);
          const price = yScale.invert(adjustedY);
          
          // Find closest data point
          const bisect = d3.bisector((d: CandlestickData) => d.date).left;
          const index = bisect(filteredData, date, 1);
          const d0 = filteredData[index - 1];
          const d1 = filteredData[index];
          const d = d1 && (date.getTime() - d0.date.getTime() > d1.date.getTime() - date.getTime()) ? d1 : d0;
          
          if (d) {
            tooltip.html(`
              <div style="color: ${isDark ? '#f3f4f6' : '#111827'}">
                <div style="font-weight: bold; margin-bottom: 4px;">${symbol}</div>
                <div>Date: ${d.date.toLocaleDateString()}</div>
                <div>Open: $${d.open.toFixed(2)}</div>
                <div>High: $${d.high.toFixed(2)}</div>
                <div>Low: $${d.low.toFixed(2)}</div>
                <div>Close: $${d.close.toFixed(2)}</div>
                <div>Volume: ${(d.volume / 1000000).toFixed(1)}M</div>
              </div>
            `)
            .style("visibility", "visible")
            .style("left", `${mouseX + 10}px`)
            .style("top", `${mouseY - 10}px`);
          }
        }
      });

  }, [filteredData, indicators, selectedIndicators, isDark, height, symbol]);

  const timeRanges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
  const availableIndicators = [
    { key: 'sma20', label: 'SMA 20', color: '#f59e0b' },
    { key: 'sma50', label: 'SMA 50', color: '#8b5cf6' },
    { key: 'bollinger', label: 'Bollinger Bands', color: '#06b6d4' },
    { key: 'rsi', label: 'RSI', color: '#ef4444' },
    { key: 'macd', label: 'MACD', color: '#10b981' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative ${className}`}
    >
      <div className={`rounded-xl overflow-hidden backdrop-blur-sm border ${
        isDark 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        {/* Header with controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {symbol} Price Chart
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Interactive candlestick chart with technical indicators
              </p>
            </div>
            
            {/* Time range selector */}
            <div className="flex space-x-1">
              {timeRanges.map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Indicator toggles */}
          <div className="mt-3 flex flex-wrap gap-2">
            {availableIndicators.map(indicator => (
              <button
                key={indicator.key}
                onClick={() => {
                  setSelectedIndicators(prev => 
                    prev.includes(indicator.key)
                      ? prev.filter(i => i !== indicator.key)
                      : [...prev, indicator.key]
                  );
                }}
                className={`px-2 py-1 text-xs font-medium rounded flex items-center space-x-1 ${
                  selectedIndicators.includes(indicator.key)
                    ? 'bg-blue-500 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: indicator.color }}
                />
                <span>{indicator.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chart container */}
        <div ref={containerRef} className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height={height}
            className="overflow-visible"
          />
          
          {isZoomed && (
            <button
              onClick={() => {
                if (svgRef.current) {
                  const svg = d3.select(svgRef.current);
                  const zoom = d3.zoom<SVGSVGElement, unknown>();
                  (svg as any).call(zoom.transform, d3.zoomIdentity);
                  setIsZoomed(false);
                }
              }}
              className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reset Zoom
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
