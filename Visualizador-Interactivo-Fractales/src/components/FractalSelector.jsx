import React, { useMemo, useCallback } from 'react';

// Componente para botón de fractal optimizado
const FractalButton = React.memo(({ fractal, isSelected, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(fractal.id);
  }, [fractal.id, onClick]);

  return (
    <button
      type="button"
      className={`modern-fractal-btn ${isSelected ? 'active' : ''}`}
      onClick={handleClick}
    >
      <div className="fractal-icon">
        <i className={fractal.icon}></i>
      </div>
      <span className="fractal-name">{fractal.name}</span>
      {isSelected && (
        <div className="selection-indicator">
          <i className="bi bi-check-circle-fill"></i>
        </div>
      )}
    </button>
  );
});

/**
 * Selector de tipo de fractal
 */
const FractalSelector = React.memo(({ selectedFractal, onFractalChange }) => {
  // Lista de fractales disponibles
  const fractals = useMemo(() => [
    { id: 'mandelbrot', name: 'Mandelbrot', icon: 'bi-infinity' },
    { id: 'julia', name: 'Julia', icon: 'bi-circle-half' },
    { id: 'sierpinski', name: 'Sierpinski', icon: 'bi-triangle' },
    { id: 'koch', name: 'Koch', icon: 'bi-snow' },
    { id: 'tree', name: 'Árbol', icon: 'bi-tree' }
  ], []);

  // Manejador de cambio de fractal
  const handleClick = useCallback((fractalId) => {
    if (fractalId !== selectedFractal) {
      onFractalChange(fractalId);
    }
  }, [selectedFractal, onFractalChange]);

  return (
    <div className="controls-panel modern-panel fractal-selector-panel">
      <div className="panel-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-collection"></i>
          </div>
          <div className="header-text">
            <h6 className="panel-title">Tipo de Fractal</h6>
            <span className="panel-subtitle">Selecciona un fractal</span>
          </div>
        </div>
      </div>
      
      <div className="modern-fractal-grid">
        {fractals.map(fractal => (
          <FractalButton
            key={fractal.id}
            fractal={fractal}
            isSelected={selectedFractal === fractal.id}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  );
});

export default FractalSelector;
