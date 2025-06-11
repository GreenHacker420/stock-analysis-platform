'use client';

import { useEffect, useState, useCallback } from 'react';

interface WebGLRecoveryState {
  isContextLost: boolean;
  isRecovering: boolean;
  error: string | null;
  retryCount: number;
}

export function useWebGLRecovery() {
  const [state, setState] = useState<WebGLRecoveryState>({
    isContextLost: false,
    isRecovering: false,
    error: null,
    retryCount: 0,
  });

  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost. Attempting recovery...');
    
    setState(prev => ({
      ...prev,
      isContextLost: true,
      isRecovering: true,
      error: 'WebGL context was lost. Attempting to recover...',
    }));
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log('WebGL context restored successfully.');
    
    setState(prev => ({
      ...prev,
      isContextLost: false,
      isRecovering: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  }, []);

  const handleContextCreationError = useCallback((event: Event) => {
    console.error('WebGL context creation failed:', event);
    
    setState(prev => ({
      ...prev,
      isContextLost: true,
      isRecovering: false,
      error: 'Failed to create WebGL context. Your device may not support WebGL.',
    }));
  }, []);

  const setupWebGLRecovery = useCallback((canvas: HTMLCanvasElement) => {
    if (!canvas) return;

    // Add event listeners for WebGL context events
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    canvas.addEventListener('webglcontextcreationerror', handleContextCreationError);

    // Cleanup function
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      canvas.removeEventListener('webglcontextcreationerror', handleContextCreationError);
    };
  }, [handleContextLost, handleContextRestored, handleContextCreationError]);

  const forceRecovery = useCallback(() => {
    setState(prev => ({
      ...prev,
      isContextLost: false,
      isRecovering: false,
      error: null,
    }));
  }, []);

  const checkWebGLSupport = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl || !(gl instanceof WebGLRenderingContext)) {
        setState(prev => ({
          ...prev,
          error: 'WebGL is not supported on this device.',
        }));
        return false;
      }

      // Check for common WebGL extensions
      const extensions = {
        loseContext: gl.getExtension('WEBGL_lose_context'),
        depthTexture: gl.getExtension('WEBGL_depth_texture'),
        textureFloat: gl.getExtension('OES_texture_float'),
      };

      return {
        supported: true,
        extensions,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        renderer: gl.getParameter(gl.RENDERER),
        vendor: gl.getParameter(gl.VENDOR),
      };
    } catch (error) {
      console.error('WebGL support check failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to check WebGL support.',
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    // Check WebGL support on mount
    checkWebGLSupport();
  }, [checkWebGLSupport]);

  return {
    ...state,
    setupWebGLRecovery,
    forceRecovery,
    checkWebGLSupport,
  };
}

// WebGL recovery utilities
export function createWebGLRecoveryHandler(canvas: HTMLCanvasElement) {
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost. Attempting recovery...');
  };

  const handleContextRestored = () => {
    console.log('WebGL context restored successfully.');
  };

  const handleContextCreationError = (event: Event) => {
    console.error('WebGL context creation failed:', event);
  };

  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);
  canvas.addEventListener('webglcontextcreationerror', handleContextCreationError);

  return () => {
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    canvas.removeEventListener('webglcontextcreationerror', handleContextCreationError);
  };
}

// WebGL performance monitoring hook
export function useWebGLPerformance() {
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
  });

  const startMonitoring = useCallback((gl: WebGLRenderingContext) => {
    let frameCount = 0;
    let lastTime = window.performance.now();
    let totalFrameTime = 0;

    const monitor = () => {
      const currentTime = window.performance.now();
      const deltaTime = currentTime - lastTime;

      frameCount++;
      totalFrameTime += deltaTime;

      if (frameCount >= 60) {
        const avgFrameTime = totalFrameTime / frameCount;
        const fps = 1000 / avgFrameTime;

        // Get memory usage if available
        const memInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        const memoryUsage = memInfo ? gl.getParameter(memInfo.UNMASKED_RENDERER_WEBGL) : 0;

        setPerformanceStats({
          fps: Math.round(fps),
          frameTime: Math.round(avgFrameTime * 100) / 100,
          memoryUsage,
        });

        frameCount = 0;
        totalFrameTime = 0;
      }

      lastTime = currentTime;
      requestAnimationFrame(monitor);
    };

    monitor();
  }, []);

  return {
    performance: performanceStats,
    startMonitoring,
  };
}

// Utility function to get WebGL capabilities
export function getWebGLCapabilities() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl || !(gl instanceof WebGLRenderingContext)) return null;

    return {
      version: gl.getParameter(gl.VERSION),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      extensions: gl.getSupportedExtensions(),
    };
  } catch (error) {
    console.error('Failed to get WebGL capabilities:', error);
    return null;
  }
}
