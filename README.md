# 🚀 Portafolio 3D Interactivo - Setup Gamer & Multimedia Room

Un portafolio web interactivo en 3D inspirado en el estilo de **Jesse Zhou**, desarrollado con **Three.js**, **GSAP** y **Vite**.

El proyecto representa una habitación gamer/multimedia isométrica interactiva en 3D con iluminación realista, modelos GLTF/GLB detallados, ventiladores animados por shaders/mixers, pantallas interactivas con Canvas dinámico, y dos monitores en la pared reproduciendo videos y transmisiones en vivo con `THREE.VideoTexture`.

---

## ✨ Características Principales

- **🎮 Setup Gamer Personalizado**:
  - Escritorio con monitores duales (pantalla principal interactiva con carrusel de proyectos y enlaces reales; pantalla secundaria vertical con redes sociales y formulario de contacto).
  - Torre PC Gamer con ventiladores animados en tiempo real e iluminación RGB dinámica.
  - Silla gamer ergonómica, teclado mecánico, mousepad con luces LED y ratón.
  - Smart TV en pared con soporte, PlayStation 5 GTA VI Edition, control remoto y rack moderno.
- **🎬 Transmisión de Video en Pared (Estilo Jesse Zhou)**:
  - Dos pantallas widescreen con bordes delgados de aluminio y retroiluminación ambiental.
  - Reproducción continua de video mediante `THREE.VideoTexture`.
  - Panel interactivo con control de audio, pausa/play, presets de canales y carga de URLs de streaming en directo (.mp4).
- **🎥 Sistema de Cámaras Cinemáticas (GSAP)**:
  - Puntos de interés (POIs) interactivos con transiciones suaves: Vista General, Monitor Principal, Monitor Vertical, Torre PC, Silla Gamer, Periféricos y Pantallas de Video.
- **✨ Iluminación y Renderizado de Alta Gama**:
  - Sombras suaves (PCFSoftShadowMap), ACESFilmicToneMapping, luces de acento cian/magenta y luz ambiental de estudio.

---

## 🛠️ Tecnologías

- **Three.js** (v0.169.0)
- **GSAP** (v3.12.5)
- **Vite** (v5.4.8)
- **GLTFLoader** & **OrbitControls**
- **HTML5 Canvas** & **VideoTexture**

---

## 📦 Instalación y Uso Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Danielcastro5/portafolio-programacion.git
   cd portafolio-programacion
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 📁 Estructura del Proyecto

```text
├── index.html                 # Estructura del DOM, modales y HUD
├── main.js                    # Motor Three.js, GSAP, iluminación y lógica 3D
├── style.css                  # Estilos visuales y diseño premium
├── package.json               # Dependencias (three, gsap, vite)
├── README.md                  # Documentación
│
└── public/                    # Recursos estáticos
    ├── models/                # Modelos 3D GLB optimizados
    └── videos/                # Clips de video locales para la pared
```

---

## 👤 Autor

Desarrollado por **Daniel Castro** ([@Danielcastro5](https://github.com/Danielcastro5)).
