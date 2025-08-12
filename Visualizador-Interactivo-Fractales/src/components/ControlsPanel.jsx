import React, { useCallback, useMemo } from 'react';

/**
 * Componente para controles de slider optimizado
 */
const SliderControl = React.memo(({ config, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(config.key, parseFloat(e.target.value));
  }, [config.key, onChange]);

  const handleDecrement = useCallback(() => {
    onChange(config.key, Math.max(config.min, config.value - config.step));
  }, [config.key, config.value, config.min, config.step, onChange]);

  const handleIncrement = useCallback(() => {
    onChange(config.key, Math.min(config.max, config.value + config.step));
  }, [config.key, config.value, config.max, config.step, onChange]);

  const percentage = ((config.value - config.min) / (config.max - config.min)) * 100;

  return (
    <div className="modern-control-card">
      <div className="control-header">
        <label className="control-label">{config.label}</label>
        <div className="value-badge">{config.displayValue}</div>
      </div>
      
      <div className="control-body">
        <button
          type="button"
          className="control-btn"
          onClick={handleDecrement}
          disabled={config.value <= config.min}
        >
          <i className="bi bi-dash"></i>
        </button>
        
        <div className="slider-container">
          <input
            type="range"
            className="modern-slider"
            min={config.min}
            max={config.max}
            step={config.step}
            value={config.value}
            onChange={handleChange}
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
            }}
          />
        </div>
        
        <button
          type="button"
          className="control-btn"
          onClick={handleIncrement}
          disabled={config.value >= config.max}
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>
    </div>
  );
});

/**
 * Componente para selector de color optimizado
 */
const ColorPicker = React.memo(({ currentColor, onChange }) => {
  const presetColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const handleColorClick = useCallback((color) => onChange(color), [onChange]);
  const handleColorInputChange = useCallback((e) => onChange(e.target.value), [onChange]);

  return (
    <div className="modern-control-card color-picker-card">
      <div className="control-header">
        <label className="control-label">Color</label>
        <div className="color-preview" style={{ backgroundColor: currentColor }}></div>
      </div>
      
      <div className="color-picker-body">
        <div className="preset-colors">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`modern-color-dot ${currentColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
            >
              {currentColor === color && <i className="bi bi-check"></i>}
            </button>
          ))}
        </div>
        
        <div className="custom-color-wrapper">
          <label className="custom-color-label">Personalizado</label>
          <input
            type="color"
            className="modern-color-input"
            value={currentColor}
            onChange={handleColorInputChange}
          />
        </div>
      </div>
    </div>
  );
});

/**
 * Panel de control principal para parámetros del fractal
 */
const ControlsPanel = React.memo(({ fractalParams, onParameterChange, selectedFractal }) => {
  const resetParameters = useCallback(() => {
    const defaults = { iterations: 5, zoom: 0.5, rotation: 0, translateX: 0, translateY: 0, color: '#3B82F6' };
    Object.entries(defaults).forEach(([param, value]) => onParameterChange(param, value));
  }, [onParameterChange]);

  const controlsConfig = useMemo(() => {
    const fractalConfigs = {
      tree: { iterations: { max: 15 }, zoom: { max: 2 } },
      sierpinski: { iterations: { max: 7 }, zoom: { max: 3 } },
      koch: { iterations: { max: 10 }, zoom: { max: 6 } },
      mandelbrot: { iterations: { max: 40 }, zoom: { max: 3 } },
      julia: { iterations: { max: 100 }, zoom: { max: 3 } },
      default: { iterations: { max: 20 }, zoom: { max: 2 } }
    };

    const config = fractalConfigs[selectedFractal] || fractalConfigs.default;

    return [
      {
        key: 'iterations',
        label: 'Profundidad',
        min: 0,
        max: config.iterations.max,
        step: 1,
        value: fractalParams.iterations,
        displayValue: fractalParams.iterations
      },
      {
        key: 'zoom',
        label: 'Escalar',
        min: 0,
        max: config.zoom.max,
        step: 0.1,
        value: fractalParams.zoom,
        displayValue: `${fractalParams.zoom.toFixed(1)}x`
      },
      {
        key: 'rotation',
        label: 'Rotación',
        min: 0,
        max: 360,
        step: 1,
        value: fractalParams.rotation,
        displayValue: `${fractalParams.rotation}°`
      }
    ];
  }, [fractalParams, selectedFractal]);

  return (
    <div className="controls-panel modern-panel">
      <div className="panel-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-sliders"></i>
          </div>
          <div className="header-text">
            <h6 className="panel-title">Parámetros</h6>
            <span className="panel-subtitle">Controles del Fractal</span>
          </div>
        </div>
        <button className="reset-btn" onClick={resetParameters}>
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div className="modern-controls-grid">
        {controlsConfig.map(control => (
          <SliderControl
            key={control.key}
            config={control}
            onChange={onParameterChange}
          />
        ))}

        <ColorPicker
          currentColor={fractalParams.color}
          onChange={(color) => onParameterChange('color', color)}
        />
      </div>
    </div>
  );
});

export default ControlsPanel;
