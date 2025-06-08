'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  ArrowDownTrayIcon, 
  PhotoIcon, 
  DocumentIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

interface ChartExportProps {
  chartRef: React.RefObject<HTMLElement>;
  filename?: string;
  title?: string;
  className?: string;
}

interface ExportOptions {
  format: 'png' | 'pdf' | 'svg';
  quality: number;
  width: number;
  height: number;
  includeBackground: boolean;
  includeTitle: boolean;
}

export default function ChartExport({ 
  chartRef, 
  filename = 'chart', 
  title,
  className = '' 
}: ChartExportProps) {
  const { isDark } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 1,
    width: 1920,
    height: 1080,
    includeBackground: true,
    includeTitle: true
  });

  const exportChart = async (format: 'png' | 'pdf' | 'svg') => {
    if (!chartRef.current) return;

    setIsExporting(true);
    
    try {
      switch (format) {
        case 'png':
          await exportAsPNG();
          break;
        case 'pdf':
          await exportAsPDF();
          break;
        case 'svg':
          await exportAsSVG();
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPNG = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: exportOptions.includeBackground 
        ? (isDark ? '#111827' : '#ffffff') 
        : null,
      scale: exportOptions.quality,
      width: exportOptions.width,
      height: exportOptions.height,
      useCORS: true,
      allowTaint: true
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportAsPDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: exportOptions.includeBackground 
        ? (isDark ? '#111827' : '#ffffff') 
        : null,
      scale: exportOptions.quality,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    // Add title if enabled
    if (exportOptions.includeTitle && title) {
      pdf.setFontSize(16);
      pdf.text(title, 20, 30);
    }

    const yOffset = exportOptions.includeTitle && title ? 50 : 0;
    pdf.addImage(imgData, 'PNG', 0, yOffset, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  };

  const exportAsSVG = async () => {
    if (!chartRef.current) return;

    // Find SVG elements in the chart
    const svgElements = chartRef.current.querySelectorAll('svg');
    
    if (svgElements.length === 0) {
      console.warn('No SVG elements found for export');
      return;
    }

    // Clone the first SVG element
    const svgElement = svgElements[0];
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Set dimensions
    clonedSvg.setAttribute('width', exportOptions.width.toString());
    clonedSvg.setAttribute('height', exportOptions.height.toString());
    
    // Add background if enabled
    if (exportOptions.includeBackground) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', isDark ? '#111827' : '#ffffff');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);
    }

    // Add title if enabled
    if (exportOptions.includeTitle && title) {
      const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titleElement.setAttribute('x', '20');
      titleElement.setAttribute('y', '30');
      titleElement.setAttribute('font-size', '16');
      titleElement.setAttribute('font-weight', 'bold');
      titleElement.setAttribute('fill', isDark ? '#ffffff' : '#000000');
      titleElement.textContent = title;
      clonedSvg.appendChild(titleElement);
    }

    // Convert to string and create download
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    
    const link = document.createElement('a');
    link.download = `${filename}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Quick export buttons */}
        <button
          onClick={() => exportChart('png')}
          disabled={isExporting}
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-300'
          } disabled:cursor-not-allowed transition-colors`}
          title="Export as PNG"
        >
          <PhotoIcon className="w-4 h-4 mr-2" />
          PNG
        </button>

        <button
          onClick={() => exportChart('pdf')}
          disabled={isExporting}
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-300'
          } disabled:cursor-not-allowed transition-colors`}
          title="Export as PDF"
        >
          <DocumentIcon className="w-4 h-4 mr-2" />
          PDF
        </button>

        {/* Options toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            showOptions
              ? 'bg-blue-500 text-white'
              : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } transition-colors`}
          title="Export Options"
        >
          <Cog6ToothIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Export options panel */}
      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="p-4">
            <h4 className={`text-sm font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Export Options
            </h4>

            <div className="space-y-4">
              {/* Format selection */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Format
                </label>
                <div className="flex space-x-2">
                  {(['png', 'pdf', 'svg'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setExportOptions(prev => ({ ...prev, format }))}
                      className={`px-3 py-1 text-xs font-medium rounded uppercase ${
                        exportOptions.format === format
                          ? 'bg-blue-500 text-white'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality/Scale */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quality: {exportOptions.quality}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={exportOptions.quality}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    quality: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Width
                  </label>
                  <input
                    type="number"
                    value={exportOptions.width}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      width: parseInt(e.target.value) 
                    }))}
                    className={`w-full px-2 py-1 text-xs rounded border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Height
                  </label>
                  <input
                    type="number"
                    value={exportOptions.height}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      height: parseInt(e.target.value) 
                    }))}
                    className={`w-full px-2 py-1 text-xs rounded border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Options checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeBackground}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeBackground: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  <span className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Include background
                  </span>
                </label>

                {title && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTitle}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeTitle: e.target.checked 
                      }))}
                      className="mr-2"
                    />
                    <span className={`text-xs ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Include title
                    </span>
                  </label>
                )}
              </div>

              {/* Export button */}
              <button
                onClick={() => {
                  exportChart(exportOptions.format);
                  setShowOptions(false);
                }}
                disabled={isExporting}
                className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
                  isExporting
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } transition-colors`}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Export {exportOptions.format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
