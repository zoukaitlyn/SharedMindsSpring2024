import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, update, set, push, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

let isInteracting = false;

// Get the input box and the canvas element
const canvas = document.createElement('canvas');
canvas.setAttribute('id', 'myCanvas');
canvas.style.position = 'absolute';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.left = '0';
canvas.style.top = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.backgroundColor = 'pink';
document.body.appendChild(canvas);
console.log('canvas', canvas.width, canvas.height);

const inputBox = document.createElement('input');
inputBox.setAttribute('type', 'text');
inputBox.setAttribute('id', 'inputBox');
inputBox.setAttribute('placeholder', 'Enter text here');
inputBox.style.position = 'absolute';
inputBox.style.left = '54%';
inputBox.style.top = '50%';
inputBox.style.transform = 'translate(-50%, -50%)';
inputBox.style.zIndex = '100';
inputBox.style.fontSize = '30px';
inputBox.style.fontFamily = 'Arial';
document.body.appendChild(inputBox);

const colorMenu = document.createElement('select');
colorMenu.setAttribute('id', 'colorSelect');
colorMenu.style.position = 'absolute';
colorMenu.style.left = '37%';
colorMenu.style.top = '50%';
colorMenu.style.height = '40px'
colorMenu.style.transform = 'translate(-60%, -50%)';
colorMenu.style.zIndex = '100';
document.body.appendChild(colorMenu);

const colorOptions = ['Black', 'FireBrick', 'MidnightBlue', 'Olive', 'Violet', 'Tomato', 'DeepPink', 'LawnGreen', 'DeepSkyBlue', 'DarkOrange'];

colorOptions.forEach(color => {
    const optionElement = document.createElement('option');
    optionElement.value = color.toLowerCase();
    optionElement.textContent = color;
    colorMenu.appendChild(optionElement);
});

const fontMenu = document.createElement('select');
fontMenu.setAttribute('id', 'fontSelect');
fontMenu.style.position = 'absolute';
fontMenu.style.left = '27.5%';
fontMenu.style.top = '50%';
fontMenu.style.height = '40px'
fontMenu.style.transform = 'translate(-50%, -50%)';
fontMenu.style.zIndex = '100';
document.body.appendChild(fontMenu)

const fontOptions = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];

fontOptions.forEach(font => {
    const optionElement = document.createElement('option');
    optionElement.value = font.toLowerCase();
    optionElement.textContent = font;
    fontMenu.appendChild(optionElement);
});

const fontSizeMenu = document.createElement('select');
fontSizeMenu.setAttribute('id', 'fontSizeMenu');
fontSizeMenu.style.position = 'absolute';
fontSizeMenu.style.left = '21%';
fontSizeMenu.style.top = '50%';
fontSizeMenu.style.height = '40px';
fontSizeMenu.style.transform = 'translate(-50%, -50%)';
fontSizeMenu.style.zIndex = '100';
document.body.appendChild(fontSizeMenu);

const fontSizeOptions = ['10', '15', '20', '25', '30', '35', '40', '45', '50'];

fontSizeOptions.forEach(fontSize => {
    const optionElement = document.createElement('option');
    optionElement.value = fontSize;
    optionElement.textContent = fontSize;
    fontSizeMenu.appendChild(optionElement);
});

// Add event listener to the input box
inputBox.addEventListener('keydown', function (event) {
    // Check if the Enter key is pressed

    if (event.key === 'Enter') {
        const inputValue = inputBox.value;
        const colorValue = colorMenu.value;
        const fontValue = fontMenu.value;
        const sizeValue = fontSizeMenu.value;
        const inputBoxRect = inputBox.getBoundingClientRect();
        const x = inputBoxRect.left;
        const y = inputBoxRect.top;
        // Add the text to the database
        const data = { type: 'text', position: { x: x, y: y }, text: inputValue, color: colorValue, font: fontValue, fontSize: sizeValue};
        addNewThingToFirebase('texts', data);
        //don't draw it locally until you hear back from firebase
    }
});

function drawText(x, y, text, color, font, fontSize) {
    const ctx = canvas.getContext('2d');
    ctx.font = fontSize + 'px ' + font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

// Add event listener to the color select menu
colorMenu.addEventListener('change', function(event) {
    const selectedColor = event.target.value;
    inputBox.style.color = selectedColor;
});

// Add event listener to the font select menu
fontMenu.addEventListener('change', function(event) {
    const selectedFont = event.target.value;
    inputBox.style.fontFamily = selectedFont;
});

// Add event listener to the font size menu
fontSizeMenu.addEventListener('change', function(event) {
    const selectedFontSize = event.target.value;
    inputBox.style.fontSize = selectedFontSize + 'px';
});

// Add event listener to the document for mouse down event
document.addEventListener('mousedown', (event) => {
    // Set the location of the input box to the mouse location
    isInteracting = true;
});
document.addEventListener('mousemove', (event) => {
    // Set the location of the input box to the mouse location
    console.log('mousemove');
    if (isInteracting) {
        inputBox.style.left = event.clientX + 40 + 'px';
        inputBox.style.top = event.clientY + 'px';
        colorMenu.style.left = event.clientX - 205 + 'px';
        colorMenu.style.top = event.clientY + 'px';
        fontMenu.style.left = event.clientX - 340 + 'px';
        fontMenu.style.top = event.clientY + 'px';
        fontSizeMenu.style.left = event.clientX - 434 + 'px';
        fontSizeMenu.style.top = event.clientY + 'px';
    }
});
document.addEventListener('mouseup', (event) => {
    isInteracting = false;
});

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdEADETCdxhdrwKMG-1xdgJqNft2J_4-g",
    authDomain: "week4-29aa8.firebaseapp.com",
    projectId: "week4-29aa8",
    storageBucket: "week4-29aa8.appspot.com",
    messagingSenderId: "964838522023",
    appId: "1:964838522023:web:3360d045ee2295a59e6f82"
};

const app = initializeApp(firebaseConfig);
//make a folder in your firebase for this example
let appName = "SharedMinds2DExample";

let db = getDatabase();
subscribeToData('texts');


function addNewThingToFirebase(folder, data) {
    //firebase will supply the key,  this will trigger "onChildAdded" below
    const dbRef = ref(db, appName + '/' + folder);
    const newKey = push(dbRef, data).key;
    return newKey; //useful for later updating
}

function subscribeToData(folder) {
    //get callbacks when there are changes either by you locally or others remotely
    const commentsRef = ref(db, appName + '/' + folder + '/');
    onChildAdded(commentsRef, (data) => {
        drawText(data.val().position.x, data.val().position.y, data.val().text, data.val().color, data.val().font, data.val().fontSize);
    });
    onChildChanged(commentsRef, (data) => {
        reactToFirebase("changed", data.val(), data.key)
    });
    onChildRemoved(commentsRef, (data) => {
        reactToFirebase("removed", data.val(), data.key)
    });
}


