'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface WebGLInfo {
  supported: boolean;
  version?: string;
  vendor?: string;
  renderer?: string;
  maxTextureSize?: number;
  maxViewportDims?: number[];
  extensions?: string[];
  error?: string;
}

export default function WebGLDiagnostic() {
  const { isDark } = useTheme();
  const [webglInfo, setWebglInfo] = useState<WebGLInfo | null>(null);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl || !(gl instanceof WebGLRenderingContext)) {
          setWebglInfo({
            supported: false,
            error: 'WebGL is not supported on this device/browser'
          });
          return;
        }

        const info: WebGLInfo = {
          supported: true,
          version: gl.getParameter(gl.VERSION),
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
          extensions: gl.getSupportedExtensions() || []
        };

        setWebglInfo(info);
      } catch (error) {
        setWebglInfo({
          supported: false,
          error: `WebGL check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    };

    checkWebGL();
  }, []);

  if (!webglInfo) {
    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Checking WebGL support...
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        WebGL Diagnostic
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            WebGL Support:
          </span>
          <span className={`px-2 py-1 rounded text-sm ${
            webglInfo.supported 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {webglInfo.supported ? 'Supported' : 'Not Supported'}
          </span>
        </div>

        {webglInfo.error && (
          <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-300 text-sm">
              <strong>Error:</strong> {webglInfo.error}
            </p>
          </div>
        )}

        {webglInfo.supported && (
          <>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Version:</strong> {webglInfo.version}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Vendor:</strong> {webglInfo.vendor}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Renderer:</strong> {webglInfo.renderer}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Max Texture Size:</strong> {webglInfo.maxTextureSize}px
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Max Viewport:</strong> {webglInfo.maxViewportDims?.join(' x ')}px
            </div>
            
            <details className="mt-3">
              <summary className={`cursor-pointer text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Extensions ({webglInfo.extensions?.length || 0})
              </summary>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {webglInfo.extensions?.map((ext, index) => (
                  <div key={index} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {ext}
                  </div>
                ))}
              </div>
            </details>
          </>
        )}

        {!webglInfo.supported && (
          <div className="mt-3 p-3 rounded bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Possible Solutions:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Enable hardware acceleration in your browser settings</li>
              <li>• Update your graphics drivers</li>
              <li>• Try a different browser (Chrome, Firefox, Edge)</li>
              <li>• Check if WebGL is disabled in browser flags</li>
              <li>• Restart your browser</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
