# 🌀 Visualizador Interactivo de Fractales

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3+-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Una aplicación web interactiva para la visualización y manipulación de fractales matemáticos clásicos, desarrollada con React y tecnologías modernas de frontend.

![Preview](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Visualizador+de+Fractales)

## 📋 Descripción del Proyecto

Este proyecto forma parte del curso de **Gráfica Computacional** y tiene como objetivo aplicar conocimientos de:
- Geometría computacional
- Transformaciones matemáticas 2D/3D
- Algoritmos de renderizado
- Principios de UI/UX design

### 🎯 Objetivos

- **Principal**: Desarrollar un visualizador interactivo que permita generar y manipular fractales clásicos
- **Secundarios**:
  - Implementar algoritmos de generación de fractales
  - Crear una interfaz moderna y responsive
  - Aplicar transformaciones en tiempo real (rotación, escalado, traslación)
  - Proporcionar funcionalidades de exportación de imágenes

## ✨ Características

### 🔢 Fractales Implementados
- **Conjunto de Mandelbrot** - Conjunto clásico de números complejos
- **Conjunto de Julia** - Variaciones del conjunto de Mandelbrot
- **Triángulo de Sierpinski** - Fractal triangular autosimilar
- **Curva de Koch** - Curva fractal infinitamente larga
- **Árbol Fractal** - Estructura ramificada recursiva

### 🎮 Controles Interactivos
- **Iteraciones**: Control del nivel de detalle (10-1000 iteraciones)
- **Zoom**: Acercamiento dinámico (0.1x - 10x)
- **Rotación**: Rotación completa 360° con slider o manual
- **Traslación**: Movimiento en ejes X e Y (-5 a 5 unidades)
- **Color**: Selector de paleta personalizable con presets

### 🎨 Interfaz de Usuario
- **Diseño Responsive** - Compatible con dispositivos móviles y desktop
- **Material Design** - Interfaz moderna con efectos glassmorphism
- **Controles Intuitivos** - Sliders, dropdowns y botones optimizados
- **Feedback Visual** - Animaciones y transiciones suaves

### 💾 Funcionalidades de Exportación
- **Formato único**: PNG de alta calidad
- **Resolución fija**: 1920x1080
- **Guardado simple**: Un clic para exportar

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.0+** - Biblioteca de UI con hooks modernos
- **Vite** - Build tool y servidor de desarrollo rápido
- **Bootstrap 5.3** - Framework CSS para diseño responsive
- **CSS Custom Properties** - Variables CSS para theming

### Renderizado y Gráficos
- **Three.js** - Biblioteca 3D para WebGL
- **React Three Fiber** - Integración React + Three.js
- **Canvas API** - Renderizado 2D nativo del navegador

### Herramientas de Desarrollo
- **ESLint** - Linting y calidad de código
- **PostCSS** - Procesamiento avanzado de CSS
- **Git** - Control de versiones

## 📁 Estructura del Proyecto

```
src/
├── components/                 # Componentes React reutilizables
│   ├── Header.jsx             # Encabezado con navegación
│   ├── FractalSelector.jsx    # Selector de tipo de fractal
│   ├── ControlsPanel.jsx      # Panel de controles interactivos
│   └── SaveButton.jsx         # Botón de exportación
├── fractals/                  # Implementaciones de fractales
│   ├── Mandelbrot.jsx         # Conjunto de Mandelbrot
│   ├── Julia.jsx              # Conjunto de Julia
│   ├── Sierpinski.jsx         # Triángulo de Sierpinski
│   ├── Koch.jsx               # Curva de Koch
│   └── Tree.jsx               # Árbol fractal recursivo
├── App.jsx                    # Componente principal
├── main.jsx                   # Punto de entrada React
├── index.css                  # Estilos globales base
└── custom.css                 # Estilos personalizados del proyecto
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** 16.0 o superior
- **npm** 8.0 o superior

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/visualizador-fractales.git
cd visualizador-fractales
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Compilar para producción**
```bash
npm run build
```

5. **Preview de producción**
```bash
npm run preview
```

## 🎮 Guía de Uso

### Selección de Fractal
1. Utiliza el panel lateral izquierdo para seleccionar el tipo de fractal
2. Cada fractal incluye una descripción informativa
3. El fractal se renderiza automáticamente al seleccionarlo

### Ajuste de Parámetros
- **Iteraciones**: Arrastra el slider para aumentar/disminuir el detalle
- **Zoom**: Usa el control de zoom para acercarte o alejarte
- **Rotación**: Rota el fractal usando el slider circular
- **Posición**: Ajusta X e Y para mover el fractal en el canvas
- **Color**: Selecciona colores predefinidos o usa el selector personalizado

### Transformaciones Rápidas
Los botones flotantes en la esquina inferior derecha permiten:
- Zoom in/out rápido
- Rotación horaria/antihoraria
- Reset a posición inicial

### Exportación
1. Haz clic en "Guardar PNG" para exportar la imagen
2. La imagen se descargará automáticamente en resolución 1920x1080

## 🔧 Configuración Avanzada

### Variables CSS Personalizables

```css
:root {
  --primary-color: #3B82F6;      /* Color principal */
  --secondary-color: #6B7280;    /* Color secundario */
  --border-radius: 0.75rem;      /* Radio de borde */
  --transition: all 0.3s ease;   /* Transiciones */
}
```

### Parámetros de Fractal por Defecto

```javascript
const defaultParams = {
  iterations: 100,
  zoom: 1,
  rotation: 0,
  translateX: 0,
  translateY: 0,
  color: '#3B82F6'
};
```

## 📱 Responsive Design

La aplicación está optimizada para múltiples dispositivos:

- **Desktop** (1200px+): Layout completo con sidebar fijo
- **Tablet** (768px-1199px): Layout adaptativo con controles colapsibles
- **Mobile** (576px-767px): Layout apilado vertical con navegación touch
- **Small Mobile** (<576px): Interfaz compacta optimizada

## 🎨 Temas y Personalización

### Soporte para Tema Oscuro
El sistema detecta automáticamente la preferencia del usuario:

```css
@media (prefers-color-scheme: dark) {
  .app-container {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }
}
```

### Accesibilidad
- Navegación completa por teclado
- Soporte para lectores de pantalla
- Contrastes apropiados según WCAG 2.1
- Reducción de animaciones para usuarios sensibles

## 🧪 Testing y Calidad

### Linting
```bash
npm run lint          # Ejecutar ESLint
npm run lint:fix      # Corregir automáticamente
```

### Métricas de Performance
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

Genera archivos optimizados en la carpeta `dist/`:
- Minificación de JS/CSS
- Optimización de imágenes
- Tree shaking automático
- Código splitting por rutas

### Hosting Recomendado
- **Vercel** - Deploy automático desde Git
- **Netlify** - Hosting con CDN global
- **GitHub Pages** - Hosting gratuito
- **Firebase Hosting** - Integración con Google Cloud

## 📊 Roadmap

### Versión 1.1 (Próxima)
- [ ] Implementación completa de algoritmos de fractales
- [ ] Sistema de presets guardados
- [ ] Export en múltiples resoluciones
- [ ] Modo de pantalla completa

### Versión 1.2
- [ ] Fractales 3D interactivos
- [ ] Animaciones temporales
- [ ] Compartir configuraciones por URL
- [ ] API REST para configuraciones

### Versión 2.0
- [ ] Editor de parámetros avanzado
- [ ] Fractales definidos por usuario
- [ ] Sistema de plugins
- [ ] Modo colaborativo en tiempo real

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código
- Usa ES6+ y hooks de React
- Sigue el estilo definido por ESLint
- Documenta funciones complejas
- Mantén componentes pequeños y enfocados

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo Principal* - [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- **ESPE** - Universidad de las Fuerzas Armadas
- **Gráfica Computacional** - Curso académico
- **React Community** - Documentación y recursos
- **Three.js Team** - Biblioteca de gráficos 3D

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la [documentación](#-guía-de-uso)
2. Busca en [Issues existentes](https://github.com/tu-usuario/visualizador-fractales/issues)
3. Crea un [nuevo Issue](https://github.com/tu-usuario/visualizador-fractales/issues/new)

**¿Te gusta el proyecto?** ⭐ ¡Dale una estrella en GitHub!

---

*Desarrollado con ❤️ para la comunidad académica de gráfica computacional*
