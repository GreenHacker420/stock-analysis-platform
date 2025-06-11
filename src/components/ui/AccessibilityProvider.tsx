'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  screenReader: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: string | boolean) => void;
  isHighContrast: boolean;
  shouldReduceMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    focusVisible: true,
    screenReader: false,
  });

  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...parsed,
        reducedMotion: parsed.reducedMotion || prefersReducedMotion,
        highContrast: parsed.highContrast || prefersHighContrast,
      });
    } else {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (settings.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      case 'extra-large':
        root.classList.add('text-xl');
        break;
      default:
        root.classList.add('text-base');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSetting,
      isHighContrast: settings.highContrast,
      shouldReduceMotion: settings.reducedMotion,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Utility component for accessible focus management
export function FocusTrap({ children, active = true }: { children: React.ReactNode; active?: boolean }) {
  const trapRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !trapRef.current) return;

    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);

  return <div ref={trapRef}>{children}</div>;
}

// Screen reader only text component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Skip link component for keyboard navigation
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { isDark } = useTheme();
  
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 rounded-md font-medium transition-colors ${
        isDark
          ? 'bg-gray-800 text-white border border-gray-600'
          : 'bg-white text-gray-900 border border-gray-300'
      } focus:ring-2 focus:ring-blue-500`}
    >
      {children}
    </a>
  );
}

// Accessible button component with proper ARIA attributes
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function AccessibleButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: AccessibleButtonProps) {
  const { isDark } = useTheme();
  const { shouldReduceMotion } = useAccessibility();

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${shouldReduceMotion ? '' : 'transition-all duration-200'}
  `;

  const variantClasses = {
    primary: isDark
      ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-gray-800'
      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-white',
    secondary: isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500 focus:ring-offset-gray-800'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500 focus:ring-offset-white',
    ghost: isDark
      ? 'text-gray-300 hover:bg-gray-800 focus:ring-gray-500 focus:ring-offset-gray-900'
      : 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 focus:ring-offset-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className={`animate-spin -ml-1 mr-2 h-4 w-4 text-current`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// Accessible form input component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function AccessibleInput({
  label,
  error,
  helpText,
  id,
  className = '',
  ...props
}: AccessibleInputProps) {
  const { isDark } = useTheme();
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className={`block text-sm font-medium ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error
            ? isDark
              ? 'border-red-500 bg-gray-800 text-white'
              : 'border-red-500 bg-white text-gray-900'
            : isDark
              ? 'border-gray-600 bg-gray-800 text-white'
              : 'border-gray-300 bg-white text-gray-900'
          }
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {helpText && (
        <p
          id={helpId}
          className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {helpText}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
