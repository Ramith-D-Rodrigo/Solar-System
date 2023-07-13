import * as THREE from './node_modules/three/src/Three.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import planets from './planets.js';

const SEGMENTS = 500;

const scene = new THREE.Scene(); //create a scene
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000); //create a camera

const renderer = new THREE.WebGLRenderer(); //create a renderer

const controls = new OrbitControls(camera, renderer.domElement); //create controls for the camera

//texture loader
const textureLoader = new THREE.TextureLoader();

scene.background = textureLoader.load('./textures/8k_stars.jpg');

renderer.setSize(window.innerWidth, window.innerHeight); //set the size of the renderer
document.body.appendChild(renderer.domElement);

const sunGeometry = new THREE.SphereGeometry(30, SEGMENTS, SEGMENTS); //create a sphere
const sunTexture = textureLoader.load('./textures/2k_sun.jpg');
const SunMaterial = new THREE.MeshToonMaterial({ map: sunTexture }); //create a material
SunMaterial.map = sunTexture;
const SunMesh = new THREE.Mesh(sunGeometry, SunMaterial); //create a mesh
scene.add(SunMesh); //add the mesh to the scene

const sunLight = new THREE.PointLight(0xFFFFFF, 1.2, 0); //create a light
sunLight.position.set(0, 0, 0); //set the light's position
sunLight.castShadow = true;
scene.add(sunLight); //add the light to the scene

//create 9 empty objects to act as sun rotation points
const sunRotationPoints = [];

for (let i = 0; i < planets.length; i++) {
    const sunRotationPoint = new THREE.Object3D();
    scene.add(sunRotationPoint);
    sunRotationPoints.push(sunRotationPoint);
}

for(let i = 0; i < planets.length; i++){
    const planet = planets[i];
    const planetGeometry = new THREE.SphereGeometry(planet.radius, SEGMENTS, SEGMENTS); //create a sphere
    const planetTexture = textureLoader.load(planet.texture);
    const planetMaterial = new THREE.MeshPhysicalMaterial({ map: planetTexture }); //create a material
    planetMaterial.castShadow = true;
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial); //create a mesh

    //add planet relative to the sun's coordinate system
    let position = null;

    if(i < 4){
        position = 40 * (i + 1);
    }
    else{
        position = 40 * (i + 2);
    }
    planetMesh.position.x = position;

    //create orbit
    const orbitGeometry = new THREE.RingGeometry(position, position + 0.1, SEGMENTS);
    const orbitMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    orbitMaterial.transparent = true;
    orbitMaterial.opacity = 0.5;
    const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial); //create a mesh
    orbitMesh.rotation.x = Math.PI / 2;
    scene.add(orbitMesh); //add the mesh to the scene

    sunRotationPoints[i].add(planetMesh); //add the mesh to the scene

    if(planet.name === "Earth"){
        //create the moon
        const moonGeometry = new THREE.SphereGeometry(1, SEGMENTS, SEGMENTS); //create a sphere
        const moonTexture = textureLoader.load('./textures/2k_moon.jpg');
        const moonMaterial = new THREE.MeshPhysicalMaterial({ map: moonTexture }); //create a material
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial); //create a mesh
        moonMesh.position.x = 10;
        planetMesh.add(moonMesh); //add the mesh to the scene

        //create the moon's orbit
        const moonOrbitGeometry = new THREE.RingGeometry(10, 10.1, SEGMENTS);
        const moonOrbitMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
        moonOrbitMaterial.transparent = true;
        moonOrbitMaterial.opacity = 0.5;
        const moonOrbitMesh = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial); //create a mesh
        moonOrbitMesh.rotation.x = Math.PI / 2;
        planetMesh.add(moonOrbitMesh); //add the mesh to the scene

    }

    if(planet.name === "Saturn"){
        //create the ring
        for(let j = 0; j < 7; j++){
            const ringGeometry = new THREE.RingGeometry((planets[i].radius + 0.1) + j * 0.5, (planets[i].radius + 0.5) + j * 0.5, 32);
            const ringMaterial = new THREE.MeshToonMaterial({ side: THREE.DoubleSide });
            const ringTexture = textureLoader.load('./textures/2k_saturn_ring_alpha.png');
            ringMaterial.transparent = true;
            ringMaterial.castShadow = true;
            ringMaterial.map = ringTexture;
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial); //create a mesh
            ringMesh.rotation.x = Math.PI / 2;
            planetMesh.add(ringMesh); //add the mesh to the scene
        }

    }

    planet.setMesh(planetMesh);
}

//set the camera position
camera.position.z = 100;
camera.position.y = 30; 
camera.rotation.x = -0.1;


const rotateSun = () => {
    requestAnimationFrame(rotateSun);
    let rotationValue = 0.01;
    SunMesh.rotation.y += 0.01;

    for(let i = 0; i < 9; i++){
        sunRotationPoints[i].rotation.y += rotationValue;
        rotationValue = rotationValue / 1.3;
    }

    renderer.render(scene, camera); //render the scene
}


const rotatePlanets = () => {
    requestAnimationFrame(rotatePlanets);

    for(let i = 0; i < 9; i++){
        planets[i].mesh.rotation.y += 0.01;
    }
}
rotateSun(); //start the animation
rotatePlanets(); //start the animation