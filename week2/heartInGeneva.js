import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

let camera3D, scene, renderer, cube;
let controls;
let light;

function init3D() {
    // 3D scene, camera, renderer
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 3D object- box
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, flatShading: true });
    cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    const heart_shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    heart_shape.moveTo(x + 2.5, y + 2.5);
    heart_shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    heart_shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    heart_shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    heart_shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    heart_shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    heart_shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = {
        steps: 2,  
        depth: 2,  
        bevelEnabled: true,  
        bevelThickness: 1,  
        bevelSize: 1,  
        bevelSegments: 2,  
    };

    const heart_geometry = new THREE.ExtrudeGeometry(heart_shape, extrudeSettings);
    const heart_material = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.5, metalness: 1 });
    const heart_mesh = new THREE.Mesh(heart_geometry, heart_material);
    scene.add(heart_mesh);

    let bgGeometery = new THREE.SphereGeometry(950, 100, 40);
    bgGeometery.scale(-1, 1, 1);
    let panotexture = new THREE.TextureLoader().load("geneva.JPG");
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

function animate() {
    controls.update();  //orbit controls
    renderer.render(scene, camera3D);
    requestAnimationFrame(animate);
}

init3D();
