'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';

interface MarketData {
  country: string;
  exchange: string;
  performance: number;
  volume: number;
  position: [number, number, number];
  color: string;
}

interface MarketGlobeProps {
  data: MarketData[];
  className?: string;
}

function MarketPoint({ 
  data, 
  onHover, 
  isHovered,
  isDark 
}: {
  data: MarketData;
  onHover: (data: MarketData | null) => void;
  isHovered: boolean;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const pointColor = useMemo(() => {
    if (data.performance > 0) return '#10b981'; // Green
    if (data.performance < 0) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  }, [data.performance]);

  const pointSize = useMemo(() => {
    return Math.max(0.02, Math.abs(data.performance) / 100);
  }, [data.performance]);

  useFrame((state) => {
    if (meshRef.current) {
      if (isHovered || hovered) {
        meshRef.current.scale.setScalar(2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
      
      // Pulsing animation for active markets
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      if (Math.abs(data.performance) > 2) {
        meshRef.current.scale.multiplyScalar(pulse);
      }
    }
  });

  return (
    <group position={data.position}>
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
        <sphereGeometry args={[pointSize, 8, 8]} />
        <meshStandardMaterial 
          color={pointColor}
          emissive={pointColor}
          emissiveIntensity={isHovered || hovered ? 0.5 : 0.2}
        />
      </mesh>
      
      {(isHovered || hovered) && (
        <Html position={[0, 0.1, 0]} center>
          <div className={`px-3 py-2 rounded-lg shadow-lg ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } border backdrop-blur-sm min-w-32`}>
            <div className="text-sm font-semibold">{data.country}</div>
            <div className="text-xs text-gray-500">{data.exchange}</div>
            <div className={`text-sm font-bold ${
              data.performance > 0 ? 'text-green-500' : 
              data.performance < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {data.performance > 0 ? '+' : ''}{data.performance.toFixed(2)}%
            </div>
            <div className="text-xs">
              Volume: {(data.volume / 1000000).toFixed(1)}M
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe({ isDark }: { isDark: boolean }) {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial 
        color={isDark ? '#1f2937' : '#3b82f6'}
        transparent
        opacity={0.3}
        wireframe={false}
      />
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.001, 32, 32]} />
        <meshBasicMaterial 
          color={isDark ? '#4b5563' : '#1e40af'}
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </mesh>
  );
}

function Scene({ data, isDark }: { data: MarketData[]; isDark: boolean }) {
  const [hoveredData, setHoveredData] = useState<MarketData | null>(null);

  return (
    <>
      <ambientLight intensity={isDark ? 0.3 : 0.5} />
      <pointLight position={[10, 10, 10]} intensity={isDark ? 0.8 : 1} />
      <pointLight position={[-10, -10, -10]} intensity={isDark ? 0.4 : 0.6} />
      
      <Globe isDark={isDark} />
      
      {data.map((market, index) => (
        <MarketPoint
          key={`${market.country}-${market.exchange}`}
          data={market}
          onHover={setHoveredData}
          isHovered={hoveredData?.exchange === market.exchange}
          isDark={isDark}
        />
      ))}
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        maxDistance={5}
        minDistance={2}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function MarketGlobe({ data, className = '' }: MarketGlobeProps) {
  const { isDark } = useTheme();

  // Sample market data with approximate globe positions
  const marketData = useMemo(() => {
    const markets = [
      { country: 'USA', exchange: 'NYSE', performance: 2.3, volume: 3200, lat: 40.7, lng: -74.0 },
      { country: 'USA', exchange: 'NASDAQ', performance: 1.8, volume: 2800, lat: 37.4, lng: -122.1 },
      { country: 'UK', exchange: 'LSE', performance: -0.5, volume: 1200, lat: 51.5, lng: -0.1 },
      { country: 'Japan', exchange: 'TSE', performance: 0.8, volume: 1800, lat: 35.7, lng: 139.7 },
      { country: 'Germany', exchange: 'DAX', performance: -1.2, volume: 900, lat: 50.1, lng: 8.7 },
      { country: 'China', exchange: 'SSE', performance: 3.1, volume: 2100, lat: 31.2, lng: 121.5 },
      { country: 'India', exchange: 'BSE', performance: 2.7, volume: 1500, lat: 19.1, lng: 72.9 },
      { country: 'Canada', exchange: 'TSX', performance: 1.1, volume: 800, lat: 43.7, lng: -79.4 },
      { country: 'Australia', exchange: 'ASX', performance: -0.3, volume: 600, lat: -33.9, lng: 151.2 },
      { country: 'Brazil', exchange: 'B3', performance: 1.9, volume: 700, lat: -23.5, lng: -46.6 },
    ];

    return markets.map(market => {
      // Convert lat/lng to 3D sphere coordinates
      const phi = (90 - market.lat) * (Math.PI / 180);
      const theta = (market.lng + 180) * (Math.PI / 180);
      const radius = 1.05;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return {
        country: market.country,
        exchange: market.exchange,
        performance: market.performance,
        volume: market.volume,
        position: [x, y, z] as [number, number, number],
        color: market.performance > 0 ? '#10b981' : market.performance < 0 ? '#ef4444' : '#6b7280'
      };
    });
  }, []);

  const stats = useMemo(() => {
    const positive = marketData.filter(m => m.performance > 0).length;
    const negative = marketData.filter(m => m.performance < 0).length;
    const avgPerformance = marketData.reduce((sum, m) => sum + m.performance, 0) / marketData.length;
    
    return { positive, negative, avgPerformance };
  }, [marketData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
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
            Global Market Performance
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Interactive 3D view of worldwide stock exchanges
          </p>
        </div>
        
        <div className="h-96 w-full">
          <Canvas
            camera={{ position: [0, 0, 3], fov: 60 }}
            style={{ background: isDark ? '#0f172a' : '#f1f5f9' }}
          >
            <Scene data={marketData} isDark={isDark} />
          </Canvas>
        </div>
        
        {/* Global stats */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold text-green-500`}>
                {stats.positive}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Markets Up
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold text-red-500`}>
                {stats.negative}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Markets Down
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                stats.avgPerformance > 0 ? 'text-green-500' : 
                stats.avgPerformance < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {stats.avgPerformance > 0 ? '+' : ''}{stats.avgPerformance.toFixed(2)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Global Avg
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
