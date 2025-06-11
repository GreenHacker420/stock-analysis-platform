'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { formatINR } from '@/lib/currencyUtils';
import * as THREE from 'three';

interface PortfolioData {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  sector: string;
}

interface Portfolio3DChartProps {
  data: PortfolioData[];
  totalValue: number;
  className?: string;
}

function DonutSegment({ 
  data, 
  index, 
  totalSegments, 
  onHover, 
  isHovered,
  isDark 
}: {
  data: PortfolioData;
  index: number;
  totalSegments: number;
  onHover: (data: PortfolioData | null) => void;
  isHovered: boolean;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { startAngle, endAngle } = useMemo(() => {
    const anglePerSegment = (Math.PI * 2) / totalSegments;
    return {
      startAngle: index * anglePerSegment,
      endAngle: (index + 1) * anglePerSegment
    };
  }, [index, totalSegments]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      if (isHovered || hovered) {
        meshRef.current.scale.setScalar(1.1);
        meshRef.current.position.y = 0.2;
      } else {
        meshRef.current.scale.setScalar(1);
        meshRef.current.position.y = 0;
      }
    }
  });

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const innerRadius = 1;
    const outerRadius = 2;
    
    // Create donut segment
    shape.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
    shape.lineTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
    shape.arc(0, 0, outerRadius, startAngle, endAngle, false);
    shape.lineTo(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius);
    shape.arc(0, 0, innerRadius, endAngle, startAngle, true);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 8
    });
  }, [startAngle, endAngle]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
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
      <meshStandardMaterial 
        color={data.color}
        metalness={0.3}
        roughness={0.4}
        emissive={isHovered || hovered ? data.color : '#000000'}
        emissiveIntensity={isHovered || hovered ? 0.2 : 0}
      />
      
      {(isHovered || hovered) && (
        <Html position={[0, 1, 0]} center>
          <div className={`px-3 py-2 rounded-lg shadow-lg ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } border backdrop-blur-sm`}>
            <div className="text-sm font-semibold">{data.symbol}</div>
            <div className="text-xs text-gray-500">{data.name}</div>
            <div className="text-sm">{formatINR(data.value, { compact: true })}</div>
            <div className="text-xs">{data.percentage.toFixed(1)}%</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function Scene({ data, isDark }: { data: PortfolioData[]; isDark: boolean }) {
  const [hoveredData, setHoveredData] = useState<PortfolioData | null>(null);

  return (
    <>
      <ambientLight intensity={isDark ? 0.3 : 0.5} />
      <pointLight position={[10, 10, 10]} intensity={isDark ? 0.8 : 1} />
      <pointLight position={[-10, -10, -10]} intensity={isDark ? 0.4 : 0.6} />
      
      {data.map((item, index) => (
        <DonutSegment
          key={item.symbol}
          data={item}
          index={index}
          totalSegments={data.length}
          onHover={setHoveredData}
          isHovered={hoveredData?.symbol === item.symbol}
          isDark={isDark}
        />
      ))}
      
      {/* Center text */}
      <Text
        position={[0, 0, 0.5]}
        fontSize={0.3}
        color={isDark ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Portfolio
      </Text>
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        maxDistance={8}
        minDistance={3}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function Portfolio3DChart({ data, totalValue, className = '' }: Portfolio3DChartProps) {
  const { isDark } = useTheme();

  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      percentage: (item.value / totalValue) * 100,
      color: item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`
    }));
  }, [data, totalValue]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
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
            Portfolio Allocation
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Total Value: {formatINR(totalValue, { compact: true })}
          </p>
        </div>
        
        <div className="h-96 w-full">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ background: isDark ? '#1f2937' : '#f9fafb' }}
          >
            <Scene data={processedData} isDark={isDark} />
          </Canvas>
        </div>
        
        {/* Legend */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {processedData.map((item) => (
              <div key={item.symbol} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className={`text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {item.symbol} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
