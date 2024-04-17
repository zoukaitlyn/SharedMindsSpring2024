// This is a test of the p5LiveMedia webrtc library and associated service.
// Open this sketch up 9 times to send video back and forth

let allConnections = [];
let vidWidth = 160;
let vidHeight = 120;
let p5live;
let nameField;


function setup() {
  createCanvas(480, 360);

  myVideo = createCapture(VIDEO, gotMineConnectOthers);
  myVideo.size(vidWidth, vidHeight);
  myVideo.hide();
  allConnections['Me'] = {
    'video': myVideo,
    'name': "Me",
    'x': random(width),
    'y': random(height)
  }
  nameField = createInput("Your name");
  nameField.changed(enteredName);
  
  collisionMessageInput = createInput("Collision message");
  collisionMessageInput.position(0, height + 30);
}

function gotMineConnectOthers(myStream) {
  p5live = new p5LiveMedia(this, "CAPTURE", myStream, "arbitraryDataRoomName");
  p5live.on('stream', gotOtherStream);
  p5live.on('disconnect', lostOtherStream);
  p5live.on('data', gotData);
}

function draw() {
  background(220);
  stroke(255);
  // for (var id in allConnections) {
  //   let thisConnectJSON = allConnections[id];
  //   let x = thisConnectJSON.x;
  //   let y = thisConnectJSON.y;
  //   image(thisConnectJSON.video, x, y, vidWidth, vidHeight);
  //   fill(255);
  //   text(thisConnectJSON.name, x + 10, y + 20);
  // }
  
  // Loop through each connection
  for (let id1 in allConnections) {
    let connect1 = allConnections[id1];
    let x1 = connect1.x;
    let y1 = connect1.y;
    let w1 = vidWidth;
    let h1 = vidHeight;
    
    // Draw the video stream and name text for connection 1
    image(connect1.video, x1, y1, w1, h1);
    fill(255)
    text(connect1.name, x1 + 10, y1 + 20);
    
    // Loop through other connections to check for collisions
    for (let id2 in allConnections) {
      if (id1 !== id2) {
        let connect2 = allConnections[id2];
        let x2 = connect2.x;
        let y2 = connect2.y;
        let w2 = vidWidth;
        let h2 = vidHeight;
        
        // Check for collision between connection 1 and connection 2
        if (detectCollision(x1, y1, w1, h1, x2, y2, w2, h2)) {
          // Collisions detected, handle the collision as needed
          console.log("Collision detected between", connect1.name, "and", connect2.name);

          let collisionMessage = collisionMessageInput.value();
          fill(255, 0, 0)
          stroke(0)
          text(collisionMessage, (x1+x2)/2, (y1+y2)/2)
        }
      }
    }
  }
}

// Function to detect collision between two rectangles
function detectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}

// We got a new stream!
function gotOtherStream(stream, id) {
  // This is just like a video/stream from createCapture(VIDEO)
  otherVideo = stream;
  otherVideo.size(vidWidth, vidHeight);
  allConnections[id] = {
    'video': otherVideo,
    'name': id,
    'x': 0,
    'y': 0
  }
  otherVideo.hide();
  mouseDragged() //send them your location
  enteredName() //send them your name
}

function lostOtherStream(id) {
  print("lost connection " + id)
  delete allConnections[id];
}

function mouseDragged() {
  //change locally
  allConnections['Me'].x = mouseX;
  allConnections['Me'].y = mouseY;
  //send to others
  let dataToSend = {
    dataType: 'location',
    x: mouseX,
    y: mouseY
  };
  // Send it
  p5live.send(JSON.stringify(dataToSend));
}

function enteredName() {
  //change locally
  allConnections['Me'].name = nameField.value();
  //
  let dataToSend = {
    dataType: 'name',
    name: nameField.value()
  };
  print(dataToSend);
  // Send it
  p5live.send(JSON.stringify(dataToSend));
}

function gotData(data, id) {
  // If it is JSON, parse it

  let d = JSON.parse(data);

  print(d.dataType);
  if (d.dataType == 'name') {
    allConnections[id].name = d.name;
  } else if (d.dataType == 'location') {
    allConnections[id].x = d.x;
    allConnections[id].y = d.y;
  }
}