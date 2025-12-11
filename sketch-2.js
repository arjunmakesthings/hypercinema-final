/*
me, my father & our neurons. 

made for hypercinema-final at itp; december 2025.

by arjun.
*/

let cam;

let units = [];

let clicked = false; //toggle to keep track of when i change colour.

//memories:
let my_memories = [];
let dad_memories = [];

function preload() {
  // i have to manually load all media since they're all different formats.
  //mine:
  my_memories[0] = createVideo("./assets/media/my-memories/0.mp4");
  my_memories[1] = loadImage("./assets/media/my-memories/1.webp");
  my_memories[2] = loadImage("./assets/media/my-memories/2.webp");
  my_memories[3] = createVideo("./assets/media/my-memories/3.mp4");
  my_memories[4] = loadImage("./assets/media/my-memories/4.webp");
  my_memories[5] = loadImage("./assets/media/my-memories/5.webp");
  my_memories[6] = loadImage("./assets/media/my-memories/6.webp");
  my_memories[7] = createVideo("./assets/media/my-memories/7.mp4");
  my_memories[8] = createVideo("./assets/media/my-memories/8.mp4");
  my_memories[9] = loadImage("./assets/media/my-memories/9.webp");
  my_memories[10] = createVideo("./assets/media/my-memories/10.mp4");

  //dad's:
  dad_memories[0] = createVideo("./assets/media/dad-memories/0.mp4");
  dad_memories[1] = loadImage("./assets/media/dad-memories/1.webp");
  dad_memories[2] = loadImage("./assets/media/dad-memories/2.webp");
  dad_memories[3] = createVideo("./assets/media/dad-memories/3.mp4");
  dad_memories[4] = loadImage("./assets/media/dad-memories/4.webp");
  dad_memories[5] = loadImage("./assets/media/dad-memories/5.webp");
  dad_memories[6] = loadImage("./assets/media/dad-memories/6.webp");
  dad_memories[7] = createVideo("./assets/media/dad-memories/7.mp4");
  dad_memories[8] = createVideo("./assets/media/dad-memories/8.mp4");
  dad_memories[9] = loadImage("./assets/media/dad-memories/9.webp");
  dad_memories[10] = createVideo("./assets/media/dad-memories/10.mp4");

  // hide *only videos*, not images
  for (let m of my_memories) {
    if (m && m.hide) m.hide();
  }
  for (let m of dad_memories) {
    if (m && m.hide) m.hide();
  }
}

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
    //image(cam, 0, 0, width, height);
    detect();
  }

  for (unit of units) {
    unit.display();
  }

  //connections between points: 

  stroke(255, 80); // light white, slightly transparent
  strokeWeight(1);

  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      let a = units[i];
      let b = units[j];

      // same memory index AND different brain sides
      if (a.memory_index === b.memory_index && a.brain !== b.brain) {
        line(a.scaled_x+a.s/2, a.scaled_y+a.s/2, b.scaled_x-b.s/2, b.scaled_y-b.s/2);
      }
    }
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

let col_difference_threshold = 30; //this number is used to account for noise that the webcam will experience.

let required_distance = 200; //required distance before a pixel is considered a new unit.

function detect() {
  cam.loadPixels();

  //for every unit, create a new accumulator object. we use this to keep track of average positions.
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
          //accumulate positions for averaging:
          unit_accumulators[i].sum_x += scaled_x;
          unit_accumulators[i].sum_y += scaled_y;
          unit_accumulators[i].count++;
          this_has_a_unit = true;

          break; //stop checking other units inside this sub-loop. it is already accounted for.
        }
      }

      //if after all the loops, it is still considered a new position, we make a new unit.
      if (!this_has_a_unit) {
        //we want to push a new unit with a media file attached to it.

        let n = 0; //placeholder for index of memories.

        if (x < cam.width / 2) {
          //our unit is in the left-half. make it pick from my memories (0).
          units.push(new Unit(x, y, 5, 0));
        } else {
          //in the right half. make it pick from dad's memories (1).
          units.push(new Unit(x, y, 5, 1));
        }

        //add new accumulator for averaging this pixel's stuff.
        unit_accumulators.push({ sum_x: map(x, 0, cam.width, 0, width), sum_y: map(y, 0, cam.height, 0, height), count: 1 });
      }
    }
  }

  // update positions.
  for (let i = 0; i < units.length; i++) {
    if (unit_accumulators[i].count > 0) {
      units[i].seen = true;
      let avg_x = unit_accumulators[i].sum_x / unit_accumulators[i].count;
      let avg_y = unit_accumulators[i].sum_y / unit_accumulators[i].count;

      //math tells us that area=height=sqrt(area). area for us is the number of pixels in this accumulator object.
      let avg_size = Math.sqrt(unit_accumulators[i].count) * 6;
      units[i].update(avg_x, avg_y, avg_size);
    }
  }

  double_check();
}

function double_check() {
  // remove all units that did not receive any matching pixels this frame
  for (let i = units.length - 1; i >= 0; i--) {
    if (!units[i].seen) {
      units[i].destroy();
      units.splice(i, 1);
    }
  }

  // reset seen flags for next frame
  for (let unit of units) {
    unit.seen = false;
  }
}

class Unit {
  constructor(x, y, size, brain) {
    this.x = x;
    this.y = y;

    this.scaled_x = map(this.x, 0, cam.width, 0, width);
    this.scaled_y = map(this.y, 0, cam.height, 0, height);

    this.s = size;

    this.brain = brain;

    this.main_file;
    this.hidden_file;

    this.tint_val_main = 0;
    this.tint_val_hidden = 0;

    this.seen = false;

    // pick a random index
    let idx;
    
    if ((brain = 0)) {
      idx = floor(random(my_memories.length));
      this.main_file = my_memories[idx];
      this.hidden_file = dad_memories[idx];
    } else {
      idx = floor(random(dad_memories.length));
      this.main_file = dad_memories[idx];
      this.hidden_file = my_memories[idx];
    }

    this.memory_index = idx;

    // Initialize video-only behavior
    this.initMedia(this.main_file);
    this.initMedia(this.hidden_file);
  }

  initMedia(m) {
    // if it's a VIDEO
    if (m && m.loop) {
      m.volume(0);
      m.loop();
    }
  }

  stopMedia(m) {
    if (m && m.stop) {
      m.stop();
    }
  }

  display() {
    // fill(255);
    // rect(this.scaled_x, this.scaled_y, this.w, this.h);

    this.tint_val_main = map(this.scaled_x, 0, width, 0, 255);
    this.tint_val_hidden = map(this.scaled_x, 0, width, 255, 0);

    // fill(0);
    // square(this.scaled_x - this.s / 2, this.scaled_y - this.s / 2, this.s); 

    push();
    //background to remove tint.
    tint(255, this.tint_val_main);
    image(this.main_file, this.scaled_x - this.s / 2, this.scaled_y - this.s / 2, this.s, this.s);
    pop();

    push();
    tint(255, this.tint_val_hidden);
    image(this.hidden_file, this.scaled_x - this.s / 2, this.scaled_y - this.s / 2, this.s, this.s);
    pop();
  }

  update(x, y, size) {
    this.scaled_x = x;
    this.scaled_y = y;

    this.s = size;
  }

  destroy() {
    this.stopMedia(this.main_file);
    this.stopMedia(this.hidden_file);
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
