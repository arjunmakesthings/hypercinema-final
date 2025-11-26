//blob detection; november, 2025.

let cam;

let cw = 1280;
let ch = 720;

function setup() {
  cam = createCapture(VIDEO, {flipped:true}, make_canvas);
  cam.hide();

  pixelDensity(1);
  noStroke();

  colorMode (HSB); 
}
function make_canvas(){
  createCanvas(cam.width, cam.height); 
}

let pos = { x: 0, y: 0 };

function draw() {
  background(0);

  cam.loadPixels();

  detect();

  image(cam, 0, 0);
  
  rect(pos.x, pos.y, 20, 20); 

}

let brightness_to_detect = 100;
let noise = 10;

function detect() {
  //we pre-define a value. if there is an object with that value, draw a box there.

  let n = get_pixel_index(mouseX, mouseY); 
  let c = color(cam.pixels[n], cam.pixels[n + 1], cam.pixels[n + 2]);
  let bright_val = brightness(c);
  console.log(bright_val); 
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

class Unit {}
