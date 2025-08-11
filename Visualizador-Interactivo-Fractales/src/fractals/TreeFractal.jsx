import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * Fractal de árbol recursivo con controles de zoom, rotación y arrastre
 */
const TreeFractal = React.memo(({ 
  iterations = 0, 
  zoom = 1, 
  rotation = 0, 
  translateX = 0, 
  translateY = 0, 
  color = '#3B82F6',
  onParameterChange
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentTranslate, setCurrentTranslate] = useState({ x: translateX, y: translateY });

  /**
   * Maneja controles de teclado
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!onParameterChange) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onParameterChange('rotation', Math.max(0, rotation - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onParameterChange('rotation', Math.min(360, rotation + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          onParameterChange('iterations', Math.min(15, iterations + 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          onParameterChange('iterations', Math.max(0, iterations - 1));
          break;
      }
    };

    const handleWheel = (e) => {
      if (!onParameterChange) return;
      e.preventDefault();
      
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(10, zoom * zoomFactor));
      onParameterChange('zoom', newZoom);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel);
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [rotation, iterations, zoom, onParameterChange]);

  // Sincronizar el estado local con las props
  useEffect(() => {
    if (currentTranslate.x !== translateX || currentTranslate.y !== translateY) {
      setCurrentTranslate({ x: translateX, y: translateY });
    }
  }, [translateX, translateY]);

  // Generador de colores para diferentes niveles del árbol
  const generateColorVariations = useCallback((baseColor, maxIterations) => {
    const variations = [];
    const rgb = hexToRgb(baseColor);
    
    for (let i = 0; i <= maxIterations; i++) {
      const factor = i / Math.max(maxIterations, 1);
      const r = Math.max(20, Math.round(rgb.r * (1 - factor * 0.65))); 
      const g = Math.max(20, Math.round(rgb.g * (1 - factor * 0.55)));  
      const b = Math.max(20, Math.round(rgb.b * (1 - factor * 0.45)));
      variations.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return variations;
  }, []);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // Configuración del árbol
  const treeConfig = useMemo(() => {
    const maxIter = Math.max(0, Math.min(iterations, 20));
    const tamanoBase = 120 * zoom;
    
    return {
      maxIterations: maxIter,
      tamanoBase,
      anguloBase: -90,
      baseRotation: rotation,
      colorVariations: generateColorVariations(color, maxIter + 1)
    };
  }, [iterations, zoom, rotation, color, generateColorVariations]);

  /**
   * Algoritmo recursivo para dibujar el árbol fractal
   */
  const dibujarArbol = useCallback((ctx, x1, y1, angulo, profundidad, tamano, config) => {
    if (profundidad < 0) return;
    
    const colorIndex = Math.min(config.maxIterations - profundidad, config.colorVariations.length - 1);
    ctx.strokeStyle = config.colorVariations[colorIndex];
    ctx.lineWidth = Math.max(0.5, tamano * 0.08);
    
    const anguloRad = angulo * Math.PI / 180;
    const x2 = x1 + Math.cos(anguloRad) * tamano;
    const y2 = y1 + Math.sin(anguloRad) * tamano;
    
    // Dibujar rama
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Dibujar hojas en ramas finales
    if (profundidad === 0 && tamano > 5) {
      ctx.save();
      ctx.fillStyle = config.colorVariations[colorIndex];
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x2, y2, Math.max(1, tamano * 0.03), 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
    
    // Recursión para ramas hijas
    if (profundidad > 0) {
      const nuevoTamano = tamano * 0.75;
      const anguloIzq = angulo - 25;
      const anguloDer = angulo + 25;
      
      dibujarArbol(ctx, x2, y2, anguloIzq, profundidad - 1, nuevoTamano, config);
      dibujarArbol(ctx, x2, y2, anguloDer, profundidad - 1, nuevoTamano, config);
    }
  }, []);

  /**
   * Función principal de renderizado del fractal
   */
  const renderTree = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Punto de inicio del árbol (centrado en la base)
    const startX = rect.width / 2 + currentTranslate.x;
    const startY = rect.height - 50 + currentTranslate.y;
    const startAngle = treeConfig.anguloBase + treeConfig.baseRotation;
    
    if (treeConfig.maxIterations >= 0) {
      dibujarArbol(ctx, startX, startY, startAngle, treeConfig.maxIterations, treeConfig.tamanoBase, treeConfig);
    }
  }, [treeConfig, currentTranslate, dibujarArbol]);

  // Manejadores de eventos de arrastre
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - currentTranslate.x, y: e.clientY - currentTranslate.y });
  }, [currentTranslate]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setCurrentTranslate({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - currentTranslate.x, y: touch.clientY - currentTranslate.y });
    e.preventDefault();
  }, [currentTranslate]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setCurrentTranslate({ x: newX, y: newY });
    e.preventDefault();
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Eventos de mouse y touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Renderizado y resize
  useEffect(() => {
    renderTree();
  }, [renderTree]);

  useEffect(() => {
    const handleResize = () => renderTree();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [renderTree]);

  return (
    <canvas
      ref={canvasRef}
      className="fractal-canvas"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    />
  );
});

export default TreeFractal;
