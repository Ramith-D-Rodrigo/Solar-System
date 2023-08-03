import * as THREE from './node_modules/three/src/Three.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import planets from './planets.js';

const SEGMENTS = 100;

const CAMERA_START_X = -0.1;
const CAMERA_START_Y = 30;
const CAMERA_START_Z = 100;

let scene = null;
let camera = null;
let controls = null;

//global variables
let SunMesh = null;
const sunRotationPoints = [];
let renderer = null; //renderer
let saturnMoonRotationPoints = [];
let moons = [];
let textureLoader = null;

const init = () => {
    scene = new THREE.Scene(); //create a scene
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000); //create a camera

    scene.background = new THREE.CubeTextureLoader().setPath("/textures/").load([
        '8k_stars_cube.jpg',
        '8k_stars_milky_way_cube.jpg',
        '8k_stars_cube.jpg',
        '8k_stars_cube.jpg',
        '8k_stars_milky_way_cube.jpg',
        '8k_stars_milky_way_cube.jpg',
    ]);

    renderer = new THREE.WebGLRenderer({ antialias: true }); //create a renderer
    renderer.setSize(window.innerWidth, window.innerHeight); //set the size of the renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
     
    controls = new OrbitControls(camera, renderer.domElement); //create controls for the camera
        
    //texture loader
    textureLoader = new THREE.TextureLoader();
        
    const sunGeometry = new THREE.SphereGeometry(30, SEGMENTS, SEGMENTS); //create a sphere
    const sunTexture = textureLoader.load('./textures/2k_sun.jpg');
    const SunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); //create a material
    SunMaterial.map = sunTexture;
    SunMesh = new THREE.Mesh(sunGeometry, SunMaterial); //create a mesh
    scene.add(SunMesh); //add the mesh to the scene
    
    const sunLight = new THREE.PointLight(0xFFFFFF, 1, 2000); //create a light
    sunLight.position.set(0, 20, 0); //set the light's position
    sunLight.castShadow = true;
    scene.add(sunLight); //add the light to the scene
        
    //create 9 empty objects to act as sun rotation points
    for (let i = 0; i < planets.length; i++) {
        const sunRotationPoint = new THREE.Object3D();
        scene.add(sunRotationPoint);
        sunRotationPoints.push(sunRotationPoint);
    }
    
    for(let i = 0; i < planets.length; i++){
        const planet = planets[i];
        const planetGeometry = new THREE.SphereGeometry(planet.radius, SEGMENTS, SEGMENTS); //create a sphere
        const planetTexture = textureLoader.load(planet.texture);
        const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture }); //create a material
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial); //create a mesh

        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;
    
        //add planet relative to the sun's coordinate system
        let position = null;
    
        if(i < 4){
            position = 40 * (i + 1);
        }
        else{
            position = 40 * (i + 2);
        }
        planetMesh.position.x = position;
    
        sunRotationPoints[i].add(planetMesh); //add the mesh to the scene
    
        if(planet.name === "Earth"){
            //create the moon
            const moonGeometry = new THREE.SphereGeometry(1, SEGMENTS, SEGMENTS); //create a sphere
            const moonTexture = textureLoader.load('./textures/2k_moon.jpg');
            const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture }); //create a material
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial); //create a mesh

            moonMesh.castShadow = true;
            moonMesh.receiveShadow = true;

            moonMesh.position.x = 10;
            planetMesh.add(moonMesh); //add the mesh to the scene   

            moons.push(moonMesh);
        }
    
        if(planet.name === "Saturn"){
            //create the ring
            const ringGeometry = new THREE.RingGeometry((planets[i].radius + 0.5), (planets[i].radius + 0.8) * 1.35, SEGMENTS, SEGMENTS);
            const ringTex = textureLoader.load('./textures/2k_saturn_ring_alpha.png');
            const ringMaterial = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, 
                //map the texture to the ring but flip it so it's not upside down
                map: ringTex,
                transparent: true,
            });          

            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial); //create a mesh
            ringMesh.rotation.x = Math.PI / 2;
            planetMesh.add(ringMesh); //add the mesh to the scene

            ringMesh.castShadow = true;
            ringMesh.receiveShadow = false;
            
            //create the moons of saturn (create 10 moons)
            for(let j = 0; j < 10; j++){
                //create rotation point for the moon
                const moonRotationPoint = new THREE.Object3D();
                //give random x rotation for random axis for the moon
                moonRotationPoint.rotation.x = Math.random() * 2 * Math.PI;

                //add the moon rotation point to the planet
                planetMesh.add(moonRotationPoint);


                const moonGeometry = new THREE.SphereGeometry(Math.random() * 0.45, SEGMENTS, SEGMENTS); //create a sphere
                const moonTexture = textureLoader.load('./textures/2k_moon.jpg');
                const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture }); //create a material
                const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial); //create a mesh

                moonMesh.castShadow = true;
                moonMesh.receiveShadow = true;

                moonMesh.position.x = planets[i].radius + 10 + j * 1.5;
                //add the moon to the moon rotation point
                moonRotationPoint.add(moonMesh); //add the mesh to the scene   

                saturnMoonRotationPoints.push([moonRotationPoint, Math.random() * 0.007]); //add the moon rotation point to the array and give it a random rotation speed

                moons.push(moonMesh);
            }
        }
    
        planet.setMesh(planetMesh);
    }

    //set the camera position
    camera.position.z = CAMERA_START_Z;
    camera.position.y = CAMERA_START_Y; 
    camera.rotation.x = CAMERA_START_X;
    scene.add(camera);
    
    controls.update(); //update the controls to match the camera position
}


const raycaster = new THREE.Raycaster(); //create a raycaster
const mouse = new THREE.Vector2(); //create a vector2 to store the mouse position

let isFollowingObj = false;
let followingObj = null;

const rotateSun = () => {
    let rotationValue = 0.01;
    SunMesh.rotation.y += 0.01;

    for(let i = 0; i < 9; i++){
        sunRotationPoints[i].rotation.y += rotationValue;
        rotationValue = rotationValue / 1.3;
    }
}

const rotatePlanets = () => {
    for(let i = 0; i < 9; i++){
        planets[i].mesh.rotation.y += 0.01;
    }
}

const saturnMoonRotaion = () => {
    for(let i = 0; i < saturnMoonRotationPoints.length; i++){
        saturnMoonRotationPoints[i][0].rotation.y += saturnMoonRotationPoints[i][1];
    }
}

const rotateMoons = () => {
    for(let i = 0; i < moons.length; i++){
        moons[i].rotation.y += 0.005;
    }
}

//object focus

const followObject = () => {
    if(isFollowingObj){
        //focus the camera on the object
        const objectPosition = new THREE.Vector3();
        followingObj.getWorldPosition(objectPosition);
        const cameraOffset = new THREE.Vector3(0, 5, followingObj.geometry.boundingSphere.radius + 10);
        camera.position.copy(objectPosition).add(cameraOffset);
        camera.lookAt(objectPosition);
        controls.enabled = false;
    }
}
const animate = () => {
    requestAnimationFrame(animate);
    rotateSun();
    rotatePlanets();
    rotateMoons();
    saturnMoonRotaion();
    followObject();

    renderer.render(scene, camera); //render the scene
}


const resetCamera = () => {
    //return back to original position
    camera.position.x = CAMERA_START_X;
    camera.position.y = CAMERA_START_Y;
    camera.position.z = CAMERA_START_Z;

    controls.update();
    controls.enabled = true;
}

const stopFollowingObject = (event) => {
    if(event.keyCode === 27){ //Esc pressed
        isFollowingObj = false;
        resetCamera();
        followingObj = null;
    }
}


//mouse event listeners for raycasting

const mouseMove = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; //calculate the mouse position
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

const focusObject = (event) => {
    raycaster.setFromCamera(mouse, camera); //set the raycaster position
    const intersects = raycaster.intersectObjects(scene.children, true); //get the objects that intersect with the raycaster

    //if there are any intersections
    if(intersects.length > 0){
        followingObj = intersects[0].object; //get the first intersected object
        isFollowingObj = true;
    }
}

//add the event listeners
document.addEventListener('mousemove', mouseMove);
document.addEventListener('click', focusObject);
document.addEventListener("keydown", stopFollowingObject);
//rendering
init();
animate();
