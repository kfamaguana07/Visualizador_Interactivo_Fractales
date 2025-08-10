import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * Fractal de Sierpinski con controles de zoom, rotación y arrastre
 */
const SierpinskiFractal = React.memo(({ 
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

  // Keyboard controls
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
          onParameterChange('iterations', Math.min(10, iterations + 1));
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

  // Generador de colores para diferentes niveles del triángulo
  const generateColorVariations = useCallback((baseColor, maxIterations) => {
    const variations = [];
    const rgb = hexToRgb(baseColor);
    
    for (let i = 0; i <= maxIterations; i++) {
      const factor = i / Math.max(maxIterations, 1);
      const r = Math.max(30, Math.round(rgb.r * (1 - factor * 0.6))); 
      const g = Math.max(30, Math.round(rgb.g * (1 - factor * 0.5)));  
      const b = Math.max(30, Math.round(rgb.b * (1 - factor * 0.4)));
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

  // Configuración del fractal
  const sierpinskiConfig = useMemo(() => {
    const maxIter = Math.max(0, Math.min(iterations, 7));
    const baseSize = 300 * zoom;
    
    return {
      maxIterations: maxIter,
      baseSize,
      rotation: rotation,
      colorVariations: generateColorVariations(color, maxIter + 1)
    };
  }, [iterations, zoom, rotation, color, generateColorVariations]);

  /**
   * Función para rotar un punto alrededor del centro
   */
  const rotatePoint = useCallback((x, y, centerX, centerY, angle) => {
    const angleRad = angle * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    const dx = x - centerX;
    const dy = y - centerY;
    
    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos
    };
  }, []);

  /**
   * Algoritmo recursivo para dibujar el triángulo de Sierpinski
   */
  const dibujarSierpinski = useCallback((ctx, x1, y1, x2, y2, x3, y3, profundidad, config, centerX, centerY) => {
    if (profundidad < 0) return;
    
    // Aplicar rotación a los vértices del triángulo
    const p1 = config.rotation !== 0 ? rotatePoint(x1, y1, centerX, centerY, config.rotation) : { x: x1, y: y1 };
    const p2 = config.rotation !== 0 ? rotatePoint(x2, y2, centerX, centerY, config.rotation) : { x: x2, y: y2 };
    const p3 = config.rotation !== 0 ? rotatePoint(x3, y3, centerX, centerY, config.rotation) : { x: x3, y: y3 };
    
    if (profundidad === 0) {
      // Dibujar triángulo base
      const colorIndex = Math.min(config.maxIterations, config.colorVariations.length - 1);
      ctx.fillStyle = config.colorVariations[colorIndex];
      ctx.strokeStyle = config.colorVariations[colorIndex];
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      
      // Relleno con transparencia para efecto visual
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
    } else {
      // Calcular puntos medios (sin rotación, se aplica en la recursión)
      const mx1 = (x1 + x2) / 2;
      const my1 = (y1 + y2) / 2;
      const mx2 = (x2 + x3) / 2;
      const my2 = (y2 + y3) / 2;
      const mx3 = (x3 + x1) / 2;
      const my3 = (y3 + y1) / 2;
      
      // Recursión para los tres triángulos más pequeños
      dibujarSierpinski(ctx, x1, y1, mx1, my1, mx3, my3, profundidad - 1, config, centerX, centerY);
      dibujarSierpinski(ctx, mx1, my1, x2, y2, mx2, my2, profundidad - 1, config, centerX, centerY);
      dibujarSierpinski(ctx, mx3, my3, mx2, my2, x3, y3, profundidad - 1, config, centerX, centerY);
    }
  }, [rotatePoint]);

  /**
   * Función principal de renderizado del fractal
   */
  const renderSierpinski = useCallback(() => {
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
    
    // Centro del canvas
    const centerX = rect.width / 2 + currentTranslate.x;
    const centerY = rect.height / 2 + currentTranslate.y;
    
    // Vértices del triángulo equilátero inicial
    const size = sierpinskiConfig.baseSize;
    const height = size * Math.sqrt(3) / 2;
    
    const x1 = centerX; // Vértice superior
    const y1 = centerY - height / 2;
    const x2 = centerX - size / 2; // Vértice inferior izquierdo
    const y2 = centerY + height / 2;
    const x3 = centerX + size / 2; // Vértice inferior derecho
    const y3 = centerY + height / 2;
    
    if (sierpinskiConfig.maxIterations >= 0) {
      dibujarSierpinski(ctx, x1, y1, x2, y2, x3, y3, sierpinskiConfig.maxIterations, sierpinskiConfig, centerX, centerY);
    }
  }, [sierpinskiConfig, currentTranslate, dibujarSierpinski]);

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
    renderSierpinski();
  }, [renderSierpinski]);

  useEffect(() => {
    const handleResize = () => renderSierpinski();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [renderSierpinski]);

  // Calcular número de triángulos
  const triangleCount = sierpinskiConfig.maxIterations === 0 ? 1 : Math.pow(3, sierpinskiConfig.maxIterations);

  return (
    <div className="fractal-canvas-container">
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
      
      <div className="fractal-info">
        <div className="info-item">
          <span className="info-label">Iteraciones:</span>
          <span className="info-value">{sierpinskiConfig.maxIterations}/7</span>
        </div>
        <div className="info-item">
          <span className="info-label">Triángulos:</span>
          <span className="info-value">{triangleCount.toLocaleString()}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Controles:</span>
          <span className="info-value">🖱️ Arrastra</span>
        </div>
      </div>
    </div>
  );
});

export default SierpinskiFractal;
