import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import gsap from 'gsap';

/* ==========================================================================
   CONFIGURACIÓN BÁSICA Y RENDERER
   ========================================================================== */
const canvas = document.getElementById('webgl');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0e14);
scene.fog = new THREE.FogExp2(0x0c0e14, 0.035);

const isMobile = window.innerWidth <= 768;

const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
// Vista isométrica cercana y cinematográfica adaptada a escala humana
camera.position.set(3.8, 3.4, 3.2);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

/* ==========================================================================
   CSS3D RENDERER (TRANSMISIÓN DE YOUTUBE EN VIVO DIRECTA EN 3D)
   ========================================================================== */
const cssScene = new THREE.Scene();
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(sizes.width, sizes.height);
cssRenderer.domElement.id = 'css3d';
cssRenderer.domElement.style.position = 'fixed';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.left = '0';
cssRenderer.domElement.style.width = '100%';
cssRenderer.domElement.style.height = '100%';
cssRenderer.domElement.style.pointerEvents = 'none'; // Permite que OrbitControls reciba los clics del mouse
cssRenderer.domElement.style.zIndex = '1';
document.body.appendChild(cssRenderer.domElement);

// Referencias globales de las pantallas para alternar entre WebGL MP4 y YouTube CSS3D
let leftScreenMesh = null;
let rightScreenMesh = null;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.1, -1.6);
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.minDistance = 1.2;
controls.maxDistance = 12.0;

/* ==========================================================================
   ILUMINACIÓN DE ESTUDIO ARQUITECTÓNICO & GAMER
   ========================================================================== */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

// Luz direccional cenital suave con sombras finas
const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
dirLight.position.set(3.5, 6.0, 3.0);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 16;
dirLight.shadow.camera.left = -5;
dirLight.shadow.camera.right = 5;
dirLight.shadow.camera.top = 5;
dirLight.shadow.camera.bottom = -5;
dirLight.shadow.bias = -0.0003;
scene.add(dirLight);

// Luz de relleno lateral azulada fría para relieve y volumen
const fillLight = new THREE.DirectionalLight(0xa5c4f5, 0.75);
fillLight.position.set(-4, 3.5, 2);
scene.add(fillLight);

// Luz cálida sutil de contra-ángulo para silueta de la silla y torre
const rimLight = new THREE.DirectionalLight(0xffe8cc, 0.5);
rimLight.position.set(0, 3.5, 4);
scene.add(rimLight);

// Resplandor dinámico de la tira LED trasera en la pared
const deskLedLight = new THREE.PointLight(0x00f2fe, 2.2, 6);
deskLedLight.position.set(0, 1.2, -2.6);
scene.add(deskLedLight);

/* ==========================================================================
   TEXTURA PROCEDURAL DE ALFOMBRA NEGRA
   ========================================================================== */
function createBlackCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0c0e14';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    const v = Math.min(255, Math.max(0, 12 + noise));
    data[i] = v;
    data[i + 1] = v + 1;
    data[i + 2] = v + 4;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/* ==========================================================================
   CONSTRUCCIÓN DE LA HABITACIÓN (6.2m x 6.2m x 3.4m • ESCALA HUMANA REALISTA)
   ========================================================================== */
const interactiveObjects = [];
let fanLedMaterials = [];

function buildRoom() {
  const room = new THREE.Group();

  // 1. SUELO: ALFOMBRA NEGRA COMPLETA DE PARED A PARED
  const carpetTexture = createBlackCarpetTexture();
  const floorGeo = new THREE.BoxGeometry(6.2, 0.3, 6.2);
  const blackCarpetMat = new THREE.MeshStandardMaterial({
    color: 0x0c0e14,
    map: carpetTexture,
    roughness: 0.94,
    metalness: 0.02
  });
  const floor = new THREE.Mesh(floorGeo, blackCarpetMat);
  floor.position.y = -0.15;
  floor.receiveShadow = true;
  room.add(floor);

  // 2. PAREDES: BLANCO ROTO ARQUITECTÓNICO / GRIS TIZA DE ESTUDIO (#b4bcc8)
  const studioWallMat = new THREE.MeshStandardMaterial({
    color: 0xb4bcc8,
    roughness: 0.80,
    metalness: 0.01
  });

  // Pared izquierda
  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 6.2), studioWallMat);
  wallLeft.position.set(-3.05, 1.7, 0);
  wallLeft.receiveShadow = true;
  room.add(wallLeft);

  // Pared trasera
  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 0.2), studioWallMat);
  wallBack.position.set(0, 1.7, -3.05);
  wallBack.receiveShadow = true;
  room.add(wallBack);

  // Zócalo perimetral negro fino
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.35 });
  const bbBack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.12, 0.22), baseboardMat);
  bbBack.position.set(0, 0.06, -3.03);
  room.add(bbBack);

  const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 6.2), baseboardMat);
  bbLeft.position.set(-3.03, 0.06, 0);
  room.add(bbLeft);

  // 3. PANEL ARQUITECTÓNICO DE LISTONES VERTICALES
  const slatPanelGroup = new THREE.Group();
  const slatMat = new THREE.MeshStandardMaterial({ color: 0x1c202b, roughness: 0.45 });
  const slatCount = 24;
  const slatSpacing = 0.15;
  const slatStartX = -1.72;
  for (let s = 0; s < slatCount; s++) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 2.5, 0.02),
      slatMat
    );
    slat.position.set(slatStartX + s * slatSpacing, 1.8, -2.93);
    slat.castShadow = true;
    slat.receiveShadow = true;
    slatPanelGroup.add(slat);
  }
  room.add(slatPanelGroup);

  // 4. ESTANTE FLOTANTE MINIMALISTA EN GRAFITO
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x181c26, roughness: 0.4 });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 0.28), shelfMat);
  shelf.position.set(0, 2.7, -2.86);
  shelf.castShadow = true;
  room.add(shelf);

  // Maceta con planta sobre el estante flotante
  const potMat = new THREE.MeshStandardMaterial({ color: 0x12141c, roughness: 0.3 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 16), potMat);
  pot.position.set(-1.2, 2.82, -2.86);
  room.add(pot);

  const plantLeafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 });
  for (let l = 0; l < 6; l++) {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.01), plantLeafMat);
    leaf.rotation.z = (l - 2.5) * 0.24;
    leaf.rotation.y = l * 0.75;
    leaf.position.set(-1.2, 2.92, -2.86);
    room.add(leaf);
  }

  // 5. PANTALLAS DE VIDEO MURALES EN VIVO (ESTILO JESSE ZHOU • TRANSMISIÓN DE CINE/CLIPS/NBA)
  const videoFrameMat = new THREE.MeshStandardMaterial({
    color: 0x0e111a,
    roughness: 0.32,
    metalness: 0.75
  });

  // Pantalla Izquierda de Video
  const leftDisplayGroup = new THREE.Group();
  leftDisplayGroup.position.set(-2.05, 2.15, -2.93);

  const leftFrameMesh = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.80, 0.04), videoFrameMat);
  leftFrameMesh.castShadow = true;
  leftDisplayGroup.add(leftFrameMesh);

  const leftBacklightMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  fanLedMaterials.push(leftBacklightMat);
  const leftBacklight = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.84, 0.01), leftBacklightMat);
  leftBacklight.position.set(0, 0, -0.015);
  leftDisplayGroup.add(leftBacklight);

  leftScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.24, 0.74),
    new THREE.MeshBasicMaterial({
      map: leftVideoTex,
      side: THREE.DoubleSide,
      toneMapped: false
    })
  );
  leftScreenMesh.position.set(0, 0, 0.022);
  leftScreenMesh.userData = { section: 'leftVideo', label: 'Pantalla de Video 1 (Live Stream)' };
  interactiveObjects.push(leftScreenMesh);
  leftDisplayGroup.add(leftScreenMesh);

  room.add(leftDisplayGroup);

  // Pantalla Derecha de Video
  const rightDisplayGroup = new THREE.Group();
  rightDisplayGroup.position.set(2.05, 2.15, -2.93);

  const rightFrameMesh = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.80, 0.04), videoFrameMat);
  rightFrameMesh.castShadow = true;
  rightDisplayGroup.add(rightFrameMesh);

  const rightBacklightMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
  fanLedMaterials.push(rightBacklightMat);
  const rightBacklight = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.84, 0.01), rightBacklightMat);
  rightBacklight.position.set(0, 0, -0.015);
  rightDisplayGroup.add(rightBacklight);

  rightScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.24, 0.74),
    new THREE.MeshBasicMaterial({
      map: rightVideoTex,
      side: THREE.DoubleSide,
      toneMapped: false
    })
  );
  rightScreenMesh.position.set(0, 0, 0.022);
  rightScreenMesh.userData = { section: 'rightVideo', label: 'Pantalla de Video 2 (Live Stream)' };
  interactiveObjects.push(rightScreenMesh);
  rightDisplayGroup.add(rightScreenMesh);

  room.add(rightDisplayGroup);

  // Tira LED trasera pegada a la pared
  const deskLedStripMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  fanLedMaterials.push(deskLedStripMat);
  const deskLedStrip = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.02, 0.02), deskLedStripMat);
  deskLedStrip.position.set(0, 1.0, -2.92);
  room.add(deskLedStrip);

  scene.add(room);
}

/* ==========================================================================
   GENERADORES DE TEXTURAS DINÁMICAS (CANVAS 2D) PARA LAS PANTALLAS
   - PANTALLA 1: Monitor Ultrawide (Portafolio de Proyectos con Enlaces)
   - PANTALLA 2: Monitor Vertical (Contacto, Redes y Formulario de Solicitud)
   - PANTALLA 3: Pantalla Inteligente en Pared (Quiénes Somos & Stack Tech)
   ========================================================================== */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function createProjectsScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Fondo cyber degradado
  const bgGrad = ctx.createLinearGradient(0, 0, 2048, 1024);
  bgGrad.addColorStop(0, '#090c16');
  bgGrad.addColorStop(0.5, '#0d1120');
  bgGrad.addColorStop(1, '#070912');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Cuadrícula sutil
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 2048; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Barra de título de ventana tipo IDE
  ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
  ctx.fillRect(0, 0, 2048, 90);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.strokeRect(0, 0, 2048, 90);

  const dots = ['#ff5f56', '#ffbd2e', '#27c93f'];
  dots.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(45 + i * 36, 45, 12, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText('~/portfolio/projects - Live Showcase v2.4', 180, 55);

  ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1650, 25, 340, 42, 21);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.fillText('● PORTAFOLIO ONLINE', 1690, 54);

  // Encabezado
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 58px "Outfit", sans-serif';
  ctx.fillText('PORTAFOLIO DE PROYECTOS // TECH FREELANCER', 80, 180);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 28px "Outfit", sans-serif';
  ctx.fillText('Plataformas Web 3D, SaaS Empresariales, Arquitectura Cloud & Soluciones con IA', 80, 228);

  // 3 Tarjetas de proyectos
  const projects = [
    {
      tag: 'SAAS & CLOUD',
      status: '● EN PRODUCCIÓN',
      statusColor: '#10b981',
      title: 'NEXUS SAAS PLATFORM',
      desc: 'Plataforma B2B con analítica en tiempo real, autenticación OAuth y facturación global Stripe.',
      stack: ['Next.js 14', 'TypeScript', 'PostgreSQL', 'Stripe'],
      color: '#00f2fe'
    },
    {
      tag: 'WEB 3D & SHADERS',
      status: '★ AWARD WINNING',
      statusColor: '#ffaa40',
      title: 'AETHERIA 3D METAVERSE',
      desc: 'Experiencia interactiva 3D con físicas en tiempo real, shaders GLSL de refracción y 60 FPS.',
      stack: ['Three.js', 'WebGL', 'GLSL', 'GSAP Motion'],
      color: '#ff007f'
    },
    {
      tag: 'IA & AUTOMATIZACIÓN',
      status: '● PRODUCTION READY',
      statusColor: '#a855f7',
      title: 'QUANTUM AI AGENT CORE',
      desc: 'Ecosistema de agentes autónomos para procesamiento masivo de datos e integración con LLMs.',
      stack: ['Python', 'FastAPI', 'OpenAI', 'Docker'],
      color: '#a855f7'
    }
  ];

  const cardW = 590;
  const cardH = 550;
  const cardY = 270;
  const startX = 80;
  const gapX = 54;

  projects.forEach((proj, idx) => {
    const cx = startX + idx * (cardW + gapX);

    ctx.fillStyle = 'rgba(16, 22, 36, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cx, cardY, cardW, cardH, 20);
    ctx.fill();

    ctx.strokeStyle = proj.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(cx + 30, cardY + 28, 200, 36, 18);
    ctx.fill();

    ctx.fillStyle = proj.color;
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText(proj.tag, cx + 46, cardY + 53);

    ctx.fillStyle = proj.statusColor;
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillText(proj.status, cx + cardW - 220, cardY + 53);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px "Outfit", sans-serif';
    ctx.fillText(proj.title, cx + 30, cardY + 120);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 23px "Outfit", sans-serif';
    wrapText(ctx, proj.desc, cx + 30, cardY + 175, cardW - 60, 34);

    let badgeX = cx + 30;
    const badgeY = cardY + 360;
    proj.stack.forEach((tech) => {
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      const tw = ctx.measureText(tech).width;
      ctx.fillStyle = 'rgba(0, 242, 254, 0.12)';
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, tw + 22, 34, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(tech, badgeX + 11, badgeY + 24);
      badgeX += tw + 34;
    });

    ctx.fillStyle = 'rgba(0, 242, 254, 0.18)';
    ctx.beginPath();
    ctx.roundRect(cx + 30, cardY + 440, cardW - 60, 64, 14);
    ctx.fill();
    ctx.strokeStyle = proj.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Outfit", sans-serif';
    ctx.fillText('⚡ Haz clic en la pantalla para abrir enlaces ↗', cx + 55, cardY + 482);
  });

  // Banner inferior interactivo
  ctx.fillStyle = 'rgba(10, 14, 24, 0.95)';
  ctx.fillRect(0, 870, 2048, 154);
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 870, 2048, 154);

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.fillText('🖱️ HAZ CLIC EN ESTA PANTALLA PARA VER TODOS LOS PROYECTOS Y ABRIR ENLACES EN VIVO ↗', 180, 960);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createContactScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1920);
  bgGrad.addColorStop(0, '#090b14');
  bgGrad.addColorStop(0.5, '#0d1020');
  bgGrad.addColorStop(1, '#06080e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1920);

  ctx.strokeStyle = 'rgba(255, 0, 127, 0.05)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 1920; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Header superior
  ctx.fillStyle = 'rgba(18, 22, 36, 0.9)';
  ctx.fillRect(0, 0, 1024, 110);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 36px "Outfit", sans-serif';
  ctx.fillText('CONNECT HUB // FREELANCE', 50, 70);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.fillText('● DISPONIBLE', 820, 68);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 50px "Outfit", sans-serif';
  ctx.fillText('CONTACTO & REDES', 50, 200);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 26px "Outfit", sans-serif';
  ctx.fillText('Canal directo para coordinar proyectos', 50, 245);

  // Redes
  ctx.fillStyle = 'rgba(18, 24, 38, 0.8)';
  ctx.beginPath();
  ctx.roundRect(50, 290, 924, 460, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText('NUESTRAS REDES SOCIALES', 85, 345);

  const socials = [
    { label: 'GitHub', val: 'github.com/masterdent-soft' },
    { label: 'LinkedIn', val: 'linkedin.com/in/freelance-tech-dev' },
    { label: 'X (Twitter)', val: '@masterdent_tech' },
    { label: 'Email', val: 'contacto@masterdent-soft.com' }
  ];

  socials.forEach((s, idx) => {
    const sy = 405 + idx * 78;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(85, sy - 28, 854, 58, 12);
    ctx.fill();

    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText('▶ ' + s.label + ':', 110, sy + 10);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '400 24px "Space Grotesk", sans-serif';
    ctx.fillText(s.val, 320, sy + 10);
  });

  // Formulario
  ctx.fillStyle = 'rgba(18, 24, 38, 0.8)';
  ctx.beginPath();
  ctx.roundRect(50, 800, 924, 910, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ff007f';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText('SOLICITAR COTIZACIÓN DE PROYECTO', 85, 860);

  const inputs = [
    { label: 'Tu Nombre o Empresa:', val: 'Ej: Carlos Gómez / Nova Studios' },
    { label: 'Correo Electrónico:', val: 'tu-correo@empresa.com' },
    { label: 'Tipo de Proyecto:', val: 'Sitio Web 3D / Full-Stack SaaS' },
    { label: 'Asunto / Detalles del Proyecto:', val: 'Cuéntanos sobre tu idea o proyecto a desarrollar...' }
  ];

  let inpY = 930;
  inputs.forEach((inp, idx) => {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillText(inp.label, 85, inpY);

    const isTextarea = idx === 3;
    const h = isTextarea ? 180 : 64;

    ctx.fillStyle = 'rgba(10, 14, 24, 0.85)';
    ctx.beginPath();
    ctx.roundRect(85, inpY + 12, 854, h, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '400 22px "Outfit", sans-serif';
    ctx.fillText(inp.val, 110, inpY + 52);

    inpY += h + 50;
  });

  ctx.fillStyle = '#ff007f';
  ctx.beginPath();
  ctx.roundRect(85, 1580, 854, 76, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Outfit", sans-serif';
  ctx.fillText('🚀 ENVIAR SOLICITUD DE PROYECTO', 250, 1628);

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 28px "Outfit", sans-serif';
  ctx.fillText('👆 HAZ CLIC AQUÍ PARA ABRIR Y LLENAR EL FORMULARIO', 100, 1820);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createWallScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
  bgGrad.addColorStop(0, '#070912');
  bgGrad.addColorStop(0.5, '#0b0f1e');
  bgGrad.addColorStop(1, '#05070e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1920; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1080);
    ctx.stroke();
  }

  // Header superior
  ctx.fillStyle = 'rgba(16, 22, 34, 0.95)';
  ctx.fillRect(0, 0, 1920, 90);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 1920, 90);

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 30px "Space Grotesk", sans-serif';
  ctx.fillText('CYBER CORE STUDIO // CAPACIDADES & PERFIL', 60, 56);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 24px "Space Grotesk", sans-serif';
  ctx.fillText('● DISPONIBLE PARA FREELANCE', 1480, 56);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 64px "Outfit", sans-serif';
  ctx.fillText('QUIÉNES SOMOS & QUÉ HACEMOS', 60, 190);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 28px "Outfit", sans-serif';
  ctx.fillText('Estudio de Ingeniería de Software, Desarrollo Web 3D & Soluciones de Inteligencia Artificial', 60, 240);

  // 3 Columnas
  ctx.fillStyle = 'rgba(18, 24, 38, 0.8)';
  ctx.beginPath();
  ctx.roundRect(60, 290, 560, 550, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 32px "Outfit", sans-serif';
  ctx.fillText('¿QUIÉNES SOMOS?', 90, 355);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 24px "Outfit", sans-serif';
  wrapText(ctx, 'Somos ingenieros y desarrolladores freelance enfocados en crear experiencias web inmersivas, productos SaaS escalables y aplicaciones de alto impacto con tecnologías punteras.', 90, 410, 500, 38);

  ctx.fillStyle = 'rgba(18, 24, 38, 0.8)';
  ctx.beginPath();
  ctx.roundRect(680, 290, 560, 550, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ff007f';
  ctx.font = 'bold 32px "Outfit", sans-serif';
  ctx.fillText('¿QUÉ HACEMOS?', 710, 355);

  const services = [
    '• Sitios Web 3D & WebGL a 60 FPS',
    '• Plataformas Full-Stack & SaaS en Cloud',
    '• Soluciones & Agentes Autónomos con IA',
    '• Apps Móviles Nativas y Multiplataforma',
    '• Arquitectura de Software & APIs REST/GraphQL'
  ];
  services.forEach((serv, i) => {
    ctx.fillStyle = '#f8fafc';
    ctx.font = '500 23px "Outfit", sans-serif';
    ctx.fillText(serv, 710, 420 + i * 58);
  });

  ctx.fillStyle = 'rgba(18, 24, 38, 0.8)';
  ctx.beginPath();
  ctx.roundRect(1300, 290, 560, 550, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 32px "Outfit", sans-serif';
  ctx.fillText('STACK TECNOLÓGICO', 1330, 355);

  const techBadges = [
    'TypeScript', 'React', 'Next.js 14',
    'Three.js', 'WebGL', 'Node.js',
    'Python', 'Docker', 'PostgreSQL',
    'Tailwind', 'GSAP', 'AWS Cloud'
  ];

  let tX = 1330;
  let tY = 410;
  techBadges.forEach((t) => {
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    const tw = ctx.measureText(t).width;
    if (tX + tw + 20 > 1820) {
      tX = 1330;
      tY += 60;
    }
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tX, tY, tw + 24, 44, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.fillText(t, tX + 12, tY + 30);
    tX += tw + 38;
  });

  ctx.fillStyle = 'rgba(10, 14, 24, 0.95)';
  ctx.fillRect(0, 890, 1920, 190);
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 890, 1920, 190);

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.fillText('🖱️ HAZ CLIC EN ESTA PANTALLA PARA VER NUESTRO PERFIL DETALLADO Y SERVICIOS ↗', 220, 990);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Inicializar elementos y texturas de video en vivo (Estilo Jesse Zhou)
function createVideoElement(src) {
  const video = document.createElement('video');
  video.src = src;
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute('webkit-playsinline', 'true');
  video.play().catch(() => {
    const onFirstClick = () => {
      video.play();
      window.removeEventListener('click', onFirstClick);
    };
    window.addEventListener('click', onFirstClick);
  });
  return video;
}

const leftVideoEl = createVideoElement('/videos/clip_left.mp4');
const leftVideoTex = new THREE.VideoTexture(leftVideoEl);
leftVideoTex.minFilter = THREE.LinearFilter;
leftVideoTex.magFilter = THREE.LinearFilter;
leftVideoTex.colorSpace = THREE.SRGBColorSpace;

const rightVideoEl = createVideoElement('/videos/clip_right.mp4');
const rightVideoTex = new THREE.VideoTexture(rightVideoEl);
rightVideoTex.minFilter = THREE.LinearFilter;
rightVideoTex.magFilter = THREE.LinearFilter;
rightVideoTex.colorSpace = THREE.SRGBColorSpace;

// Inicializar texturas de las pantallas
const projectsTexture = createProjectsScreenTexture();
const contactTexture = createContactScreenTexture();
const wallScreenTex = createWallScreenTexture();

buildRoom();

/* ==========================================================================
   ELEMENTOS CSS3D PARA PANTALLAS DE YOUTUBE EN VIVO EN PARED
   ========================================================================== */
function createScreenCssElement(id) {
  const container = document.createElement('div');
  container.id = `css3d-container-${id}`;
  container.style.width = '640px';
  container.style.height = '382px';
  container.style.backgroundColor = '#000';
  container.style.borderRadius = '4px';
  container.style.overflow = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.display = 'none';

  const iframe = document.createElement('iframe');
  iframe.id = `youtube-iframe-${id}`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  container.appendChild(iframe);

  return { container, iframe };
}

const leftScreenCss = createScreenCssElement('left');
const leftCssObject = new CSS3DObject(leftScreenCss.container);
leftCssObject.scale.set(0.0019375, 0.0019375, 0.0019375);
leftCssObject.position.set(-2.05, 2.15, -2.905);
cssScene.add(leftCssObject);

const rightScreenCss = createScreenCssElement('right');
const rightCssObject = new CSS3DObject(rightScreenCss.container);
rightCssObject.scale.set(0.0019375, 0.0019375, 0.0019375);
rightCssObject.position.set(2.05, 2.15, -2.905);
cssScene.add(rightCssObject);

/* ==========================================================================
   CARGA DEL SETUP PRINCIPAL (gaming_setup_v2.glb)
   - ESCALA HUMANA REALISTA (0.38): Escritorio de 2.66m de ancho, altura 0.98m
   - Teclado y mouse en tamaño ergonómico natural
   - Monitor super ultrawide de 1.85m
   - Torre y silla viejas eliminadas totalmente
   - Tablero con cara superior DoubleSide completamente blanca y sólida
   - Desplazado adelante para que el brazo articulado no atraviese la pared
   ========================================================================== */
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  '/models/gaming_setup_v2.glb',
  (gltf) => {
    const setupModel = gltf.scene;

    // Escala realista ergonómica: ancho escritorio 2.66m, altura 0.98m
    const SETUP_SCALE = 0.38;
    setupModel.scale.set(SETUP_SCALE, SETUP_SCALE, SETUP_SCALE);
    setupModel.rotation.y = -Math.PI / 2;
    setupModel.position.set(0, 0, 0);
    setupModel.updateMatrixWorld(true);

    // 1. ELIMINAR COMPLETAMENTE LOS NODOS DE LA TORRE VIEJA Y SILLA VIEJA DEL GRAFO
    const nodesToDelete = ['Plane_Plane.001', 'whole_boundary_Plane.004'];
    nodesToDelete.forEach(name => {
      const node = setupModel.getObjectByName(name);
      if (node && node.parent) {
        node.parent.remove(node);
      }
    });

    let deskTableMesh = null;
    const meshesToRemove = [];

    setupModel.traverse((child) => {
      if (child.isMesh) {
        const meshName = (child.name || '').toLowerCase();
        const matName = (child.material && child.material.name ? child.material.name : '').toLowerCase();

        // Purgar cualquier residuo de la torre o silla antigua
        if (
          meshName.includes('plane_plane') ||
          meshName.includes('material.011') ||
          meshName.includes('material.018') ||
          meshName.includes('material.019') ||
          meshName.includes('material.020') ||
          meshName.includes('whole_boundary') ||
          meshName.includes('chair_material') ||
          meshName.includes('white_metal') ||
          meshName.includes('black_metal')
        ) {
          child.visible = false;
          meshesToRemove.push(child);
          return;
        }

        child.castShadow = true;
        child.receiveShadow = true;

        // 2. MESA GAMER: TABLERO SUPERIOR BLANCO SÓLIDO (DOUBLESIDE) Y PATAS NEGRAS
        if (meshName.includes('desk') && (meshName.includes('material.001') || matName.includes('material.001'))) {
          // CAPA SUPERIOR DEL MESÓN: Se fuerza DoubleSide y recalculo de normales
          deskTableMesh = child;
          child.geometry.computeVertexNormals();
          child.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.14,
            metalness: 0.04,
            side: THREE.DoubleSide,
            shadowSide: THREE.DoubleSide
          });
          child.visible = true;
        } else if (meshName.includes('desk') && (meshName.includes('material.002') || matName.includes('material.002'))) {
          // PATAS Y ESTRUCTURA INFERIOR NEGRA
          child.geometry.computeVertexNormals();
          child.material = new THREE.MeshStandardMaterial({
            color: 0x111318,
            roughness: 0.35,
            metalness: 0.22,
            side: THREE.DoubleSide
          });
          child.visible = true;
        }

        // 3. PERIFÉRICOS: Teclado y Ratón Blancos con letras legibles y RGB Chroma
        else if (meshName.includes('material.003')) {
          if (child.material) {
            child.material.color.set(0xffffff);
            child.material.roughness = 0.22;
            if (child.material.emissive) {
              child.material.emissiveIntensity = 2.8;
              fanLedMaterials.push(child.material);
            }
          }
          child.userData = { section: 'peripherals', label: 'Teclado Mecánico Blanco' };
          interactiveObjects.push(child);
        } else if (meshName.includes('material.004')) {
          if (child.material) {
            child.material.color.set(0xffffff);
            child.material.roughness = 0.18;
            if (child.material.emissive) {
              fanLedMaterials.push(child.material);
            }
          }
          child.userData = { section: 'peripherals', label: 'Ratón Gamer Blanco' };
          interactiveObjects.push(child);
        } else if (meshName.includes('pad_material') || meshName.includes('pad')) {
          // Alfombrilla Gaming XXL: Negro antracita mate con superficie nítida elevada sobre el mesón
          child.geometry.computeVertexNormals();
          child.position.z += 0.025; // Elevar sobre el mesón en su eje local (+Z es UP en el nodo pad)
          child.material = new THREE.MeshStandardMaterial({
            color: 0x111317,
            roughness: 0.88,
            metalness: 0.06,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3
          });
          child.renderOrder = 2;
          child.visible = true;
          child.userData = { section: 'peripherals', label: 'Alfombrilla Gamer XXL' };
          interactiveObjects.push(child);
        }

        // 4. MONITOR ULTRAWIDE PRINCIPAL (PORTAFOLIO DE PROYECTOS INTERACTIVO)
        else if (meshName.includes('material.009') || meshName.includes('material009')) {
          child.geometry.computeVertexNormals();
          child.material = new THREE.MeshBasicMaterial({
            map: projectsTexture,
            side: THREE.DoubleSide,
            toneMapped: false
          });
          child.renderOrder = 3;
          child.userData = { section: 'monitor', label: 'Monitor Ultrawide (Portafolio de Proyectos)' };
          interactiveObjects.push(child);
        }

        // 5. MONITOR VERTICAL SECUNDARIO (CONTACTO, REDES Y SOLICITUD DE PROYECTOS)
        else if (meshName.includes('cylinder_screen') || meshName.includes('screen.002') || (meshName.includes('cylinder') && matName.includes('screen'))) {
          child.geometry.computeVertexNormals();
          child.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            1, 1,
            1, 0,
            0, 0,
            0, 1
          ]), 2));
          child.material = new THREE.MeshBasicMaterial({
            map: contactTexture,
            side: THREE.DoubleSide,
            toneMapped: false
          });
          child.renderOrder = 3;
          child.userData = { section: 'verticalScreen', label: 'Monitor Vertical (Contacto & Redes)' };
          interactiveObjects.push(child);
        }
      }
    });

    // Purgar mallas eliminadas de su contenedor
    meshesToRemove.forEach(obj => {
      if (obj.parent) obj.parent.remove(obj);
    });

    // 5. POSICIÓN DEL ESCRITORIO CON HOLGURA DE PARED PARA EL BRAZO DEL MONITOR
    // El mesón queda con su borde posterior a -2.74m pegado directamente a la pared del frente
    const deskBox = new THREE.Box3().setFromObject(deskTableMesh || setupModel);
    const TARGET_DESK_BACK_Z = -2.74;
    const currentDeskBackZ = deskBox.min.z;
    const requiredZOffset = TARGET_DESK_BACK_Z - currentDeskBackZ;

    setupModel.position.set(0, 0, requiredZOffset);
    setupModel.updateMatrixWorld(true);

    scene.add(setupModel);
  },
  undefined,
  (err) => {
    console.warn('Error cargando gaming_setup_v2:', err);
  }
);

/* ==========================================================================
   CARGA DE LA NUEVA TORRE GAMER ANIMADA (pc_gamer_animation.glb)
   - ESCALA IMPONENTE FULL-TOWER E-ATX (0.82): Altura ~0.70m sobre el escritorio
   - DERECHA MIRANDO PARA EL FRENTE (rotation.y = Math.PI): 3 ventiladores frontales hacia el usuario
   - 9 VENTILADORES EN MOVIMIENTO ACTIVO CON ANIMATIONMIXER
   - SISTEMA RGB Y COMPONENTES VISIBLES A TRAVÉS DEL CRISTAL TEMPLADO
   - MONTADA A RAS DE LA SUPERFICIE DEL ESCRITORIO
   ========================================================================== */
let pcMixer = null;

gltfLoader.load(
  '/models/pc_gamer_animation.glb',
  (gltf) => {
    const pcModel = gltf.scene;

    // Escala imponente de torre gamer full-tower E-ATX (0.82): altura ~0.70m, ancho 0.33m, profundidad 0.81m
    const PC_SCALE = 0.82;
    pcModel.scale.set(PC_SCALE, PC_SCALE, PC_SCALE);

    // Derecha mirando para el frente: perfectamente alineada y ventiladores frontales hacia el frente (+Z)
    pcModel.rotation.y = Math.PI;

    // Posición asentada a ras sobre el mesón en el ala derecha (Y = 0.954m, Z = -2.14m)
    pcModel.position.set(0.96, 0.954, -2.14);

    if (gltf.animations && gltf.animations.length > 0) {
      pcMixer = new THREE.AnimationMixer(pcModel);
      gltf.animations.forEach((clip) => {
        const action = pcMixer.clipAction(clip);
        action.play();
      });
    }

    pcModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Filtrar malla corrupta de Maya (pCube62)
        if (child.name.includes('pCube62') || child.name.includes('blinn24')) {
          child.visible = false;
          return;
        }
        if (child.geometry && child.geometry.attributes.position) {
          const pos = child.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            if (Math.abs(pos.getX(i)) > 1000) {
              child.visible = false;
              return;
            }
          }
        }

        // Cristal templado transparente
        if (child.name.includes('aiStandardSurface4') || child.name.includes('blinn1')) {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.22;
            child.material.roughness = 0.05;
            child.material.metalness = 0.1;
          }
        }

        // Potenciar RGB de los ventiladores, disipador y memorias
        if (child.material) {
          if (child.material.emissive && (child.material.emissive.r > 0 || child.material.emissive.g > 0 || child.material.emissive.b > 0 || child.material.emissiveMap)) {
            child.material.emissiveIntensity = 2.8;
          }
        }

        child.userData = { section: 'tower', label: 'Torre Gamer RGB Animada' };
        interactiveObjects.push(child);
      }
    });

    scene.add(pcModel);
  },
  undefined,
  (err) => {
    console.warn('Error cargando pc_gamer_animation:', err);
  }
);

/* ==========================================================================
   CARGA DE LA NUEVA SILLA GAMER BLACK (gaming_chair_black.glb)
   - ESCALA HUMANA IMPONENTE Y GENEROSA (1.42): Altura cabecero 1.77m, ancho 1.03m
   - TEXTURAS PBR 4K ORIGINALES CON CUERO NEGRO, COSTURAS Y RELIEVE
   - UBICADA ERGONÓMICAMENTE FRENTE AL ESCRITORIO
   ========================================================================== */
gltfLoader.load(
  '/models/gaming_chair_black.glb',
  (gltf) => {
    const chairModel = gltf.scene;

    // Escala amplia ergonómica imponente (1.42): altura cabecero 1.77m, ancho 1.03m
    const CHAIR_SCALE = 1.42;
    chairModel.scale.set(CHAIR_SCALE, CHAIR_SCALE, CHAIR_SCALE);

    // Orientada hacia el escritorio y teclado, ángulo natural
    chairModel.rotation.y = Math.PI * 0.90;

    // Apoyada directamente en la alfombra (Y = 0) frente al centro de la mesa
    chairModel.position.set(0.05, 0.0, -0.77);

    chairModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Preservar sus texturas PBR originales de cuero negro, costuras y ruedas
        if (child.material) {
          child.material.roughness = 0.52;
          child.material.metalness = 0.15;
        }

        child.userData = { section: 'chair', label: 'Silla Gamer Black Edition' };
        interactiveObjects.push(child);
      }
    });

    scene.add(chairModel);
  },
  undefined,
  (err) => {
    console.warn('Error cargando gaming_chair_black:', err);
  }
);

/* ==========================================================================
   ZONA DE ENTRETENIMIENTO Y PANTALLA DE ESTUDIO (PARED IZQUIERDA X = -3.05)
   1. RACK DE TV MODERNO (rack_tv_moderno.glb)
   2. TELEVISOR SMART 60" EN PARED (1b7eff20a86b4cc692bc4222ac1ac252.glb)
   3. SOPORTE DE PARED ARTICULADO DE ACERO ROBUSTO
   4. PLAYSTATION 5 GTA VI EDITION (ps5__gta_vi_-.glb)
   5. CONTROL REMOTO DEL TELEVISOR (tv_remote_-_psx.glb)
   ========================================================================== */

// 1. CARGA DEL RACK DE TV MODERNO (Mesa baja con cajoneras bajo el televisor)
gltfLoader.load(
  '/models/rack_tv_moderno.glb',
  (gltf) => {
    const rackModel = gltf.scene;

    // Escala humana ampliada: Ancho Z: 2.31m, Altura Y: 0.66m, Fondo X: 0.43m
    const RACK_SCALE = 0.33;
    rackModel.scale.set(RACK_SCALE, RACK_SCALE, RACK_SCALE);

    // Orientación: frontal hacia el interior de la habitación (+X), trasera contra la pared (-X)
    rackModel.rotation.y = 0;

    // Apoyado en el suelo (Y = 0), pegado a la pared izquierda (X = -2.76) y desplazado a Z = 1.10
    rackModel.position.set(-2.76, 0.0, 1.10);

    rackModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.42;
        }
        child.userData = { section: 'wallDisplay', label: 'Rack Moderno de TV' };
        interactiveObjects.push(child);
      }
    });

    scene.add(rackModel);
  },
  undefined,
  (err) => {
    console.warn('Error cargando rack_tv_moderno:', err);
  }
);

// 2. SOPORTE DE PARED ARTICULADO DE ACERO PARA EL TELEVISOR (UBICADO A Y = 1.90m, Z = 1.10m)
const tvBracketGroup = new THREE.Group();
tvBracketGroup.position.set(-2.93, 1.90, 1.10);

const bracketSteelMat = new THREE.MeshStandardMaterial({
  color: 0x141720,
  metalness: 0.88,
  roughness: 0.28
});

// Placa base fijada a la pared izquierda
const bracketBasePlate = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.52, 0.60), bracketSteelMat);
bracketBasePlate.position.set(-0.08, 0, 0);
bracketBasePlate.castShadow = true;
bracketBasePlate.receiveShadow = true;
tvBracketGroup.add(bracketBasePlate);

// 4 Pernos hexagonales de anclaje a la pared
const boltMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
const boltOffsets = [
  [-0.06, 0.19, 0.23],
  [-0.06, -0.19, 0.23],
  [-0.06, 0.19, -0.23],
  [-0.06, -0.19, -0.23]
];
boltOffsets.forEach(([bx, by, bz]) => {
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.025, 8), boltMat);
  bolt.rotation.z = Math.PI / 2;
  bolt.position.set(bx, by, bz);
  tvBracketGroup.add(bolt);
});

// Brazos dobles articulados de soporte
const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.05, 0.04), bracketSteelMat);
armUpper.position.set(0.01, 0.12, 0.07);
armUpper.rotation.y = 0.08;
armUpper.castShadow = true;
tvBracketGroup.add(armUpper);

const armLower = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.05, 0.04), bracketSteelMat);
armLower.position.set(0.01, -0.12, -0.07);
armLower.rotation.y = -0.08;
armLower.castShadow = true;
tvBracketGroup.add(armLower);

// Placa VESA de acople directo al televisor
const vesaPlate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.44, 0.44), bracketSteelMat);
vesaPlate.position.set(0.09, 0, 0);
vesaPlate.castShadow = true;
tvBracketGroup.add(vesaPlate);

// Canaleta vertical embellecedora para cables hacia la mesa (llega hasta la superficie Y = 0.66m)
const tvCableDuct = new THREE.Mesh(
  new THREE.BoxGeometry(0.025, 1.25, 0.06),
  new THREE.MeshStandardMaterial({ color: 0x181c26, roughness: 0.5 })
);
tvCableDuct.position.set(-0.08, -0.62, 0);
tvBracketGroup.add(tvCableDuct);

scene.add(tvBracketGroup);

// 3. CARGA DEL TELEVISOR SMART 65"-75" EN PARED (1b7eff20a86b4cc692bc4222ac1ac252.glb)
gltfLoader.load(
  '/models/1b7eff20a86b4cc692bc4222ac1ac252.glb',
  (gltf) => {
    const tvScene = gltf.scene;
    // Escala imponente de 65"-75" (1.65): Ancho 1.85m, Alto 1.09m
    const TV_SCALE = 1.65;

    // Compensar centro interno del modelo (X: 2.55, Y: -0.691, Z: -0.031)
    const tvGroup = new THREE.Group();
    tvScene.position.set(-2.55, 0.691, 0.031);
    tvGroup.add(tvScene);

    tvGroup.scale.set(TV_SCALE, TV_SCALE, TV_SCALE);
    // Girar para que la pantalla mire hacia el interior de la habitación (+X)
    tvGroup.rotation.y = Math.PI / 2;
    // Ubicación en la pared izquierda: X = -2.80, altura elevada Y = 1.90m, Z = 1.10m
    tvGroup.position.set(-2.80, 1.90, 1.10);

    tvScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const meshName = (child.name || '').toLowerCase();

        if (meshName.includes('screen')) {
          // Asignar coordenadas UV normalizadas de pantalla completa [0, 0] a [1, 1]
          child.geometry.computeVertexNormals();
          child.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1
          ]), 2));
          child.material = new THREE.MeshBasicMaterial({
            map: wallScreenTex,
            side: THREE.DoubleSide,
            toneMapped: false
          });
          child.renderOrder = 3;
          child.userData = { section: 'wallDisplay', label: 'Smart TV: Quiénes Somos & Stack Tech' };
          interactiveObjects.push(child);
        } else if (meshName.includes('redlight')) {
          child.material = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
          fanLedMaterials.push(child.material);
        } else {
          // Carcasa y biseles de aluminio cepillado negro grafito
          child.material = new THREE.MeshStandardMaterial({
            color: 0x0f1117,
            roughness: 0.32,
            metalness: 0.85
          });
          child.userData = { section: 'wallDisplay', label: 'Smart TV 65" 4K' };
          interactiveObjects.push(child);
        }
      }
    });

    scene.add(tvGroup);
  },
  undefined,
  (err) => {
    console.warn('Error cargando 1b7eff20a86b4cc692bc4222ac1ac252:', err);
  }
);

// 4. CARGA DE LA PLAYSTATION 5 GTA VI EDITION (ps5__gta_vi_-.glb)
gltfLoader.load(
  '/models/ps5__gta_vi_-.glb',
  (gltf) => {
    const ps5Model = gltf.scene;

    // Escala grande imponente (1.30): Altura ~51cm sobre la mesa
    const PS5_SCALE = 1.30;
    ps5Model.scale.set(PS5_SCALE, PS5_SCALE, PS5_SCALE);

    // Ángulo calibrado (120°): Consola y control DualSense completamente asentados sobre la mesa (sin flotar en el aire)
    ps5Model.rotation.y = (120 * Math.PI) / 180;

    // Apoyada firmemente sobre la mesa (Y = 0.66m) en el ala izquierda (Z = 0.65)
    ps5Model.position.set(-2.78, 0.66, 0.65);

    ps5Model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.36;
          if (child.material.emissive && (child.material.emissive.r > 0 || child.material.emissive.g > 0 || child.material.emissive.b > 0)) {
            child.material.emissiveIntensity = 2.4;
          }
        }
        child.userData = { section: 'wallDisplay', label: 'PlayStation 5 // GTA VI Edition' };
        interactiveObjects.push(child);
      }
    });

    scene.add(ps5Model);
  },
  undefined,
  (err) => {
    console.warn('Error cargando ps5__gta_vi_-:', err);
  }
);

// 5. CARGA DEL CONTROL REMOTO DEL TELEVISOR (tv_remote_-_psx.glb)
gltfLoader.load(
  '/models/tv_remote_-_psx.glb',
  (gltf) => {
    const remoteModel = gltf.scene;
    const remoteMesh = remoteModel.getObjectByName('tv_remote1_lambert46_0');

    const remoteGroup = new THREE.Group();
    if (remoteMesh) {
      remoteMesh.geometry.center();
      // Proporción humana real de control remoto: 18cm de largo x 5.2cm ancho x 1.5cm grosor
      remoteMesh.scale.set(0.052, 0.180, 0.015);
      // Acostado plano sobre el mueble BOCA ARRIBA (+Math.PI / 2 hace que los botones miren hacia el techo)
      remoteMesh.rotation.set(Math.PI / 2, 0, 0.22);
      remoteMesh.castShadow = true;
      remoteMesh.receiveShadow = true;
      remoteMesh.userData = { section: 'wallDisplay', label: 'Control Remoto Smart TV' };
      interactiveObjects.push(remoteMesh);
      remoteGroup.add(remoteMesh);
    } else {
      remoteModel.scale.set(3.2, 3.2, 3.2);
      remoteGroup.add(remoteModel);
    }

    // Ubicado sobre la mesa del televisor en el ala derecha (Y = 0.668m, Z = 1.55)
    remoteGroup.position.set(-2.72, 0.668, 1.55);
    scene.add(remoteGroup);
  },
  undefined,
  (err) => {
    console.warn('Error cargando tv_remote_-_psx:', err);
  }
);

/* ==========================================================================
   PUNTOS DE INTERÉS CINEMÁTICOS (RECALIBRADOS A ESCALA HUMANA)
   ========================================================================== */
const POIS = {
  home: {
    camera: { x: isMobile ? 4.2 : 3.8, y: isMobile ? 3.8 : 3.4, z: isMobile ? 3.6 : 3.2 },
    target: { x: 0, y: 1.1, z: -1.8 }
  },
  monitor: {
    camera: { x: 0.0, y: 1.55, z: -0.94 },
    target: { x: 0.0, y: 1.55, z: -2.44 }
  },
  verticalScreen: {
    camera: { x: -0.75, y: 1.55, z: -1.14 },
    target: { x: -0.98, y: 1.55, z: -2.24 }
  },
  wallDisplay: {
    camera: { x: -0.65, y: 1.90, z: 1.10 },
    target: { x: -2.80, y: 1.90, z: 1.10 }
  },
  leftVideo: {
    camera: { x: -1.10, y: 2.15, z: -1.50 },
    target: { x: -2.05, y: 2.15, z: -2.93 }
  },
  rightVideo: {
    camera: { x: 1.10, y: 2.15, z: -1.50 },
    target: { x: 2.05, y: 2.15, z: -2.93 }
  },
  tower: {
    camera: { x: 1.8, y: 1.6, z: -1.19 },
    target: { x: 0.96, y: 1.35, z: -2.14 }
  },
  peripherals: {
    camera: { x: 0.2, y: 1.8, z: -1.09 },
    target: { x: 0.0, y: 1.0, z: -1.99 }
  },
  chair: {
    camera: { x: 1.6, y: 1.4, z: 0.41 },
    target: { x: 0.05, y: 0.9, z: -0.77 }
  }
};

let currentPOI = 'home';

function openModal(modalId) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  document.querySelectorAll('.modal-card').forEach(m => m.classList.remove('active'));

  const target = document.getElementById(modalId);
  if (target) {
    target.classList.add('active');
    overlay.classList.add('active');
  }
}

function closeModals() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');
  document.querySelectorAll('.modal-card').forEach(m => m.classList.remove('active'));
}

function moveToPOI(poiKey) {
  const poi = POIS[poiKey];
  if (!poi) return;
  currentPOI = poiKey;

  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-poi') === poiKey);
  });

  controls.enabled = false;
  playAudioChime();

  gsap.timeline({
    onComplete: () => {
      controls.enabled = true;
      // Abrir modal interactivo correspondiente si es una de las pantallas
      if (poiKey === 'monitor') {
        openModal('modal-projects');
      } else if (poiKey === 'verticalScreen') {
        openModal('modal-contact');
      } else if (poiKey === 'wallDisplay') {
        openModal('modal-about');
      } else if (poiKey === 'leftVideo' || poiKey === 'rightVideo') {
        openModal('modal-video');
      } else if (poiKey === 'home') {
        closeModals();
      }
    }
  })
  .to(camera.position, {
    x: poi.camera.x,
    y: poi.camera.y,
    z: poi.camera.z,
    duration: 1.6,
    ease: 'power2.inOut'
  }, 0)
  .to(controls.target, {
    x: poi.target.x,
    y: poi.target.y,
    z: poi.target.z,
    duration: 1.6,
    ease: 'power2.inOut'
  }, 0);
}

/* ==========================================================================
   RAYCASTING LIGERO PARA CLICK EN ELEMENTOS DEL SETUP
   ========================================================================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-100, -100);
let hoveredObject = null;

window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function checkHover() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);

  if (intersects.length > 0) {
    let topGroup = intersects[0].object;
    while (topGroup.parent && !topGroup.userData.section) {
      topGroup = topGroup.parent;
    }

    if (topGroup.userData && topGroup.userData.section) {
      if (hoveredObject !== topGroup) {
        hoveredObject = topGroup;
        document.body.style.cursor = 'pointer';
      }
      return;
    }
  }

  if (hoveredObject) {
    hoveredObject = null;
    document.body.style.cursor = 'default';
  }
}

window.addEventListener('click', (e) => {
  // Ignorar si el clic fue en un modal o en el HUD
  if (e.target.closest('#modal-overlay') || e.target.closest('.hud')) {
    return;
  }

  if (hoveredObject && hoveredObject.userData && hoveredObject.userData.section) {
    const sec = hoveredObject.userData.section;
    if (POIS[sec]) {
      moveToPOI(sec);
    }
  }
});

/* ==========================================================================
   INTERACCIÓN DE MODALES Y FORMULARIO DE PROYECTO
   ========================================================================== */
document.querySelectorAll('.modal-close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModals();
  });
});

const modalOverlayEl = document.getElementById('modal-overlay');
if (modalOverlayEl) {
  modalOverlayEl.addEventListener('click', (e) => {
    if (e.target === modalOverlayEl) {
      closeModals();
    }
  });
}

document.querySelectorAll('.btn-cta-switch').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetModal = btn.getAttribute('data-switch');
    if (targetModal) {
      openModal(targetModal);
      if (targetModal === 'modal-contact') {
        moveToPOI('verticalScreen');
      }
    }
  });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-card').forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

const projectForm = document.getElementById('project-request-form');
if (projectForm) {
  projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-request');
    const successAlert = document.getElementById('form-success-alert');
    if (btnSubmit) {
      btnSubmit.innerHTML = '<span>⏳ Enviando Solicitud...</span>';
      btnSubmit.disabled = true;
    }

    setTimeout(() => {
      playAudioChime();
      if (btnSubmit) {
        btnSubmit.innerHTML = '<span>✓ Solicitud Recibida</span>';
      }
      if (successAlert) {
        successAlert.classList.add('show');
      }
      projectForm.reset();
    }, 1000);
  });
}

/* ==========================================================================
   BINDINGS DE CONTROLES DE VIDEO EN VIVO (AUDIO, PAUSA Y PRESETS)
   ========================================================================== */
function initVideoControls() {
  let isLeftYoutubeMuted = true;
  let isLeftYoutubePaused = false;
  let isLeftInteract = false;

  let isRightYoutubeMuted = true;
  let isRightYoutubePaused = false;
  let isRightInteract = false;

  function showVideoStatus(screen, msg, type = 'info') {
    const statusEl = document.getElementById(`status-${screen}`);
    if (!statusEl) return;
    statusEl.className = `video-status-msg active ${type}`;
    statusEl.innerHTML = msg;
  }

  function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  function playYouTube(screen, videoId, title) {
    const css = screen === 'left' ? leftScreenCss : rightScreenCss;
    const screenMesh = screen === 'left' ? leftScreenMesh : rightScreenMesh;
    const videoEl = screen === 'left' ? leftVideoEl : rightVideoEl;
    const titleEl = document.getElementById(`video-title-${screen}`);
    const btnAudio = document.getElementById(`btn-toggle-audio-${screen}`);
    const btnPause = document.getElementById(`btn-pause-${screen}`);

    // Pausar el video MP4 local y ocultar la malla 3D de WebGL
    videoEl.pause();
    if (screenMesh) screenMesh.visible = false;

    // Configurar el iframe de YouTube en 3D
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${videoId}&playsinline=1&enablejsapi=1`;
    css.iframe.src = embedUrl;
    css.container.style.display = 'block';

    if (screen === 'left') {
      isLeftYoutubeMuted = true;
      isLeftYoutubePaused = false;
    } else {
      isRightYoutubeMuted = true;
      isRightYoutubePaused = false;
    }

    if (title && titleEl) {
      titleEl.textContent = title;
    }

    if (btnAudio) {
      btnAudio.textContent = '🔊 Activar Audio (YouTube)';
      btnAudio.classList.remove('active');
    }
    if (btnPause) {
      btnPause.textContent = '⏸ Pausar';
    }

    showVideoStatus(screen, `▶️ <strong>Transmitiendo YouTube en 3D en vivo:</strong> ${title || videoId}. Presiona "Activar Audio" para escuchar.`, 'success');
  }

  function playMp4(screen, src, title) {
    const css = screen === 'left' ? leftScreenCss : rightScreenCss;
    const screenMesh = screen === 'left' ? leftScreenMesh : rightScreenMesh;
    const videoEl = screen === 'left' ? leftVideoEl : rightVideoEl;
    const titleEl = document.getElementById(`video-title-${screen}`);
    const prevSrc = videoEl.currentSrc || videoEl.src;
    const btnAudio = document.getElementById(`btn-toggle-audio-${screen}`);

    // Ocultar YouTube iframe
    css.iframe.src = '';
    css.container.style.display = 'none';
    if (screenMesh) screenMesh.visible = true;

    showVideoStatus(screen, '🔄 Conectando y cargando flujo de video...', 'info');
    if (title && titleEl) {
      titleEl.textContent = title;
    }

    let hasLoaded = false;

    const onCanPlay = () => {
      hasLoaded = true;
      videoEl.removeEventListener('canplay', onCanPlay);
      videoEl.removeEventListener('error', onError);
      videoEl.play().then(() => {
        showVideoStatus(screen, `✅ Transmitiendo en vivo: ${title || 'Video'}`, 'success');
        const pauseBtn = document.getElementById(`btn-pause-${screen}`);
        if (pauseBtn) pauseBtn.textContent = '⏸ Pausar';
      }).catch(e => {
        console.warn('Autoplay notice:', e);
        showVideoStatus(screen, '⚠️ Video listo. Presiona "Pausar/Reanudar" para reproducir.', 'warning');
      });
    };

    const onError = () => {
      if (hasLoaded) return;
      videoEl.removeEventListener('canplay', onCanPlay);
      videoEl.removeEventListener('error', onError);
      showVideoStatus(screen, '❌ <strong>No se pudo cargar:</strong> La URL no es accesible o bloqueó CORS. Restaurando canal previo.', 'error');
      if (prevSrc && prevSrc !== src) {
        videoEl.src = prevSrc;
        videoEl.play().catch(() => {});
      }
    };

    videoEl.addEventListener('canplay', onCanPlay, { once: true });
    videoEl.addEventListener('error', onError, { once: true });

    videoEl.src = src;
    videoEl.load();

    if (btnAudio) {
      btnAudio.textContent = videoEl.muted ? '🔊 Activar Audio' : '🔇 Silenciar Audio';
      btnAudio.classList.toggle('active', !videoEl.muted);
    }
  }

  // Audio Left
  const btnAudioLeft = document.getElementById('btn-toggle-audio-left');
  if (btnAudioLeft) {
    btnAudioLeft.addEventListener('click', () => {
      if (leftScreenCss.container.style.display === 'block') {
        isLeftYoutubeMuted = !isLeftYoutubeMuted;
        const cmd = isLeftYoutubeMuted ? 'mute' : 'unMute';
        leftScreenCss.iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
        btnAudioLeft.textContent = isLeftYoutubeMuted ? '🔊 Activar Audio (YouTube)' : '🔇 Silenciar (YouTube)';
        btnAudioLeft.classList.toggle('active', !isLeftYoutubeMuted);
      } else {
        leftVideoEl.muted = !leftVideoEl.muted;
        if (!leftVideoEl.muted) leftVideoEl.volume = 1.0;
        btnAudioLeft.textContent = leftVideoEl.muted ? '🔊 Activar Audio' : '🔇 Silenciar Audio';
        btnAudioLeft.classList.toggle('active', !leftVideoEl.muted);
      }
    });
  }

  // Pause Left
  const btnPauseLeft = document.getElementById('btn-pause-left');
  if (btnPauseLeft) {
    btnPauseLeft.addEventListener('click', () => {
      if (leftScreenCss.container.style.display === 'block') {
        isLeftYoutubePaused = !isLeftYoutubePaused;
        const cmd = isLeftYoutubePaused ? 'pauseVideo' : 'playVideo';
        leftScreenCss.iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
        btnPauseLeft.textContent = isLeftYoutubePaused ? '▶ Reanudar' : '⏸ Pausar';
      } else {
        if (leftVideoEl.paused) {
          leftVideoEl.play();
          btnPauseLeft.textContent = '⏸ Pausar';
        } else {
          leftVideoEl.pause();
          btnPauseLeft.textContent = '▶ Reanudar';
        }
      }
    });
  }

  // Audio Right
  const btnAudioRight = document.getElementById('btn-toggle-audio-right');
  if (btnAudioRight) {
    btnAudioRight.addEventListener('click', () => {
      if (rightScreenCss.container.style.display === 'block') {
        isRightYoutubeMuted = !isRightYoutubeMuted;
        const cmd = isRightYoutubeMuted ? 'mute' : 'unMute';
        rightScreenCss.iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
        btnAudioRight.textContent = isRightYoutubeMuted ? '🔊 Activar Audio (YouTube)' : '🔇 Silenciar (YouTube)';
        btnAudioRight.classList.toggle('active', !isRightYoutubeMuted);
      } else {
        rightVideoEl.muted = !rightVideoEl.muted;
        if (!rightVideoEl.muted) rightVideoEl.volume = 1.0;
        btnAudioRight.textContent = rightVideoEl.muted ? '🔊 Activar Audio' : '🔇 Silenciar Audio';
        btnAudioRight.classList.toggle('active', !rightVideoEl.muted);
      }
    });
  }

  // Pause Right
  const btnPauseRight = document.getElementById('btn-pause-right');
  if (btnPauseRight) {
    btnPauseRight.addEventListener('click', () => {
      if (rightScreenCss.container.style.display === 'block') {
        isRightYoutubePaused = !isRightYoutubePaused;
        const cmd = isRightYoutubePaused ? 'pauseVideo' : 'playVideo';
        rightScreenCss.iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
        btnPauseRight.textContent = isRightYoutubePaused ? '▶ Reanudar' : '⏸ Pausar';
      } else {
        if (rightVideoEl.paused) {
          rightVideoEl.play();
          btnPauseRight.textContent = '⏸ Pausar';
        } else {
          rightVideoEl.pause();
          btnPauseRight.textContent = '▶ Reanudar';
        }
      }
    });
  }

  // Toggle interacción directa con clicks en YouTube Left
  const btnInteractLeft = document.getElementById('btn-toggle-interact-left');
  if (btnInteractLeft) {
    btnInteractLeft.addEventListener('click', () => {
      isLeftInteract = !isLeftInteract;
      leftScreenCss.container.style.pointerEvents = isLeftInteract ? 'auto' : 'none';
      leftScreenCss.iframe.style.pointerEvents = isLeftInteract ? 'auto' : 'none';
      btnInteractLeft.textContent = isLeftInteract
        ? '🖱️ Clics dentro de YouTube: ACTIVADO'
        : '🎥 Modo Cámara 3D (Clics en YouTube desactivados)';
      btnInteractLeft.classList.toggle('active', isLeftInteract);
    });
  }

  // Toggle interacción directa con clicks en YouTube Right
  const btnInteractRight = document.getElementById('btn-toggle-interact-right');
  if (btnInteractRight) {
    btnInteractRight.addEventListener('click', () => {
      isRightInteract = !isRightInteract;
      rightScreenCss.container.style.pointerEvents = isRightInteract ? 'auto' : 'none';
      rightScreenCss.iframe.style.pointerEvents = isRightInteract ? 'auto' : 'none';
      btnInteractRight.textContent = isRightInteract
        ? '🖱️ Clics dentro de YouTube: ACTIVADO'
        : '🎥 Modo Cámara 3D (Clics en YouTube desactivados)';
      btnInteractRight.classList.toggle('active', isRightInteract);
    });
  }

  // Presets de canales
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.getAttribute('data-screen');
      const src = btn.getAttribute('data-src');
      const type = btn.getAttribute('data-type');
      const title = btn.getAttribute('data-title') || btn.textContent.trim();
      
      document.querySelectorAll(`.btn-preset[data-screen="${screen}"]`).forEach(b => b.classList.remove('active-channel'));
      btn.classList.add('active-channel');

      if (!screen || !src) return;

      if (type === 'youtube') {
        const ytId = extractYouTubeId(src);
        if (ytId) {
          playYouTube(screen, ytId, title);
        }
      } else {
        playMp4(screen, src, title);
      }
    });
  });

  // Selector de archivos locales desde tu PC
  const fileInputLeft = document.getElementById('file-video-left');
  if (fileInputLeft) {
    fileInputLeft.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        playMp4('left', objectUrl, `📂 ${file.name}`);
      }
    });
  }

  const fileInputRight = document.getElementById('file-video-right');
  if (fileInputRight) {
    fileInputRight.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        playMp4('right', objectUrl, `📂 ${file.name}`);
      }
    });
  }

  // Carga de URL personalizada Left
  const btnLoadCustomLeft = document.getElementById('btn-load-custom-left');
  const inputCustomLeft = document.getElementById('custom-url-left');
  if (btnLoadCustomLeft && inputCustomLeft) {
    btnLoadCustomLeft.addEventListener('click', () => {
      const url = inputCustomLeft.value.trim();
      if (!url) {
        showVideoStatus('left', '⚠️ Por favor pega un enlace de YouTube o URL de video directa.', 'warning');
        return;
      }
      const ytId = extractYouTubeId(url);
      if (ytId) {
        playYouTube('left', ytId, 'Video de YouTube');
        return;
      }
      playMp4('left', url, 'Enlace de Streaming Externo');
    });
  }

  // Carga de URL personalizada Right
  const btnLoadCustomRight = document.getElementById('btn-load-custom-right');
  const inputCustomRight = document.getElementById('custom-url-right');
  if (btnLoadCustomRight && inputCustomRight) {
    btnLoadCustomRight.addEventListener('click', () => {
      const url = inputCustomRight.value.trim();
      if (!url) {
        showVideoStatus('right', '⚠️ Por favor pega un enlace de YouTube o URL de video directa.', 'warning');
        return;
      }
      const ytId = extractYouTubeId(url);
      if (ytId) {
        playYouTube('right', ytId, 'Video de YouTube');
        return;
      }
      playMp4('right', url, 'Enlace de Streaming Externo');
    });
  }
}
initVideoControls();

/* ==========================================================================
   SINTETIZADOR DE AUDIO PROCEDURAL (0ms LAG)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playAudioChime() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    // Silencioso
  }
}

/* ==========================================================================
   PRELOADER & HUD BINDINGS
   ========================================================================== */
const preloader = document.getElementById('preloader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const startBtn = document.getElementById('start-btn');
const hud = document.getElementById('hud');

let hasEntered = false;

function enterExperience() {
  if (hasEntered) return;
  hasEntered = true;

  initAudio();
  playAudioChime();

  if (preloader) {
    preloader.classList.add('fade-out');
    preloader.style.pointerEvents = 'none';

    gsap.to(preloader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        preloader.style.display = 'none';
        if (hud) {
          hud.style.opacity = '1';
        }
      }
    });
  }
}

let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += 20;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);

    if (loaderBar) loaderBar.style.width = '100%';
    if (loaderPercent) loaderPercent.textContent = '100%';

    if (startBtn) {
      startBtn.style.display = 'inline-block';
      startBtn.style.opacity = '1';
      startBtn.style.pointerEvents = 'auto';
      startBtn.classList.add('visible');
    }

    setTimeout(() => {
      enterExperience();
    }, 700);
  } else {
    if (loaderBar) loaderBar.style.width = `${loadProgress}%`;
    if (loaderPercent) loaderPercent.textContent = `${loadProgress}%`;
  }
}, 30);

if (startBtn) {
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    enterExperience();
  });
}

if (preloader) {
  preloader.addEventListener('click', () => {
    enterExperience();
  });
}

setTimeout(() => {
  enterExperience();
}, 2500);

document.querySelectorAll('.nav-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const poiKey = btn.getAttribute('data-poi');
    moveToPOI(poiKey);
  });
});

const btnReset = document.getElementById('btn-reset');
if (btnReset) {
  btnReset.addEventListener('click', () => {
    moveToPOI('home');
  });
}

/* ==========================================================================
   LOOP DE ANIMACIÓN (60 FPS FLUIDO • ROTACIÓN DE VENTILADORES Y CICLO RGB)
   ========================================================================== */
const clock = new THREE.Clock();
let frameCount = 0;
let lastTime = 0;

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  const delta = elapsedTime - lastTime;
  lastTime = elapsedTime;

  // Actualizar animación fluida de los 9 ventiladores de la torre
  if (pcMixer) {
    pcMixer.update(delta);
  }

  // Ciclo suave de color RGB Chroma en ventiladores y tira LED
  const hue = (elapsedTime * 0.15) % 1;
  const rgbColor = new THREE.Color().setHSL(hue, 0.95, 0.55);

  fanLedMaterials.forEach(mat => {
    if (mat.color) mat.color.copy(rgbColor);
    if (mat.emissive) mat.emissive.copy(rgbColor);
  });
  deskLedLight.color.copy(rgbColor);

  frameCount++;
  if (frameCount % 3 === 0) {
    checkHover();
  }

  controls.update();
  renderer.render(scene, camera);
  cssRenderer.render(cssScene, camera);
}

animate();

/* ==========================================================================
   RESPONSIVIDAD Y REDIMENSIONAMIENTO
   ========================================================================== */
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  cssRenderer.setSize(sizes.width, sizes.height);
});
