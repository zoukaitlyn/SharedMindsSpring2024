import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

let camera3D, scene, renderer, cube;
let controls;
let light;

//snow
let particles; // snowflakes
let positions = [], velocities = []; // snowflake positions and velocities [x,y,z]

const numSnowflakes = 15000;

const maxRange = 1000, minRange = maxRange/2;
const minHeight = 150; 

function init3D() {
    // 3D scene, camera, renderer
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    

    const geometry = new THREE.BufferGeometry(); // positions and velocites as attributes
    const TextureLoader = new THREE.TextureLoader(); // load snowflake image

    addSnowflakes()


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
    for(let i=0; i<numSnowflakes; i++){
        positions.push(
            Math.floor(Math.random() * maxRange - minRange),
            Math.floor(Math.random() * minRange - minHeight),
            Math.floor(Math.random() * minRange - minRange),
        )
        velocities.push(
            Math.floor(Math.random() * 6 - 3) * 0.1,
            Math.floor(Math.random() * 5 - 0.12) * 0.18,
            Math.floor(Math.random() * 6 - 3) * 0.1,
        )
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3))

    const snowflakeMaterial = new THREE.PointsMaterial({
        size: 4,
        map: textureLoader.load("snowflake.png"),
        blend: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.7,
    });
    
    particles = new THREE.Points(geometry, snowflakeMaterial);
    scene.add(particles);

}

function updateParticles(){
    for(let i=0; i < numSnowflakes*3; i += 3){
        particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i];
        particles.geometry.attributes.position.array[i+1] -= particles.geometry.attributes.velocity.array[i+1]
        particles.geometry.attributes.position.array[i+2] -= particles.geometry.attributes.velocity.array[i+2]

        if(particles.geometry.attributes.position.array[i+1]<0){
            particles.geometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange)
            particles.geometry.attributes.position.array[i+1] = Math.floor(Math.random() * minRange - minHeight)
            particles.geometry.attributes.position.array[i+2] = Math.floor(Math.random() * minRange - minRange)

        }

    }
    // tell computer to update new position in position array
    particles.geometry.attributes.position.needsUpdate = true;
}

function animate() {

    updateParticles;

    controls.update();  //orbit controls
    renderer.render(scene, camera3D);
    requestAnimationFrame(animate);
}

init3D();
