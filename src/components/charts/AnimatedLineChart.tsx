'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as d3 from 'd3';

interface DataPoint {
  date: Date;
  value: number;
  volume?: number;
}

interface LineData {
  name: string;
  data: DataPoint[];
  color: string;
  strokeWidth?: number;
  fillGradient?: boolean;
}

interface AnimatedLineChartProps {
  lines: LineData[];
  title: string;
  yAxisLabel?: string;
  className?: string;
  height?: number;
  showVolume?: boolean;
  animationDuration?: number;
}

export default function AnimatedLineChart({
  lines,
  title,
  yAxisLabel,
  className = '',
  height = 400,
  showVolume = false,
  animationDuration = 2000
}: AnimatedLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !lines.length) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const mainHeight = showVolume ? chartHeight * 0.7 : chartHeight;
    const volumeHeight = showVolume ? chartHeight * 0.3 : 0;

    // Combine all data points to get overall extents
    const allData = lines.flatMap(line => line.data);
    const xExtent = d3.extent(allData, d => d.date) as [Date, Date];
    const yExtent = d3.extent(allData, d => d.value) as [number, number];
    const volumeExtent = showVolume ? d3.extent(allData, d => d.volume || 0) as [number, number] : [0, 0];

    // Scales
    const xScale = d3.scaleTime()
      .domain(xExtent)
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .nice()
      .range([mainHeight, 0]);

    const volumeScale = showVolume ? d3.scaleLinear()
      .domain(volumeExtent)
      .range([mainHeight + volumeHeight, mainHeight + 20]) : null;

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create gradients
    const defs = svg.append("defs");
    lines.forEach((line, index) => {
      if (line.fillGradient) {
        const gradient = defs.append("linearGradient")
          .attr("id", `gradient-${index}`)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0).attr("y1", 0)
          .attr("x2", 0).attr("y2", mainHeight);

        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", line.color)
          .attr("stop-opacity", 0.8);

        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", line.color)
          .attr("stop-opacity", 0.1);
      }
    });

    // Line generator
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Area generator for gradient fill
    const areaGenerator = d3.area<DataPoint>()
      .x(d => xScale(d.date))
      .y0(mainHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw lines
    lines.forEach((line, index) => {
      const lineGroup = g.append("g")
        .attr("class", `line-group-${index}`)
        .style("opacity", hoveredLine && hoveredLine !== line.name ? 0.3 : 1);

      // Draw gradient fill if enabled
      if (line.fillGradient) {
        lineGroup.append("path")
          .datum(line.data)
          .attr("fill", `url(#gradient-${index})`)
          .attr("d", areaGenerator);
      }

      // Draw line
      const path = lineGroup.append("path")
        .datum(line.data)
        .attr("fill", "none")
        .attr("stroke", line.color)
        .attr("stroke-width", line.strokeWidth || 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", lineGenerator);

      // Animate line drawing
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(animationDuration)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          if (index === lines.length - 1) {
            setAnimationProgress(1);
          }
        });

      // Add data points
      lineGroup.selectAll(".dot")
        .data(line.data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 0)
        .attr("fill", line.color)
        .attr("stroke", isDark ? "#1f2937" : "#ffffff")
        .attr("stroke-width", 2)
        .transition()
        .delay((d, i) => (i / line.data.length) * animationDuration)
        .duration(200)
        .attr("r", 3);
    });

    // Volume bars if enabled
    if (showVolume && volumeScale) {
      const volumeData = allData.filter(d => d.volume);
      g.selectAll(".volume-bar")
        .data(volumeData)
        .enter().append("rect")
        .attr("class", "volume-bar")
        .attr("x", d => xScale(d.date) - 1)
        .attr("y", d => volumeScale(d.volume || 0))
        .attr("width", 2)
        .attr("height", 0)
        .attr("fill", isDark ? "#4b5563" : "#9ca3af")
        .attr("opacity", 0.6)
        .transition()
        .delay((d, i) => (i / volumeData.length) * animationDuration * 0.5)
        .duration(300)
        .attr("height", d => mainHeight + volumeHeight - volumeScale(d.volume || 0));
    }

    // Axes
    const xAxis = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${mainHeight + volumeHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d") as any));

    const yAxis = g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    // Style axes
    [xAxis, yAxis].forEach(axis => {
      axis.selectAll("text")
        .style("fill", isDark ? "#d1d5db" : "#374151")
        .style("font-size", "12px");
      
      axis.selectAll("path, line")
        .style("stroke", isDark ? "#4b5563" : "#d1d5db");
    });

    // Y-axis label
    if (yAxisLabel) {
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (mainHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", isDark ? "#d1d5db" : "#374151")
        .style("font-size", "12px")
        .text(yAxisLabel);
    }

    // Legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 10}, 20)`);

    lines.forEach((line, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * 25})`)
        .style("cursor", "pointer")
        .on("mouseover", () => setHoveredLine(line.name))
        .on("mouseout", () => setHoveredLine(null));

      legendItem.append("line")
        .attr("x1", 0)
        .attr("x2", 15)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", line.color)
        .attr("stroke-width", line.strokeWidth || 2);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("fill", isDark ? "#d1d5db" : "#374151")
        .style("font-size", "12px")
        .text(line.name);
    });

    // Crosshair and tooltip
    const crosshair = g.append("g")
      .attr("class", "crosshair")
      .style("display", "none");

    const crosshairX = crosshair.append("line")
      .attr("class", "crosshair-x")
      .attr("y1", 0)
      .attr("y2", mainHeight + volumeHeight)
      .attr("stroke", isDark ? "#6b7280" : "#9ca3af")
      .attr("stroke-dasharray", "3,3");

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
        const [mouseX] = d3.pointer(event);
        const adjustedX = mouseX - margin.left;
        
        if (adjustedX >= 0 && adjustedX <= width) {
          crosshairX.attr("x1", adjustedX).attr("x2", adjustedX);
          
          const date = xScale.invert(adjustedX);
          
          // Find closest data points for each line
          const tooltipData = lines.map(line => {
            const bisect = d3.bisector((d: DataPoint) => d.date).left;
            const index = bisect(line.data, date, 1);
            const d0 = line.data[index - 1];
            const d1 = line.data[index];
            const d = d1 && (date.getTime() - d0?.date.getTime() > d1.date.getTime() - date.getTime()) ? d1 : d0;
            return { line: line.name, data: d, color: line.color };
          }).filter(d => d.data);

          if (tooltipData.length > 0) {
            const tooltipContent = `
              <div style="color: ${isDark ? '#f3f4f6' : '#111827'}">
                <div style="font-weight: bold; margin-bottom: 8px;">
                  ${tooltipData[0].data.date.toLocaleDateString()}
                </div>
                ${tooltipData.map(d => `
                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <div style="width: 12px; height: 12px; background-color: ${d.color}; border-radius: 50%; margin-right: 8px;"></div>
                    <span style="margin-right: 8px;">${d.line}:</span>
                    <span style="font-weight: bold;">$${d.data.value.toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
            `;

            tooltip.html(tooltipContent)
              .style("visibility", "visible")
              .style("left", `${mouseX + 10}px`)
              .style("top", `${event.offsetY - 10}px`);
          }
        }
      });

  }, [lines, isDark, height, showVolume, animationDuration, hoveredLine]);

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
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <div className="flex items-center space-x-4">
            <div className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Interactive line chart with smooth animations
            </div>
            {animationProgress < 1 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs text-blue-500">Animating...</span>
              </div>
            )}
          </div>
        </div>
        
        <div ref={containerRef} className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height={height}
            className="overflow-visible"
          />
        </div>
      </div>
    </motion.div>
  );
}
