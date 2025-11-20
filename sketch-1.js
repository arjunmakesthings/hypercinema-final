//video manipulation trial 1; november, 2025.

let vid1, vid2;

function preload() {
  //load all media before sketch starts.

  vid1 = createVideo("./assets/media/dad-in.mp4");
  vid1.hide();
  vid2 = createVideo("./assets/media/dad-out.mp4");
  vid2.hide();
}

function setup() {
  createCanvas(1280, 720);
}

function draw() {
  background(0);

  vid1.loop(); //by default it loops.
  vid2.loop(); //by default it loops.

  push(); 
//   tint(0,0,0,mouseX); 
//   image(vid1, 0, 0); 
  pop();
  image(vid2, 0, 0);
}
