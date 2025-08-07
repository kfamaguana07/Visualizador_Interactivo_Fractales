/**
 * Web Worker para cálculos intensivos de fractales
 * Libera el hilo principal para mejor UX
 */

// Función para calcular puntos del fractal de Mandelbrot
const calculateMandelbrot = (data) => {
  const { width, height, zoom, centerX, centerY, maxIterations } = data;
  const imageData = new Uint8ClampedArray(width * height * 4);
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const zx = (x - width / 2) / (zoom * width / 4) + centerX;
      const zy = (y - height / 2) / (zoom * height / 4) + centerY;
      
      let cx = zx;
      let cy = zy;
      let iteration = 0;
      
      while (cx * cx + cy * cy < 4 && iteration < maxIterations) {
        const tmp = cx * cx - cy * cy + zx;
        cy = 2 * cx * cy + zy;
        cx = tmp;
        iteration++;
      }
      
      const pixelIndex = (y * width + x) * 4;
      const color = iteration === maxIterations ? 0 : (iteration / maxIterations) * 255;
      
      imageData[pixelIndex] = color;     // R
      imageData[pixelIndex + 1] = color * 0.8; // G
      imageData[pixelIndex + 2] = color * 1.2; // B
      imageData[pixelIndex + 3] = 255;   // A
    }
  }
  
  return imageData;
};

// Función para optimizar cálculos del triángulo de Sierpinski
const optimizeSierpinskiPoints = (data) => {
  const { iterations, baseSize } = data;
  const points = [];
  
  // Pre-calcular todos los puntos para evitar recursión costosa
  const generatePoints = (level, x1, y1, x2, y2, x3, y3) => {
    if (level <= 0) {
      points.push({ x1, y1, x2, y2, x3, y3, level });
      return;
    }
    
    const mx1 = (x1 + x2) / 2;
    const my1 = (y1 + y2) / 2;
    const mx2 = (x2 + x3) / 2;
    const my2 = (y2 + y3) / 2;
    const mx3 = (x3 + x1) / 2;
    const my3 = (y3 + y1) / 2;
    
    generatePoints(level - 1, x1, y1, mx1, my1, mx3, my3);
    generatePoints(level - 1, mx1, my1, x2, y2, mx2, my2);
    generatePoints(level - 1, mx3, my3, mx2, my2, x3, y3);
  };
  
  // Triángulo base
  const height = baseSize * Math.sqrt(3) / 2;
  generatePoints(iterations, 0, -height/2, -baseSize/2, height/2, baseSize/2, height/2);
  
  return points;
};

// Función para optimizar el árbol fractal
const optimizeTreeStructure = (data) => {
  const { iterations, baseSize, branches } = data;
  const treeData = [];
  
  const generateBranches = (level, x, y, angle, length) => {
    if (level <= 0) return;
    
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    treeData.push({
      startX: x,
      startY: y,
      endX,
      endY,
      level,
      length
    });
    
    const newLength = length * 0.75;
    const leftAngle = angle - 0.5;
    const rightAngle = angle + 0.5;
    
    generateBranches(level - 1, endX, endY, leftAngle, newLength);
    generateBranches(level - 1, endX, endY, rightAngle, newLength);
  };
  
  generateBranches(iterations, 0, 0, -Math.PI / 2, baseSize);
  return treeData;
};

// Manejador principal del worker
self.onmessage = function(e) {
  const { type, data, id } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'mandelbrot':
        result = calculateMandelbrot(data);
        break;
      case 'sierpinski':
        result = optimizeSierpinskiPoints(data);
        break;
      case 'tree':
        result = optimizeTreeStructure(data);
        break;
      default:
        throw new Error(`Tipo de cálculo desconocido: ${type}`);
    }
    
    // Enviar resultado de vuelta al hilo principal
    self.postMessage({
      type: 'success',
      result,
      id
    });
    
  } catch (error) {
    // Enviar error de vuelta al hilo principal
    self.postMessage({
      type: 'error',
      error: error.message,
      id
    });
  }
};
