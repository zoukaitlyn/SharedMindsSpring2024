import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

// Initialize variables
let camera, scene, renderer, controls;

// Initialize function
function init3D() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 12, 20);

    // Create light
    const light = new THREE.PointLight(0xFFFFFF, 3);
    light.position.set(500, 500, 500);
    light.castShadow = true;
    scene.add(light);

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);

    // Create event listener for dropdown change
    const shapeSelect = document.getElementById("shapeSelect");
    addButton.addEventListener("click", createShape);

    // Add event listener to the floor file input
    const floorFileInput = document.getElementById("floorFileInput");
    floorFileInput.addEventListener("change", handleFileSelect);

    // Add event listener to the floor file input
    const bgFileInput = document.getElementById("bgFileInput");
    bgFileInput.addEventListener("change", handleFileSelect2);

    // Initial shape creation
    createShape();
    createFloor();
    createBackground();

    // Start animation loop
    animate();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            updateFloorTexture(image);
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleFileSelect2(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            updateBackgroundTexture(image);
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Function to create shape based on dropdown selection
function createShape() {
    // Get selected shape from dropdown
    const selectedShape = document.getElementById("shapeSelect").value;

    // Create selected shape
    let geometry, material, mesh;
    switch (selectedShape) {
        case "box":
            geometry = new THREE.BoxGeometry();
            break;
        case "sphere":
            geometry = new THREE.SphereGeometry(1, 32, 32);
            break;
        case "cylinder":
            geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
            break;
        default:
            console.error("Invalid shape selection");
            return;
    }

    const color = document.getElementById("colorPicker").value;
    material = new THREE.MeshBasicMaterial({ color: color });
    mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = (Math.random() * 15 - 5);
    mesh.position.z = (Math.random() * 15 - 5);
    mesh.position.y = 1;

    // Add created shape to the scene
    scene.add(mesh);

    // Render the scene
    renderer.render(scene, camera);
}

function createFloor() {
    // Create a plane geometry
    const planeGeometry = new THREE.PlaneGeometry(70, 60);

    // Create a material
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide }); // Adjust color as needed

    // Create the mesh
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.name = "floor";

    // Rotate the plane to be horizontal
    planeMesh.rotation.x = -Math.PI / 2;

    // Position the plane at the bottom
    planeMesh.position.y = -1; // Adjust the position based on your scene

    // Add the plane to the scene
    scene.add(planeMesh);
}

function updateFloorTexture(image) {
    // Create texture from the loaded image
    const texture = new THREE.TextureLoader().load(image.src);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    // Create a material with the texture
    const floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

    // Find the existing floor mesh in the scene and update its material
    scene.traverse(child => {
        if (child instanceof THREE.Mesh && child.name === "floor") {
            child.material = floorMaterial;
        }
    });
}

function createBackground(){
    let bgGeometery = new THREE.SphereGeometry(950, 100, 40);
    bgGeometery.scale(-1, 1, 1);
    let panotexture = new THREE.TextureLoader().load("mountains.jpeg");
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });
    let back = new THREE.Mesh(bgGeometery, backMaterial);
    back.name = "bg";

    scene.add(back);
}

function updateBackgroundTexture(image) {
    // Create texture from the loaded image
    const texture = new THREE.TextureLoader().load(image.src);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const bgMaterial = new THREE.MeshBasicMaterial({ map: texture });

    // Find the existing floor mesh in the scene and update its material
    scene.traverse(child => {
        if (child instanceof THREE.Mesh && child.name === "bg") {
            child.material = bgMaterial;
        }
    });
}

function animate() {
    controls.update();  // Update orbit controls
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Call the init function to set everything up
init3D();
