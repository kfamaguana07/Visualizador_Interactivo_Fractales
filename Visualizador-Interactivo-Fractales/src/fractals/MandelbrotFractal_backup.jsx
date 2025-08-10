
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

// Utilidad para convertir color HEX a RGB (movida fuera del componente para mejor rendimiento)
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

/**
 * Fractal de Mandelbrot optimizado con renderizado por chunks
 */
const MandelbrotFractal = ({ 
  width = 900, 
  height = 600, 
  maxIterations = 100, 
  zoom = 1, 
  offsetX = 0, 
  offsetY = 0, 
  rotation = 0, 
  color = '#3B82F6', 
  translateX = 0, 
  translateY = 0, 
  onParameterChange 
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentTranslate, setCurrentTranslate] = useState({ x: translateX, y: translateY });
  const [isRendering, setIsRendering] = useState(false);

  // Configuración memoizada para evitar recálculos
  const config = useMemo(() => ({
    width,
    height,
    maxIterations: Math.max(5, Math.min(200, maxIterations)),
    zoom: Math.max(0.1, Math.min(10, zoom)),
    offsetX,
    offsetY,
    rotation: rotation * Math.PI / 180,
    colorRgb: hexToRgb(color),
    translateX,
    translateY
  }), [width, height, maxIterations, zoom, offsetX, offsetY, rotation, color, translateX, translateY]);

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
          onParameterChange('iterations', Math.min(200, maxIterations + 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          onParameterChange('iterations', Math.max(0, maxIterations - 1));
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
  }, [rotation, maxIterations, zoom, onParameterChange]);

  // Sincronizar el estado local con las props
  useEffect(() => {
    if (currentTranslate.x !== translateX || currentTranslate.y !== translateY) {
      setCurrentTranslate({ x: translateX, y: translateY });
    }
  }, [translateX, translateY]);

  // Función optimizada para calcular punto de Mandelbrot
  const mandelbrotPoint = useCallback((cx, cy, maxIter) => {
    let zx = 0, zy = 0;
    let zx2 = 0, zy2 = 0;
    let iter = 0;
    
    while (zx2 + zy2 < 4 && iter < maxIter) {
      zy = 2 * zx * zy + cy;
      zx = zx2 - zy2 + cx;
      zx2 = zx * zx;
      zy2 = zy * zy;
      iter++;
    }
    return iter;
  }, []);

  // Renderizado por chunks para evitar bloqueo del UI
  const drawMandelbrotChunked = useCallback(() => {
    if (isRendering) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, config.width, config.height);
    
    if (config.maxIterations <= 0) return;
    
    setIsRendering(true);
    
    // Configuración de chunks para renderizado progresivo
    const CHUNK_SIZE = 32; // Procesar en chunks de 32x32 píxeles
    const chunks = [];
    
    for (let y = 0; y < config.height; y += CHUNK_SIZE) {
      for (let x = 0; x < config.width; x += CHUNK_SIZE) {
        chunks.push({ x, y, width: Math.min(CHUNK_SIZE, config.width - x), height: Math.min(CHUNK_SIZE, config.height - y) });
      }
    }
    
    let chunkIndex = 0;
    
    const processChunk = () => {
      if (chunkIndex >= chunks.length) {
        setIsRendering(false);
        return;
      }
      
      const chunk = chunks[chunkIndex];
      const imgData = ctx.createImageData(chunk.width, chunk.height);
      const data = imgData.data;
      
      // Precalcular transformaciones
      const centerX = config.width / 2 + currentTranslate.x;
      const centerY = config.height / 2 + currentTranslate.y;
      const scale = 4 / (config.zoom * Math.min(config.width, config.height));
      const cosA = Math.cos(config.rotation);
      const sinA = Math.sin(config.rotation);
      
      for (let py = 0; py < chunk.height; py++) {
        for (let px = 0; px < chunk.width; px++) {
          const screenX = chunk.x + px;
          const screenY = chunk.y + py;
          
          // Transformar coordenadas
          let x = (screenX - centerX) * scale;
          let y = (screenY - centerY) * scale;
          
          // Aplicar rotación
          const rotX = x * cosA - y * sinA;
          const rotY = x * sinA + y * cosA;
          
          // Aplicar offset
          const cx = rotX + config.offsetX;
          const cy = rotY + config.offsetY;
          
          const iter = mandelbrotPoint(cx, cy, config.maxIterations);
          const pixelIndex = (py * chunk.width + px) * 4;
          
          if (iter === config.maxIterations) {
            // Punto en el conjunto (negro)
            data[pixelIndex] = 0;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 255;
          } else {
            // Colorear basado en iteraciones
            const t = iter / config.maxIterations;
            data[pixelIndex] = Math.floor(config.colorRgb.r * (1 - t * 0.8));
            data[pixelIndex + 1] = Math.floor(config.colorRgb.g * (1 - t * 0.6));
            data[pixelIndex + 2] = Math.floor(config.colorRgb.b * (1 - t * 0.4));
            data[pixelIndex + 3] = 255;
          }
        }
      }
      
      ctx.putImageData(imgData, chunk.x, chunk.y);
      chunkIndex++;
      
      // Usar requestAnimationFrame para el siguiente chunk
      animationFrameRef.current = requestAnimationFrame(processChunk);
    };
    
    processChunk();
  }, [config, currentTranslate, mandelbrotPoint, isRendering]);

  // Cancelar renderizado anterior si hay uno en progreso
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const drawMandelbrot = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRendering(false);
  // Redibuja cuando cambian parámetros
  useEffect(() => {
    drawMandelbrot();
  }, [drawMandelbrot]);

  // Arrastre con mouse
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - currentTranslate.x, y: e.clientY - currentTranslate.y });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setCurrentTranslate({ x: newX, y: newY });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Arrastre touch
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - currentTranslate.x, y: touch.clientY - currentTranslate.y });
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setCurrentTranslate({ x: newX, y: newY });
    e.preventDefault();
  };
  const handleTouchEnd = () => setIsDragging(false);

  // Zoom con rueda del mouse (deshabilitado para evitar conflicto con el panel)
  const handleWheel = (e) => {
    e.preventDefault();
    // Si quieres permitir zoom con la rueda, aquí podrías emitir un callback al panel
    // pero por ahora solo se controla desde el panel
  };



  // Eventos
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Info
  return (
    <div className="fractal-canvas-container">
      <canvas
        ref={canvasRef}
        className="fractal-canvas"
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', display: 'block', cursor: isDragging ? 'grabbing' : 'grab', background: 'transparent' }}
      />
      <div className="fractal-info">
        <div className="info-item">
          <span className="info-label">Iteraciones:</span>
          <span className="info-value">{maxIterations}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Color:</span>
          <span className="info-value"><span style={{display:'inline-block',width:16,height:16,background:color,borderRadius:4,marginRight:4,border:'1px solid #ccc',verticalAlign:'middle'}}></span>{color}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Zoom:</span>
          <span className="info-value">{zoom.toFixed(2)}x</span>
        </div>
        <div className="info-item">
          <span className="info-label">Rotación:</span>
          <span className="info-value">{rotation}&deg;</span>
        </div>
        <div className="info-item">
          <span className="info-label">Centro:</span>
          <span className="info-value">({(offsetX - currentTranslate.x / 200).toFixed(3)}, {(offsetY - currentTranslate.y / 200).toFixed(3)})</span>
        </div>
        <div className="info-item">
          <span className="info-label">Controles:</span>
          <span className="info-value">🖱️ Arrastra</span>
        </div>
      </div>
    </div>
  );
};

export default MandelbrotFractal;
