'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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
  marketCap?: number;
  isOpen?: boolean;
  timezone?: string;
  currency?: string;
  lastUpdated?: string;
}

interface MarketGlobeProps {
  data?: MarketData[];
  className?: string;
  onMarketClick?: (market: MarketData) => void;
  showStats?: boolean;
  autoRotate?: boolean;
}

function MarketPoint({
  data,
  onHover,
  onClick,
  isHovered,
  isDark
}: {
  data: MarketData;
  onHover: (data: MarketData | null) => void;
  onClick?: (data: MarketData) => void;
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
    const baseSize = 0.015;
    const performanceMultiplier = Math.abs(data.performance) / 100;
    const marketCapMultiplier = data.marketCap ? Math.log10(data.marketCap / 1e9) / 30 : 0.05;
    return Math.min(0.07, Math.max(baseSize, baseSize + performanceMultiplier + marketCapMultiplier));
  }, [data.performance, data.marketCap]);

  useFrame((state) => {
    if (meshRef.current) {
      if (isHovered || hovered) {
        meshRef.current.scale.setScalar(2.5);
      } else {
        meshRef.current.scale.setScalar(1);
      }

      // Pulsing animation for active markets and market status
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      if (Math.abs(data.performance) > 2 || data.isOpen) {
        meshRef.current.scale.multiplyScalar(pulse);
      }

      // Gentle rotation for market points
      meshRef.current.rotation.y += 0.01;
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
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(data);
        }}
      >
        <sphereGeometry args={[pointSize, 12, 12]} />
        <meshStandardMaterial
          color={pointColor}
          emissive={pointColor}
          emissiveIntensity={isHovered || hovered ? 0.7 : data.isOpen ? 0.4 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Market status ring for open markets */}
      {data.isOpen && (
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[pointSize * 1.5, pointSize * 2, 16]} />
          <meshBasicMaterial
            color={pointColor}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {(isHovered || hovered) && (
        <Html position={[0, 0.15, 0]} center>
          <div className={`px-4 py-3 rounded-xl shadow-2xl ${
            isDark ? 'bg-gray-900/95 text-white border-gray-700' : 'bg-white/95 text-gray-900 border-gray-200'
          } border backdrop-blur-md min-w-48 max-w-64`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold">{data.country}</div>
              {data.isOpen && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  <span className="text-xs text-green-500">OPEN</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-2">{data.exchange}</div>
            <div className={`text-lg font-bold mb-1 ${
              data.performance > 0 ? 'text-green-500' :
              data.performance < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {data.performance > 0 ? '+' : ''}{data.performance.toFixed(2)}%
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Volume:</span>
                <div className="font-medium">
                  {data.volume > 1000000
                    ? `${(data.volume / 1000000).toFixed(1)}M`
                    : `${(data.volume / 1000).toFixed(0)}K`}
                </div>
              </div>
              {data.marketCap && (
                <div>
                  <span className="text-gray-500">Market Cap:</span>
                  <div className="font-medium">
                    {data.marketCap > 1000000000000
                      ? `$${(data.marketCap / 1000000000000).toFixed(1)}T`
                      : `$${(data.marketCap / 1000000000).toFixed(0)}B`}
                  </div>
                </div>
              )}
            </div>
            {data.currency && (
              <div className="text-xs text-gray-500 mt-2">
                Currency: {data.currency}
              </div>
            )}
            {data.lastUpdated && (
              <div className="text-xs text-gray-400 mt-1">
                Updated: {(() => {
                  try {
                    return new Date(data.lastUpdated).toLocaleTimeString();
                  } catch (e) {
                    return 'Recently';
                  }
                })()}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe({ isDark, autoRotate = true }: { isDark: boolean; autoRotate?: boolean }) {
  const globeRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += 0.003;
    }
    if (wireframeRef.current && autoRotate) {
      wireframeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Main globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          color={isDark ? '#1e293b' : '#3b82f6'}
          transparent
          opacity={0.4}
          wireframe={false}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireframeRef}>
        <sphereGeometry args={[1.002, 64, 64]} />
        <meshBasicMaterial
          color={isDark ? '#475569' : '#1e40af'}
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial
          color={isDark ? '#0f172a' : '#dbeafe'}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function Scene({
  data,
  isDark,
  onMarketClick,
  autoRotate = true
}: {
  data: MarketData[];
  isDark: boolean;
  onMarketClick?: (market: MarketData) => void;
  autoRotate?: boolean;
}) {
  const [hoveredData, setHoveredData] = useState<MarketData | null>(null);

  return (
    <>
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      <pointLight position={[10, 10, 10]} intensity={isDark ? 1.2 : 1.5} />
      <pointLight position={[-10, -10, -10]} intensity={isDark ? 0.6 : 0.8} />
      <pointLight position={[0, 10, 0]} intensity={isDark ? 0.4 : 0.6} />

      <Globe isDark={isDark} autoRotate={autoRotate} />

      {data.map((market, index) => (
        <MarketPoint
          key={`${market.country}-${market.exchange}-${index}`}
          data={market}
          onHover={setHoveredData}
          onClick={onMarketClick}
          isHovered={hoveredData?.exchange === market.exchange}
          isDark={isDark}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={6}
        minDistance={1.5}
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

export default function MarketGlobe({
  data,
  className = '',
  onMarketClick,
  showStats = true,
  autoRotate = true
}: MarketGlobeProps) {
  const { isDark } = useTheme();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced market data with more countries and better positioning
  const defaultMarketData = useMemo(() => {
    const markets = [
      // Major Global Markets
      { country: 'USA', exchange: 'NYSE', performance: 2.3, volume: 3200000000, lat: 40.7, lng: -74.0, marketCap: 25000000000000, isOpen: false, timezone: 'EST', currency: 'USD' },
      { country: 'USA', exchange: 'NASDAQ', performance: 1.8, volume: 2800000000, lat: 37.4, lng: -122.1, marketCap: 22000000000000, isOpen: false, timezone: 'PST', currency: 'USD' },
      { country: 'UK', exchange: 'LSE', performance: -0.5, volume: 1200000000, lat: 51.5, lng: -0.1, marketCap: 4000000000000, isOpen: false, timezone: 'GMT', currency: 'GBP' },
      { country: 'Japan', exchange: 'TSE', performance: 0.8, volume: 1800000000, lat: 35.7, lng: 139.7, marketCap: 6000000000000, isOpen: true, timezone: 'JST', currency: 'JPY' },
      { country: 'Germany', exchange: 'DAX', performance: -1.2, volume: 900000000, lat: 50.1, lng: 8.7, marketCap: 2000000000000, isOpen: false, timezone: 'CET', currency: 'EUR' },
      { country: 'China', exchange: 'SSE', performance: 3.1, volume: 2100000000, lat: 31.2, lng: 121.5, marketCap: 7000000000000, isOpen: true, timezone: 'CST', currency: 'CNY' },

      // Indian Markets (Prioritized)
      { country: 'India', exchange: 'NSE', performance: 2.7, volume: 1500000000, lat: 19.1, lng: 72.9, marketCap: 3500000000000, isOpen: true, timezone: 'IST', currency: 'INR' },
      { country: 'India', exchange: 'BSE', performance: 2.5, volume: 1200000000, lat: 18.9, lng: 72.8, marketCap: 3200000000000, isOpen: true, timezone: 'IST', currency: 'INR' },

      // Other Major Markets
      { country: 'Canada', exchange: 'TSX', performance: 1.1, volume: 800000000, lat: 43.7, lng: -79.4, marketCap: 2500000000000, isOpen: false, timezone: 'EST', currency: 'CAD' },
      { country: 'Australia', exchange: 'ASX', performance: -0.3, volume: 600000000, lat: -33.9, lng: 151.2, marketCap: 1800000000000, isOpen: true, timezone: 'AEST', currency: 'AUD' },
      { country: 'Brazil', exchange: 'B3', performance: 1.9, volume: 700000000, lat: -23.5, lng: -46.6, marketCap: 1200000000000, isOpen: false, timezone: 'BRT', currency: 'BRL' },
      { country: 'South Korea', exchange: 'KRX', performance: 0.6, volume: 500000000, lat: 37.6, lng: 126.9, marketCap: 1600000000000, isOpen: true, timezone: 'KST', currency: 'KRW' },
      { country: 'France', exchange: 'Euronext', performance: -0.8, volume: 400000000, lat: 48.9, lng: 2.3, marketCap: 2800000000000, isOpen: false, timezone: 'CET', currency: 'EUR' },
      { country: 'Hong Kong', exchange: 'HKEX', performance: 1.4, volume: 900000000, lat: 22.3, lng: 114.2, marketCap: 5000000000000, isOpen: true, timezone: 'HKT', currency: 'HKD' },
      { country: 'Switzerland', exchange: 'SIX', performance: 0.2, volume: 200000000, lat: 47.4, lng: 8.5, marketCap: 1500000000000, isOpen: false, timezone: 'CET', currency: 'CHF' },
      { country: 'Netherlands', exchange: 'AEX', performance: -0.4, volume: 300000000, lat: 52.4, lng: 4.9, marketCap: 1000000000000, isOpen: false, timezone: 'CET', currency: 'EUR' },
    ];

    return markets.map(market => {
      // Convert lat/lng to 3D sphere coordinates
      const phi = (90 - market.lat) * (Math.PI / 180);
      const theta = (market.lng + 180) * (Math.PI / 180);
      const radius = 1.08;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return {
        country: market.country,
        exchange: market.exchange,
        performance: market.performance,
        volume: market.volume,
        position: [x, y, z] as [number, number, number],
        color: market.performance > 0 ? '#10b981' : market.performance < 0 ? '#ef4444' : '#6b7280',
        marketCap: market.marketCap,
        isOpen: market.isOpen,
        timezone: market.timezone,
        currency: market.currency,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  // Fetch global market data or use provided data
  useEffect(() => {
    const fetchMarketData = async () => {
      if (data && data.length > 0) {
        setMarketData(data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API (we'll create this endpoint)
        const response = await fetch('/api/markets/global');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.markets) {
            setMarketData(result.markets);
          } else {
            throw new Error('Invalid API response');
          }
        } else {
          throw new Error('API request failed');
        }
      } catch (err) {
        console.warn('Failed to fetch global market data, using default data:', err);
        setError('Using default market data');
        setMarketData(defaultMarketData);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [data, defaultMarketData]);

  const stats = useMemo(() => {
    const positive = marketData.filter(m => m.performance > 0).length;
    const negative = marketData.filter(m => m.performance < 0).length;
    const avgPerformance = marketData.reduce((sum, m) => sum + m.performance, 0) / marketData.length;
    const openMarkets = marketData.filter(m => m.isOpen).length;

    return { positive, negative, avgPerformance, openMarkets };
  }, [marketData]);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
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
              Loading global market data...
            </p>
          </div>
          <div className="h-96 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Global Market Performance
            </h3>
            {error && (
              <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                Offline Mode
              </span>
            )}
          </div>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Interactive 3D view of worldwide stock exchanges
          </p>
        </div>

        <div className="h-96 w-full relative">
          <Canvas
            camera={{ position: [0, 0, 3], fov: 60 }}
            style={{ background: isDark ? '#0f172a' : '#f1f5f9' }}
          >
            <Scene
              data={marketData}
              isDark={isDark}
              onMarketClick={onMarketClick}
              autoRotate={autoRotate}
            />
          </Canvas>

          {/* Controls hint */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">
            Click & drag to rotate • Scroll to zoom
          </div>
        </div>

        {/* Global stats */}
        {showStats && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-4 gap-4 text-center">
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
                <div className={`text-lg font-bold text-blue-500`}>
                  {stats.openMarkets}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Markets Open
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
        )}
      </div>
    </motion.div>
  );
}
