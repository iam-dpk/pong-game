const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_SPEED = 7;
const BALL_RADIUS = 8;
const WINNING_SCORE = 7;

const leftPaddle = {
  x: 20,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: PADDLE_SPEED,
};

const rightPaddle = {
  x: canvas.width - 20 - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 5,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: BALL_RADIUS,
  speed: 5,
  velocityX: 5,
  velocityY: 3,
};

const score = {
  left: 0,
  right: 0,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;

  const angle = (Math.random() * 0.8 - 0.4) * Math.PI / 2;
  ball.velocityX = direction * Math.cos(angle) * ball.speed;
  ball.velocityY = Math.sin(angle) * ball.speed;
}

function updatePaddles() {
  if (keys.ArrowUp) {
    leftPaddle.y -= leftPaddle.speed;
  }

  if (keys.ArrowDown) {
    leftPaddle.y += leftPaddle.speed;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);

  const targetY = ball.y - rightPaddle.height / 2;
  const diff = targetY - rightPaddle.y;
  const maxStep = rightPaddle.speed;

  if (Math.abs(diff) > maxStep) {
    rightPaddle.y += diff > 0 ? maxStep : -maxStep;
  } else {
    rightPaddle.y = targetY;
  }

  rightPaddle.y = clamp(rightPaddle.y, 0, canvas.height - rightPaddle.height);
}

function handleBallWallCollision() {
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.velocityY *= -1;
  }

  if (ball.y + ball.radius >= canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.velocityY *= -1;
  }
}

function handlePaddleCollision(paddle, isLeft) {
  const overlapsX =
    ball.x + ball.radius > paddle.x &&
    ball.x - ball.radius < paddle.x + paddle.width;

  const overlapsY =
    ball.y + ball.radius > paddle.y &&
    ball.y - ball.radius < paddle.y + paddle.height;

  if (!overlapsX || !overlapsY) {
    return;
  }

  const relativeIntersect =
    (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
  const bounceAngle = relativeIntersect * (Math.PI / 3);
  const direction = isLeft ? 1 : -1;

  const currentSpeed = Math.max(Math.hypot(ball.velocityX, ball.velocityY) + 0.3, 6);

  ball.x = isLeft
    ? paddle.x + paddle.width + ball.radius
    : paddle.x - ball.radius;

  ball.velocityX = direction * Math.cos(bounceAngle) * currentSpeed;
  ball.velocityY = Math.sin(bounceAngle) * currentSpeed;
}

function updateBall() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  handleBallWallCollision();

  if (ball.x - ball.radius <= leftPaddle.x + leftPaddle.width) {
    handlePaddleCollision(leftPaddle, true);
  }

  if (ball.x + ball.radius >= rightPaddle.x) {
    handlePaddleCollision(rightPaddle, false);
  }

  if (ball.x + ball.radius < 0) {
    score.right += 1;
    resetBall(1);
  }

  if (ball.x - ball.radius > canvas.width) {
    score.left += 1;
    resetBall(-1);
  }
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#7dd3fc';
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(String(score.left), canvas.width / 4, 52);
  ctx.fillText(String(score.right), (canvas.width * 3) / 4, 52);
}

function drawWinMessage() {
  if (score.left >= WINNING_SCORE || score.right >= WINNING_SCORE) {
    const winner = score.left >= WINNING_SCORE ? 'Player Wins!' : 'Computer Wins!';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(winner, canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 45);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
  drawScore();
  drawWinMessage();
}

function gameLoop() {
  if (score.left < WINNING_SCORE && score.right < WINNING_SCORE) {
    updatePaddles();
    updateBall();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  leftPaddle.y = clamp(mouseY - leftPaddle.height / 2, 0, canvas.height - leftPaddle.height);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }

  if (score.left >= WINNING_SCORE || score.right >= WINNING_SCORE) {
    score.left = 0;
    score.right = 0;
    resetBall(Math.random() < 0.5 ? -1 : 1);
  }

  if (event.key in keys) {
    keys[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

resetBall(Math.random() < 0.5 ? -1 : 1);
requestAnimationFrame(gameLoop);