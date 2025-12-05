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
    image(cam, 0, 0, width, height);
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

let col_difference_threshold = 40; //this number is used to account for noise that the webcam will experience.

let required_distance = 200; //required distance before a pixel is considered a new unit.

function detect() {
  cam.loadPixels();

  // Prepare a temporary array to accumulate positions for averaging
  let unit_accumulators = units.map(() => ({ sum_x: 0, sum_y: 0, count: 0 }));

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

      //if the code has progressed, it means that this is a pixel we care about.

      //first, we scale the coordinates of this pixel to canvas-space.
      let scaled_x = map(x, 0, cam.width, 0, width);
      let scaled_y = map(y, 0, cam.height, 0, height);

      //assume positively: this is a brand new blob.
      let this_has_a_unit = false;

      for (let i = 0; i < units.length; i++) {
        let unit = units[i];

        let d = dist(scaled_x, scaled_y, unit.scaled_x, unit.scaled_y);

        if (d < required_distance) {
          // accumulate positions for averaging
          unit_accumulators[i].sum_x += scaled_x;
          unit_accumulators[i].sum_y += scaled_y;
          unit_accumulators[i].count++;
          this_has_a_unit = true;

          break; // stop checking other units
        }
      }

      //if after all the loops, it is still considered a new position, we make a new unit.
      if (!this_has_a_unit) {
        units.push(new Unit(x, y));
        // add new accumulator for averaging
        unit_accumulators.push({ sum_x: map(x, 0, cam.width, 0, width), sum_y: map(y, 0, cam.height, 0, height), count: 1 });
      }
    }
  }

  // Update units to average positions
  for (let i = 0; i < units.length; i++) {
    if (unit_accumulators[i].count > 0) {
      let avg_x = unit_accumulators[i].sum_x / unit_accumulators[i].count;
      let avg_y = unit_accumulators[i].sum_y / unit_accumulators[i].count;
      units[i].update(avg_x, avg_y);
    }
  }

  double_check();
}

function double_check() {
  for (let i = 0; i < units.length; i++) {
    //units have a scaled-x and scaled-y. we unscale them first.

    let cam_scale_x = map(units[i].scaled_x, 0, width, 0, cam.width);
    let cam_scale_y = map(units[i].scaled_y, 0, height, 0, cam.height);

    let cam_pixel_index = get_cam_pixel_index(floor(cam_scale_x), floor(cam_scale_y));

    let pr = cam.pixels[cam_pixel_index];
    let pg = cam.pixels[cam_pixel_index + 1];
    let pb = cam.pixels[cam_pixel_index + 2];

    let dr = abs(pr - col_to_detect.r);
    let dg = abs(pg - col_to_detect.g);
    let db = abs(pb - col_to_detect.b);

    //if the colour does not match, skip this iteration and move on to the next iteration.
    if (dr > col_difference_threshold || dg > col_difference_threshold || db > col_difference_threshold) {
      //not our colour.
      units.splice(i, 1);
    } else {
      //our colour:
      continue;
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
