//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

let camera3D, scene, renderer, object;
let controls;
let light;
let objToRender = 'desk';

function init3D() {
    // 3D scene, camera, renderer
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //Instantiate a new renderer and set its size
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container3D").appendChild(renderer.domElement);

    //Instantiate a loader for the .gltf file
    const loader = new GLTFLoader();

    //Load the file
    loader.load(
        `models/${objToRender}/scene.gltf`,
        function (gltf) {
            //If the file is loaded, add it to the scene
            object = gltf.scene;
            object.scale.set(10,10,10)
            object.position.x = 0;
            object.position.y = -4;
            object.position.z = 2;

            scene.add(object);
        },
        function (xhr) {
            //While it is loading, log the progress
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            //If there is an error, log it
            console.error(error);
        }
    );

    light = new THREE.PointLight(0xFFFFFF, 3);
    /* position the light so it shines on the cube (x, y, z) */
    light.position.set(500, 500, 500);
    light.castShadow = true;
    scene.add(light);

    controls = new OrbitControls(camera3D, renderer.domElement);
    camera3D.position.x = 3;
    camera3D.position.y = 12;
    camera3D.position.z = 4;
    animate();
}

function animate() {
    controls.update();  //orbit controls
    renderer.render(scene, camera3D);
    requestAnimationFrame(animate);
}

init3D();
