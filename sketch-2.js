//blob detection; november, 2025.

let cam;

let my_memories = [];
let dad_memories = [];

let units = []; //keep track of how many units are on the area.

function preload() {
  my_memories[0] = createVideo("./assets/media/my-memories/0.mp4");
  dad_memories[0] = createVideo("./assets/media/dad-memories/0.mp4");

  for (let i = 0; i < my_memories.length; i++) {
    my_memories[i].hide();
    dad_memories[i].hide();
  }
}

function setup() {
  cam = createCapture(VIDEO, { flipped: true }, make_canvas);
  cam.hide();

  pixelDensity(1);

  noStroke(); 
}
function make_canvas() {
  createCanvas(cam.width, cam.height);
}

function draw() {
  background(0);

  cam.loadPixels();

  detect();

  tint(255,20);  
  image(cam, 0, 0);

  // updatePixels();

  for (let unit of units) {
    // unit.show();
  }
}

let threshold = 200;
let noisy = 50;

function detect() {
  for (let i = 0; i < cam.pixels.length; i+=4) {
    let r = cam.pixels[i]; 
    let g = cam.pixels[i+1]; 
    let b = cam.pixels[i + 2]; 

    if (r > threshold && g < noisy && b < noisy) {
      let pos = get_coordinates(i);
      rect(pos.x, pos.y, 5, 5);
    }
  }
}

//helper to convert from pixels array to x, y.
function get_pixel_index(x, y) {
  return (y * cam.width + x) * 4;
}

function get_coordinates(n) {
  let pixel_number = n / 4;

  let x = pixel_number % cam.width;
  let y = Math.floor(pixel_number / cam.width);

  return { x, y };
}

//each unit has a media file that it loops, a position on the screen

class Unit {
  constructor(x, y, file) {
    this.x = x;
    this.y = y;
    this.file = file;
  }

  show() {
    image(this.file, this.x, this.y, 50, 50);
  }
}
