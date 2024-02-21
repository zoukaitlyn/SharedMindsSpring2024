import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import * as FB from './firebaseStuff.js';

let camera3D, scene, renderer, cube;
let controls;
let light;

//snow
let particles; // snowflakes
let positions = [], velocities = []; // snowflake positions and velocities (x,y,z)

const numSnowflakes = 10000; // number of snowflakes

const maxRange = 1000, minRange = maxRange/2; // snowflakes placed -500 to 500 on x and z axes
const minHeight = 150; // snowflakes placed 150 to 500 on y axis

// buffer geometry stores data as arrays for each attribute
const geometry = new THREE.BufferGeometry(); // positions and velocites as attributes
const textureLoader = new THREE.TextureLoader(); // load snowflake image

function init3D() {
    // 3D scene, camera, renderer
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // call snowflake function, make geometry + material and add to screen
    addSnowflakes();

    //background
    let bgGeometery = new THREE.SphereGeometry(950, 100, 40);
    bgGeometery.scale(-1, 1, 1);
    let panotexture = new THREE.TextureLoader().load("snowpanorama.jpeg");
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });

    let back = new THREE.Mesh(bgGeometery, backMaterial);
    scene.add(back);

    light = new THREE.PointLight(0xFFFFFF, 3);
    /* position the light so it shines on the cube (x, y, z) */
    light.position.set(0, 0, 10);
    scene.add(light);

    controls = new OrbitControls(camera3D, renderer.domElement);
    camera3D.position.z = 5;
    animate();
}

function addSnowflakes(){
    // loops through all snowflakes
    for(let i=0; i<numSnowflakes; i++){
        positions.push( // create a position for each snowflake
            Math.random() * maxRange - minRange, // x -500 to 500
            Math.random() * minRange - minHeight, // y 250 to 750
            Math.random() * minRange - minRange // z -500 to 500
        );
        velocities.push( // create a velocity for each snowflake, sideways drift
            (Math.random() * 6 - 3) * 0.1, // x 0.3 to -0.3
            (Math.random() * 5 - 0.12) * 0.18, // y 0.02 to 0.92
            (Math.random() * 6 - 3) * 0.1 // -0.3 to 0.3
        );
    }

    // add to geometry
    // each attribute has an array of values
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    // create snowflake material
    const snowflakeMaterial = new THREE.PointsMaterial({
        size: 4,
        map: textureLoader.load("snowflake.png"),
        blending: THREE.AdditiveBlending, // add rgb values
        depthTest: false, // determines if one object is in front of another
        transparent: true, // enable opacity changes
        opacity: 0.7
    });
    
    // create snowflake particle, add to array
    // snowflakes are points located in 3d world
    particles = new THREE.Points(geometry, snowflakeMaterial);
    scene.add(particles);
}

function updateParticles(){
    // take velocity values and subtract from position values for each snowflake
    // every snowflake has 3 position values
    for(let i=0; i < numSnowflakes*3; i += 3){
        particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i];
        particles.geometry.attributes.position.array[i+1] -= particles.geometry.attributes.velocity.array[i+1];
        particles.geometry.attributes.position.array[i+2] -= particles.geometry.attributes.velocity.array[i+2];

        // is the snowflake is below the ground?
        // give the snowflake a new position(same in add snowflake)
        if(particles.geometry.attributes.position.array[i+1] < -200){
            particles.geometry.attributes.position.array[i] = Math.random() * maxRange - minRange;
            particles.geometry.attributes.position.array[i+1] = Math.random() * minRange - minHeight;
            particles.geometry.attributes.position.array[i+2] = Math.random() * minRange - minRange;
        }
    }
    // tell computer to update new position in position array
    particles.geometry.attributes.position.needsUpdate = true;
}


function animate() {
    updateParticles(); 
    
    controls.update();  //orbit controls
    renderer.render(scene, camera3D);
    requestAnimationFrame(animate);
}

init3D();
