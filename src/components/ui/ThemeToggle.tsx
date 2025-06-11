'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ThemeToggle({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <span className={`text-sm font-medium ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {isDark ? 'Dark' : 'Light'} Mode
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`relative inline-flex items-center ${sizeClasses[size]} rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isDark 
            ? 'bg-blue-600 focus:ring-offset-gray-800' 
            : 'bg-gray-200 focus:ring-offset-white'
        }`}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle theme"
      >
        {/* Background gradient with enhanced animations */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: isDark
              ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #1e40af 100%)'
              : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Animated background overlay */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          animate={{
            background: isDark
              ? 'radial-gradient(circle at 30% 30%, rgba(147, 197, 253, 0.8) 0%, transparent 50%)'
              : 'radial-gradient(circle at 70% 70%, rgba(254, 215, 170, 0.8) 0%, transparent 50%)'
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        
        {/* Toggle circle with enhanced styling */}
        <motion.div
          className={`relative inline-block ${
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
          } bg-white rounded-full flex items-center justify-center overflow-hidden`}
          style={{
            boxShadow: isDark
              ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
          animate={{
            x: isDark
              ? size === 'sm' ? 16 : size === 'md' ? 20 : 24
              : 2,
            scale: isDark ? 1.05 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8
          }}
        >
          {/* Icon with enhanced animations */}
          <motion.div
            className="relative"
            initial={false}
            animate={{
              scale: 1,
              rotate: isDark ? 360 : 0
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            <motion.div
              animate={{
                opacity: isDark ? 1 : 0,
                scale: isDark ? 1 : 0.5
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <MoonIcon className={`${iconSizes[size]} text-blue-600`} />
            </motion.div>
            <motion.div
              animate={{
                opacity: isDark ? 0 : 1,
                scale: isDark ? 0.5 : 1
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <SunIcon className={`${iconSizes[size]} text-yellow-500`} />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Enhanced stars for dark mode */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-full"
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: i % 2 === 0 ? '2px' : '1px',
                height: i % 2 === 0 ? '2px' : '1px',
                left: `${15 + i * 12}%`,
                top: `${25 + (i * 8) % 40}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Sun rays for light mode */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-full"
          animate={{ opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-2 bg-yellow-300 origin-bottom"
              style={{
                left: '50%',
                bottom: '50%',
                transformOrigin: '50% 100%',
                transform: `rotate(${i * 45}deg) translateX(-50%)`,
              }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scaleY: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </button>
    </div>
  );
}
