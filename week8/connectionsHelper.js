const replicateProxy = "https://replicate-api-proxy.glitch.me";

let distances = []
let instructions = "Input today's NYT Connections Words(16 words, seperated by comma)"

function setup() {
    createCanvas(600, 600);

    let input_field = createInput("AMEND, CORRECT, POTATO, FIX, REVISE, BLUE, BINGO, COMPUTER, LOTTERY, ROULETTE, FIGHT, WAR, ROW, SCRAP, POKER, TIFF");
    // let input_field = createInput("AMEND, CORRECT, REVISE, FIX, LOTTERY, ROULETTE, WAR, BINGO");

    input_field.size(550);
    input_field.position(25, 350); 

    //add a button to ask for words
    let button = createButton("Ask");
    button.position(25, 380); 
    button.mousePressed(() => {
        askForEmbeddings(input_field.value());
    });
    textSize(18)
}

function draw() {
    background(255);
    textSize(15)
    fill("black")
    text(instructions, 25, 330); 

    const margin = 40;
    const gridSize = 4;
    const cellWidth = (width - margin * 2) / gridSize;
    const cellHeight = 40;

    // Define color gradients for each row
    const rowColors = [
        color(250, 223, 118),   // Yellow
        color(160, 195, 98),     // Green
        color(176, 196, 237),     // Blue
        color(187, 129, 195)    // Purple
    ];

    // Sort the distances array based on cosine similarity
    distances.sort((a, b) => b.distance - a.distance);

    for (let i = 0; i < distances.length; i++) {
        let thisComparison = distances[i];
        let row = Math.floor(i / gridSize);
        let col = i % gridSize;

        let x = col * cellWidth + margin;
        let y = row * cellHeight + margin;

        let pixelDistance = (1 - thisComparison.distance) * width * 2;
        let yOffset = 0;

        // Center the text vertically within the cell
        let textY = y + cellHeight / 2 + yOffset;

        // Set the fill color based on the row index
        fill(rowColors[row]);
        rect(x, y, cellWidth, cellHeight); // Draw a colored rectangle behind the word
        fill(0); // Set text color to black
        text(thisComparison.phrase, x + 5, textY); // Draw the word with a slight offset
    }
}

async function askForEmbeddings(p_prompt) {
    let promptInLines = p_prompt.replace(/,/g, "\n");
    let data = {
        version: "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
        input: {
            inputs: promptInLines,
        },
    };
    console.log("Asking for Picture Info From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    const url = replicateProxy + "/create_n_get/";
    console.log("url", url, "options", options);
    const raw = await fetch(url, options);
    //console.log("raw", raw);
    const proxy_said = await raw.json();
    let output = proxy_said.output;
    console.log("Proxy Returned", output);
    distances = []
    let firstOne = output[0];
    for (let i = 0; i < output.length; i++) {
        let thisOne = output[i];
        let cdist = cosineSimilarity(firstOne.embedding, thisOne.embedding);
        distances.push({ "reference": firstOne.input, "phrase": thisOne.input, "distance": cdist })
        console.log(firstOne.input, thisOne.input, cdist);
    }
}

function cosineSimilarity(vecA, vecB) {
    return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

function dotProduct(vecA, vecB) {
    let product = 0;
    for (let i = 0; i < vecA.length; i++) {
        product += vecA[i] * vecB[i];
    }
    return product;
}

function magnitude(vec) {
    let sum = 0;
    for (let i = 0; i < vec.length; i++) {
        sum += vec[i] * vec[i];
    }
    return Math.sqrt(sum);
}

