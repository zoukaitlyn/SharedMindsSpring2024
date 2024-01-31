let thoughtInput;
let submitButton;

let randomX;
let randomY;

let textSpeed;

let allThoughts = []

function setup() {
    var canvas = createCanvas(1500, 700);
    canvas.parent('#canvas-div');
    fill(0)

    thoughtInput = document.querySelector('#thought-input')
    submitButton = document.querySelector('#submit-button')

    randomX = random(0, width)
    randomY = random(0, height)
    randomSize = random(20, 100)
    randomR = random(0, 255)
    randomG = random(0, 255)
    randomB = random(0, 255)

}

function draw() {
    console.log("length", allThoughts.length)
    // thoughtInput.addEventListener("input", function () {
        // fill(randomR, randomG, randomB)
        // textSize(randomSize)
        // text(thoughtInput.value, randomX, randomY)
        // new Thought(randomX, randomY, randomSize, randomR, randomG, randomB, thoughtInput.value).moveAndDisplay()
    // });

    submitButton.addEventListener("click", function () {
        console.log(thoughtInput.value)
        let k = new Thought(randomX, randomY, randomSize, randomR, randomG, randomB, thoughtInput.value)
        allThoughts.push(k)
        thoughtInput.value = ""
        randomText()
    });

    for(let i=0; i<allThoughts.length; i++){
        // let expire =
        allThoughts[i].moveAndDisplay()

        // if(expire){
        //     allThoughts.splice(i, 1)
        //     i--
        // }     
        
    }

}

function randomText(){
    randomX = random(0, width)
    randomY = random(0, height)
    randomSize = random(20, 100)
    randomR = random(0, 255)
    randomG = random(0, 255)
    randomB = random(0, 255)
}

class Thought {
    constructor(x, y, size, r, g, b, text) {
        this.x = x
        this.y = y
        this.size = size
        this.r = r
        this.g = g
        this.b = b
        this.text = text
        this.noiseLocationX = random(100)
        this.noiseLocationY = random(100)
    }
    moveAndDisplay(){
        this.x = map(noise(this.noiseLocationX), 0, 1, 0, width)
        this.y = map(noise(this.noiseLocationY), 0, 1, 0, height)

        this.noiseLocationX += 0.01
        this.noiseLocationY += 0.01

        this.y = constrain(this.y, 0, height)

        if(this.x > width){
            this.x = 0
        } else if(this.x < 0){
            this.x = width      
        }

        // expire 
        // this.size -= 0.5

        stroke(0)
        fill(this.r, this.g, this.b)
        textSize(this.size)
        text(this.text, this.x, this.y)

        if(this.size <= 1){
            return true
        }
        return false

    }
}



