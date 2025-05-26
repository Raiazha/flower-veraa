import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module.js";

const canvasEl = document.querySelector("#canvas");
const cleanBtn = document.querySelector(".clean-btn");

const pointer = {
  x: 0.5,
  y: 0.5,
  clicked: true,
};

let basicMaterial, shaderMaterial;
let renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let sceneShader = new THREE.Scene();
let sceneBasic = new THREE.Scene();
let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
let clock = new THREE.Clock();

let renderTargets = [
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
];

// 🔽 Memuat file shader sebelum createPlane
Promise.all([
  fetch("shaders/vertexShader.vert").then(res => res.text()),
  fetch("shaders/flowerShader.frag").then(res => res.text())
]).then(([vertexShader, fragmentShader]) => {
  createPlane(vertexShader, fragmentShader);
  updateSize();
  window.addEventListener("resize", () => {
    updateSize();
    cleanCanvas();
  });
  render();
});

let isTouchScreen = false;

window.addEventListener("click", (e) => {
  if (!isTouchScreen) {
    pointer.x = e.pageX / window.innerWidth;
    pointer.y = e.pageY / window.innerHeight;
    pointer.clicked = true;
  }
});

window.addEventListener("touchstart", (e) => {
  isTouchScreen = true;
  pointer.x = e.targetTouches[0].pageX / window.innerWidth;
  pointer.y = e.targetTouches[0].pageY / window.innerHeight;
  pointer.clicked = true;
});

function cleanScreen() {
  cleanCanvas();
}

function cleanCanvas() {
  pointer.vanishCanvas = true;
  setTimeout(() => {
    pointer.vanishCanvas = false;
  }, 50);
}

function createPlane(vertexShader, fragmentShader) {
  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_stop_time: { value: 0.0 },
      u_stop_randomizer: { value: new THREE.Vector2(Math.random(), Math.random()) },
      u_cursor: { value: new THREE.Vector2(pointer.x, pointer.y) },
      u_ratio: { value: window.innerWidth / window.innerHeight },
      u_texture: { value: null },
      u_clean: { value: 1.0 },
      u_fade: { value: 0.95 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  basicMaterial = new THREE.MeshBasicMaterial();
  const planeGeometry = new THREE.PlaneGeometry(2, 2);
  const planeBasic = new THREE.Mesh(planeGeometry, basicMaterial);
  const planeShader = new THREE.Mesh(planeGeometry, shaderMaterial);
  sceneBasic.add(planeBasic);
  sceneShader.add(planeShader);
}

function render() {
  shaderMaterial.uniforms.u_clean.value = pointer.vanishCanvas ? 0 : 1;
  shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture;

  if (pointer.clicked) {
    shaderMaterial.uniforms.u_cursor.value = new THREE.Vector2(pointer.x, 1 - pointer.y);
    shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector2(Math.random(), Math.random());
    shaderMaterial.uniforms.u_stop_time.value = 0.0;
    pointer.clicked = false;
  }

  shaderMaterial.uniforms.u_stop_time.value += clock.getDelta();

  renderer.setRenderTarget(renderTargets[1]);
  renderer.render(sceneShader, camera);
  basicMaterial.map = renderTargets[1].texture;
  renderer.setRenderTarget(null);
  renderer.render(sceneBasic, camera);

  let tmp = renderTargets[0];
  renderTargets[0] = renderTargets[1];
  renderTargets[1] = tmp;

  requestAnimationFrame(render);
}

function updateSize() {
  shaderMaterial.uniforms.u_ratio.value = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

