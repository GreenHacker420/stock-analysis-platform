'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';

interface StockPerformanceData {
  symbol: string;
  name: string;
  performance: number; // percentage change
  volume: number;
  marketCap: number;
  price: number;
}

interface StockPerformanceCubesProps {
  data: StockPerformanceData[];
  className?: string;
}

function PerformanceCube({ 
  data, 
  position, 
  onHover, 
  isHovered,
  isDark 
}: {
  data: StockPerformanceData;
  position: [number, number, number];
  onHover: (data: StockPerformanceData | null) => void;
  isHovered: boolean;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const cubeHeight = useMemo(() => {
    return Math.max(0.1, Math.abs(data.performance) / 10);
  }, [data.performance]);

  const cubeColor = useMemo(() => {
    if (data.performance > 0) {
      return new THREE.Color(0x10b981); // Green for positive
    } else if (data.performance < 0) {
      return new THREE.Color(0xef4444); // Red for negative
    } else {
      return new THREE.Color(0x6b7280); // Gray for neutral
    }
  }, [data.performance]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      if (isHovered || hovered) {
        meshRef.current.scale.setScalar(1.2);
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      } else {
        meshRef.current.scale.setScalar(1);
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
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
        <boxGeometry args={[0.8, cubeHeight, 0.8]} />
        <meshStandardMaterial 
          color={cubeColor}
          metalness={0.4}
          roughness={0.3}
          emissive={cubeColor}
          emissiveIntensity={isHovered || hovered ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Stock symbol text */}
      <Text
        position={[0, -cubeHeight/2 - 0.3, 0]}
        fontSize={0.2}
        color={isDark ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        {data.symbol}
      </Text>
      
      {(isHovered || hovered) && (
        <Html position={[0, cubeHeight/2 + 0.5, 0]} center>
          <div className={`px-4 py-3 rounded-lg shadow-xl ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } border backdrop-blur-sm min-w-48`}>
            <div className="text-lg font-bold">{data.symbol}</div>
            <div className="text-sm text-gray-500 mb-2">{data.name}</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Performance:</span>
                <span className={`font-semibold ${
                  data.performance > 0 ? 'text-green-500' : 
                  data.performance < 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {data.performance > 0 ? '+' : ''}{data.performance.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span>${data.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Volume:</span>
                <span>{(data.volume / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span>Market Cap:</span>
                <span>${(data.marketCap / 1000000000).toFixed(1)}B</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ data, isDark }: { data: StockPerformanceData[]; isDark: boolean }) {
  const [hoveredData, setHoveredData] = useState<StockPerformanceData | null>(null);

  const positions = useMemo(() => {
    const gridSize = Math.ceil(Math.sqrt(data.length));
    const spacing = 2;
    const offset = (gridSize - 1) * spacing / 2;
    
    return data.map((_, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      return [
        col * spacing - offset,
        0,
        row * spacing - offset
      ] as [number, number, number];
    });
  }, [data]);

  return (
    <>
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDark ? 0.8 : 1}
        castShadow
      />
      <pointLight position={[-10, 10, -10]} intensity={isDark ? 0.5 : 0.7} />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color={isDark ? '#374151' : '#f3f4f6'}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {data.map((item, index) => (
        <PerformanceCube
          key={item.symbol}
          data={item}
          position={positions[index]}
          onHover={setHoveredData}
          isHovered={hoveredData?.symbol === item.symbol}
          isDark={isDark}
        />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        maxDistance={15}
        minDistance={5}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export default function StockPerformanceCubes({ data, className = '' }: StockPerformanceCubesProps) {
  const { isDark } = useTheme();

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
            Stock Performance 3D View
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Cube height represents performance magnitude. Green = positive, Red = negative.
          </p>
        </div>
        
        <div className="h-96 w-full relative overflow-hidden">
          <Canvas
            camera={{ position: [8, 8, 8], fov: 60 }}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e293b 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
            }}
            shadows
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
              failIfMajorPerformanceCaveat: false
            }}
            onCreated={({ gl }) => {
              // Handle WebGL context loss
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('WebGL context lost in StockPerformanceCubes. Attempting to restore...');
              });

              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored in StockPerformanceCubes.');
              });
            }}
          >
            <Scene data={data} isDark={isDark} />
          </Canvas>

          {/* Interactive controls overlay */}
          <div className="absolute top-2 left-2 space-y-1">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
            }`}>
              Drag to rotate
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
            }`}>
              Scroll to zoom
            </div>
          </div>
        </div>
        
        {/* Performance summary */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold text-green-500`}>
                {data.filter(d => d.performance > 0).length}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Positive
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold text-red-500`}>
                {data.filter(d => d.performance < 0).length}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Negative
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {data.filter(d => d.performance === 0).length}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Neutral
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
