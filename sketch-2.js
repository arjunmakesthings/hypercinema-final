// revised blob detection.

let cam;

let units = [];

let clicked = false;

function setup() {
  //set defaults:
  pixelDensity(1);
  noStroke();

  cam = createCapture(VIDEO, canv_to_asp);
  cam.hide();
}

function canv_to_asp() {
  let asp_ratio = cam.height / cam.width;

  let wh = windowWidth * asp_ratio;

  createCanvas(windowWidth, wh);
}

function draw() {
  background(0);

  //i wanted to use a tertiary operator, but it just works differently and causes an error in my program.
  if (!col_set) {
    set_colour();
  } else {
    detect();
  }

  for (unit of units) {
    unit.display();
  }
}

let col_to_detect = {
  r: 0,
  g: 0,
  b: 0,
};

let col_set = false;

function set_colour() {
  image(cam, 0, 0, width, height);

  loadPixels();

  let n = get_canvas_pixel_index(floor(mouseX), floor(mouseY));

  let r = pixels[n];

  fill(255);
  text(r, mouseX, mouseY);

  if (clicked == true) {
    col_to_detect.r = pixels[n];
    col_to_detect.g = pixels[n + 1];
    col_to_detect.b = pixels[n + 2];

    col_set = true;
  }
}

let col_difference_threshold = 10; //this number is used to account for noise that the webcam will experience.

let required_distance = 500; //required distance before a pixel is considered a new unit.

function detect() {
  cam.loadPixels();

  for (let x = 0; x < cam.width; x++) {
    for (let y = 0; y < cam.height; y++) {
      let n = (y * cam.width + x) * 4;

      let pr = cam.pixels[n];
      let pg = cam.pixels[n + 1];
      let pb = cam.pixels[n + 2];

      let dr = abs(pr - col_to_detect.r);
      let dg = abs(pg - col_to_detect.g);
      let db = abs(pb - col_to_detect.b);

      //if the colour does not match, skip this iteration and move on to the next iteration.
      if (dr > col_difference_threshold || dg > col_difference_threshold || db > col_difference_threshold) continue;

      //if the code has progressed, it means that it is a pixel that we care about. s

      //first, we scale this coordinate to canvas-space.
      const scaled_x = map(x, 0, cam.width, 0, width);
      const scaled_y = map(y, 0, cam.height, 0, height);

      //assume positively: this is a brand new blob.
      let matched_unit = false;

      for (let unit of units) {
        const d = dist(scaled_x, scaled_y, unit.scaled_x, unit.scaled_y);

        if (d < required_distance) {
          //if it is close to a unit that we created in the previous frame, it is probably the same unit. just update it, and exit this loop.
          unit.update(scaled_x, scaled_y);
          matched_unit = true;

          //if you've already found a match, stop checking more.
          break;
        }
      }

      //if after all the loops, it is still considered a new position, we make a new unit.
      if (!matched_unit) {
        units.push(new Unit(x, y));
      }
    }
  }
}

class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.scaled_x = map(this.x, 0, cam.width, 0, width);
    this.scaled_y = map(this.y, 0, cam.height, 0, height);

    this.w = 10;
    this.h = 10;
  }

  display() {
    fill(255);
    rect(this.scaled_x, this.scaled_y, this.w, this.h);
  }

  update(x, y) {
    this.scaled_x = x;
    this.scaled_y = y;
  }
}

function mousePressed() {
  clicked = true;
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
