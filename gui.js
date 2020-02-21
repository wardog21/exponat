let orientation = 0;	// orientation of the user in the environment in radian
let direction = 0;		// direction from the user to the exponat in radian
let speed = {
	x: 0,
	y: 0
}
// pixel position
let position = {
	x: 100,
	y: 100
}
// dimension in schritten
let absoluteDimension = {
  x: 16,
  y: 50
}
// relative position - WErte zwischen 0 und 1
let relativePosition = {
  x: 0,
  y: 0
}
let circleSize =  10;	// size of the object circle
// let socket = io();		// enable websockets
let panning = 0;		// used for 2D sound
// object of sounds
let sounds = {
	throne: null,
	door: null,
	dino: null
};
let exponat = 0; 		// array of exponats
let map_image;			// background image / museum layout


// p5.js preload() function is guaranteed to be finished before running setup()
// used to download files from the server
function preload() {
	map_image = loadImage('map.png');
	soundFormats('mp3', 'ogg');
	sounds.throne = loadSound('throne.mp3');
	sounds.door = loadSound('door.mp3');
	sounds.dino = loadSound('dino.mp3');
}

// orientation data submitted by the client smartphone
function onOrientationChange(e) {
	orientation = radians(e.alpha + 90);
	speed.x = radians(e.gamma) * 5;
	speed.y = radians(e.beta) * 5;
	if(abs(speed.x) < 1 && abs(speed.y) < 1) {
		speed.x = 0;
		speed.y = 0;
	}
	// socket.emit('orientation', orientation);
	// socket.emit('debug', {x: speed.x, y: speed.y, z: orientation});
}

// hacked scale functions used to scale layout
function transformCoordX (x_) {
	return x_ * windowWidth / 502;
}
function transformCoordY (y_) {
	return y_ * windowHeight / 709;
}

// p5.js setup() function is designed to run once in the beginning
function setup() {
	//resizing museum layout to browser window
	map_image.resize(windowWidth, windowHeight);
	// enable device orientation sensor
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', onOrientationChange);
	}
	// writing exponat data after the sound files are loaded
	exponat = [
	  	{position: {x: transformCoordX(208), y: transformCoordY(265)}, area: 70, file:sounds.throne},
	  	{position: {x: transformCoordX(446), y: transformCoordY(408)}, area: 30, file:sounds.door},
	  	{position: {x: transformCoordX(100), y: transformCoordY(100)}, area: 50, file:sounds.dino}
	];
	// used for scaling
	rectMode(CENTER);
	imageMode(CENTER);
	// p5.js canvas for display
	createCanvas(windowWidth, windowHeight);
	// optic set
  	noStroke();
}

setInterval(function(){
	position.x = position.x + speed.x;
	position.y = position.y + speed.y;
	if(position.x < 0) {
		position.x = 0;
	}
	else if(position.x > 360) {
		position.x = 360;
	}
	if(position.y < 0) {
		position.y = 0;
	}
	else if(position.y > 620) {
		position.y = 620;
	}
	relativePosition.x = position.x / (windowWidth / 2) * absoluteDimension.x;
	relativePosition.y = (1 - (position.y / windowHeight)) * absoluteDimension.y;
}, 10);

// p5.js touchMoved() runs when the screen is touched or the mouse is dragged
// grabbing new position, translating it and sending it to the server
function touchMoved() {
	position.x = mouseX;
	position.y = mouseY;
	relativePosition.x = mouseX / (windowWidth / 2);
	relativePosition.y = 1 - (mouseY / (windowHeight));
	// socket.emit('position', {x:(relativePosition.x * absoluteDimension.x), y:(relativePosition.y * absoluteDimension.y)});

	return false;
}

// p5.js draw() is used for every frame
// main gui code
function draw()   {
	// receiving new data from the server
	// socket.on('update', function(data){
		// updating existing data with fresh ones
		// position.x = (data.posX / absoluteDimension.x) * (windowWidth / 2);
		// position.y = (1 - (data.posY / absoluteDimension.y)) * windowHeight;
		// orientation = data.orientation;
		
		// calculating relativ direction from the user to the exponat
		// playing soundeffects
		exponat.forEach(function(item, index) {
			// if it is already playing, check if the user left the area of effect and stop the sound in that case, otherwise update panning
			if(item.file.isPlaying()) {
				if((abs(item.position.x - position.x) > item.area+5) || (abs(item.position.y - position.y) > item.area+5)) {
					item.file.stop();
				}
				else {
					direction = atan((item.position.y - position.y) / (item.position.x - position.x));
					if(item.position.x > position.x) {
						if(item.position.y > position.y) {
							direction = -PI + direction;
						}
						else {
							direction = PI + direction;
						}
					}
					panning = sin(direction+orientation-HALF_PI);
					item.file.pan(panning);
				}
			}
			// if not playing a sound, check if a sound should be played. calc panning and start playing in that case.
			else {
				if((abs(item.position.x - position.x) <= item.area) && (abs(item.position.y - position.y) <= item.area)) {
					direction = atan((item.position.y - position.y) / (item.position.x - position.x));
					if(item.position.x > position.x) {
						if(item.position.y > position.y) {
							direction = -PI + direction;
						}
						else {
							direction = PI + direction;
						}
					}
					console.log(direction);
					panning = sin(direction+orientation-HALF_PI);

					item.file.pan(panning);
					item.file.play();
				}
			}
		});
	// });
	// drawing all objects
	background(240);
	image(map_image, windowWidth/2, windowHeight/2);
	// drawing all exponats and their area of effect
	exponat.forEach(function(item, index) {
		fill(0, 0, 255, 80);
		rect(item.position.x, item.position.y, 2*item.area, 2*item.area);
		fill('blue');
		ellipse(item.position.x, item.position.y, circleSize);
	});
	// drawing user position and orientation
	fill(255, 0, 0, 80);
	arc(position.x, position.y, 100, 100, -orientation-0.5-HALF_PI, -orientation+0.5-HALF_PI, PIE);
	fill('red');
	ellipse(position.x, position.y, circleSize);
	
}