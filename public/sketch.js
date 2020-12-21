const socket = io();

let rows, cols;
let w, h;

let statusP;

function setup() {
	createCanvas(400 * 2 + 1, 400 + 1);

	statusP = document.getElementById('status');

	socket.on('row_col', data => {
		rows = data.rows;
		cols = data.cols;
		w = int(width / (2 * cols));
		h = int(height / rows);

		statusP.textContent = `Place your ${data.totalShips} ships`;

		for (let i = 0; i < rows; ++i) {
			for (let j = 0; j < cols; ++j) {
				rect(j * w, i * h, w, h);
				rect(j * w + int(width / 2), i * h, w, h);
			}
		}
		
		strokeWeight(2);
		stroke(0, 137, 255);
		line(width/2, 0, width/2, height);
	});

	socket.on('shipPlaced', data => {
		noStroke();
		fill(0, 137, 255);
		rect(data.j * w, data.i * h, w, h);
	});

	socket.on('result', data => {
		const x = data.j * w;
		const y = data.i * h;
		if (data.hit) {
			stroke(255, 0, 0);
			strokeWeight(1);
			line(x, y, x + w, y + h);
			line(x + w, y, x, y + h);
		}

		else {
			strokeWeight(1);
			stroke(0);
			fill(0, 137, 255);
			ellipse(x + w/2, y + h/2, 4, 4);
		}
	});


	socket.on('changeStatus', data => {
		statusP.textContent = data.message;
	});
}


function mousePressed() {
	if (mouseX > width || mouseY > height) return;
	const i = floor(mouseY / h);
	const j = floor(mouseX / w);
	socket.emit('mouseClick', {i ,j});
}
