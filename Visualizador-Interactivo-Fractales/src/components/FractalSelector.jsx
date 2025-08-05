import React, { useMemo, useCallback } from 'react';

/**
 * Componente FractalSelector - Selector de tipo de fractal optimizado
 */
const FractalSelector = React.memo(({ selectedFractal, onFractalChange }) => {
  // Lista de fractales disponibles memoizada
  const fractals = useMemo(() => [
    { id: 'mandelbrot', name: 'Mandelbrot', icon: 'bi-circle' },
    { id: 'julia', name: 'Julia', icon: 'bi-droplet' },
    { id: 'sierpinski', name: 'Sierpinski', icon: 'bi-triangle' },
    { id: 'koch', name: 'Koch', icon: 'bi-lightning' },
    { id: 'tree', name: 'Árbol', icon: 'bi-tree' }
  ], []);

  // Handler optimizado para evitar recreaciones
  const handleClick = useCallback((fractalId) => {
    if (fractalId !== selectedFractal) {
      onFractalChange(fractalId);
    }
  }, [selectedFractal, onFractalChange]);

  return (
    <div className="fractal-selector">
      <h6 className="text-secondary mb-3 fw-semibold">
        <i className="bi bi-collection me-2"></i>
        Tipo de Fractal
      </h6>
      
      {/* Grid de botones para fractales */}
      <div className="fractal-grid">
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

// Componente botón individual optimizado
const FractalButton = React.memo(({ fractal, isSelected, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(fractal.id);
  }, [fractal.id, onClick]);

  const buttonClassName = useMemo(() => 
    `fractal-btn ${isSelected ? 'active' : ''}`,
    [isSelected]
  );

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-label={`Seleccionar fractal ${fractal.name}`}
      title={`Fractal ${fractal.name}`}
    >
      <i className={`${fractal.icon} fs-4 mb-2`}></i>
      <div className="small fw-medium">{fractal.name}</div>
    </button>
  );
});

// Nombres para debugging
FractalSelector.displayName = 'FractalSelector';
FractalButton.displayName = 'FractalButton';

export default FractalSelector;
