'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as d3 from 'd3';

interface HeatmapData {
  sector: string;
  metric: string;
  value: number;
  displayValue?: string;
  description?: string;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  title: string;
  colorScheme?: 'performance' | 'risk' | 'volume';
  className?: string;
  height?: number;
}

export default function HeatmapChart({
  data,
  title,
  colorScheme = 'performance',
  className = '',
  height = 400
}: HeatmapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null);

  const colorSchemes = {
    performance: {
      positive: ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
      negative: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
      neutral: '#6b7280'
    },
    risk: {
      positive: ['#fef3c7', '#fde68a', '#fcd34d', '#f59e0b', '#d97706', '#b45309', '#92400e'],
      negative: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
      neutral: '#6b7280'
    },
    volume: {
      positive: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca'],
      negative: ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed'],
      neutral: '#6b7280'
    }
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.length) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 120, bottom: 60, left: 120 };
    const width = container.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Get unique sectors and metrics
    const sectors = [...new Set(data.map(d => d.sector))];
    const metrics = [...new Set(data.map(d => d.metric))];

    const cellWidth = width / metrics.length;
    const cellHeight = chartHeight / sectors.length;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(metrics)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(sectors)
      .range([0, chartHeight])
      .padding(0.05);

    // Color scale
    const valueExtent = d3.extent(data, d => d.value) as [number, number];
    const colorScale = d3.scaleSequential()
      .domain(valueExtent)
      .interpolator(d3.interpolateRdYlGn);

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create cells
    const cells = g.selectAll(".cell")
      .data(data)
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", d => `translate(${xScale(d.metric)},${yScale(d.sector)})`);

    // Cell rectangles
    cells.append("rect")
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => {
        if (d.value === 0) return colorSchemes[colorScheme].neutral;
        return colorScale(d.value);
      })
      .attr("stroke", isDark ? "#374151" : "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .style("opacity", 1)
      .on("end", function() {
        d3.select(this.parentNode as any)
          .on("mouseover", function(event, d) {
            d3.select(this).select("rect")
              .transition()
              .duration(200)
              .attr("stroke-width", 3)
              .attr("stroke", isDark ? "#60a5fa" : "#3b82f6");
            
            setSelectedCell(d as HeatmapData);
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

    // Cell text
    cells.append("text")
      .attr("x", xScale.bandwidth() / 2)
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", d => {
        const brightness = d3.hsl(colorScale(d.value)).l;
        return brightness > 0.6 ? "#000000" : "#ffffff";
      })
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => d.displayValue || d.value.toFixed(1))
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50 + 400)
      .style("opacity", 1);

    // X-axis labels
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight + 10})`)
      .selectAll("text")
      .data(metrics)
      .enter().append("text")
      .attr("x", d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr("y", 0)
      .attr("dy", "0.71em")
      .attr("text-anchor", "middle")
      .style("fill", isDark ? "#d1d5db" : "#374151")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(d => d)
      .each(function(d) {
        const text = d3.select(this);
        const words = d.split(/\s+/);
        if (words.length > 1) {
          text.text(null);
          words.forEach((word, i) => {
            text.append("tspan")
              .attr("x", (xScale(d) || 0) + xScale.bandwidth() / 2)
              .attr("dy", i === 0 ? "0.71em" : "1.2em")
              .text(word);
          });
        }
      });

    // Y-axis labels
    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(-10,0)")
      .selectAll("text")
      .data(sectors)
      .enter().append("text")
      .attr("x", 0)
      .attr("y", d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("fill", isDark ? "#d1d5db" : "#374151")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(d => d);

    // Color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + margin.left + 20},${margin.top + 20})`);

    const legendScale = d3.scaleLinear()
      .domain(valueExtent)
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"));

    // Legend gradient
    const legendGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const value = valueExtent[0] + (valueExtent[1] - valueExtent[0]) * (i / numStops);
      legendGradient.append("stop")
        .attr("offset", `${(i / numStops) * 100}%`)
        .attr("stop-color", colorScale(value));
    }

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#legend-gradient)")
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
      .text("Value Scale");

  }, [data, isDark, height, colorScheme]);

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
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Interactive sector performance heatmap
              </p>
            </div>
            
            {/* Color scheme selector */}
            <div className="flex space-x-2">
              {(['performance', 'risk', 'volume'] as const).map(scheme => (
                <button
                  key={scheme}
                  onClick={() => {/* Color scheme change logic */}}
                  className={`px-3 py-1 text-xs font-medium rounded capitalize ${
                    colorScheme === scheme
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {scheme}
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
              className={`absolute top-4 left-4 px-3 py-2 rounded-lg shadow-lg ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } border backdrop-blur-sm z-10`}
            >
              <div className="text-sm font-semibold">{selectedCell.sector}</div>
              <div className="text-xs text-gray-500">{selectedCell.metric}</div>
              <div className="text-lg font-bold mt-1">
                {selectedCell.displayValue || selectedCell.value.toFixed(2)}
              </div>
              {selectedCell.description && (
                <div className="text-xs text-gray-600 mt-1">
                  {selectedCell.description}
                </div>
              )}
            </motion.div>
          )}
        </div>
        
        {/* Summary statistics */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold text-green-500`}>
                {data.filter(d => d.value > 0).length}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Positive
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold text-red-500`}>
                {data.filter(d => d.value < 0).length}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Negative
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(2)}
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
