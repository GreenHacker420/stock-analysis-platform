'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';

interface RiskLevel {
  level: string;
  description: string;
  percentage: number;
  value: number;
  color: string;
  riskScore: number; // 1-5 scale
}

interface RiskPyramidProps {
  data: RiskLevel[];
  totalValue: number;
  className?: string;
}

function PyramidLevel({ 
  data, 
  levelIndex, 
  totalLevels,
  onHover, 
  isHovered,
  isDark 
}: {
  data: RiskLevel;
  levelIndex: number;
  totalLevels: number;
  onHover: (data: RiskLevel | null) => void;
  isHovered: boolean;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { size, position } = useMemo(() => {
    const baseSize = 2;
    const levelHeight = 0.4;
    const sizeReduction = levelIndex * 0.3;
    const currentSize = baseSize - sizeReduction;
    
    return {
      size: currentSize,
      position: [0, levelIndex * levelHeight, 0] as [number, number, number]
    };
  }, [levelIndex]);

  useFrame((state) => {
    if (meshRef.current) {
      if (isHovered || hovered) {
        meshRef.current.scale.setScalar(1.1);
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      } else {
        meshRef.current.scale.setScalar(1);
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      }
    }
  });

  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      size * 0.8, // top radius
      size, // bottom radius
      0.3, // height
      8 // radial segments
    );
  }, [size]);

  return (
    <group position={position}>
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
          emissive={data.color}
          emissiveIntensity={isHovered || hovered ? 0.3 : 0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Risk level text */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.15}
        color={isDark ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
      >
        {data.level}
      </Text>
      
      {(isHovered || hovered) && (
        <Html position={[0, 0.5, 0]} center>
          <div className={`px-4 py-3 rounded-lg shadow-xl ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } border backdrop-blur-sm min-w-48`}>
            <div className="text-lg font-bold">{data.level}</div>
            <div className="text-sm text-gray-500 mb-2">{data.description}</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Allocation:</span>
                <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Value:</span>
                <span>${data.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Score:</span>
                <span className={`font-semibold ${
                  data.riskScore <= 2 ? 'text-green-500' :
                  data.riskScore <= 3 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {data.riskScore}/5
                </span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ data, isDark }: { data: RiskLevel[]; isDark: boolean }) {
  const [hoveredData, setHoveredData] = useState<RiskLevel | null>(null);

  return (
    <>
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDark ? 0.8 : 1}
        castShadow
      />
      <pointLight position={[-10, 10, -10]} intensity={isDark ? 0.5 : 0.7} />
      
      {/* Base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 16]} />
        <meshStandardMaterial 
          color={isDark ? '#374151' : '#e5e7eb'}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {data.map((level, index) => (
        <PyramidLevel
          key={level.level}
          data={level}
          levelIndex={index}
          totalLevels={data.length}
          onHover={setHoveredData}
          isHovered={hoveredData?.level === level.level}
          isDark={isDark}
        />
      ))}
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        maxDistance={8}
        minDistance={3}
        maxPolarAngle={Math.PI / 2}
        autoRotate={true}
        autoRotateSpeed={0.3}
      />
    </>
  );
}

export default function RiskPyramid({ data, totalValue, className = '' }: RiskPyramidProps) {
  const { isDark } = useTheme();

  const processedData = useMemo(() => {
    // Sort by risk score (lowest risk at bottom)
    return data
      .sort((a, b) => a.riskScore - b.riskScore)
      .map((item, index) => ({
        ...item,
        percentage: (item.value / totalValue) * 100,
        color: item.color || (() => {
          const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
          return colors[index % colors.length];
        })()
      }));
  }, [data, totalValue]);

  const riskStats = useMemo(() => {
    const lowRisk = processedData.filter(d => d.riskScore <= 2);
    const mediumRisk = processedData.filter(d => d.riskScore === 3);
    const highRisk = processedData.filter(d => d.riskScore >= 4);
    
    return {
      low: lowRisk.reduce((sum, d) => sum + d.percentage, 0),
      medium: mediumRisk.reduce((sum, d) => sum + d.percentage, 0),
      high: highRisk.reduce((sum, d) => sum + d.percentage, 0)
    };
  }, [processedData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
            Risk Assessment Pyramid
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Portfolio risk distribution by investment level
          </p>
        </div>
        
        <div className="h-96 w-full">
          <Canvas
            camera={{ position: [4, 4, 4], fov: 60 }}
            style={{ background: isDark ? '#111827' : '#f8fafc' }}
            shadows
          >
            <Scene data={processedData} isDark={isDark} />
          </Canvas>
        </div>
        
        {/* Risk distribution summary */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold text-green-500`}>
                {riskStats.low.toFixed(1)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Low Risk
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold text-yellow-500`}>
                {riskStats.medium.toFixed(1)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Medium Risk
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold text-red-500`}>
                {riskStats.high.toFixed(1)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                High Risk
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            {processedData.map((level) => (
              <div key={level.level} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {level.level}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {level.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
