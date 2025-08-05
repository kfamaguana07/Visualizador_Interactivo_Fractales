import React, { useState, useCallback, useMemo } from 'react';

/**
 * Componente SaveButton optimizado - Botón para guardar PNG
 */
const SaveButton = React.memo(({ selectedFractal, fractalParams }) => {
  const [isSaving, setIsSaving] = useState(false);

  // Handler optimizado para el guardado
  const handleSave = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Simulación del proceso de guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En el futuro aquí se implementará la lógica real de guardado
      console.log('Guardando fractal:', {
        type: selectedFractal,
        params: fractalParams,
        timestamp: new Date().toISOString()
      });
      
      // Mostrar notificación de éxito
      console.log('Fractal guardado exitosamente como PNG');
      
    } catch (error) {
      console.error('Error al guardar el fractal:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, selectedFractal, fractalParams]);

  // Nombre del archivo generado dinámicamente
  const fileName = useMemo(() => {
    const timestamp = new Date().toISOString().slice(0, 10);
    return `fractal_${selectedFractal}_${timestamp}.png`;
  }, [selectedFractal]);

  // Contenido del botón memoizado
  const buttonContent = useMemo(() => {
    if (isSaving) {
      return (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Guardando...</span>
          </span>
          Guardando...
        </>
      );
    }
    
    return (
      <>
        <i className="bi bi-download me-2"></i>
        Guardar PNG
      </>
    );
  }, [isSaving]);

  // Clase CSS del botón optimizada
  const buttonClassName = useMemo(() => 
    `btn btn-success w-100 ${isSaving ? 'disabled' : ''}`,
    [isSaving]
  );

  return (
    <div className="save-button-container">
      <h6 className="text-secondary mb-3 fw-semibold">
        <i className="bi bi-download me-2"></i>
        Exportar
      </h6>
      
      <button
        type="button"
        className={buttonClassName}
        onClick={handleSave}
        disabled={isSaving}
        title={`Guardar como ${fileName}`}
        aria-label={`Guardar fractal ${selectedFractal} como PNG`}
      >
        {buttonContent}
      </button>
      
      <SaveInfo fileName={fileName} isSaving={isSaving} />
    </div>
  );
});

// Componente separado para la información de guardado
const SaveInfo = React.memo(({ fileName, isSaving }) => {
  const infoText = useMemo(() => {
    if (isSaving) {
      return 'Procesando imagen...';
    }
    return `Archivo: ${fileName}`;
  }, [fileName, isSaving]);

  return (
    <small className="text-muted d-block text-center mt-2">
      <div>Resolución: 1920x1080</div>
      <div className="mt-1">{infoText}</div>
    </small>
  );
});

// Nombres para debugging
// Nombres para debugging
SaveButton.displayName = 'SaveButton';
SaveInfo.displayName = 'SaveInfo';

export default SaveButton;
