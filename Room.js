const rows = 5, cols = 5;
const totalShips = 10;

class Room {
	constructor(name) {
		this.name = name;
		this.members = [];
		this.full = false;

		this.ships1 = [];
		this.ships2 = [];
		this.startGuessing = false;
		this.player1Turn = true;

		this.end = false;
	}


	handleClick(socket, i, j) {
		if (this.end) return;

		const ships = socket == this.members[0]? this.ships1 : this.ships2;
		const opponentShips = socket == this.members[0]? this.ships2 : this.ships1;

		const opponent = socket == this.members[0]? this.members[1] : this.members[0];

		if (!this.startGuessing) {
			if (j < cols && ships.length < totalShips) {
				if (ships.filter(obj => obj.i == i && obj.j == j).length == 0) {
					ships.push({i, j});
					socket.emit('shipPlaced', {i, j});


					if (this.ships1.length == totalShips && this.ships2.length == totalShips) {
						this.startGuessing = true;
						this.members[0].emit('changeStatus', {message : 'Your turn'});
						this.members[1].emit('changeStatus', {message : "Opponent's turn"});
					}

					else if (ships.length == totalShips) socket.emit('changeStatus', {
						message : 'Wait for opponent to join and place his/her ships'
					});
				}
			}
		}

		else if (this.startGuessing) {
			if ((this.player1Turn ^ socket == this.members[1]) && j >= cols) {

				let hitShipIndex = -1;
				for (let index = 0; index < opponentShips.length; ++index) {
					let s = opponentShips[index];
					if (s.i == i && s.j == j - cols) {
						hitShipIndex = index;
						break;
					}
				}

				if (hitShipIndex >= 0) {
					opponentShips.splice(hitShipIndex, 1);

					socket.emit('result', {
						hit : true,
						i : i,
						j : j
					});
					
					opponent.emit('result', {
						hit : true,
						i : i,
						j : j - cols
					});

					if (opponentShips.length == 0) {
						this.end = true;
						socket.emit('changeStatus', {message : 'You won!'});
						opponent.emit('changeStatus', {message : 'You lost!'});
					}
				}

				else {

					socket.emit('result', {
						hit : false,
						i : i,
						j : j
					});
					
					opponent.emit('result', {
						hit : false,
						i : i,
						j : j - cols
					});
				}

				this.player1Turn = !this.player1Turn;
				if (!this.end) {
					socket.emit('changeStatus', {message : "Opponent's turn"});
					opponent.emit('changeStatus', {message : 'Your turn'});
				}
			}
		}
	}


	add(socket) {
		this.members.push(socket);
		socket.join(this.name);
		socket.emit('row_col', {rows, cols, totalShips});
		console.log(socket.id + ' has joined in ' + 'room' + this.name);

		if (this.members.length == 2) this.full = true;
	}

	has(socket) {
		for (let member of this.members) {
			if (member.id == socket.id) return true;
		}
		return false;
	}

	remove(socket) {
		for (let i = 0; i < this.members.length; i++) {
			let member = this.members[i];
			if (member.id == socket.id) {
				this.members.splice(i, 1);
				break;
			}
		}

		console.log(socket.id + ' has left from ' + 'room' + this.name);
	}
}

module.exports = Room;
