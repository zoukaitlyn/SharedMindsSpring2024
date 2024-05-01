import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/DragControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";


// Initialize variables
let camera, scene, renderer, controls, dragControls, object;
let objects = [];
let objToRender = 'iron_shelf';
let objToRender2 = 'bed_sagara';

document.addEventListener('DOMContentLoaded', () => {
    // Call the init function to set everything up
    init3D();

    const floorSelect = document.getElementById("floorSelect");
    floorSelect.addEventListener("change", loadSelectedFloor);
});

// Initialize function
function init3D() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 12, 20);

    // Create light
    const light = new THREE.PointLight(0xFFFFFF, 3);
    light.position.set(-50, 50, 0);
    light.castShadow = true; 
    scene.add(light);

    light.shadow.mapSize.width = 2048; 
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1; 
    light.shadow.camera.far = 25;

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    document.body.appendChild(renderer.domElement);

    //Instantiate a loader for the .gltf file
    const loader = new GLTFLoader();

    //Load the shelf
    loader.load(
        `models/${objToRender}/scene.gltf`,
        function (gltf) {
            const scaleFactor = 0.07;
            const object = gltf.scene;
            object.scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            // Set the desired position
            const desiredPosition = new THREE.Vector3(2.1, -0.05, -1.5);
            
            // Adjust the position based on the scale factor
            const adjustedPosition = new THREE.Vector3(
                desiredPosition.x / scaleFactor,
                desiredPosition.y / scaleFactor,
                desiredPosition.z / scaleFactor
            );
            
            // Set the position of the object
            object.position.copy(adjustedPosition);
            
            // Add the object to the scene
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

    // load the bed
    loader.load(
        `models/${objToRender2}/scene.gltf`,
        function (gltf) {
            const scaleFactor = 0.01;
            const object = gltf.scene;
            object.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
            // Set the desired position for the second model
            const desiredPosition = new THREE.Vector3(0, 0.07, 0);
    
            // Adjust the position based on the scale factor
            const adjustedPosition = new THREE.Vector3(
                desiredPosition.x / scaleFactor,
                desiredPosition.y / scaleFactor,
                desiredPosition.z / scaleFactor
            );
    
            // Set the position of the object
            object.position.copy(adjustedPosition);

            object.rotation.y = Math.PI / 2; 

    
            // Add the object to the scene
            scene.add(object);
        },
        function (xhr) {
            // While it is loading, log the progress
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            // If there is an error, log it
            console.error(error);
        }
    );


    // Create OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);

    // Initialize DragControls
    dragControls = new DragControls(objects, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', function(event) {
        controls.enabled = false;
    });
    dragControls.addEventListener('dragend', function(event) {
        controls.enabled = true;
    });

    dragControls.addEventListener('drag', function(event) {
        console.log('Shelf position:', event.object.position);
    });


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
    // createFloor();
    createRoom();
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
    const objectLabel = document.getElementById("objectLabel").value;

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
    material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.5 });

    mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = (Math.random() * 15 - 5);
    mesh.position.y = 1;
    mesh.position.z = (Math.random() * 15 - 5);

    mesh.userData.label = objectLabel;

    // Add created shape to the scene
    scene.add(mesh);
    objects.push(mesh);

    const label = createLabel(objectLabel); 
    label.position.set(mesh.position.x, mesh.position.y + 1, mesh.position.z);
    scene.add(label);

    mesh.userData.label = objectLabel; 


    // Render the scene
    renderer.render(scene, camera);
}

function createLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const font = 'Bold 50px Arial';
    context.font = font;
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
    canvas.width = textWidth + 20; 
    canvas.height = 100; 

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text on the canvas
    context.fillStyle = '#000000'; 
    context.font = font;
    context.fillText(text, 10, 50); 

    // Create texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(canvas.width / 100, canvas.height / 100); 
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}


function createFloor() {
    // Create a plane geometry
    const planeGeometry = new THREE.PlaneGeometry(70, 60);

    // Create a material
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide }); 

    // Create the mesh
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.name = "floor";

    // Rotate the plane to be horizontal
    planeMesh.rotation.x = -Math.PI / 2;

    // Position the plane at the bottom
    planeMesh.position.y = -1; 

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
    const floorMaterial = new THREE.MeshStandardMaterial({ map: texture });

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
    let panotexture = new THREE.TextureLoader().load("backgrounds/mountains.jpeg");
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture, receiveShadow: true });
    let back = new THREE.Mesh(bgGeometery, backMaterial);
    back.name = "bg";

    scene.add(back);
}

function updateBackgroundTexture(image) {
    // Create texture from the loaded image
    const texture = new THREE.TextureLoader().load(image.src);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const bgMaterial = new THREE.MeshBasicMaterial({ map: texture, receiveShadow: true });

    // Find the existing floor mesh in the scene and update its material
    scene.traverse(child => {
        if (child instanceof THREE.Mesh && child.name === "bg") {
            child.material = bgMaterial;
        }
    });
}

function createWalls() {
    const wallHeight = 20;
    const wallColor = 0xCCCCAA; // Adjust color as needed

    // Define wall dimensions
    const wallWidth = 70;
    const wallDepth = 60;

    // Create material for walls
    const wallMaterial = new THREE.MeshBasicMaterial({ color: wallColor});

    // Create walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, wallDepth), wallMaterial);
    leftWall.position.set(-wallWidth / 2, wallHeight / 2 - 1, 0);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, wallDepth), wallMaterial);
    rightWall.position.set(wallWidth / 2, wallHeight / 2 - 1, 0);

    const cornerWall = new THREE.Mesh(new THREE.BoxGeometry(wallWidth, wallHeight, 1), wallMaterial);
    cornerWall.position.set(0, wallHeight / 2 - 1, -wallDepth / 2);

    // Add walls to the scene
    scene.add(leftWall);
    scene.add(rightWall);
    scene.add(cornerWall);
}

function createClock() {
    const rectWidth = 5;
    const rectHeight = 3;
    const rectDepth = 0.1;

    // Create a BoxGeometry with the defined dimensions
    const rectGeometry = new THREE.BoxGeometry(rectWidth, rectHeight, rectDepth);

    // Create a CanvasTexture to draw the time
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200; // Adjust canvas size as needed
    canvas.height = 100;
    context.font = '45pt Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center'; 
    context.textBaseline = 'middle'; 
    context.fillText('00:00', 50, 90); 

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Create a MeshBasicMaterial or MeshStandardMaterial for the rectangle
    const rectMaterial = new THREE.MeshBasicMaterial({ map: texture }); 

    // Create a Mesh using the geometry and material
    const rectangle = new THREE.Mesh(rectGeometry, rectMaterial);

    // Position the clock on the wall
    rectangle.position.set(0, 15, -29); 

    // Add the clock mesh to the scene
    scene.add(rectangle);

    // Update the clock texture with current time every second
    setInterval(() => {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();

        // Clear canvas before drawing new time
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Update clock texture with current time
        const timeString = `${hours}:${minutes}`;
        const textWidth = context.measureText(timeString).width;
        context.fillText(timeString, canvas.width / 2, canvas.height / 2);        
        texture.needsUpdate = true;
    }, 1000);
}

function loadSelectedFloor() {
    const selectedFloor = document.getElementById("floorSelect").value;

    // Remove existing floor if any
    scene.traverse(child => {
        if (child instanceof THREE.Mesh && child.name === "floor") {
            scene.remove(child);
        }
    });

    // Load selected floor model or texture
    switch (selectedFloor) {
        case "floor1":
            // Load floor model or texture for floor option 1
            // Example: Create a plane geometry with texture
            const floorTexture1 = new THREE.TextureLoader().load("floors/floor1.png");
            floorTexture1.wrapS = THREE.RepeatWrapping;
            floorTexture1.wrapT = THREE.RepeatWrapping;
            floorTexture1.repeat.set(10, 10);

            const floorMaterial1 = new THREE.MeshStandardMaterial({ map: floorTexture1 });

            const floorGeometry1 = new THREE.PlaneGeometry(70, 60); 

            const floorMesh1 = new THREE.Mesh(floorGeometry1, floorMaterial1);
            floorMesh1.name = "floor";

            // Rotate the plane to be horizontal
            floorMesh1.rotation.x = -Math.PI / 2;

            // Position the plane at the bottom
            floorMesh1.position.y = -1; 

            // Add the plane to the scene
            scene.add(floorMesh1);
            break;
        
        case "floor2":
            const floorTexture2 = new THREE.TextureLoader().load("floors/floor2.png");
            floorTexture2.wrapS = THREE.RepeatWrapping;
            floorTexture2.wrapT = THREE.RepeatWrapping;
            floorTexture2.repeat.set(10, 10);

            const floorMaterial2 = new THREE.MeshStandardMaterial({ map: floorTexture2 });

            const floorGeometry2 = new THREE.PlaneGeometry(70, 60);

            const floorMesh2 = new THREE.Mesh(floorGeometry2, floorMaterial2);
            floorMesh2.name = "floor";

            floorMesh2.rotation.x = -Math.PI / 2;

            floorMesh2.position.y = -1; 
            scene.add(floorMesh2);

            break;
        
        default:
            console.error("Invalid floor selection");
            break;
    }
}


function createRoom() {
    createFloor();
    createWalls();
    createClock();
}

function animate() {
    controls.update(); 

    // Update label positions
    objects.forEach(object => {
        const label = object.userData.label;
        console.log("Label:", label);

        if (label) {
            const objectPosition = object.position.clone().add(new THREE.Vector3(0, 1, 0));
            label.position.copy(objectPosition);
        }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

