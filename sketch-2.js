// revised blob detection.

let cam;

let col_to_detect = {
  r: 0,
  g: 0,
  b: 0,
};

let col_set = false;

let units = [];

function setup() {
  //set defaults:
  pixelDensity(1);
  noStroke();

  cam = createCapture(VIDEO, make_canvas);
}

function make_canvas() {
  createCanvas(cam.width, cam.height);
}

function draw() {
  background(0);
  //load all camera pixels all the time, because we need that for a bunch of things.
  loadPixels();

  let n = get_canvas_pixel_index(floor(mouseX), floor(mouseY));
  let r = pixels[n];

  fill(255);
  text(r, mouseX, mouseY);
}

let col_difference_threshold = 10; //this number is used to account for noise that the webcam will experience.

function detect() {
  //go through every single pixel, and see if it matches the colour that was set.
  for (let x = 0; x < cam.width; x++) {
    for (let y = 0; y < cam.height; y++) {
      let n = (y * cam.width + x) * 4; //get index.

      //see if it matches the colour we selected.
      let pr = cam.pixels[n];
      let pg = cam.pixels[n + 1];
      let pb = cam.pixels[n + 2];

      //color difference:
      let dr = abs(pr - col_to_detect.r);
      let dg = abs(pg - col_to_detect.g);
      let db = abs(pb - col_to_detect.b);

      let desired = false; //boolean that assumes that the pixel you're evaluating is not a desired pixel.

      if (dr < col_difference_threshold && dg < col_difference_threshold && db < col_difference_threshold) {
        //this means that this point is roughly the same colour.
        desired = true;
      }

      if (desired) {
        //if no other units have been created, make the first one:

        if (units.length < 1) {
          units.push(new Unit(x, y));
        }
      } else {
      }
    }
  }
}

class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    fill(255);
    rect(this.x, this.y, 50, 50);
  }
}

function debug_view({ see_colours = false }) {
  if (see_colours) {
    loadPixels();
    image(cam, 0, 0, width, height);
    let n = get_canvas_pixel_index(mouseX, mouseY);

    let r = pixels[n];
    let g = pixels[n + 1];
    let b = pixels[n + 2];
    fill(255);
    text("rgb: " + pixels[r] + "," + pixels[g] + "," + pixels[b], mouseX, mouseY);
  }
}

function mousePressed() {
  let n = get_cam_pixel_index(mouseX, mouseY);

  col_to_detect.r = cam.pixels[n];
  col_to_detect.g = cam.pixels[n + 1];
  col_to_detect.b = cam.pixels[n + 2];

  col_set = true;
}

// helpers:
//helper to convert from pixels array to x, y.
function get_cam_pixel_index(x, y) {
  return (y * cam.width + x) * 4;
}

function get_canvas_pixel_index(x, y) {
  return (y * width + x) * 4;
}

//helper to convert from x, y to pixel index.
function get_coordinates(n) {
  let pixel_number = n / 4;

  let x = pixel_number % cam.width;
  let y = floor(pixel_number / cam.width);

  return { x, y };
}
