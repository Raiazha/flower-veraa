const loveCanvas = document.getElementById('loveCanvas');
const loveCtx = loveCanvas.getContext('2d');

function resizeLoveCanvas() {
  loveCanvas.width = window.innerWidth;
  loveCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeLoveCanvas);
resizeLoveCanvas();

function drawHeart(x, y, size, alpha = 1) {
  loveCtx.beginPath();
  const topCurveHeight = size * 0.3;
  loveCtx.moveTo(x, y + topCurveHeight);
  loveCtx.bezierCurveTo(
    x, y,
    x - size / 2, y,
    x - size / 2, y + topCurveHeight
  );
  loveCtx.bezierCurveTo(
    x - size / 2, y + (size + topCurveHeight) / 2,
    x, y + (size + topCurveHeight) / 1.5,
    x, y + size
  );
  loveCtx.bezierCurveTo(
    x, y + (size + topCurveHeight) / 1.5,
    x + size / 2, y + (size + topCurveHeight) / 2,
    x + size / 2, y + topCurveHeight
  );
  loveCtx.bezierCurveTo(
    x + size / 2, y,
    x, y,
    x, y + topCurveHeight
  );
  loveCtx.closePath();
  loveCtx.fillStyle = `rgba(255, 0, 100, ${alpha})`;
  loveCtx.fill();
}

const hearts = [];
const heartCount = 30;
for (let i = 0; i < heartCount; i++) {
  hearts.push({
    x: Math.random() * loveCanvas.width,
    y: Math.random() * loveCanvas.height,
    size: 10 + Math.random() * 15,
    speed: 0.5 + Math.random() * 1.5,
    alpha: 0.3 + Math.random() * 0.7,
  });
}

function animateLove() {
  loveCtx.clearRect(0, 0, loveCanvas.width, loveCanvas.height);

  for (const heart of hearts) {
    heart.y += heart.speed;
    if (heart.y > loveCanvas.height + heart.size) {
      heart.y = -heart.size;
      heart.x = Math.random() * loveCanvas.width;
    }
    drawHeart(heart.x, heart.y, heart.size, heart.alpha);
  }

  requestAnimationFrame(animateLove);
}

animateLove();
