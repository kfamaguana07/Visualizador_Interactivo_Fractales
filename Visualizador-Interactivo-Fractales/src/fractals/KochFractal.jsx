import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * Fractal Curva de Koch (Copo de Nieve) con controles interactivos
 */
const KochFractal = React.memo(({ 
  iterations = 0, 
  zoom = 1, 
  rotation = 0, 
  translateX = 0, 
  translateY = 0, 
  color = '#3B82F6' 
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentTranslate, setCurrentTranslate] = useState({ x: translateX, y: translateY });

  // Generador de colores para diferentes niveles de la curva
  const generateColorVariations = useCallback((baseColor, maxIterations) => {
    const variations = [];
    const rgb = hexToRgb(baseColor);
    
    for (let i = 0; i <= maxIterations; i++) {
      const factor = i / Math.max(maxIterations, 1);
      const r = Math.max(40, Math.round(rgb.r * (1 - factor * 0.5))); 
      const g = Math.max(40, Math.round(rgb.g * (1 - factor * 0.4)));  
      const b = Math.max(40, Math.round(rgb.b * (1 - factor * 0.3)));
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
  const kochConfig = useMemo(() => {
    const maxIter = Math.max(0, Math.min(iterations, 10)); // Aumentado a 10
    const baseSize = 280 * zoom; // Tamaño base ajustado para triángulo
    
    return {
      maxIterations: maxIter,
      baseSize,
      rotation: rotation * Math.PI / 180,
      colorVariations: generateColorVariations(color, maxIter + 1)
    };
  }, [iterations, zoom, rotation, color, generateColorVariations]);

  /**
   * Función para rotar un punto alrededor del centro
   */
  const rotatePoint = useCallback((x, y, centerX, centerY, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const dx = x - centerX;
    const dy = y - centerY;
    
    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos
    };
  }, []);

  /**
   * Calcular los puntos críticos para la transformación de Koch
   */
  const kochPoints = useCallback((p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    // Punto a 1/3 del camino
    const a = {
      x: p1.x + dx / 3,
      y: p1.y + dy / 3
    };
    
    // Punto a 2/3 del camino  
    const d = {
      x: p1.x + 2 * dx / 3,
      y: p1.y + 2 * dy / 3
    };
    
    // Punto del pico del triángulo (rotación de 60 grados)
    const angle = Math.atan2(dy, dx) - Math.PI / 3;
    const length = Math.sqrt(dx * dx + dy * dy) / 3;
    const b = {
      x: a.x + length * Math.cos(angle),
      y: a.y + length * Math.sin(angle)
    };
    
    return [a, b, d];
  }, []);

  /**
   * Generar segmentos de Koch recursivamente
   */
  const kochSegment = useCallback((p1, p2, depth) => {
    if (depth === 0) return [[p1, p2]];
    
    const [a, b, d] = kochPoints(p1, p2);
    return [
      ...kochSegment(p1, a, depth - 1),
      ...kochSegment(a, b, depth - 1),
      ...kochSegment(b, d, depth - 1),
      ...kochSegment(d, p2, depth - 1)
    ];
  }, [kochPoints]);

  /**
   * Crear el triángulo de Koch (3 curvas formando un triángulo)
   */
  const generarTrianguloKoch = useCallback((centerX, centerY, size, profundidad) => {
    const height = size * Math.sqrt(3) / 2; // Altura del triángulo equilátero
    const radius = size / Math.sqrt(3); // Radio del círculo circunscrito
    
    // Los 3 vértices del triángulo equilátero (apuntando hacia arriba)
    const vertices = [
      { x: centerX, y: centerY - radius }, // Vértice superior
      { x: centerX - size / 2, y: centerY + radius / 2 }, // Vértice inferior izquierdo
      { x: centerX + size / 2, y: centerY + radius / 2 }  // Vértice inferior derecho
    ];
    
    if (profundidad === 0) {
      // En profundidad 0, solo mostrar un punto central
      return {
        lado1: [{ x: centerX, y: centerY }],
        lado2: [],
        lado3: []
      };
    } else if (profundidad === 1) {
      // En profundidad 1, mostrar el triángulo simple
      return {
        lado1: [vertices[0], vertices[1]], // Lado izquierdo
        lado2: [vertices[1], vertices[2]], // Lado inferior
        lado3: [vertices[2], vertices[0]]  // Lado derecho
      };
    } else {
      // Para profundidades mayores, aplicar Koch a cada lado
      const segments1 = kochSegment(vertices[0], vertices[1], profundidad - 1);
      const segments2 = kochSegment(vertices[1], vertices[2], profundidad - 1);
      const segments3 = kochSegment(vertices[2], vertices[0], profundidad - 1);
      
      // Convertir segmentos a puntos conectados
      const lado1 = [segments1[0][0]];
      segments1.forEach(seg => lado1.push(seg[1]));
      
      const lado2 = [segments2[0][0]];
      segments2.forEach(seg => lado2.push(seg[1]));
      
      const lado3 = [segments3[0][0]];
      segments3.forEach(seg => lado3.push(seg[1]));
      
      return {
        lado1: lado1.slice(0, -1), // Eliminar último punto para evitar duplicados
        lado2: lado2.slice(0, -1),
        lado3: lado3.slice(0, -1)
      };
    }
  }, [kochSegment]);

  /**
   * Función para dibujar una curva de puntos
   */
  const dibujarCurva = useCallback((ctx, puntos, color, lineWidth = 2) => {
    if (puntos.length < 2) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(puntos[0].x, puntos[0].y);
    
    for (let i = 1; i < puntos.length; i++) {
      ctx.lineTo(puntos[i].x, puntos[i].y);
    }
    
    ctx.stroke();
  }, []);

  /**
   * Función principal de renderizado del fractal
   */
  const renderKoch = useCallback(() => {
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
    
    // Centro del canvas
    const centerX = rect.width / 2 + currentTranslate.x;
    const centerY = rect.height / 2 + currentTranslate.y;
    
    // Generar el triángulo de Koch
    const trianguloKoch = generarTrianguloKoch(centerX, centerY, kochConfig.baseSize, kochConfig.maxIterations);
    
    // Aplicar rotación si es necesaria
    const aplicarRotacion = (puntos) => {
      if (kochConfig.rotation === 0 || puntos.length === 0) return puntos;
      return puntos.map(punto => rotatePoint(punto.x, punto.y, centerX, centerY, kochConfig.rotation));
    };
    
    // Configurar estilo de dibujo
    const colorIndex = Math.min(kochConfig.maxIterations, kochConfig.colorVariations.length - 1);
    const currentColor = kochConfig.colorVariations[colorIndex];
    let lineWidth;
    
    if (kochConfig.maxIterations === 0) {
      // Punto central
      ctx.fillStyle = currentColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else if (kochConfig.maxIterations === 1) {
      // Triángulo simple con líneas más gruesas
      lineWidth = 4;
      dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado1), currentColor, lineWidth);
      dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado2), currentColor, lineWidth);
      dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado3), currentColor, lineWidth);
    } else {
      // Triángulo fractal con detalles
      lineWidth = Math.max(0.5, 6 - kochConfig.maxIterations * 0.6);
      
      // Dibujar cada lado del triángulo fractal
      dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado1), currentColor, lineWidth);
      dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado2), currentColor, lineWidth);
      dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado3), currentColor, lineWidth);
      
      // Opcional: Añadir efecto de sombra para iteraciones altas
      if (kochConfig.maxIterations > 5) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = lineWidth + 0.5;
        ctx.translate(1, 1);
        dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado1), 'rgba(0, 0, 0, 0.3)', lineWidth + 0.5);
        dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado2), 'rgba(0, 0, 0, 0.3)', lineWidth + 0.5);
        dibujarCurva(ctx, aplicarRotacion(trianguloKoch.lado3), 'rgba(0, 0, 0, 0.3)', lineWidth + 0.5);
        ctx.restore();
      }
    }
    
  }, [kochConfig, currentTranslate, generarTrianguloKoch, rotatePoint, dibujarCurva]);

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
    renderKoch();
  }, [renderKoch]);

  useEffect(() => {
    const handleResize = () => renderKoch();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [renderKoch]);

  // Calcular número de segmentos para triángulo
  const segmentCount = kochConfig.maxIterations <= 1 ? 
    (kochConfig.maxIterations === 0 ? 1 : 3) : 
    3 * Math.pow(4, kochConfig.maxIterations - 1);

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
          <span className="info-value">{kochConfig.maxIterations}/10</span>
        </div>
        <div className="info-item">
          <span className="info-label">Segmentos:</span>
          <span className="info-value">{segmentCount.toLocaleString()}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Controles:</span>
          <span className="info-value">� Arrastra</span>
        </div>
      </div>
    </div>
  );
});

export default KochFractal;
