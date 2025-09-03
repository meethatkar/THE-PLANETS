import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';



// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// LIGHTING;
// Add ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Add a directional light to simulate sunlight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Optionally, add a point light for extra effect
const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
pointLight.position.set(-5, 3, 5);
scene.add(pointLight);


// Create a large sphere to act as the star field background
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starTexture = new THREE.TextureLoader().load('./stars.webp');
const starMaterial = new THREE.MeshBasicMaterial({
  map: starTexture,
  side: THREE.BackSide // Render inside of sphere
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);


// SPHERE CONFIG
let radius = 1;
const segments = 64;
const colors = ['#FF0000', '#00FF00', '#FFFF00', '#0000FF'];
let orbitRadius = 3;
const spheres = new THREE.Group();
// const textures_arr = ['./csilla/clouds.png', './csilla/color.png', './earth/clouds.jpg', './earth/map.jpg', './venus/map.jpg', './csilla/clouds.png', 'volcanic/color.png']
const textures_arr = ['./color.webp', './earth.webp', './venus.webp', './volcano.webp'];

// RESIZING
window.innerWidth < 500 ? radius = 0.7 : radius = 1;
window.innerWidth < 500 ? orbitRadius = 2 : orbitRadius = 3;

for (let i = 0; i < 4; i++) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);            //DATA BINDING:- radius,
  const texture_planet = new THREE.TextureLoader();                     //PROVIEDE TEXTURE FROM HERE.
  const texture_var = texture_planet.load(textures_arr[i]);
  texture_var.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshPhysicalMaterial({ map: texture_var });
  const sphere = new THREE.Mesh(geometry, material);
  const angle = [(i / 4) * (Math.PI * 2)];
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
  spheres.add(sphere);
}

scene.add(spheres);     //added shperes

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Position camera
spheres.rotation.x = 0.25;
spheres.position.y = -0.1;
camera.position.z = 4.5;

// THROTTEL CODE (TEXT ANIMATION)
let lastWheelTime = 0;
const throttleDelay = 2000;
let counter = 0;
const h1s_div = document.querySelectorAll("#h1s h1");

function throttledWheelHandler(event) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;

    const direction = event.deltaY > 0 ? "down" : "up";

    // counter >= 3 ? counter=0 : counter++;
    if (counter >= 3) {
      h1s_div.forEach((h1, index) => {

        gsap.to(spheres.rotation, {
          y: `0`,
          duration: 2,
          ease: "expo.inOut"
        })

        gsap.to(h1, {
          y: "0%",
          duration: 2,
          ease: "power1.inOut"
        })
      })
      counter = 0;
    }
    else {
      if (direction === "down") {
        // TEXT ANIAMTION 
        gsap.to(h1s_div, {
          y: `-=${100}%`,      //used backticks caused we are using "-=" operator.
          duration: 1,
          ease: "expo.inOut"
        });

        // PLANET ROTATION
        gsap.to(spheres.rotation, {
          y: `${Math.PI / 2 + ((Math.PI / 2) * counter)}`,
          duration: 1,
          ease: "expo.inOut"
        })
        // spheres.rotation.y = Math.PI / 2 + ((Math.PI / 2)*counter);
        // console.log(`${Math.PI / 2 + ((Math.PI / 2)*counter)}`);
        counter++;      //INCREMENT ON NEXT PLANET
      }
      else {
        gsap.to(h1s_div, {
          y: `+=${100}%`,
          duration: 1,
          ease: "expo.inOut"
        });

        // SPHERE ANIMATINO LOGIC
        // PLANET ROTATION
        gsap.to(spheres.rotation, {
          y: `-=${Math.PI / 2 }`,
          duration: 1,
          ease: "expo.inOut"
        })
        counter--;      //DECREMENT ON PREVIOUS PLANET; SO LOGIC NOT BREAKS
      }
    }
  }
}

window.addEventListener("wheel", throttledWheelHandler);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // spheres.rotation.y += 0.01;
  // controls.update();
  renderer.render(scene, camera);
}
animate();

function addCursorEffectToScrollDiv() {
  const scrollDiv = document.querySelector('#cursor');
  if (!scrollDiv) return;

  window.addEventListener('mousemove', (e) => {
    // Offset so the div's center is at the cursor
    scrollDiv.style.pointerEvents = 'none';
    scrollDiv.style.top = `${e.clientY}px`;
    scrollDiv.style.left = `${e.clientX}px`;
    console.log(e.clientX);
    
  });
}

// Call the function to activate the effect
addCursorEffectToScrollDiv();


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
