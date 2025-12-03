//blob detection; november, 2025.

let cam;
let col_to_detect = {
  r: 0,
  g: 0,
  b: 0,
};

let threshold = 10; //threshold for colour detection to account for lighting.

let dist_between_units = 500;

let units = [];

let has_clicked = false; //to account for first time values being black (and messing up the program).

let my_memories = [];
let dad_memories = [];

function preload() {
  my_memories[0] = createVideo("./assets/media/my-memories/0.mp4");
  dad_memories[0] = createVideo("./assets/media/dad-memories/0.mp4");

  for (let i = 0; i < my_memories.length; i++) {
    my_memories[i].hide();
    dad_memories[i].hide();
  }
}

function setup() {
  cam = createCapture(VIDEO, make_canvas);
  cam.hide();

  pixelDensity(1);

  noStroke();
}

function make_canvas() {
  createCanvas(windowWidth, windowHeight);
}

// function canv_to_asp() {
//   let asp_ratio = cam.height / cam.width;

//   let wh = windowWidth * asp_ratio;

//   createCanvas(windowWidth, wh);
// }

function draw() {
  background(190);

  cam.loadPixels();

  if (has_clicked == true) {
    detect();
  }

  // tint(255, 200);
  image(cam, 0, 0);

  for (let unit of units) {
    unit.display();
  }

  draw_registration_for_canvas(); 
}

function draw_registration_for_canvas(){
  push(); 
  rectMode (LEFT); 
  fill (0,255,0); 
  rect (0,0,50,50); 
  pop();
}

function detect() {
  let avg_x = 0;
  let avg_y = 0;
  let count = 0;

  for (let x = 0; x < cam.width; x++) {
    for (let y = 0; y < cam.height; y++) {
      let n = (y * cam.width + x) * 4;
      //go over every single pixel, and see if it matches colour.

      let pr = cam.pixels[n];
      let pg = cam.pixels[n + 1];
      let pb = cam.pixels[n + 2];

      //color difference:
      let dr = abs(pr - col_to_detect.r);
      let dg = abs(pg - col_to_detect.g);
      let db = abs(pb - col_to_detect.b);

      let desired = false;

      if (dr < threshold && dg < threshold && db < threshold) {
        //this means that this point is roughly the same colour.
        desired = true;
      }

      if (desired) {
        //check if another unit already has this in the past:

        if (units.length < 1) {
          //no units have been created, make a unit.
          units.push(new Unit(x, y, my_memories[0]));
        }

        for (let i = 0; i < units.length; i++) {
          let d = dist(x, y, units[i].x, units[i].y);

          if (d > dist_between_units) {
            //it's a new unit.
            units.push(new Unit(x, y, my_memories[0]));
            break;
          } else {
            //it's an old unit.
            units[i].update(x, y);
            break;
          }
        }
      }
    }
  }
}

function mousePressed() {
  has_clicked = true;

  cam.loadPixels();
  let n = get_pixel_index(mouseX, mouseY);

  col_to_detect.r = cam.pixels[n];
  col_to_detect.g = cam.pixels[n + 1];
  col_to_detect.b = cam.pixels[n + 2];
}

// helpers:
//helper to convert from pixels array to x, y.
function get_pixel_index(x, y) {
  return (y * cam.width + x) * 4;
}

//helper to convert from x, y to pixel index.
function get_coordinates(n) {
  let pixel_number = n / 4;

  let x = pixel_number % cam.width;
  let y = Math.floor(pixel_number / cam.width);

  return { x, y };
}

class Unit {
  constructor(x, y, file) {
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 50;

    this.file = file; //placeholder to store video file later.

    this.file.loop(); //always loop.
  }

  display() {
    // fill(255);
    // rect(this.x, this.y, this.w, this.h);

    image(this.file, this.x, this.y, this.w, this.h);
  }

  update(x, y) {
    this.x = x;
    this.y = y;
  }
}
