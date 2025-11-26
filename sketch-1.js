//video manipulation trial 1; november, 2025.

let cw = 1280;
let ch = 720;

let vid1, vid2;

let alph1 = 0; 
let alph2 = 0; 

function preload() {
  //load all media before sketch starts.

  vid1 = createVideo("./assets/media/dad-in.mp4");
  vid1.hide();
  vid2 = createVideo("./assets/media/dad-out.mp4");
  vid2.hide();
}

function setup() {
  createCanvas(cw, ch);
}

function draw() {
  background(0);

  vid1.loop(); //by default it loops.
  vid2.loop(); //by default it loops.

  push();
  tint (255, alph1); 
  image(vid1, 0, 0, width, height, 0, 0, vid1.width, vid1.height, COVER);
  pop();

  push();
  tint(255, alph2); 
  image(vid2, 0, 0, width, height, 0, 0, vid2.width, vid2.height, COVER);
  pop();

  alph1 = map(mouseX, 0, width, 0, 255); 
  alph2 = map(mouseX, 0, width, 255, 0); 
  
}
