'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as d3 from 'd3';

interface CorrelationData {
  stock1: string;
  stock2: string;
  correlation: number;
  pValue?: number;
  significance?: 'high' | 'medium' | 'low';
}

interface CorrelationMatrixProps {
  data: CorrelationData[];
  stocks: string[];
  title?: string;
  className?: string;
  height?: number;
  showSignificance?: boolean;
}

export default function CorrelationMatrix({
  data,
  stocks,
  title = "Stock Correlation Matrix",
  className = '',
  height = 500,
  showSignificance = true
}: CorrelationMatrixProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [selectedCell, setSelectedCell] = useState<CorrelationData | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'strong' | 'moderate'>('all');

  // Create correlation matrix from data
  const correlationMatrix = useMemo(() => {
    const matrix: { [key: string]: { [key: string]: CorrelationData } } = {};
    
    stocks.forEach(stock1 => {
      matrix[stock1] = {};
      stocks.forEach(stock2 => {
        if (stock1 === stock2) {
          matrix[stock1][stock2] = {
            stock1,
            stock2,
            correlation: 1,
            significance: 'high'
          };
        } else {
          const found = data.find(d => 
            (d.stock1 === stock1 && d.stock2 === stock2) ||
            (d.stock1 === stock2 && d.stock2 === stock1)
          );
          matrix[stock1][stock2] = found || {
            stock1,
            stock2,
            correlation: 0,
            significance: 'low'
          };
        }
      });
    });
    
    return matrix;
  }, [data, stocks]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const absCorr = Math.abs(d.correlation);
      switch (filterLevel) {
        case 'strong':
          return absCorr >= 0.7;
        case 'moderate':
          return absCorr >= 0.3;
        default:
          return true;
      }
    });
  }, [data, filterLevel]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !stocks.length) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 80, right: 80, bottom: 80, left: 80 };
    const width = container.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const cellSize = Math.min(width, chartHeight) / stocks.length;

    // Scales
    const xScale = d3.scaleBand()
      .domain(stocks)
      .range([0, stocks.length * cellSize])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(stocks)
      .range([0, stocks.length * cellSize])
      .padding(0.05);

    // Color scale for correlation
    const colorScale = d3.scaleSequential()
      .domain([-1, 1])
      .interpolator(d3.interpolateRdBu);

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create cells
    const cells = g.selectAll(".cell")
      .data(stocks.flatMap(stock1 => 
        stocks.map(stock2 => correlationMatrix[stock1][stock2])
      ))
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", d => `translate(${xScale(d.stock1)},${yScale(d.stock2)})`);

    // Cell rectangles
    cells.append("rect")
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.correlation))
      .attr("stroke", isDark ? "#374151" : "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .style("cursor", "pointer")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 20)
      .style("opacity", d => {
        if (filterLevel === 'all') return 1;
        const absCorr = Math.abs(d.correlation);
        if (filterLevel === 'strong' && absCorr < 0.7) return 0.3;
        if (filterLevel === 'moderate' && absCorr < 0.3) return 0.3;
        return 1;
      })
      .on("end", function() {
        d3.select(this.parentNode as any)
          .on("mouseover", function(event, d) {
            d3.select(this).select("rect")
              .transition()
              .duration(200)
              .attr("stroke-width", 3)
              .attr("stroke", "#fbbf24");
            
            setSelectedCell(d as CorrelationData);
          })
          .on("mouseout", function() {
            d3.select(this).select("rect")
              .transition()
              .duration(200)
              .attr("stroke-width", 1)
              .attr("stroke", isDark ? "#374151" : "#e5e7eb");
            
            setSelectedCell(null);
          });
      });

    // Cell text (correlation values)
    cells.append("text")
      .attr("x", xScale.bandwidth() / 2)
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", d => {
        const brightness = d3.hsl(colorScale(d.correlation)).l;
        return brightness > 0.6 ? "#000000" : "#ffffff";
      })
      .style("font-size", `${Math.min(xScale.bandwidth(), yScale.bandwidth()) / 6}px`)
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => d.correlation.toFixed(2))
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 20 + 500)
      .style("opacity", 1);

    // Significance indicators
    if (showSignificance) {
      cells.append("circle")
        .attr("cx", xScale.bandwidth() - 8)
        .attr("cy", 8)
        .attr("r", 3)
        .attr("fill", d => {
          switch (d.significance) {
            case 'high': return "#10b981";
            case 'medium': return "#f59e0b";
            case 'low': return "#ef4444";
            default: return "#6b7280";
          }
        })
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 20 + 800)
        .style("opacity", d => d.significance !== 'low' ? 1 : 0.5);
    }

    // X-axis labels
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${stocks.length * cellSize + 10})`)
      .selectAll("text")
      .data(stocks)
      .enter().append("text")
      .attr("x", d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr("y", 0)
      .attr("dy", "0.71em")
      .attr("text-anchor", "middle")
      .style("fill", isDark ? "#d1d5db" : "#374151")
      .style("font-size", "11px")
      .style("font-weight", "500")
      .text(d => d)
      .attr("transform", d => `rotate(-45, ${(xScale(d) || 0) + xScale.bandwidth() / 2}, 0)`);

    // Y-axis labels
    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(-10,0)")
      .selectAll("text")
      .data(stocks)
      .enter().append("text")
      .attr("x", 0)
      .attr("y", d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("fill", isDark ? "#d1d5db" : "#374151")
      .style("font-size", "11px")
      .style("font-weight", "500")
      .text(d => d);

    // Color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left + stocks.length * cellSize + 20},${margin.top + 20})`);

    const legendScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"));

    // Legend gradient
    const legendGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "correlation-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    const numStops = 20;
    for (let i = 0; i <= numStops; i++) {
      const value = -1 + (2 * i / numStops);
      legendGradient.append("stop")
        .attr("offset", `${(i / numStops) * 100}%`)
        .attr("stop-color", colorScale(value));
    }

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#correlation-gradient)")
      .attr("stroke", isDark ? "#374151" : "#d1d5db");

    legend.append("g")
      .attr("transform", `translate(0,${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("fill", isDark ? "#d1d5db" : "#374151")
      .style("font-size", "10px");

    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("fill", isDark ? "#d1d5db" : "#374151")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Correlation");

    // Significance legend
    if (showSignificance) {
      const sigLegend = legend.append("g")
        .attr("transform", `translate(0, ${legendHeight + 50})`);

      const sigData = [
        { level: 'high', color: '#10b981', label: 'High Significance' },
        { level: 'medium', color: '#f59e0b', label: 'Medium Significance' },
        { level: 'low', color: '#ef4444', label: 'Low Significance' }
      ];

      sigData.forEach((d, i) => {
        const item = sigLegend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);

        item.append("circle")
          .attr("cx", 6)
          .attr("cy", 0)
          .attr("r", 4)
          .attr("fill", d.color);

        item.append("text")
          .attr("x", 15)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .style("fill", isDark ? "#d1d5db" : "#374151")
          .style("font-size", "10px")
          .text(d.label);
      });
    }

  }, [correlationMatrix, stocks, isDark, height, showSignificance, filterLevel]);

  const correlationStats = useMemo(() => {
    const correlations = data.map(d => d.correlation).filter(c => c !== 1);
    const strongPositive = correlations.filter(c => c >= 0.7).length;
    const strongNegative = correlations.filter(c => c <= -0.7).length;
    const avgCorrelation = correlations.reduce((sum, c) => sum + c, 0) / correlations.length;
    
    return { strongPositive, strongNegative, avgCorrelation };
  }, [data]);

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
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Correlation matrix showing relationships between stocks
              </p>
            </div>
            
            {/* Filter controls */}
            <div className="flex space-x-2">
              {(['all', 'moderate', 'strong'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={`px-3 py-1 text-xs font-medium rounded capitalize ${
                    filterLevel === level
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all' ? 'All' : `${level} (${level === 'strong' ? '≥0.7' : '≥0.3'})`}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div ref={containerRef} className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height={height}
            className="overflow-visible"
          />
          
          {/* Selected cell tooltip */}
          {selectedCell && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute top-4 left-4 px-4 py-3 rounded-lg shadow-lg ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } border backdrop-blur-sm z-10 min-w-48`}
            >
              <div className="text-sm font-semibold mb-2">
                {selectedCell.stock1} vs {selectedCell.stock2}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Correlation:</span>
                  <span className={`font-bold ${
                    selectedCell.correlation > 0.7 ? 'text-green-500' :
                    selectedCell.correlation < -0.7 ? 'text-red-500' :
                    Math.abs(selectedCell.correlation) > 0.3 ? 'text-yellow-500' : 'text-gray-500'
                  }`}>
                    {selectedCell.correlation.toFixed(3)}
                  </span>
                </div>
                {selectedCell.pValue && (
                  <div className="flex justify-between">
                    <span>P-value:</span>
                    <span className="font-medium">{selectedCell.pValue.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Strength:</span>
                  <span className="font-medium">
                    {Math.abs(selectedCell.correlation) > 0.7 ? 'Strong' :
                     Math.abs(selectedCell.correlation) > 0.3 ? 'Moderate' : 'Weak'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Summary statistics */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold text-green-500`}>
                {correlationStats.strongPositive}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Strong Positive
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold text-red-500`}>
                {correlationStats.strongNegative}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Strong Negative
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {correlationStats.avgCorrelation.toFixed(3)}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Average
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
