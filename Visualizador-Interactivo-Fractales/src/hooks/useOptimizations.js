import { useCallback, useRef, useState } from 'react';

/**
 * Hook personalizado para debouncing optimizado
 * Evita re-renders innecesarios en controles que cambian frecuentemente
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

/**
 * Hook para throttling de eventos
 * Útil para eventos de scroll o resize
 */
export const useThrottle = (callback, delay) => {
  const timeoutRef = useRef();
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (Date.now() - lastRun.current >= delay) {
          callback(...args);
          lastRun.current = Date.now();
        }
      }, delay - (Date.now() - lastRun.current));
    }
  }, [callback, delay]);
};

/**
 * Hook para optimizar re-renders con comparación profunda
 */
export const useStableCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);

  // Solo actualizar si las dependencias han cambiado
  if (!deps || deps.some((dep, i) => dep !== depsRef.current?.[i])) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  return useCallback((...args) => callbackRef.current(...args), []);
};

/**
 * Hook para gestión optimizada de parámetros de fractal
 */
export const useFractalParams = (initialParams) => {
  const paramsRef = useRef(initialParams);
  const [params, setParams] = useState(initialParams);

  const updateParam = useCallback((param, value) => {
    setParams(prev => {
      const newParams = { ...prev, [param]: value };
      paramsRef.current = newParams;
      return newParams;
    });
  }, []);

  const updateMultipleParams = useCallback((updates) => {
    setParams(prev => {
      const newParams = { ...prev, ...updates };
      paramsRef.current = newParams;
      return newParams;
    });
  }, []);

  const resetParams = useCallback(() => {
    setParams(initialParams);
    paramsRef.current = initialParams;
  }, [initialParams]);

  return {
    params,
    updateParam,
    updateMultipleParams,
    resetParams,
    getCurrentParams: () => paramsRef.current
  };
};
