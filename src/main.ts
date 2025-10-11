import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  LineBasicMaterial,
  LineSegments,
  Vector3,
  Float32BufferAttribute,
} from "three";

// Scene setup
const scene = new Scene();
const camera = new PerspectiveCamera(
  100, // Wider FOV for more dramatic perspective
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.insertBefore(renderer.domElement, document.body.firstChild);

camera.position.z = 35;

const particleCount = 1200;
const particles = new BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities: number[] = [];

// Initialize particles with random positions
for (let i = 0; i < particleCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 100; // x
  positions[i + 1] = (Math.random() - 0.5) * 100; // y
  positions[i + 2] = (Math.random() - 0.5) * 100; // z

  velocities.push(
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05
  );
}

particles.setAttribute("position", new BufferAttribute(positions, 3));

const visibleParticles = new BufferGeometry();
const particleMaterial = new PointsMaterial({
  color: 0x50fbc2,
  size: 0.4,
  transparent: true,
  opacity: 0.4,
});

const particleSystem = new Points(visibleParticles, particleMaterial);
scene.add(particleSystem);

const lineGeometry = new BufferGeometry();
const lineMaterial = new LineBasicMaterial({
  color: 0x50fbc2,
  transparent: true,
  opacity: 0.4,
});
const lineSystem = new LineSegments(lineGeometry, lineMaterial);
scene.add(lineSystem);

const headline = document.querySelector("h1");
const headlineRect = headline?.getBoundingClientRect();
let initialX = 0;
let initialY = 0;

if (headlineRect) {
  const centerX = headlineRect.left + headlineRect.width / 2;
  const centerY = headlineRect.top + headlineRect.height / 2;
  initialX = (centerX / window.innerWidth) * 2 - 1;
  initialY = -(centerY / window.innerHeight) * 2 + 1;
}

const mouse = { x: initialX, y: initialY };
const mouseWorld = new Vector3(initialX * 40, initialY * 40, 0);
const targetRotation = { x: initialY * 0.4, y: initialX * 0.4 };
const currentRotation = { x: initialY * 0.4, y: initialX * 0.4 };

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  targetRotation.x = mouse.y * 0.4;
  targetRotation.y = mouse.x * 0.4;

  mouseWorld.set(mouse.x * 40, mouse.y * 40, 0);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  const positions = particles.attributes.position.array as Float32Array;
  const linePositions: number[] = [];
  const visibleParticlePositions: number[] = [];

  // Update particle positions
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

    // Boundary checks - wrap around
    if (Math.abs(positions[i]) > 50) velocities[i] *= -1;
    if (Math.abs(positions[i + 1]) > 50) velocities[i + 1] *= -1;
    if (Math.abs(positions[i + 2]) > 50) velocities[i + 2] *= -1;
  }

  // Create lines between nearby particles - only show lines near mouse
  const maxDistance = 10;
  const mouseInfluenceRadius = 11;

  // Track particles that should be visible (either near mouse or connected by a visible line)
  const visibleParticleIndices = new Set<number>();

  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < maxDistance) {
        // Check if the line midpoint is near mouse
        const midX = (positions[i * 3] + positions[j * 3]) / 2;
        const midY = (positions[i * 3 + 1] + positions[j * 3 + 1]) / 2;
        const midZ = (positions[i * 3 + 2] + positions[j * 3 + 2]) / 2;

        const dxm = mouseWorld.x - midX;
        const dym = mouseWorld.y - midY;
        const dzm = mouseWorld.z - midZ;
        const distToMouse = Math.sqrt(dxm * dxm + dym * dym + dzm * dzm);

        // Only show lines that are close to mouse
        if (distToMouse < mouseInfluenceRadius) {
          linePositions.push(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
            positions[j * 3],
            positions[j * 3 + 1],
            positions[j * 3 + 2]
          );

          // Mark both endpoints as visible
          visibleParticleIndices.add(i);
          visibleParticleIndices.add(j);
        }
      }
    }
  }

  // Add all visible particles to the array
  visibleParticleIndices.forEach((i) => {
    visibleParticlePositions.push(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    );
  });

  // Update visible particles
  visibleParticles.setAttribute(
    "position",
    new Float32BufferAttribute(visibleParticlePositions, 3)
  );

  lineGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(linePositions, 3)
  );

  // Smooth rotation based on mouse
  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

  particleSystem.rotation.x = currentRotation.x;
  particleSystem.rotation.y = currentRotation.y;
  lineSystem.rotation.x = currentRotation.x;
  lineSystem.rotation.y = currentRotation.y;

  renderer.render(scene, camera);
}

animate();
