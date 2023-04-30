// "enum" for game states
const GameState = {
  START: 0,
  PLAY: 1,
};

// "enum" for movement directions
const MovementDirection = {
  UP: 0,
  DOWN: 1,
};

// Ball object with collision detection
class Ball {
  constructor(ball, bounds) {
    this.ball = ball;
    // Contains information about the size and offset to the parent element (court)
    this.rect = this.initRect = ball.getBoundingClientRect();
    // Get the initial styling of the ball
    this.initStyle = ball.style;
    // Contains rect information of the court which is used for defining the bounds
    this.bounds = bounds;
    // Randomize the speed and direction of the ball
    this.velocityX = Math.floor(Math.random() * 4) + 3;
    this.velocityY = Math.floor(Math.random() * 4) + 3;
    this.directionX = Math.floor(Math.random() * 2);
    this.directionY = Math.floor(Math.random() * 2);
  }

  // Used to update the rect information of the paddles
  updatePaddleRects(paddle1Rect, paddle2Rect) {
    this.paddle1Rect = paddle1Rect;
    this.paddle2Rect = paddle2Rect;
  }

  // Handles the movement of the ball
  move() {
    setTimeout(() => {
      // Used to add a delay to the movement else tied to system speed
      if (this.rect.top <= this.bounds.top) {
        this.directionY = 1;
      }
      if (this.rect.bottom >= this.bounds.bottom) {
        this.directionY = 0;
      }
      // Check if the ball hit the left (player 1) paddle
      if (
        this.rect.left <= this.paddle1Rect.right &&
        this.rect.top >= this.paddle1Rect.top &&
        this.rect.bottom <= this.paddle1Rect.bottom
      ) {
        this.directionX = 1;
        this.velocityX = Math.floor(Math.random() * 4) + 3;
        this.velocityY = Math.floor(Math.random() * 4) + 3;
      }
      // Check if the ball hit the right (player w) paddle
      if (
        this.rect.right >= this.paddle2Rect.left &&
        this.rect.top >= this.paddle2Rect.top &&
        this.rect.bottom <= this.paddle2Rect.bottom
      ) {
        this.directionX = 0;
        this.velocityX = Math.floor(Math.random() * 4) + 3;
        this.velocityY = Math.floor(Math.random() * 4) + 3;
      }
      // Check if ball over either side aka goal
      if (
        this.rect.left <= this.bounds.left ||
        this.rect.right >= this.bounds.right
      ) {
        if (this.rect.left <= this.bounds.left) {
          // Creating an event to trigger code else where
          let event = new Event("Player2Scored");
          document.dispatchEvent(event);
        } else {
          let event = new Event("Player1Scored");
          document.dispatchEvent(event);
        }
        // Resetting the ball after scoring
        this.rect = this.initRect;
        this.ball.style = this.initStyle;
        this.velocityX = Math.floor(Math.random() * 4) + 3;
        this.velocityY = Math.floor(Math.random() * 4) + 3;
        this.directionX = Math.floor(Math.random() * 2);
        this.directionY = Math.floor(Math.random() * 2);
      }
      // Handling the movement of the ball
      this.ball.style.top =
        this.rect.top + this.velocityY * (this.directionY == 0 ? -1 : 1) + "px";
      this.ball.style.left =
        this.rect.left +
        this.velocityX * (this.directionX == 0 ? -1 : 1) +
        "px";
      // Updating the balls rect information
      this.rect = this.ball.getBoundingClientRect();
      // Calling the next move step
      this.move();
    }, 60 / 1000); // = 60fps
  }
}

// Player object
class Paddle {
  constructor(paddle, bounds) {
    this.paddle = paddle;

    this.rect = this.paddle.getBoundingClientRect();
    this.bounds = bounds;
  }

  // Handles the movement of the paddle
  move(movementDirection) {
    if (movementDirection == MovementDirection.UP) {
      this.paddle.style.top =
        Math.max(this.bounds.top, this.rect.top - window.innerHeight * 0.06) +
        "px";
      this.rect = this.paddle.getBoundingClientRect();
    }

    if (movementDirection == MovementDirection.DOWN) {
      this.paddle.style.top =
        Math.min(
          this.bounds.bottom - this.rect.height,
          this.rect.top + window.innerHeight * 0.06
        ) + "px";
      this.rect = this.paddle.getBoundingClientRect();
    }
  }

  getRect() {
    return this.rect;
  }
}

// Object to display score
class Score {
  constructor(scoreText) {
    this.scoreText = scoreText;
    this.score = 0;
    this.scoreText.innerHTML = this.score;
  }
  // Updates the score of the object and screen
  updateScore() {
    this.score += 1;
    this.scoreText.innerHTML = this.score;
  }

  getScore() {
    return this.score;
  }
}

// Gamemanager object to handle the other objects
class GameManager {
  constructor(gameState, messager, ball, paddle1, paddle2, score1, score2) {
    this.gameState = this.initGameState = gameState;
    this.messager = this.initMessager = messager;
    this.ball = this.initBall = ball;
    this.paddle1 = this.initPaddle1 = paddle1;
    this.paddle2 = this.initPaddle2 = paddle2;
    this.score1 = this.initScore1 = score1;
    this.score2 = this.initScore2 = score2;
  }

  setGameState(gameState) {
    this.gameState = gameState;
  }
  getGameState() {
    return this.gameState;
  }

  setMessagerMessage(message) {
    this.messager.setMessage(message);
  }
  // Calling functions of linked objects
  moveBall() {
    this.updatePaddleRectsForBall();
    this.ball.move();
  }

  movePaddle1(direction) {
    this.paddle1.move(direction);
    this.updatePaddleRectsForBall();
  }

  movePaddle2(direction) {
    this.paddle2.move(direction);
    this.updatePaddleRectsForBall();
  }

  updatePaddleRectsForBall() {
    this.ball.updatePaddleRects(this.paddle1.getRect(), this.paddle2.getRect());
  }

  updateScore1() {
    this.messager.setMessage("Player 1 scored!");
    this.score1.updateScore();
    if (this.score1.getScore() === 5) {
      this.messager.setMessage("Player 1 won!");
      let event = new Event("Reset");
      document.dispatchEvent(event);
    }
  }

  updateScore2() {
    this.messager.setMessage("Player 2 scored!");
    this.score2.updateScore();
    if (this.score2.getScore() === 5) {
      this.messager.setMessage("Player 2 won!");
      let event = new Event("Reset");
      document.dispatchEvent(event);
    }
  }
}

// Messager object to display messages
class Messager {
  constructor(message) {
    this.message = message;
  }
  // Briefly displays a message on the screen
  setMessage(message) {
    if (this.message.style.display == "none") {
      this.message.style.display = "block";
    }

    this.message.innerHTML = message;
    setTimeout(() => {
      this.message.style.display = "none";
    }, 2000);
  }
}

// INIT VARIABLES AND OBJECTS
const gameState = GameState.START;
const messager = new Messager(document.querySelector(".message"));
const ball = new Ball(
  document.querySelector(".ball"),
  document.querySelector(".court").getBoundingClientRect()
);
const paddle1 = new Paddle(
  document.querySelector(".paddle1"),
  document.querySelector(".court").getBoundingClientRect()
);
const paddle2 = new Paddle(
  document.querySelector(".paddle2"),
  document.querySelector(".court").getBoundingClientRect()
);
const player1score = new Score(document.querySelector(".player1score"));
const player2score = new Score(document.querySelector(".player2score"));
const gameManager = new GameManager(
  gameState,
  messager,
  ball,
  paddle1,
  paddle2,
  player1score,
  player2score
);

// MAIN GAME LOOP THROUGH LISTENERS
document.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    if (gameManager.getGameState() == GameState.START) {
      gameManager.setGameState(GameState.PLAY);
    }

    if (gameManager.getGameState() == GameState.PLAY) {
      gameManager.setMessagerMessage("Game Started");
      gameManager.moveBall();
    }
  }

  if (gameManager.getGameState() == GameState.PLAY) {
    if (e.key == "w") {
      gameManager.movePaddle1(MovementDirection.UP);
    }
    if (e.key == "s") {
      gameManager.movePaddle1(MovementDirection.DOWN);
    }
    if (e.key == "ArrowUp") {
      gameManager.movePaddle2(MovementDirection.UP);
    }
    if (e.key == "ArrowDown") {
      gameManager.movePaddle2(MovementDirection.DOWN);
    }
  }
});

document.addEventListener("Player1Scored", (e) => {
  gameManager.updateScore1();
});

document.addEventListener("Player2Scored", (e) => {
  gameManager.updateScore2();
});

document.addEventListener("Reset", () => {
  location.reload();
});
