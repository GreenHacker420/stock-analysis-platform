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
  const { theme, toggleTheme, isDark } = useTheme();

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
        {/* Background gradient */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-400'
        }`} />
        
        {/* Toggle circle */}
        <motion.div
          className={`relative inline-block ${
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
          } bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center`}
          animate={{
            x: isDark 
              ? size === 'sm' ? 16 : size === 'md' ? 20 : 24
              : 2
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {/* Icon */}
          <motion.div
            initial={false}
            animate={{
              scale: 1,
              rotate: isDark ? 180 : 0
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            {isDark ? (
              <MoonIcon className={`${iconSizes[size]} text-blue-600`} />
            ) : (
              <SunIcon className={`${iconSizes[size]} text-yellow-500`} />
            )}
          </motion.div>
        </motion.div>
        
        {/* Stars for dark mode */}
        {isDark && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </button>
    </div>
  );
}
