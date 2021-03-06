import * as THREE from "https://unpkg.com/three@0.120.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.120.1/examples/jsm/controls/OrbitControls.js";
import { OBJLoader2 } from "https://unpkg.com/three@0.120.1/examples/jsm/loaders/OBJLoader2.js";
import { tiles } from "./tiles.js";
import { enableMenu } from "./menu.js";
import { mainColor } from "./color.js";
function main() {
  // Get html canvas reference
  const canvas = document.querySelector("#c");
  // Get loaders
  const loader = document.querySelector(".loader");

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ canvas });

  // Colors for future use
  let firstColor = 0xf3d3bd; // cold
  let fifthColor = 0x5e5e5e; // light gray

  // Modifiers used when changing view
  let cameraModifier = 0.0005; // camera speed
  let cameraRange = 0.3;

  // Camera basic setup
  let cameraFov = 75;
  let cameraAspect = 2; // the canvas default
  let cameraNear = 1;
  let cameraFar = 100;

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    cameraFov,
    cameraAspect,
    cameraNear,
    cameraFar
  );

  // Position camera
  camera.position.set(0, 8, 9);

  // Create scene
  const scene = new THREE.Scene();

  // Add scene background and fog, should be of same color

  // Helpers for positioning
  // var axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  //===================================================Scene elements===========================================================

  // Hemisphere lights
  {
    let skyColor = 0xffffff; //white
    let groundColor = 0x000000; //black
    let intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  // Directional light
  {
    let directionColor = 0xffffff;
    let intensity = 1;
    const light = new THREE.DirectionalLight(directionColor, intensity);
    light.position.set(20, 14, 0);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  // Main object
  {
    const objLoader = new OBJLoader2();
    const material = new THREE.MeshPhongMaterial({ color: firstColor });
    objLoader.load("./assets/deer.obj", function (obj) {
      obj.scale.set(0.008, 0.008, 0.008);
      obj.rotation.y = -1.5707963268;
      obj.children.forEach((child) => {
        child.material = material;
        //console.log(child.material);
      });
      scene.add(obj);
      loader.style.display = "none";
      tiles(false);
      enableMenu();
    });
  }

  // Particles
  const particleArray = [];
  {
    function mathRand(num = 8) {
      return -Math.random() * num + Math.random() * num;
    }

    const particleMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 1,
      reflectivity: 0.5,
    });
    const particleGeometry = new THREE.CircleGeometry(0.3, 3);
    let particleSpace = 15;

    for (let i = 1; i < 400; i++) {
      let particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        mathRand(particleSpace),
        mathRand(particleSpace),
        mathRand(particleSpace)
      );
      particle.rotation.set(mathRand(), mathRand(), mathRand());
      particleArray.push(particle);
      scene.add(particle);
    }
  }

  //===================================================Mouse movement===========================================================
  let mouse = new THREE.Vector2(),
    INTERSECTED;

  function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onDocumentTouchStart(event) {
    if (event.touches.length == 1) {
      mouse.x =
        (event.touches[0].pageX - window.innerWidth / 2) * cameraModifier;
      mouse.y =
        (event.touches[0].pageY - window.innerHeight / 2) * cameraModifier;
    }
  }

  function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
      mouse.x =
        (event.touches[0].pageX - window.innerWidth / 2) * cameraModifier;
      mouse.y =
        (event.touches[0].pageY - window.innerHeight / 2) * cameraModifier;
    }
  }

  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("touchstart", onDocumentTouchStart, false);
  window.addEventListener("touchmove", onDocumentTouchMove, false);

  //===================================================Responsiveness===========================================================
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  //===================================================Animation===========================================================
  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    scene.background = new THREE.Color(mainColor());
    scene.fog = new THREE.FogExp2(mainColor(), 0.15);

    scene.rotation.y -= (mouse.x * 8 - camera.rotation.y) * cameraModifier;
    scene.rotation.x -= (-(mouse.y * 2) - camera.rotation.x) * cameraModifier;
    if (scene.rotation.x < -cameraRange) scene.rotation.x = -cameraRange;
    else if (scene.rotation.x > cameraRange) scene.rotation.x = cameraRange;
    if (scene.rotation.y < -cameraRange) scene.rotation.y = -cameraRange;
    else if (scene.rotation.y > cameraRange) scene.rotation.y = cameraRange;
    //console.log(scene.rotation);

    particleArray.forEach((particle) => {
      //console.log(particle.rotation);
      particle.rotation.y += 0.005;
    });
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  //Invoke animation function :>
  requestAnimationFrame(render);
}
main();
