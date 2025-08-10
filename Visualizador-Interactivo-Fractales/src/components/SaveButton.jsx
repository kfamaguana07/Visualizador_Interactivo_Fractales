import React, { useState, useCallback, useMemo } from 'react';

/**
 * Botón para guardar fractal como PNG
 */
const SaveButton = React.memo(({ selectedFractal, fractalParams, darkMode }) => {
  const [isSaving, setIsSaving] = useState(false);

  // Función para guardar el fractal como PNG
  const handleSave = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const canvas = document.querySelector('.fractal-canvas');
      if (!canvas) {
        throw new Error('No se encontró el canvas del fractal');
      }
      
      // Crear canvas temporal con el fondo apropiado según el modo
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Usar el color de fondo apropiado según el modo
      if (darkMode) {
        // Fondo oscuro para modo dark (gradiente como en el CSS)
        const gradient = tempCtx.createLinearGradient(0, 0, tempCanvas.width, tempCanvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        tempCtx.fillStyle = gradient;
      } else {
        // Fondo blanco para modo claro
        tempCtx.fillStyle = '#ffffff';
      }
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      
      // Generar nombre de archivo y descargar
      const dataURL = tempCanvas.toDataURL('image/png', 1.0);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const fileName = `fractal_${selectedFractal}_prof${fractalParams.iterations}_${timestamp}.png`;
      
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      tempCanvas.remove();
      
    } catch (error) {
      console.error('Error al guardar el fractal:', error);
      alert('Error al guardar el fractal. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, selectedFractal, fractalParams, darkMode]);

  // Nombre del archivo generado
  const fileName = useMemo(() => {
    const timestamp = new Date().toISOString().slice(0, 10);
    return `fractal_${selectedFractal}_prof${fractalParams.iterations}_${timestamp}.png`;
  }, [selectedFractal, fractalParams.iterations]);

  return (
    <div className="controls-panel modern-panel save-panel">
      <div className="panel-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-download"></i>
          </div>
          <div className="header-text">
            <h6 className="panel-title">Exportar</h6>
            <span className="panel-subtitle">Descargar fractal</span>
          </div>
        </div>
      </div>
      
      <div className="save-panel-body">
        <button
          type="button"
          className={`modern-save-btn ${isSaving ? 'saving' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          <div className="save-btn-content">
            {isSaving ? (
              <>
                <div className="save-spinner"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <i className="bi bi-download"></i>
                <span>Descargar PNG</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
});

export default SaveButton;
