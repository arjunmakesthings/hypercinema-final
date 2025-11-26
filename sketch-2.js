//blob detection; november, 2025.

let cam;

let cw = 1280;
let ch = 720;

function setup() {
  cam = createCapture(VIDEO, {flipped:true}, make_canvas);
  cam.hide();

  pixelDensity(1);
  noStroke();
}
function make_canvas(){
  createCanvas(cam.width, cam.height); 
}


function draw() {
  background(0);

  cam.loadPixels();

  detect();

  tint(255,50); 
  image(cam, 0, 0);

   updatePixels();
}

let max_r = 0;
let max_r_index = 0;

let max_g = 0;
let max_g_index = 0; 

function detect() {
  //every frame, find the location of the highest colour values.

  max_r = 0;
  max_r_index = 0;
  max_g = 0;
  max_g_index = 0;
  
  for (let i = 0; i < cam.pixels.length; i += 4) {
    let r = cam.pixels[i]; 
    let g = cam.pixels[i+1]; 

    if (r>max_r){
      max_r = r; 
      max_r_index = i; 
    }

    if (g > max_g) {
      max_g = g;
      max_g_index = i;
    }
  }

  //draw rectangle wherever that is. 
  let pos = get_coordinates(max_r_index); 

  rect (pos.x, pos.y, 50,50); 

  console.log(max_r, max_g);
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
