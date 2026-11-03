let N = 3; // Overlap pattern size (3x3 pixels)

let wfc;
let sourceImg; // for best results, use a small image eg. 12x12, 16x16 or 32x32 pixels

async function setup() {
  new Canvas(80, 80, PIXELATED);
  //sourceImg = await loadImage('samples/Angular.png');
  sourceImg = await loadImage('samples/Flowers.png');
  
  wfc = new WaveFunctionCollapse(sourceImg, N, width, height, false, false);
}

function draw() {
  background(128);
  // Speed up collapsing steps per frame
  for (let step = 0; step < 50; step++) {
    if (!wfc.nextStep()) {
      noLoop();
      break;
    }
  }
  image(wfc.getImage(), 0, 0);  
  //showPatterns();
}

function showPatterns() {
  let patterns = wfc.getPatternsAsImages();
  let x = 0;
  let y = 0;
  let spacing = 1;
  for (let p of patterns) {
    image(p, x, y);
    x += p.width + spacing;
    if (x >= width) {
      x = 0;
      y += p.height + spacing;
    }
  }
}

function keyPressed() {
  wfc.resetGrid();
  loop();
}