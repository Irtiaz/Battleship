const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
app.use(express.static('public'));

server.listen(PORT, () => console.log('Server is running!'));

const io = require('socket.io')(server);

const Room = require('./Room.js');

let rooms = [];

io.on('connection', socket => {
	admit(socket);

	socket.on('mouseClick', data => {
		let room = getRoom(socket);
		room.handleClick(socket, data.i, data.j);
	});

	socket.on('disconnect', () => {
		let room = getRoom(socket);
		room.remove(socket);
	});
});

function admit(socket) {
	for (let i = rooms.length - 1; i >= 0; i--) {
		if (rooms[i].members.length == 0) rooms.splice(i, 1);
	}

	let admitted = false;
	for (let room of rooms) {
		if (!room.full) {
			room.add(socket);
			admitted = true;
			break;
		}
	}
	if (!admitted) {
		let roomName = rooms.length == 0? 0 : rooms[rooms.length - 1].name + 1;
		const room = new Room(roomName);
		rooms.push(room);
		room.add(socket);
	}
}

function getRoom(socket) {
	for (let room of rooms) {
		if (room.has(socket)) return room;
	}
}
