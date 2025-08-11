
import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Convierte color HEX a RGB
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Fractal de Mandelbrot interactivo con zoom y arrastre
 */
const MandelbrotFractal = ({ width = 900, height = 600, maxIterations = 100, zoom = 1, offsetX = 0, offsetY = 0, rotation = 0, color = '#3B82F6', translateX = 0, translateY = 0, onParameterChange }) => {
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

  /**
   * Sincroniza el estado local con las props
   */
  useEffect(() => {
    if (currentTranslate.x !== translateX || currentTranslate.y !== translateY) {
      setCurrentTranslate({ x: translateX, y: translateY });
    }
  }, [translateX, translateY]);

  /**
   * Dibuja el fractal de Mandelbrot
   */
  const drawMandelbrot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    if (maxIterations <= 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    const angle = (rotation * Math.PI) / 180;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const baseRgb = hexToRgb(color);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let nx = (x - width / 2) * (4 / width) / zoom;
        let ny = (y - height / 2) * (4 / width) / zoom;
        let re = nx * cosA - ny * sinA + offsetX - currentTranslate.x / 200;
        let im = nx * sinA + ny * cosA + offsetY - currentTranslate.y / 200;
        let cRe = re;
        let cIm = im;
        let n = 0;
        while (n < maxIterations) {
          let re2 = re * re - im * im;
          let im2 = 2 * re * im;
          re = re2 + cRe;
          im = im2 + cIm;
          if (re * re + im * im > 4) break;
          n++;
        }
        const idx = 4 * (y * width + x);
        if (n === maxIterations) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        } else {
          const factor = Math.min(1, n / Math.max(1, maxIterations * 0.8));
          data[idx] = Math.round(baseRgb.r * factor);
          data[idx + 1] = Math.round(baseRgb.g * factor);
          data[idx + 2] = Math.round(baseRgb.b * factor);
          data[idx + 3] = Math.round(255 * Math.pow(factor, 0.5));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [width, height, maxIterations, zoom, currentTranslate, rotation, color]);

  /**
   * Redibuja cuando cambian parámetros
   */
  useEffect(() => {
    drawMandelbrot();
  }, [drawMandelbrot, color]);

  /**
   * Maneja arrastre con mouse
   */
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

  /**
   * Maneja arrastre con touch
   */
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

  /**
   * Maneja zoom con rueda del mouse
   */
  const handleWheel = (e) => {
    e.preventDefault();
  };

  /**
   * Configura eventos de mouse y touch
   */
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

  return (
    <canvas
      ref={canvasRef}
      className="fractal-canvas"
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', display: 'block', cursor: isDragging ? 'grabbing' : 'grab', background: 'transparent' }}
    />
  );
};

export default MandelbrotFractal;
