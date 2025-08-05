import React, { useCallback, useMemo, useRef } from 'react';

/**
 * Hook personalizado para debouncing de funciones
 */
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

/**
 * Componente ControlsPanel - Panel de control optimizado
 */
const ControlsPanel = React.memo(({ fractalParams, onParameterChange }) => {
  // Debounce para sliders que pueden cambiar frecuentemente
  const debouncedParameterChange = useDebounce(onParameterChange, 50);

  // Handlers optimizados con useCallback
  const handleSliderChange = useCallback((param, value) => {
    const parsedValue = parseFloat(value);
    debouncedParameterChange(param, parsedValue);
  }, [debouncedParameterChange]);

  const handleColorChange = useCallback((color) => {
    onParameterChange('color', color);
  }, [onParameterChange]);

  const resetParameters = useCallback(() => {
    const defaults = {
      iterations: 100,
      zoom: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0,
      color: '#3B82F6'
    };
    
    Object.entries(defaults).forEach(([param, value]) => {
      onParameterChange(param, value);
    });
  }, [onParameterChange]);

  // Colores predeterminados memoizados
  const presetColors = useMemo(() => [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ], []);

  // Configuración de controles memoizada
  const controlsConfig = useMemo(() => [
    {
      key: 'iterations',
      label: 'Iteraciones',
      min: 10,
      max: 1000,
      step: 10,
      value: fractalParams.iterations,
      displayValue: fractalParams.iterations,
      badgeClass: 'bg-primary'
    },
    {
      key: 'zoom',
      label: 'Zoom',
      min: 0.1,
      max: 10,
      step: 0.1,
      value: fractalParams.zoom,
      displayValue: `${fractalParams.zoom.toFixed(1)}x`,
      badgeClass: 'bg-success'
    },
    {
      key: 'rotation',
      label: 'Rotación',
      min: 0,
      max: 360,
      step: 1,
      value: fractalParams.rotation,
      displayValue: `${fractalParams.rotation}°`,
      badgeClass: 'bg-warning'
    }
  ], [fractalParams.iterations, fractalParams.zoom, fractalParams.rotation]);

  return (
    <div className="controls-panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-secondary mb-0 fw-semibold">
          <i className="bi bi-sliders me-2"></i>
          Parámetros
        </h6>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={resetParameters}
          title="Resetear parámetros"
          aria-label="Resetear todos los parámetros"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div className="controls-grid">
        {/* Controles principales */}
        {controlsConfig.map(control => (
          <SliderControl
            key={control.key}
            config={control}
            onChange={handleSliderChange}
          />
        ))}

        {/* Posición X e Y */}
        <div className="row mb-4">
          <div className="col-6">
            <PositionControl
              label="Pos X"
              value={fractalParams.translateX}
              onChange={(value) => handleSliderChange('translateX', value)}
            />
          </div>
          <div className="col-6">
            <PositionControl
              label="Pos Y"
              value={fractalParams.translateY}
              onChange={(value) => handleSliderChange('translateY', value)}
            />
          </div>
        </div>

        {/* Selector de Color */}
        <ColorPicker
          currentColor={fractalParams.color}
          presetColors={presetColors}
          onChange={handleColorChange}
        />
      </div>
    </div>
  );
});

// Componente optimizado para controles de slider
const SliderControl = React.memo(({ config, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(config.key, e.target.value);
  }, [config.key, onChange]);

  return (
    <div className="control-item mb-4">
      <div className="d-flex justify-content-between mb-2">
        <label className="small text-muted">{config.label}</label>
        <span className={`badge ${config.badgeClass} small`}>
          {config.displayValue}
        </span>
      </div>
      <input
        type="range"
        className="form-range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={config.value}
        onChange={handleChange}
        aria-label={`${config.label} slider`}
      />
    </div>
  );
});

// Componente optimizado para controles de posición
const PositionControl = React.memo(({ label, value, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  const displayValue = useMemo(() => value.toFixed(1), [value]);

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <label className="small text-muted">{label}</label>
        <span className="small text-muted">{displayValue}</span>
      </div>
      <input
        type="range"
        className="form-range"
        min="-5"
        max="5"
        step="0.1"
        value={value}
        onChange={handleChange}
        aria-label={`${label} position slider`}
      />
    </>
  );
});

// Componente optimizado para selector de color
const ColorPicker = React.memo(({ currentColor, presetColors, onChange }) => {
  const handleColorClick = useCallback((color) => {
    onChange(color);
  }, [onChange]);

  const handleColorInputChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="control-item">
      <label className="small text-muted mb-2 d-block">Color</label>
      <div className="color-picker-simple">
        <div className="d-flex gap-2 mb-2">
          {presetColors.map((color, index) => (
            <ColorDot
              key={color}
              color={color}
              isActive={currentColor === color}
              onClick={handleColorClick}
            />
          ))}
        </div>
        <input
          type="color"
          className="form-control form-control-color"
          value={currentColor}
          onChange={handleColorInputChange}
          aria-label="Color picker"
        />
      </div>
    </div>
  );
});

// Componente optimizado para cada punto de color
const ColorDot = React.memo(({ color, isActive, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(color);
  }, [color, onClick]);

  const className = useMemo(() => 
    `color-dot ${isActive ? 'active' : ''}`,
    [isActive]
  );

  return (
    <button
      type="button"
      className={className}
      style={{ backgroundColor: color }}
      onClick={handleClick}
      title={`Color ${color}`}
      aria-label={`Seleccionar color ${color}`}
      aria-pressed={isActive}
    />
  );
});

// Nombres para debugging
ControlsPanel.displayName = 'ControlsPanel';
SliderControl.displayName = 'SliderControl';
PositionControl.displayName = 'PositionControl';
ColorPicker.displayName = 'ColorPicker';
ColorDot.displayName = 'ColorDot';

export default ControlsPanel;
