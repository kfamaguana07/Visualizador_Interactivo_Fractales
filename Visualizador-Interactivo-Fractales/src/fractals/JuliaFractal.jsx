import React, { useRef, useEffect, useState, useCallback } from 'react';

// Utilidad para convertir color HEX a RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Fractal de Julia interactivo con zoom, rotación y arrastre
 */
const JuliaFractal = ({ 
  width = 900, 
  height = 600, 
  maxIterations = 100, 
  zoom = 1, 
  offsetX = 0, 
  offsetY = 0, 
  rotation = 0, 
  color = '#3B82F6', 
  translateX = 0, 
  translateY = 0 
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentTranslate, setCurrentTranslate] = useState({ x: translateX, y: translateY });

  // Parámetros del conjunto de Julia (pueden ser variables)
  const juliaC = { re: -0.4, im: 0.6 };

  // Dibuja el fractal de Julia
  const drawJulia = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Si las iteraciones son 0, no dibujar nada (canvas transparente)
    if (maxIterations <= 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;     // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
        data[i + 3] = 0; // A (transparente)
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // Precalcular seno y coseno para la rotación
    const angle = (rotation * Math.PI) / 180;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Paleta basada en el color seleccionado
    const baseRgb = hexToRgb(color);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Coordenadas centradas y escaladas
        let nx = (x - width / 2) * (4 / width) / zoom;
        let ny = (y - height / 2) * (4 / width) / zoom;
        
        // Aplicar rotación
        let zRe = nx * cosA - ny * sinA + offsetX - currentTranslate.x / 200;
        let zIm = nx * sinA + ny * cosA + offsetY - currentTranslate.y / 200;
        
        let n = 0;
        while (n < maxIterations) {
          // Algoritmo de Julia: z = z² + c
          let zRe2 = zRe * zRe - zIm * zIm;
          let zIm2 = 2 * zRe * zIm;
          zRe = zRe2 + juliaC.re;
          zIm = zIm2 + juliaC.im;
          
          if (zRe * zRe + zIm * zIm > 4) break;
          n++;
        }
        
        const idx = 4 * (y * width + x);
        if (n === maxIterations) {
          // Puntos del conjunto de Julia (transparente)
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0; // Transparente
        } else {
          // Gradiente del color base con intensidad basada en iteraciones
          const factor = Math.min(1, n / Math.max(1, maxIterations * 0.8));
          data[idx] = Math.round(baseRgb.r * factor);
          data[idx + 1] = Math.round(baseRgb.g * factor);
          data[idx + 2] = Math.round(baseRgb.b * factor);
          data[idx + 3] = Math.round(255 * Math.pow(factor, 0.5)); // Transparencia gradual
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [width, height, maxIterations, zoom, currentTranslate, rotation, color, offsetX, offsetY]);

  // Redibuja cuando cambian parámetros
  useEffect(() => {
    drawJulia();
  }, [drawJulia]);

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

  // Zoom con rueda del mouse (deshabilitado para evitar conflicto con el panel)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    // Solo se controla desde el panel
  }, []);

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
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

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
          <span className="info-label">Parámetro C:</span>
          <span className="info-value">({juliaC.re.toFixed(2)}, {juliaC.im.toFixed(2)})</span>
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
          <span className="info-value">{rotation}°</span>
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

export default JuliaFractal;
