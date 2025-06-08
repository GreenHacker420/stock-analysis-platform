'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';
import { extent, scaleLinear } from 'd3';

interface ScatterDataPoint {
  symbol: string;
  name: string;
  risk: number; // x-axis (0-100)
  return: number; // y-axis (percentage)
  marketCap: number; // z-axis (size/depth)
  sector: string;
  color: string;
}

interface ScatterPlot3DProps {
  data: ScatterDataPoint[];
  className?: string;
}

function DataPoint({ 
  data, 
  position,
  onHover, 
  isHovered,
  isDark 
}: {
  data: ScatterDataPoint;
  position: [number, number, number];
  onHover: (data: ScatterDataPoint | null) => void;
  isHovered: boolean;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const pointSize = useMemo(() => {
    // Size based on market cap (logarithmic scale)
    return Math.max(0.05, Math.log(data.marketCap / 1000000) / 20);
  }, [data.marketCap]);

  useFrame((state) => {
    if (meshRef.current) {
      if (isHovered || hovered) {
        meshRef.current.scale.setScalar(2);
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      } else {
        meshRef.current.scale.setScalar(1);
        meshRef.current.position.y = position[1];
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(data);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
      >
        <sphereGeometry args={[pointSize, 16, 16]} />
        <meshStandardMaterial 
          color={data.color}
          emissive={data.color}
          emissiveIntensity={isHovered || hovered ? 0.4 : 0.1}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {(isHovered || hovered) && (
        <>
          {/* Connection line to base */}
          <Line
            points={[[0, 0, 0], [0, -position[1] - 2, 0]]}
            color={data.color}
            lineWidth={2}
            dashed
          />
          
          <Html position={[0, pointSize + 0.3, 0]} center>
            <div className={`px-3 py-2 rounded-lg shadow-xl ${
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } border backdrop-blur-sm min-w-48`}>
              <div className="text-sm font-bold">{data.symbol}</div>
              <div className="text-xs text-gray-500 mb-1">{data.name}</div>
              <div className="text-xs text-gray-500 mb-2">{data.sector}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Risk Score:</span>
                  <span className="font-medium">{data.risk.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Return:</span>
                  <span className={`font-medium ${
                    data.return > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {data.return > 0 ? '+' : ''}{data.return.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Market Cap:</span>
                  <span className="font-medium">
                    ${(data.marketCap / 1000000000).toFixed(1)}B
                  </span>
                </div>
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

function Axes({ isDark }: { isDark: boolean }) {
  const axisColor = isDark ? '#6b7280' : '#9ca3af';
  
  return (
    <group>
      {/* X-axis (Risk) */}
      <Line
        points={[[-3, -2, 0], [3, -2, 0]]}
        color={axisColor}
        lineWidth={2}
      />
      <Text
        position={[3.5, -2, 0]}
        fontSize={0.15}
        color={isDark ? '#ffffff' : '#000000'}
        anchorX="left"
        anchorY="middle"
      >
        Risk →
      </Text>
      
      {/* Y-axis (Return) */}
      <Line
        points={[[-3, -2, 0], [-3, 2, 0]]}
        color={axisColor}
        lineWidth={2}
      />
      <Text
        position={[-3, 2.5, 0]}
        fontSize={0.15}
        color={isDark ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="bottom"
      >
        Return →
      </Text>
      
      {/* Z-axis (Market Cap) */}
      <Line
        points={[[-3, -2, 0], [-3, -2, 3]]}
        color={axisColor}
        lineWidth={2}
      />
      <Text
        position={[-3, -2, 3.5]}
        fontSize={0.15}
        color={isDark ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
      >
        Market Cap →
      </Text>
      
      {/* Grid lines */}
      {[-1, 0, 1].map(i => (
        <group key={i}>
          <Line
            points={[[-3, -2 + i, 0], [3, -2 + i, 0]]}
            color={axisColor}
            lineWidth={0.5}
            transparent
            opacity={0.3}
          />
          <Line
            points={[[-3 + i, -2, 0], [-3 + i, 2, 0]]}
            color={axisColor}
            lineWidth={0.5}
            transparent
            opacity={0.3}
          />
        </group>
      ))}
    </group>
  );
}

function Scene({ data, isDark }: { data: ScatterDataPoint[]; isDark: boolean }) {
  const [hoveredData, setHoveredData] = useState<ScatterDataPoint | null>(null);

  const positions = useMemo(() => {
    const riskExtent = extent(data, d => d.risk) as [number, number];
    const returnExtent = extent(data, d => d.return) as [number, number];
    const marketCapExtent = extent(data, d => d.marketCap) as [number, number];

    const riskScale = scaleLinear().domain(riskExtent).range([-3, 3]);
    const returnScale = scaleLinear().domain(returnExtent).range([-2, 2]);
    const marketCapScale = scaleLinear().domain(marketCapExtent).range([0, 3]);

    return data.map(d => [
      riskScale(d.risk),
      returnScale(d.return),
      marketCapScale(d.marketCap)
    ] as [number, number, number]);
  }, [data]);

  return (
    <>
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDark ? 0.8 : 1}
      />
      <pointLight position={[-10, 10, -10]} intensity={isDark ? 0.5 : 0.7} />
      
      <Axes isDark={isDark} />
      
      {data.map((point, index) => (
        <DataPoint
          key={point.symbol}
          data={point}
          position={positions[index]}
          onHover={setHoveredData}
          isHovered={hoveredData?.symbol === point.symbol}
          isDark={isDark}
        />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        maxDistance={12}
        minDistance={4}
      />
    </>
  );
}

export default function ScatterPlot3D({ data, className = '' }: ScatterPlot3DProps) {
  const { isDark } = useTheme();

  const processedData = useMemo(() => {
    const sectors = [...new Set(data.map(d => d.sector))];
    const sectorColors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];

    return data.map(item => ({
      ...item,
      color: item.color || sectorColors[sectors.indexOf(item.sector) % sectorColors.length]
    }));
  }, [data]);

  const stats = useMemo(() => {
    const avgRisk = data.reduce((sum, d) => sum + d.risk, 0) / data.length;
    const avgReturn = data.reduce((sum, d) => sum + d.return, 0) / data.length;
    const totalMarketCap = data.reduce((sum, d) => sum + d.marketCap, 0);
    
    return { avgRisk, avgReturn, totalMarketCap };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
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
            Risk vs Return vs Market Cap
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            3D scatter plot showing the relationship between risk, return, and market capitalization
          </p>
        </div>
        
        <div className="h-96 w-full">
          <Canvas
            camera={{ position: [6, 4, 6], fov: 60 }}
            style={{ background: isDark ? '#0f172a' : '#f8fafc' }}
          >
            <Scene data={processedData} isDark={isDark} />
          </Canvas>
        </div>
        
        {/* Statistics */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.avgRisk.toFixed(1)}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Risk Score
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                stats.avgReturn > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {stats.avgReturn > 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Return
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${(stats.totalMarketCap / 1000000000).toFixed(1)}B
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Market Cap
              </div>
            </div>
          </div>
        </div>
        
        {/* Sector legend */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
            {[...new Set(processedData.map(d => d.sector))].map((sector, index) => {
              const sectorData = processedData.find(d => d.sector === sector);
              return (
                <div key={sector} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sectorData?.color }}
                  />
                  <span className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {sector}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
