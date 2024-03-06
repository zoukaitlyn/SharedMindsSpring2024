function generateMadLib() {
    var adj1 = document.getElementById("adj1").value;
    var place = document.getElementById("place").value;
    var adj2 = document.getElementById("adj2").value;
    var thing1 = document.getElementById("thing1").value;
    var number = document.getElementById("number").value;
    var relative = document.getElementById("relative").value;
    var thing2 = document.getElementById("thing2").value;
    var part = document.getElementById("part").value;
    var celebrity = document.getElementById("celebrity").value;
    var thing3 = document.getElementById("thing3").value;

    var madLibStory = "The weather recently dipped down to " + number + " degrees, which is really cold for me. I was already bundled up, so I had to break out the thermals for my " + part + " and the " + adj1 + " sweater. " + relative + " knit the sweater for me and it’s horrible. It’s got a pattern of " + thing3 + " across the bottom with a large, " + adj2 + " " + thing1 + " in the center. I hate to wear it, but it’s woven with little bits of " + thing2 + " interlaced with the wools, so it’s super warm. But now I can’t go out anywhere because I look like " + celebrity + " if they were stranded in " + place + ".";

    document.getElementById("madLibStory").innerText = madLibStory;
}
