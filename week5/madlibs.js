import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, update, set, push, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

let isInteracting = false;
let isEditing = false;
let editingObject = null;
let objects = {};

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
// canvas.style.backgroundColor = 'pink';
document.body.appendChild(canvas);
console.log('canvas', canvas.width, canvas.height);

var divElement = document.createElement("div");
divElement.style.position = 'absolute';
divElement.style.left = '50%';
divElement.style.top = '50%';
divElement.style.transform = 'translate(-50%, -50%)';
var imgElement = document.createElement("img");
imgElement.src = "madlibs.png";
imgElement.style.width = '90%';

divElement.appendChild(imgElement);
document.body.appendChild(divElement);

const inputBox = document.createElement('input');
inputBox.setAttribute('type', 'text');
inputBox.setAttribute('id', 'inputBox');
inputBox.setAttribute('placeholder', 'Enter text here');
inputBox.style.position = 'absolute';
inputBox.style.left = '54%';
inputBox.style.top = '50%';
inputBox.style.transform = 'translate(-50%, -50%)';
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
document.body.appendChild(colorMenu);

const colorOptions = ['FireBrick', 'MidnightBlue', 'Olive', 'Violet', 'Tomato', 'DeepPink', 'LawnGreen', 'DeepSkyBlue', 'DarkOrange'];

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
document.body.appendChild(fontSizeMenu);

const fontSizeOptions = ['20', '25', '30', '35', '40', '45', '50'];

fontSizeOptions.forEach(fontSize => {
    const optionElement = document.createElement('option');
    optionElement.value = fontSize;
    optionElement.textContent = fontSize;
    fontSizeMenu.appendChild(optionElement);
});

divElement.style.zIndex = '101'; // Ensuring the image is on top of the canvas
canvas.style.zIndex = '102';
canvas.style.position = 'absolute';

inputBox.style.zIndex = '102';
inputBox.style.backgroundColor = 'transparent'
colorMenu.style.zIndex = '102';
fontMenu.style.zIndex = '102';
fontSizeMenu.style.zIndex = '102';

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
        const user = auth.currentUser;
        if(!user){
            document.getElementById('inputBox').value = "Please Log in";
            return;
        }
        let userName = user.displayName;
        if (!userName) userName = user.email.split("@")[0];
        const data = { type: 'text', position: { x: x, y: y }, text: inputValue, color: colorValue, font: fontValue, fontSize: sizeValue};
        if (isEditing) {
            console.log("update editing", editingObject.key, data);
            updateJSONFieldInFirebase('texts', editingObject.key, data);
            isEditing = false;
        } else {
            addNewThingToFirebase('texts', data);
        }
        //don't draw it locally until you hear back from firebase
    }
});

function drawText(x, y, text, color, font, fontSize) {
    const ctx = canvas.getContext('2d');
    ctx.font = fontSize + 'px ' + font;
    ctx.fillStyle = color;
    for(let key in objects){
        const object = objects[key]
        if (object.type === 'text') {
            ctx.fillText(object.userName + ": " + object.text, object.position.x, object.position.y);

        }
    

    }
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

let db, auth, app;
let googleAuthProvider;
let appName = "SharedMinds2DExample";
initFirebase();

function initFirebase(){
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyD2JqWFtTvdmJHaSp9wDdAMkfQbWhtOMIY",
        authDomain: "week5-9ce3f.firebaseapp.com",
        databaseURL: "https://week5-9ce3f-default-rtdb.firebaseio.com/",
        projectId: "week5-9ce3f",
        storageBucket: "week5-9ce3f.appspot.com",
        messagingSenderId: "1004784715160",
        appId: "1:1004784715160:web:34ab6eb4d21d82b9fc17ed"
    };

    app = initializeApp(firebaseConfig);
    //make a folder in your firebase for this example

    db = getDatabase();
    auth = getAuth();
    googleAuthProvider = new GoogleAuthProvider();

    subscribeToData('texts');

}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log("userino is signed in", user);
        showLogOutButton(user);
        // ...
    } else {
        console.log("userino is signed out");
        showLoginButtons();
        // User is signed out
        // ...
    }
});


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

let authDiv = document.createElement("div");
authDiv.style.position = "absolute";
authDiv.style.top = "10%";
authDiv.style.left = "85%";
authDiv.style.width = "150px";
//authDiv.style.height = "150px";
authDiv.style.backgroundColor = "lightpink";
authDiv.style.border = "1px solid black";
authDiv.style.padding = "10px";
authDiv.style.zIndex = "3000";
document.body.appendChild(authDiv);

function showLogOutButton(user) {
    authDiv.innerHTML = "";
    let userNameDiv = document.createElement("div");
    if (user.photoURL) {
        let userPic = document.createElement("img");
        userPic.src = user.photoURL;
        userPic.style.width = "50px";
        userPic.style.height = "50px";
        authDiv.appendChild(userPic);
    }
    if (user.displayName) {
        userNameDiv.innerHTML = user.displayName;
    } else {
        userNameDiv.innerHTML = user.email;
    }
    let logOutButton = document.createElement("button");
    authDiv.appendChild(userNameDiv);
    logOutButton.innerHTML = "Log Out";
    logOutButton.setAttribute("id", "logOut");
    logOutButton.setAttribute("class", "authButton");
    authDiv.appendChild(logOutButton);
    document.getElementById("logOut").addEventListener("click", function () {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log("signed out");
        }).catch((error) => {
            // An error happened.
            console.log("error signing out");
        });
    });

}

function showLoginButtons() {
    authDiv.innerHTML = "";
    let signUpWithGoogleButton = document.createElement("button");
    signUpWithGoogleButton.innerHTML = "Google Login";
    signUpWithGoogleButton.setAttribute("id", "signInWithGoogle");
    signUpWithGoogleButton.setAttribute("class", "authButton");
    authDiv.appendChild(signUpWithGoogleButton);

    authDiv.appendChild(document.createElement("br"));
    authDiv.appendChild(document.createElement("br"));

    let emailDiv = document.createElement("div");
    emailDiv.innerHTML = "Email";
    authDiv.appendChild(emailDiv);

    let emailInput = document.createElement("input");
    emailInput.setAttribute("id", "email");
    emailInput.setAttribute("class", "authInput");
    emailInput.setAttribute("type", "text");
    emailInput.setAttribute("placeholder", "email@email.com");
    authDiv.appendChild(emailInput);

    let passwordInput = document.createElement("input");
    passwordInput.setAttribute("id", "password");
    passwordInput.setAttribute("type", "password");
    passwordInput.setAttribute("class", "authInput");
    passwordInput.setAttribute("placeholder", "password");
    passwordInput.setAttribute("suggest", "current-password");
    passwordInput.setAttribute("autocomplete", "on");
    authDiv.appendChild(passwordInput);

    let signUpWithEmailButton = document.createElement("button");
    signUpWithEmailButton.innerHTML = "Sign Up";
    signUpWithEmailButton.setAttribute("id", "signUpWithEmail");
    signUpWithEmailButton.setAttribute("class", "authButton");
    authDiv.appendChild(signUpWithEmailButton);

    let signInWithEmailButton = document.createElement("button");
    signInWithEmailButton.innerHTML = "Sign In";
    signInWithEmailButton.setAttribute("id", "signInWithEmail");
    signInWithEmailButton.setAttribute("class", "authButton");
    authDiv.appendChild(signInWithEmailButton);

    document.getElementById("signInWithGoogle").addEventListener("click", function (event) {
        signInWithPopup(auth, googleAuthProvider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
        event.stopPropagation();
    });

    document.getElementById("signInWithEmail").addEventListener("click", function (event) {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
        event.stopPropagation();
    });

    document.getElementById("signUpWithEmail").addEventListener("click", function (event) {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
        event.stopPropagation();
    });
}


