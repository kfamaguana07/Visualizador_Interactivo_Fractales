import React, { useState, useCallback } from 'react';
import FractalSelector from './components/FractalSelector';
import ControlsPanel from './components/ControlsPanel';
import SaveButton from './components/SaveButton';
import TreeFractal from './fractals/TreeFractal';
import SierpinskiFractal from './fractals/SierpinskiFractal';
import KochFractal from './fractals/KochFractal';
import MandelbrotFractal from './fractals/MandelbrotFractal';
import JuliaFractal from './fractals/JuliaFractal';
import './styles.css';

/**
 * Aplicación principal del visualizador de fractales
 */
function App() {
  // Estados principales
  const [selectedFractal, setSelectedFractal] = useState('mandelbrot');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [fractalParams, setFractalParams] = useState({
    iterations: 5,
    zoom: 0.5,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    color: '#3B82F6'
  });

  // Manejadores de eventos optimizados
  const handleParameterChange = useCallback((param, value) => {
    setFractalParams(prev => ({
      ...prev,
      [param]: value
    }));
  }, []);

  const handleFractalChange = useCallback((fractalId) => {
    setSelectedFractal(fractalId);
    
    // Ajustar parámetros según límites del fractal seleccionado
    setFractalParams(prev => {
      const newParams = { ...prev };
      
      if (fractalId === 'sierpinski') {
        // Límites para Sierpinski: iteraciones max 7, zoom max 3
        newParams.iterations = Math.min(prev.iterations, 7);
        newParams.zoom = Math.min(prev.zoom, 3);
      } else if (fractalId === 'tree') {
        // Límites para Árbol: iteraciones max 20, zoom max 2
        newParams.iterations = Math.min(prev.iterations, 20);
        newParams.zoom = Math.min(prev.zoom, 2);
      } else if (fractalId === 'koch') {
        // Límites para Koch: iteraciones max 10, zoom max 6
        newParams.iterations = Math.min(prev.iterations, 10);
        newParams.zoom = Math.min(prev.zoom, 6);
      }
      
      return newParams;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
  }, []);

  // Renderizar fractal seleccionado
  const renderFractal = () => {
    switch (selectedFractal) {
      case 'mandelbrot':
        return (
          <MandelbrotFractal
            width={900}
            height={600}
            maxIterations={Math.max(1, fractalParams.iterations + 1)}
            zoom={fractalParams.zoom}
            offsetX={fractalParams.translateX / 200}
            offsetY={fractalParams.translateY / 200}
            rotation={fractalParams.rotation}
            color={fractalParams.color}
            translateX={fractalParams.translateX}
            translateY={fractalParams.translateY}
          />
        );
      case 'julia':
        return (
          <JuliaFractal
            width={900}
            height={600}
            maxIterations={Math.max(1, fractalParams.iterations + 1)}
            zoom={fractalParams.zoom}
            offsetX={fractalParams.translateX / 200}
            offsetY={fractalParams.translateY / 200}
            rotation={fractalParams.rotation}
            color={fractalParams.color}
            translateX={fractalParams.translateX}
            translateY={fractalParams.translateY}
          />
        );
      case 'tree':
        return (
          <TreeFractal
            iterations={fractalParams.iterations}
            zoom={fractalParams.zoom}
            rotation={fractalParams.rotation}
            translateX={fractalParams.translateX}
            translateY={fractalParams.translateY}
            color={fractalParams.color}
          />
        );
      case 'sierpinski':
        return (
          <SierpinskiFractal
            iterations={fractalParams.iterations}
            zoom={fractalParams.zoom}
            rotation={fractalParams.rotation}
            translateX={fractalParams.translateX}
            translateY={fractalParams.translateY}
            color={fractalParams.color}
          />
        );
      case 'koch':
        return (
          <KochFractal
            iterations={fractalParams.iterations}
            zoom={fractalParams.zoom}
            rotation={fractalParams.rotation}
            translateX={fractalParams.translateX}
            translateY={fractalParams.translateY}
            color={fractalParams.color}
          />
        );
      default:
        return (
          <div className="canvas-placeholder">
            <div className="placeholder-content">
              <i className="bi bi-bezier2 display-1 text-primary mb-3"></i>
              <h3 className="text-primary mb-3">Visualizador de Fractales</h3>
              <p className="text-muted mb-4">
                Fractal "{selectedFractal}" en desarrollo. <br />
                Selecciona "Árbol", "Sierpinski", "Koch", "Mandelbrot" o "Julia" para ver los fractales implementados.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container-fluid main-content p-0">
        <div className="row g-0 h-100">
          {/* Panel de Control */}
          <div className="col-xl-3 col-lg-4 col-md-5 sidebar-panel">
            <div className="sidebar-header">
              <div className="app-title">
                <h2 className="text-primary fw-bold mb-1">
                  <i className="bi bi-diagram-3 me-2"></i>
                  Fractales
                </h2>
                <p className="text-muted small mb-0">Visualizador Interactivo</p>
              </div>

              <button 
                className="btn btn-outline-secondary btn-sm dark-mode-toggle"
                onClick={toggleDarkMode}
              >
                <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}></i>
              </button>
            </div>

            <div className="sidebar-content">
              <div className="mb-4">
                <FractalSelector 
                  selectedFractal={selectedFractal}
                  onFractalChange={handleFractalChange}
                />
              </div>

              <div className="mb-4">
                <ControlsPanel 
                  fractalParams={fractalParams}
                  onParameterChange={handleParameterChange}
                  selectedFractal={selectedFractal}
                />
              </div>

              <div className="mb-4">
                <SaveButton 
                  selectedFractal={selectedFractal}
                  fractalParams={fractalParams}
                />
              </div>
            </div>
          </div>

          {/* Área de Visualización */}
          <div className="col-xl-9 col-lg-8 col-md-7 visualization-area">
            <div className="canvas-container">
              {renderFractal()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
