import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook optimizado para Canvas con mejor rendimiento
 */
export const useOptimizedCanvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Configuración optimizada del canvas
  const setupCanvas = useCallback((canvas) => {
    if (!canvas) return null;

    const ctx = canvas.getContext('2d', {
      alpha: false, // Mejora rendimiento si no necesitas transparencia
      desynchronized: true, // Reduce latencia
      willReadFrequently: false // Optimiza para escritura
    });

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Configurar resolución para pantallas de alta densidad
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Optimizaciones de rendering
    ctx.imageSmoothingEnabled = false; // Mejor para fractales pixelados
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    contextRef.current = ctx;
    return ctx;
  }, []);

  // Renderizado con requestAnimationFrame optimizado
  const scheduleRender = useCallback((renderFn) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      
      if (canvas && ctx) {
        // Limpiar solo el área necesaria en lugar de todo el canvas
        ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), 
                           canvas.height / (window.devicePixelRatio || 1));
        renderFn(ctx, canvas);
      }
    });
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    setupCanvas,
    scheduleRender,
    getContext: () => contextRef.current
  };
};

/**
 * Hook para optimización de cálculos pesados con Web Workers
 */
export const useWorkerOptimization = () => {
  const workerRef = useRef(null);

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      // Solo crear worker si está disponible
      if (typeof Worker !== 'undefined') {
        workerRef.current = new Worker('/src/workers/fractalWorker.js', { type: 'module' });
      }
    }
    return workerRef.current;
  }, []);

  const calculateInWorker = useCallback((data, callback) => {
    const worker = initWorker();
    if (worker) {
      worker.postMessage(data);
      worker.onmessage = (e) => callback(e.data);
    } else {
      // Fallback si no hay Workers disponibles
      callback(data);
    }
  }, [initWorker]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return { calculateInWorker };
};

/**
 * Hook para throttling de eventos costosos
 */
export const usePerformanceThrottle = (callback, delay = 16) => {
  const timeoutRef = useRef();
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (Date.now() - lastRun.current));
    }
  }, [callback, delay]);
};
