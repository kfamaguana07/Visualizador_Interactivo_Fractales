
  # 📚 Proyecto 3 - Computación Gráfica (NRC 22419)

  # *Tema:* Visualizador Interactivo de Fractales

  ### 👥 Integrantes
  - Kevin Fernando Amaguaña Casa
  - Guamán Pulupa Alexander Daniel
  - Tipán Ávila Reishel Dayelin

  **Asignatura:** Computación Gráfica - NRC 22419

  ---

  ## 📝 Descripción
  Aplicación web interactiva que permite visualizar, manipular y exportar fractales clásicos como la Curva de Koch, Triángulo de Sierpinski, Conjunto de Mandelbrot, Conjunto de Julia y Árbol fractal recursivo. El usuario puede modificar parámetros como iteraciones, color, zoom, rotación y traslación en tiempo real, y guardar la imagen generada.

  ---

  ## 🚀 Tecnologías utilizadas
  - ⚛️ React
  - 🟦 JavaScript (ES6+)
  - 🖼️ HTML5 Canvas
  - 🎨 CSS3
  - ⚡ Vite

  ---

  ## ✨ Características principales
  - 🧩 Generación y visualización de fractales clásicos.
  - 🎚️ Controles interactivos para iteraciones, color, zoom, rotación y traslación.
  - 🔄 Transformaciones en tiempo real.
  - 💾 Exportación de la imagen generada en formato PNG.
  - 🖥️ Interfaz moderna, clara y responsiva.
  - ⌨️ Soporte para controles de teclado y mouse.
  - 📱 Compatible con dispositivos móviles y escritorio.

  ---

  ## 🛠️ Instalación y uso
  1. Clona el repositorio:
    ```
    git clone https://github.com/kfamaguana07/Visualizador_Interactivo_Fractales.git
    ```
  2. Instala las dependencias:
    ```
    npm install
    ```
  3. Inicia la aplicación:
    ```
    npm run dev
    ```
  4. Abre tu navegador en `http://localhost:5173` (o el puerto indicado).

  ---

  ## 🗂️ Estructura del proyecto
  ```
  src/
  ├── components/                 # Componentes React reutilizables
  │   ├── FractalSelector.jsx    # Selector de tipo de fractal
  │   ├── ControlsPanel.jsx      # Panel de controles interactivos
  │   └── SaveButton.jsx         # Botón de exportación
  ├── fractals/                  # Implementaciones de fractales
  │   ├── MandelbrotFractal.jsx  # Conjunto de Mandelbrot
  │   ├── JuliaFractal.jsx       # Conjunto de Julia
  │   ├── SierpinskiFractal.jsx  # Triángulo de Sierpinski
  │   ├── KochFractal.jsx        # Curva de Koch
  │   └── TreeFractal.jsx        # Árbol fractal recursivo
  ├── App.jsx                    # Componente principal
  ├── main.jsx                   # Punto de entrada React
  ├── index.css                  # Estilos globales base
  └── styles.css                 # Estilos personalizados del proyecto
  ```
  - `src/components/`: Paneles de control, selectores, botones.
  - `src/fractals/`: Componentes de fractales (Koch, Sierpinski, Mandelbrot, Julia, Árbol).
  - `src/assets/`: Recursos gráficos y estilos.
  - `public/`: Archivos estáticos.

  ---

  ## 🎮 ¿Cómo usar?
  - Selecciona el tipo de fractal desde el panel de opciones.
  - Ajusta los parámetros de iteración, color, zoom, rotación y traslación.
  - Interactúa con el fractal usando el mouse (zoom, arrastre) y el teclado (rotación, iteraciones).
  - Haz clic en el botón de guardar para exportar la imagen generada.

  ---


  ---

  ## 📌 Créditos y agradecimientos
  Proyecto realizado para la asignatura de Computación Gráfica - NRC 22419.

  Desarrollado por:
  - Kevin Fernando Amaguaña Casa
  - Guamán Pulupa Alexander Daniel
  - Tipán Ávila Reishel Dayelin


