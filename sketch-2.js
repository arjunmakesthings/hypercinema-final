// revised blob detection.

let cam;

let col_to_detect = {
  r: 0,
  g: 0,
  b: 0,
};

let col_set = false;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //set defaults:
  pixelDensity(1);
  noStroke();

  cam = createCapture(VIDEO);
  cam.hide();
}

function draw() {
  background(0);

  if (col_set) detect();
}

function detect() {
  cam.loadPixels();
}

function mousePressed() {
  let n = get_pixel_index(mouseX, mouseY);

  col_to_detect.r = cam.pixels[n];
  col_to_detect.g = cam.pixels[n + 1];
  col_to_detect.b = cam.pixels[n + 2];

  col_set = true;
}
