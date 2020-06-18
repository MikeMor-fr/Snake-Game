window.onload = () => {

	let canvas = document.createElement("canvas");
	let canvasWidth = 900;
	let canvasHeight = 600;
	let blockSize = 30;
	let ctx = canvas.getContext("2d");
	let delay = 100;
	let widthInBlocks = canvasWidth/blockSize;
	let heightInBlocks = canvasHeight/blockSize;
	let score = 0;

	const refreshCanvas = () => {
		snakee.advance();
		if(snakee.checkCollision()) {
			game_over();
		}
		else {
			if(snakee.isEatingApple(apple)) {
				score++;
				snakee.ateApple = true;
				do {
					apple.setNewPosition();
				}
				while(apple.isOnSnake(snakee))
			}
			ctx.clearRect(0,0,canvasWidth, canvasHeight);
			drawScore();
			apple.draw();
			snakee.draw();
			setTimeout(refreshCanvas, delay);
		}
	}

	const game_over = () => {
		ctx.save();
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "black";
		let centerX = canvasWidth/2;
		let centerY = canvasHeight/2;
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		ctx.textAlign = "center";
		ctx.strokeText("Game Over", centerX, centerY-180);
		ctx.fillText("Game Over", centerX, centerY-180);

		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("Appuyer sur F5 pour rejouer", centerX, centerY-120);
		ctx.fillText("Appuyer sur F5 pour rejouer",centerX, centerY-120);
		ctx.restore();
	}

	const drawBlock = (ctx, position) => {
		let x = position[0] * blockSize;
		let y = position[1] * blockSize;
		ctx.fillRect(x, y, blockSize, blockSize);
	}

	const drawScore = () => {
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";
		let centerX = canvasWidth/2;
		let centerY = canvasHeight/2;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText(score.toString(), centerX, centerY);
		ctx.restore();
	}

	class Snake {

		constructor(body, direction) {

			this.body = body;
			this.direction = direction;
			this.ateApple = false;
			this.draw = () => {
				ctx.save();
				ctx.fillStyle = "#ff0000";
				for (let i=0; i<this.body.length; i++){
					drawBlock(ctx, this.body[i]);
				}
				ctx.restore();
			}

			this.advance = () => {
				let nextPosition = this.body[0].slice();
				switch(this.direction) {
					case "left":
						nextPosition[0] -= 1;
						break;
					case "right":
						nextPosition[0] += 1;
						break;
					case "down":
						nextPosition[1] += 1;
						break;
					case "up":
						nextPosition[1] -= 1;
						break;
				}
				this.body.unshift(nextPosition);
				if(!this.ateApple){
					this.body.pop();
				}
				else {
					this.ateApple = false;
				}
			}

			this.setDirection = (newDirection) => {
				let allowedDirection;
				switch(this.direction) {
					case "left":
					case "right":
						allowedDirection = ["up", "down"];
						break;
					case "down":
					case "up":
						allowedDirection = ["left", "right"];
						break;
					default:
					 	trow("invalid direction");
				}
				if (allowedDirection.indexOf(newDirection > -1)) {
					this.direction = newDirection;
				}
			}

			this.checkCollision = () => {
				let wallCollision = false;
				let snakeCollision = false;
				let head = this.body[0];
				let rest = this.body.slice(1);
				let snakeX = head[0];
				let snakeY = head[1];
				let minX = 0;
				let minY = 0;
				let maxX = widthInBlocks - 1;
				let maxY = heightInBlocks - 1;
				let isNotBetweenHorizontalWall = snakeX < minX || snakeX > maxX;
				let isNotBetweenVerticalWall = snakeY < minY || snakeY > maxY;

				if(isNotBetweenVerticalWall || isNotBetweenHorizontalWall) {
					wallCollision = true;
				}

				for(let i=0; i<rest.length; i++) {
					if(snakeX === rest[i][0] && snakeY === rest[i][1]) {
						snakeCollision = true;
					}
				}

				return wallCollision || snakeCollision;

			}

			this.isEatingApple = (appleToEat) => {
				let head = this.body[0];
				if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) {
					return true;
				}
				else{
					return false;
				}
			}

		}
	}

	class Apple {
		constructor(position){
			this.position = position;
			this.draw = () => {
				ctx.save();
				ctx.fillStyle = "#33cc33";
				ctx.beginPath();
				let radius = blockSize/2;
				let x = this.position[0] * blockSize + radius;
				let y = this.position[1] * blockSize + radius;
				ctx.arc(x,y,radius, 0, Math.PI*2, true);
				ctx.fill();
				ctx.restore();
			}

			this.setNewPosition = () => {
				let newX = Math.round(Math.random() * (widthInBlocks - 1));
				let newY = Math.round(Math.random() * (heightInBlocks - 1));
				this.position = [newX, newY];
			}

			this.isOnSnake = (snakeToCheck) => {
				let isOnSnake = false;

				for(let i=0; i<snakeToCheck.body.length; i++) {
					if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
						isOnSnake = true;
					}
				}
				return isOnSnake;
			}
		}
	}

	document.onkeydown = handleKeyDown = (e) => {
		let key = e.keyCode;
		let newDirection;
		switch(key) {
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
			default:
				return;
		}
		snakee.setDirection(newDirection);
	}

	const init = () => {
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "30px solid gray";
		canvas.style.margin = "50px auto";
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#ddd";
		document.body.appendChild(canvas);
		refreshCanvas();
	}

	let apple = new Apple([10,10]);
	let snakee = new Snake([[6,4], [5,4], [4,4]], "right");
	init();
}