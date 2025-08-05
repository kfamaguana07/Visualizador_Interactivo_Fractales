import React, { useState, useCallback, useMemo } from 'react';
import FractalSelector from './components/FractalSelector';
import ControlsPanel from './components/ControlsPanel';
import SaveButton from './components/SaveButton';
import './index.css';
import './custom.css';
import './performance.css';

function App() {
  // Estados principales de la aplicación
  const [selectedFractal, setSelectedFractal] = useState('mandelbrot');
  const [darkMode, setDarkMode] = useState(() => {
    // Inicializar con preferencia del sistema o localStorage
    return localStorage.getItem('darkMode') === 'true' || 
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [fractalParams, setFractalParams] = useState({
    iterations: 100,
    zoom: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    color: '#3B82F6'
  });

  // Función optimizada para actualizar parámetros del fractal
  const handleParameterChange = useCallback((param, value) => {
    setFractalParams(prev => ({
      ...prev,
      [param]: value
    }));
  }, []);

  // Función optimizada para cambio de fractal
  const handleFractalChange = useCallback((fractalId) => {
    setSelectedFractal(fractalId);
  }, []);

  // Toggle dark mode optimizado con persistencia
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
  }, []);

  // Aplicar clase CSS de manera eficiente
  const containerClassName = useMemo(() => 
    `app-container ${darkMode ? 'dark-mode' : ''}`, 
    [darkMode]
  );

  // Datos estáticos memoizados
  const appTitle = useMemo(() => ({
    title: 'Fractales',
    subtitle: 'Visualizador Interactivo'
  }), []);

  return (
    <div className={containerClassName}>
      {/* Main Content */}
      <div className="container-fluid main-content p-0">
        <div className="row g-0 h-100">
          {/* Panel de Control - Sidebar con scroll */}
          <div className="col-xl-3 col-lg-4 col-md-5 sidebar-panel">
            <div className="sidebar-header">
              {/* Título de la aplicación */}
              <div className="app-title">
                <h2 className="text-primary fw-bold mb-1">
                  <i className="bi bi-diagram-3 me-2"></i>
                  {appTitle.title}
                </h2>
                <p className="text-muted small mb-0">{appTitle.subtitle}</p>
              </div>

              {/* Toggle Dark Mode */}
              <button 
                className="btn btn-outline-secondary btn-sm dark-mode-toggle"
                onClick={toggleDarkMode}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}></i>
              </button>
            </div>

            <div className="sidebar-content">
              {/* Selector de Fractal */}
              <div className="mb-4">
                <FractalSelector 
                  selectedFractal={selectedFractal}
                  onFractalChange={handleFractalChange}
                />
              </div>

              {/* Panel de Controles */}
              <div className="mb-4">
                <ControlsPanel 
                  fractalParams={fractalParams}
                  onParameterChange={handleParameterChange}
                />
              </div>

              {/* Botón de Guardado */}
              <div className="mb-4">
                <SaveButton 
                  selectedFractal={selectedFractal}
                  fractalParams={fractalParams}
                />
              </div>
            </div>
          </div>

          {/* Área de Visualización - Fixed */}
          <div className="col-xl-9 col-lg-8 col-md-7 visualization-area">
            <div className="canvas-container">
              <div className="canvas-placeholder">
                <div className="placeholder-content">
                  <i className="bi bi-bezier2 display-1 text-primary mb-3"></i>
                  <h3 className="text-primary mb-3">Visualizador de Fractales</h3>
                  <p className="text-muted mb-4">
                    Selecciona un fractal y ajusta los parámetros para comenzar la visualización
                  </p>
                  <div className="loading-animation">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(App);
