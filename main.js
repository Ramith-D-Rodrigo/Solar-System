import * as THREE from './node_modules/three/src/Three.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import planets from './planets.js';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';
//"Saiyan Space Pod (DBOR)" (https://skfb.ly/6XPyA) by LogNworld is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

const fbxLoader = new FBXLoader();

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
let spaceshipMesh = null;

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
                map: ringTex,
                transparent: true,
            });          

            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial); //create a mesh
            ringMesh.rotation.x = Math.PI / 2;
            planetMesh.add(ringMesh); //add the mesh to the scene

            //ringMesh.castShadow = true;
            ringMesh.receiveShadow = true;
            
            //create the moons of saturn (create 10 moons)
            for(let j = 0; j < 10; j++){
                //create rotation point for the moon
                const moonRotationPoint = new THREE.Object3D();
                //give random x rotation for random axis for the moon
                moonRotationPoint.rotation.x = Math.random() * 2 * Math.PI;

                //add the moon rotation point to the planet
                planetMesh.add(moonRotationPoint);


                const moonGeometry = new THREE.SphereGeometry(Math.random() * 0.45 + 0.1, SEGMENTS, SEGMENTS); //create a sphere
                const moonTexture = textureLoader.load('./textures/2k_moon.jpg');
                const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture }); //create a material
                const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial); //create a mesh

                moonMesh.castShadow = true;
                moonMesh.receiveShadow = true;

                moonMesh.position.x = planets[i].radius + 10 + j * 1.5;
                //add the moon to the moon rotation point
                moonRotationPoint.add(moonMesh); //add the mesh to the scene   

                saturnMoonRotationPoints.push([moonRotationPoint, Math.random() * 0.007 + 0.001]); //add the moon rotation point to the array and give it a random rotation speed

                moons.push(moonMesh);
            }
        }
    
        planet.setMesh(planetMesh);
    }
    //set the camera position to point at the saturn
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
let cameraOffset = null;

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

const StartfollowingObject = () => {
    //focus the camera on the object
    const objectPosition = new THREE.Vector3();
    followingObj.getWorldPosition(objectPosition);
    //find the camera offset for the object
    cameraOffset = new THREE.Vector3(0, 3, followingObj.geometry.boundingSphere.radius + 10);

    //add the camera to the object so it follows it
    followingObj.add(camera);

    //set the camera position to the offset
    camera.position.copy(cameraOffset);

    followObject();
}

const followObject = () => {
    if(isFollowingObj){
        const objectPosition = new THREE.Vector3();
        followingObj.getWorldPosition(objectPosition);
        //set the controls target to the object position
        controls.target.copy(objectPosition);
        controls.update();
    }
}

const asteroids = [];

const spawnAsteroid = () => {
    const asteroidSize = Math.random() * 0.5 + 0.1; //random size for the asteroid

    const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, SEGMENTS, SEGMENTS); //create a sphere
    const asteroidTexture = textureLoader.load('./textures/asteroid.jpg');
    const asteroidMaterial = new THREE.MeshStandardMaterial({ map: asteroidTexture }); //create a material
    const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial); //create a mesh
    const maxDistance = Math.random() * 1000 + 500; //max distance it travels ()
    const currDistance = 0; //current distance it has travelled
    const randomAngle = Math.random() * 2 * Math.PI; //random angle for the asteroid to spawn at
    let randomSpeed = Math.random() * 5 + 1; //random speed for the asteroid to travel at (1 - 6)

    //make the speed negative 50% of the time
    if(Math.random() < 0.5){
        randomSpeed = -randomSpeed;
    }

    const movingAxis = Math.floor(Math.random() * 3); //random axis for the asteroid to travel on (x, y, z) x = 0, y = 1, z = 2

    //set the asteroid position randomly
    asteroidMesh.position.x = Math.random() * 1000 - 500;
    asteroidMesh.position.y = Math.random() * 1000 - 500;
    asteroidMesh.position.z = Math.random() * 1000 - 500;

    //add the asteroid to the scene
    scene.add(asteroidMesh);

    //create a particle system for the asteroid that acts as a trail
    const particleGeometry = new THREE.CylinderGeometry(0, asteroidSize * 2, 10, 5, 5);
    const particleMaterial = new THREE.PointsMaterial({ map: asteroidTexture, size: 0.01, sizeAttenuation: true });

    //add some ring particles to the asteroid
    const ringCount = Math.random() * 10 + 1;
    for(let i = 0; i < ringCount; i++){
        const ringGeometry = new THREE.RingGeometry(asteroidSize + Math.random(), asteroidSize * (Math.random() + 6), 20, 2, 2);
        const ringMaterial = new THREE.PointsMaterial({ map: asteroidTexture, size: 0.01, sizeAttenuation: true });
        const ringMesh = new THREE.Points(ringGeometry, ringMaterial);
        //random rotation for the ring
        ringMesh.rotation.x = Math.random() * 2 * Math.PI;
        asteroidMesh.add(ringMesh);
    }


    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    //add the particle system to the asteroid so it moves with it
    asteroidMesh.add(particleSystem);
   
    //rotate the particle system so it is facing the asteroid moving direction
    if(movingAxis === 0){ //if the asteroid is moving on the x axis
        particleSystem.rotation.z = -Math.PI / 2;
        //reverse the rotation if the asteroid is moving backwards
        if(randomSpeed < 0){
            particleSystem.rotation.z = Math.PI / 2;
        }
    }
    else if(movingAxis === 1){  //if the asteroid is moving on the y axis
        if(randomSpeed < 0){
            particleSystem.rotation.x = Math.PI;
        }
    }
    else{
        particleSystem.rotation.x = Math.PI / 2;
        //reverse the rotation if the asteroid is moving backwards
        if(randomSpeed < 0){
            particleSystem.rotation.x = -Math.PI / 2;
        }
    }


    asteroids.push({
        mesh: asteroidMesh,
        maxDistance: maxDistance,
        currDistance: currDistance,
        randomAngle: randomAngle,
        randomSpeed: randomSpeed,
        movingAxis: movingAxis,
    }); //add the asteroid to the array
}

const moveAsteroids = () => {
    for(let i = 0; i < asteroids.length; i++){
        if(asteroids[i].currDistance < asteroids[i].maxDistance){
            if(asteroids[i].movingAxis === 0){  //check the axis it is moving on
                asteroids[i].mesh.position.x += asteroids[i].randomSpeed;

            }else if(asteroids[i].movingAxis === 1){
                asteroids[i].mesh.position.y += asteroids[i].randomSpeed;

            }else{
                asteroids[i].mesh.position.z += asteroids[i].randomSpeed;
            }
            asteroids[i].currDistance += asteroids[i].randomSpeed;

        }else{
            //remove the asteroid from the scene
            scene.remove(asteroids[i].mesh);
            console.log("removed");
            //remove the asteroid from the array
            asteroids.splice(i, 1);
        }
    }
}


const animate = () => {
    requestAnimationFrame(animate);
    rotateSun();
    rotatePlanets();
    rotateMoons();
    saturnMoonRotaion();
    followObject();

    //for random asteroid spawning
    //first get a random number between 0 and 1000
    const randomNum = Math.floor(Math.random() * 1000);
    if(randomNum % 75 === 0){ //if the number is divisible by 234
        spawnAsteroid(); //spawn an asteroid
    }
    moveAsteroids();


    renderer.render(scene, camera); //render the scene
}


const resetCamera = () => {
    scene.add(camera);
    //return back to original position
    camera.position.x = CAMERA_START_X;
    camera.position.y = CAMERA_START_Y;
    camera.position.z = CAMERA_START_Z;

    //reset the controls to the original position
    controls.target.set(0, 0, 0);

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
        StartfollowingObject();
    }
}

//add the event listeners
document.addEventListener('mousemove', mouseMove);
document.addEventListener('click', focusObject);
document.addEventListener("keydown", stopFollowingObject);
//rendering
init();
animate();
