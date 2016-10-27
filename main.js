var container;
var camera, scene, renderer, particles, geometry, material, i, h, color, sprite, size;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var allVertices;

init();
animate();
function getRandomSpeed() {
  return Math.random() / 2;
}
function init() {
  container = document.createElement('div');
  container.classList.add('canvas-container');
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
  camera.position.z = 1000;
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.001);
  geometry = new THREE.Geometry();
  sprite = new THREE.TextureLoader().load("images/disc.png");
  for (i = 0; i < 1000; i++) {
    var vertex = new THREE.Vector3();
    vertex.x = 2000 * Math.random() - 1000;
    vertex.y = 2000 * Math.random() - 1000;
    vertex.z = 2000 * Math.random() - 1000;
    vertex.speed = getRandomSpeed();
    geometry.vertices.push(vertex);
  }

  allVertices = geometry.vertices;

  material = new THREE.PointsMaterial({ size: 35, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true });
  material.color.setHSL(1.0, 0.3, 0.7);
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
  //
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  //
  //
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  //
  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onDocumentMouseDown() {
  allVertices.forEach((vertex) => {
    vertex.speed = -10;
  });
}
function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}
function onDocumentTouchStart(event) {
  if (event.touches.length == 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}
function onDocumentTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}
//
function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  allVertices.forEach((vertex) => {
    if (vertex.speed < 0 && vertex.y < -500) {
      vertex.speed = getRandomSpeed();
    }

    if (vertex.y > 2000) {
      vertex.y = -2000;
    }

    vertex.setY(vertex.y + vertex.speed);
  });

  geometry.verticesNeedUpdate = true;

  var time = Date.now() * 0.00005;
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (- mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  h = (360 * (1.0 + time) % 360) / 360;
  material.color.setHSL(h, 0.5, 0.5);
  renderer.render(scene, camera);
}
