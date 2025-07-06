// Get the Start Game button, the game UI, the game container, and the title screen
const startBtn = document.getElementById('start-btn');
const gameContainer = document.getElementById('game-container');
const titleScreen = document.getElementById('title-screen');

// When the page loads, show only the title screen and hide the game layout
window.addEventListener('DOMContentLoaded', () => {
  // Show the title screen
  titleScreen.style.display = 'block';
  // Hide the game layout
  gameContainer.style.display = 'none';
});

// When the Start Game button is clicked, hide the title screen and show the game layout
startBtn.addEventListener('click', () => {
  // Hide the title screen (header)
  titleScreen.style.display = 'none';
  // Show the game layout
  gameContainer.style.display = 'block';
});

// --- Butterfly Movement Logic ---
// Get references to the butterfly and flower groups
const butterfly = document.getElementById('butterfly');
const flowersRow = document.querySelector('.flowers-row');
const flowerGroups = Array.from(document.querySelectorAll('.flower-group'));

// Array to store the center x positions of each flower
let flowerCenters = [];
// Track which flower the butterfly is above (0-4)
let butterflyIndex = 2; // Start at center flower

// Calculate the center x positions of each flower relative to .flowers-row
function calculateFlowerCenters() {
  flowerCenters = flowerGroups.map(flower => {
    const flowerRect = flower.getBoundingClientRect();
    const rowRect = flowersRow.getBoundingClientRect();
    // Center x relative to .flowers-row
    return flowerRect.left - rowRect.left + flowerRect.width / 2;
  });
}

// Move the butterfly to the correct flower with a jump arc
function moveButterfly(index) {
  // Clamp index between 0 and 4
  butterflyIndex = Math.max(0, Math.min(index, flowerCenters.length - 1));
  // Get the x position for the butterfly
  const centerX = flowerCenters[butterflyIndex];
  // Move the butterfly horizontally and center it
  butterfly.style.left = `${centerX}px`;
  butterfly.style.transform = 'translate(-50%, 0)';
  // Add jump arc effect
  butterfly.classList.add('butterfly-jump');
  setTimeout(() => {
    butterfly.classList.remove('butterfly-jump');
  }, 250);
}

// Listen for keydown events to move the butterfly
function handleKeyDown(e) {
  // Only move if the game is visible
  if (gameContainer.style.display === 'none') return;
  if (e.repeat) return; // Ignore held-down keys
  // Move left
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
    moveButterfly(butterflyIndex - 1);
  }
  // Move right
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
    moveButterfly(butterflyIndex + 1);
  }
}

// Recalculate flower positions and update butterfly on resize
function handleResize() {
  calculateFlowerCenters();
  moveButterfly(butterflyIndex);
}

// --- Initialization ---
// Set up everything after the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Show only the title screen at first
  titleScreen.style.display = 'block';
  gameContainer.style.display = 'none';
  // Calculate flower positions and set butterfly
  calculateFlowerCenters();
  moveButterfly(butterflyIndex);
});

// When Start Game is clicked, show the game and recalculate positions
startBtn.addEventListener('click', () => {
  titleScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  // Recalculate flower positions and move butterfly
  calculateFlowerCenters();
  moveButterfly(butterflyIndex);
});

// Listen for keydown and resize events
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('resize', handleResize);

// --- Raindrop Obstacle Logic ---
const cloudGroups = Array.from(document.querySelectorAll('.cloud-group'));
const grassFloor = document.querySelector('.grass-floor');
const livesSvgs = Array.from(document.querySelectorAll('.lives svg'));
let lives = 3;
let gameOver = false;
let invincible = false; // Butterfly can't be hit if true

// Helper to get the top of the grass (for raindrop removal)
function getGrassTop() {
  const grassRect = grassFloor.getBoundingClientRect();
  const rowRect = flowersRow.getBoundingClientRect();
  return grassRect.top - rowRect.top;
}

// Create a single raindrop for a given cloud
function createRaindrop(cloudIndex) {
  if (gameOver) return;
  const cloud = cloudGroups[cloudIndex];
  const cloudsRow = document.querySelector('.clouds-row');
  const cloudRect = cloud.getBoundingClientRect();
  const cloudsRowRect = cloudsRow.getBoundingClientRect();
  const flowersRowRect = flowersRow.getBoundingClientRect();

  // Calculate start position: bottom center of the cloud
  const cloudImg = cloud.querySelector('.cloud-img');
  let cloudImgRect = cloudImg ? cloudImg.getBoundingClientRect() : cloudRect;
  // Responsive raindrop size
  let dropSize = Math.max(18, Math.round(cloudImgRect.width * 0.18)); // 18px min, ~18% of cloud width
  if (window.innerWidth < 800) dropSize = 18;
  // Center the raindrop under the cloud
  const startLeft = cloudImgRect.left - flowersRowRect.left + cloudImgRect.width / 2 - dropSize / 2;
  const startTop = cloudImgRect.bottom - flowersRowRect.top;

  // Calculate end position (top of grass)
  const grassTop = getGrassTop();
  const fallDistance = grassTop - startTop - 10; // 10px above grass

  // Create the raindrop element
  const drop = document.createElement('img');
  drop.src = 'img/rain.png';
  drop.className = 'raindrop-anim';
  drop.style.left = `${startLeft}px`;
  drop.style.top = `${startTop}px`;
  drop.style.width = `${dropSize}px`;
  drop.style.height = `${dropSize}px`;
  drop.style.setProperty('--fall-distance', `${fallDistance}px`);

  // Add to .flowers-row (so it's above the flowers and grass)
  flowersRow.appendChild(drop);

  // Set random fall duration (1.0s to 1.7s)
  const fallDuration = 1000 + Math.random() * 700;
  drop.style.animationDuration = `${fallDuration}ms`;

  // Collision and cleanup logic
  let collided = false;
  function checkCollision() {
    if (gameOver || invincible) return;
    const dropRect = drop.getBoundingClientRect();
    const butterflyRect = butterfly.getBoundingClientRect();
    // Simple box collision
    if (
      dropRect.left < butterflyRect.right &&
      dropRect.right > butterflyRect.left &&
      dropRect.top < butterflyRect.bottom &&
      dropRect.bottom > butterflyRect.top
    ) {
      if (!collided) {
        collided = true;
        loseLife();
        drop.remove();
      }
    }
  }

  // Check collision every 40ms while falling
  const collisionInterval = setInterval(() => {
    if (!document.body.contains(drop)) {
      clearInterval(collisionInterval);
      return;
    }
    checkCollision();
  }, 40);

  // Remove drop when animation ends
  drop.addEventListener('animationend', () => {
    if (!collided && document.body.contains(drop)) {
      drop.remove();
    }
    clearInterval(collisionInterval);
  });
}

// Lose a life and update hearts
function loseLife() {
  if (lives > 0) {
    lives--;
    // Remove the rightmost heart SVG
    if (livesSvgs[lives]) {
      livesSvgs[lives].parentNode.removeChild(livesSvgs[lives]);
      livesSvgs.pop();
    }
    if (lives === 0) {
      endGame();
    }
  }
}

// Show Game Over message and stop the game
function endGame() {
  gameOver = true;
  // Show a simple Game Over message in the center
  const msg = document.createElement('div');
  msg.textContent = 'Game Over';
  msg.style.position = 'fixed';
  msg.style.top = '50%';
  msg.style.left = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.fontSize = '3rem';
  msg.style.color = '#222';
  msg.style.background = 'rgba(255,255,255,0.95)';
  msg.style.padding = '32px 48px';
  msg.style.borderRadius = '24px';
  msg.style.zIndex = '1000';
  msg.style.boxShadow = '0 8px 32px #0002';
  document.body.appendChild(msg);
}

// Start generating raindrops for each cloud at random intervals
function startRaindrops() {
  cloudGroups.forEach((cloud, i) => {
    function spawn() {
      if (gameOver) return;
      createRaindrop(i);
      // Next drop in 0.7s to 2.2s
      const next = 700 + Math.random() * 1500;
      setTimeout(spawn, next);
    }
    // Delay the first drop by 1.2 seconds for fairness
    setTimeout(spawn, 1200);
  });
}

// Start raindrops when the game starts
startBtn.addEventListener('click', () => {
  // ...existing code...
  lives = 3;
  gameOver = false;
  invincible = true;
  // Reset hearts
  livesSvgs.forEach(svg => svg.classList.remove('heart-lost'));
  startRaindrops();
  // Give the player 1.2 seconds of invincibility at the start
  setTimeout(() => {
    invincible = false;
  }, 1200);
});