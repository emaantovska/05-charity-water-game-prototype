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

// Add a flag to prevent movement after game over
let isGameOver = false;

// Track the current level
let currentLevel = 1;

// Helper to update the level label in the HUD
function updateLevelLabel() {
  setTimeout(() => {
    const levelBar = document.querySelector('.level-bar');
    if (levelBar) {
      levelBar.textContent = `Level ${currentLevel}`;
    }
  }, 0);
}

function showGameOverScreen(customMessage) {
  stopTimer();
  // Create the Game Over box
  const msg = document.createElement('div');
  msg.textContent = customMessage || 'Game Over';
  msg.style.position = 'fixed';
  msg.style.top = '50%';
  msg.style.left = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.fontSize = '3rem';
  msg.style.color = '#fff';
  msg.style.background = '#0a2472'; // dark blue
  msg.style.padding = '32px 48px 80px 48px';
  msg.style.borderRadius = '24px';
  msg.style.zIndex = '1000';
  msg.style.boxShadow = '0 8px 32px #0005';
  msg.style.textAlign = 'center';
  msg.style.fontFamily = 'Fredoka One, Comic Sans MS, Comic Sans, cursive, sans-serif';

  // If the player completed the level, show extra info and points
  if (customMessage === 'You Saved Water! Level Complete') {
    // Create a new div for the extra message
    const extra = document.createElement('div');
    extra.textContent = '💧 In the minute it took you to complete this level, 5 liters of water could have been wasted if the tap was left running. A drop saved today is a life secured for the future. You\'ve earned 5000 points!';
    extra.style.fontSize = '1.3rem';
    extra.style.color = '#b3e5fc';
    extra.style.marginTop = '28px';
    extra.style.marginBottom = '8px';
    extra.style.lineHeight = '1.5';
    extra.style.fontFamily = 'inherit';
    // Add the extra message below the main message
    msg.appendChild(document.createElement('br'));
    msg.appendChild(extra);

    // Trigger confetti celebration
    if (jsConfetti) {
      jsConfetti.addConfetti();
    }
  }

  // Create the Restart/Next Level button
  const restartBtn = document.createElement('button');
  if (customMessage === 'You Saved Water! Level Complete') {
    restartBtn.textContent = 'Next Level';
  } else {
    restartBtn.textContent = 'Restart?';
  }
  restartBtn.style.marginTop = '32px';
  restartBtn.style.fontSize = '1.5rem';
  restartBtn.style.background = '#fff';
  restartBtn.style.color = '#0a2472';
  restartBtn.style.border = 'none';
  restartBtn.style.borderRadius = '12px';
  restartBtn.style.padding = '12px 32px';
  restartBtn.style.cursor = 'pointer';
  restartBtn.style.fontWeight = 'bold';
  restartBtn.style.boxShadow = '0 2px 12px #0002';
  restartBtn.style.position = 'absolute';
  restartBtn.style.left = '50%';
  restartBtn.style.bottom = '24px';
  restartBtn.style.transform = 'translateX(-50%)';
  restartBtn.style.transition = 'background 0.2s, color 0.2s';
  restartBtn.onmouseenter = () => {
    restartBtn.style.background = '#1976d2';
    restartBtn.style.color = '#fff';
  };
  restartBtn.onmouseleave = () => {
    restartBtn.style.background = '#fff';
    restartBtn.style.color = '#0a2472';
  };

  // When button is clicked, handle next level or restart
  restartBtn.onclick = () => {
    msg.remove();
    const livesDiv = document.querySelector('.lives');
    while (livesDiv.children.length < 3) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.innerHTML = '<path d="M16 29s-13-8.35-13-16.5S10.5 2 16 8.5 29 2 29 12.5 16 29 16 29z" fill="#4fc3f7" stroke="#1976d2" stroke-width="2"/>';
      livesDiv.appendChild(svg);
    }
    document.querySelectorAll('.raindrop-anim').forEach(drop => drop.remove());
    if (customMessage === 'You Saved Water! Level Complete') {
      // Increment level and update HUD
      currentLevel++;
      updateLevelLabel();
      // Reset all relevant game state for new level
      lives = 3;
      gameOver = false;
      invincible = false;
      isGameOver = false;
      gameContainer.style.display = 'block';
      titleScreen.style.display = 'none';
      butterflyIndex = 0;
      calculateFlowerCenters();
      moveButterfly(butterflyIndex);
      progress = 0;
      wraparounds = 0;
      updateProgressBar();
      tapActive = false;
      const rightFlower = flowerGroups[flowerGroups.length - 1];
      rightFlower.innerHTML = '<img src="img/flowers.png" class="flower-img" alt="Flower">';
      const heartSvgs = livesDiv.querySelectorAll('svg');
      heartSvgs.forEach(svg => svg.classList.remove('heart-lost'));
      resetTimer();
      startTimer();
      startRaindrops();
    } else {
      // Reset to level 1 only if restarting from main menu
      currentLevel = 1;
      updateLevelLabel();
      lives = 3;
      gameOver = false;
      invincible = false;
      isGameOver = false;
      gameContainer.style.display = 'none';
      titleScreen.style.display = 'block';
    }
  };
  msg.appendChild(restartBtn);
  document.body.appendChild(msg);
}

// Listen for keydown events to move the butterfly
function handleKeyDown(e) {
  // Only move if the game is visible
  if (gameContainer.style.display === 'none' || isGameOver) return;
  if (e.repeat) return; // Ignore held-down keys

  // --- Check for level completion on tap ---
  // If the butterfly is on the tap and the user presses W or ArrowUp
  if (
    tapActive &&
    butterflyIndex === flowerCenters.length - 1 &&
    (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp')
  ) {
    // End the game and show the level complete message
    isGameOver = true;
    showGameOverScreen('You Saved Water! Level Complete');
    return;
  }

  // Move left
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
    moveButterfly(butterflyIndex - 1);
  }
  // Move right
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
    if (butterflyIndex === flowerCenters.length - 1) {
      if (!tapActive && wraparounds === WRAPAROUNDS_TO_WIN - 1) {
        // On the third wrap, replace rightmost flower with tap2.png
        tapActive = true;
        const rightFlower = flowerGroups[flowerGroups.length - 1];
        rightFlower.innerHTML = '';
        const tapImg = document.createElement('img');
        tapImg.src = 'img/tap2.png';
        tapImg.alt = 'Water Tap';
        tapImg.style.width = '150px'; // Bigger tap
        tapImg.style.height = 'auto';
        tapImg.style.display = 'block';
        tapImg.style.margin = '0 auto';
        tapImg.style.position = 'absolute';
        tapImg.style.right = '-60px'; // Stick out more from right side
        tapImg.style.top = '-190px'; // Raise tap up to butterfly eye level
        tapImg.style.zIndex = '10';
        tapImg.style.opacity = '0'; // Start invisible
        tapImg.style.transform = 'translateY(40px) scale(0.7)'; // Start lower and smaller
        tapImg.style.transition = 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)';
        rightFlower.style.position = 'relative';
        rightFlower.appendChild(tapImg);
        // Animate in after a short delay for smoothness
        setTimeout(() => {
          tapImg.style.opacity = '1';
          tapImg.style.transform = 'translateY(0) scale(1)';
        }, 30);
      }
      // If at rightmost flower, loop to leftmost (unless tap is active)
      if (!tapActive) {
        // Make butterfly invincible during teleport
        invincible = true;
        moveButterfly(0);
        wraparounds++;
        progress++;
        updateProgressBar();
        // Remove invincibility after short delay
        setTimeout(() => {
          invincible = false;
        }, 400);
      }
    } else {
      moveButterfly(butterflyIndex + 1);
      progress++;
      updateProgressBar();
      // --- REMOVE: auto level complete on tap ---
      // If tap is active and butterfly moves to tap, do nothing (wait for W key)
    }
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

// When Start Game is clicked, always reset to Level 1
startBtn.addEventListener('click', () => {
  currentLevel = 1;
  updateLevelLabel();
  titleScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  // Recalculate flower positions and move butterfly
  calculateFlowerCenters();
  moveButterfly(butterflyIndex);
});

// Also update the label on DOMContentLoaded in case of reload
window.addEventListener('DOMContentLoaded', () => {
  updateLevelLabel();
  // Show only the title screen at first
  titleScreen.style.display = 'block';
  gameContainer.style.display = 'none';
  // Calculate flower positions and set butterfly
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
    // Animate the rightmost heart fading out, then remove it after animation
    const livesDiv = document.querySelector('.lives');
    const heartSvgs = livesDiv.querySelectorAll('svg');
    if (heartSvgs[lives]) {
      // Add the heart-lost class for smooth animation
      heartSvgs[lives].classList.add('heart-lost');
      // Remove the SVG after the animation ends (0.5s)
      setTimeout(() => {
        if (heartSvgs[lives] && heartSvgs[lives].parentNode) {
          heartSvgs[lives].parentNode.removeChild(heartSvgs[lives]);
        }
      }, 500);
    }
    // If no lives left, end the game
    if (lives === 0) {
      endGame();
    }
  }
}

// Show Game Over message and stop the game
function endGame() {
  stopTimer();
  gameOver = true;
  isGameOver = true; // Prevent movement
  // Create the Game Over box
  const msg = document.createElement('div');
  msg.textContent = 'Game Over';
  msg.style.position = 'fixed';
  msg.style.top = '50%';
  msg.style.left = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.fontSize = '3rem';
  msg.style.color = '#fff';
  msg.style.background = '#0a2472'; // dark blue
  msg.style.padding = '32px 48px 80px 48px';
  msg.style.borderRadius = '24px';
  msg.style.zIndex = '1000';
  msg.style.boxShadow = '0 8px 32px #0005';
  msg.style.textAlign = 'center';
  msg.style.fontFamily = 'Fredoka One, Comic Sans MS, Comic Sans, cursive, sans-serif';

  // Create the Restart button
  const restartBtn = document.createElement('button');
  restartBtn.textContent = 'Restart?';
  restartBtn.style.marginTop = '32px';
  restartBtn.style.fontSize = '1.5rem';
  restartBtn.style.background = '#fff';
  restartBtn.style.color = '#0a2472';
  restartBtn.style.border = 'none';
  restartBtn.style.borderRadius = '12px';
  restartBtn.style.padding = '12px 32px';
  restartBtn.style.cursor = 'pointer';
  restartBtn.style.fontWeight = 'bold';
  restartBtn.style.boxShadow = '0 2px 12px #0002';
  restartBtn.style.position = 'absolute';
  restartBtn.style.left = '50%';
  restartBtn.style.bottom = '24px';
  restartBtn.style.transform = 'translateX(-50%)';
  restartBtn.style.transition = 'background 0.2s, color 0.2s';
  restartBtn.onmouseenter = () => {
    restartBtn.style.background = '#1976d2';
    restartBtn.style.color = '#fff';
  };
  restartBtn.onmouseleave = () => {
    restartBtn.style.background = '#fff';
    restartBtn.style.color = '#0a2472';
  };

  // When Restart is clicked, go back to the title screen and reset game state
  restartBtn.onclick = () => {
    msg.remove();
    // Reset hearts (add back SVGs if missing)
    const livesDiv = document.querySelector('.lives');
    while (livesDiv.children.length < 3) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.innerHTML = '<path d="M16 29s-13-8.35-13-16.5S10.5 2 16 8.5 29 2 29 12.5 16 29 16 29z" fill="#4fc3f7" stroke="#1976d2" stroke-width="2"/>';
      livesDiv.appendChild(svg);
    }
    // Reset lives and butterfly position
    lives = 3;
    gameOver = false;
    invincible = false;
    isGameOver = false; // Allow movement again
    // Remove all raindrops
    document.querySelectorAll('.raindrop-anim').forEach(drop => drop.remove());
    // Hide game, show title
    gameContainer.style.display = 'none';
    titleScreen.style.display = 'block';
  };

  msg.appendChild(restartBtn);
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

// --- Timer Logic ---
let timerInterval = null;
let timerStart = null;
function startTimer() {
  timerStart = Date.now();
  const timerDiv = document.getElementById('game-timer');
  if (timerInterval) clearInterval(timerInterval);
  function update() {
    const elapsed = Math.floor((Date.now() - timerStart) / 1000);
    const min = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const sec = String(elapsed % 60).padStart(2, '0');
    if (timerDiv) timerDiv.textContent = `${min}:${sec}`;
  }
  update();
  timerInterval = setInterval(update, 1000);
}
function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}
function resetTimer() {
  stopTimer();
  const timerDiv = document.getElementById('game-timer');
  if (timerDiv) timerDiv.textContent = '00:00';
}
// Start timer when game starts
startBtn.addEventListener('click', () => {
  resetTimer();
  startTimer();
});
// Stop timer on win/game over
function showGameOverScreen(customMessage) {
  stopTimer();
  // Create the Game Over box
  const msg = document.createElement('div');
  msg.textContent = customMessage || 'Game Over';
  msg.style.position = 'fixed';
  msg.style.top = '50%';
  msg.style.left = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.fontSize = '3rem';
  msg.style.color = '#fff';
  msg.style.background = '#0a2472'; // dark blue
  msg.style.padding = '32px 48px 80px 48px';
  msg.style.borderRadius = '24px';
  msg.style.zIndex = '1000';
  msg.style.boxShadow = '0 8px 32px #0005';
  msg.style.textAlign = 'center';
  msg.style.fontFamily = 'Fredoka One, Comic Sans MS, Comic Sans, cursive, sans-serif';

  // If the player completed the level, show extra info and points
  if (customMessage === 'You Saved Water! Level Complete') {
    // Create a new div for the extra message
    const extra = document.createElement('div');
    extra.textContent = '💧 In the minute it took you to complete this level, 5 liters of water could have been wasted if the tap was left running. A drop saved today is a life secured for the future. You\'ve earned 5000 points!';
    extra.style.fontSize = '1.3rem';
    extra.style.color = '#b3e5fc';
    extra.style.marginTop = '28px';
    extra.style.marginBottom = '8px';
    extra.style.lineHeight = '1.5';
    extra.style.fontFamily = 'inherit';
    // Add the extra message below the main message
    msg.appendChild(document.createElement('br'));
    msg.appendChild(extra);

    // Trigger confetti celebration
    if (jsConfetti) {
      jsConfetti.addConfetti();
    }
  }

  // Create the Restart/Next Level button
  const restartBtn = document.createElement('button');
  if (customMessage === 'You Saved Water! Level Complete') {
    restartBtn.textContent = 'Next Level';
  } else {
    restartBtn.textContent = 'Restart?';
  }
  restartBtn.style.marginTop = '32px';
  restartBtn.style.fontSize = '1.5rem';
  restartBtn.style.background = '#fff';
  restartBtn.style.color = '#0a2472';
  restartBtn.style.border = 'none';
  restartBtn.style.borderRadius = '12px';
  restartBtn.style.padding = '12px 32px';
  restartBtn.style.cursor = 'pointer';
  restartBtn.style.fontWeight = 'bold';
  restartBtn.style.boxShadow = '0 2px 12px #0002';
  restartBtn.style.position = 'absolute';
  restartBtn.style.left = '50%';
  restartBtn.style.bottom = '24px';
  restartBtn.style.transform = 'translateX(-50%)';
  restartBtn.style.transition = 'background 0.2s, color 0.2s';
  restartBtn.onmouseenter = () => {
    restartBtn.style.background = '#1976d2';
    restartBtn.style.color = '#fff';
  };
  restartBtn.onmouseleave = () => {
    restartBtn.style.background = '#fff';
    restartBtn.style.color = '#0a2472';
  };

  // When button is clicked, go back to the title screen and reset game state
  restartBtn.onclick = () => {
    msg.remove();
    // Reset hearts (add back SVGs if missing)
    const livesDiv = document.querySelector('.lives');
    while (livesDiv.children.length < 3) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.innerHTML = '<path d="M16 29s-13-8.35-13-16.5S10.5 2 16 8.5 29 2 29 12.5 16 29 16 29z" fill="#4fc3f7" stroke="#1976d2" stroke-width="2"/>';
      livesDiv.appendChild(svg);
    }
    // Reset lives and butterfly position
    lives = 3;
    gameOver = false;
    invincible = false;
    isGameOver = false; // Allow movement again
    // Remove all raindrops
    document.querySelectorAll('.raindrop-anim').forEach(drop => drop.remove());
    // Hide game, show title
    gameContainer.style.display = 'none';
    titleScreen.style.display = 'block';
  };

  msg.appendChild(restartBtn);
  document.body.appendChild(msg);
}

// Ensure butterfly starts on the leftmost flower when the game starts
function startGame() {
  // Hide the title screen (header)
  titleScreen.style.display = 'none';
  // Show the game layout
  gameContainer.style.display = 'block';
  // Set butterfly to leftmost flower
  butterflyIndex = 0; // Always start at the first (leftmost) flower
  moveButterfly(butterflyIndex);
  // Recalculate flower positions and move butterfly
  calculateFlowerCenters();
  moveButterfly(butterflyIndex);
  // Reset progress bar and wraparounds
  progress = 0;
  wraparounds = 0;
  updateProgressBar();
  tapActive = false;
  // Restore rightmost flower image
  const rightFlower = flowerGroups[flowerGroups.length - 1];
  rightFlower.innerHTML = '<img src="img/flowers.png" class="flower-img" alt="Flower">';
}

// Add progress bar HTML just below Level 1 label in the HUD
const hudCenter = document.querySelector('.hud-center');
if (!document.getElementById('level-progress')) {
  const progressDiv = document.createElement('div');
  progressDiv.id = 'level-progress';
  const barDiv = document.createElement('div');
  barDiv.id = 'progress-bar';
  progressDiv.appendChild(barDiv);
  // Insert after level-bar
  const levelBar = document.querySelector('.level-bar');
  levelBar.insertAdjacentElement('afterend', progressDiv);
}

// Progress bar logic
let progress = 0;
const WRAPAROUNDS_TO_WIN = 3;
const totalProgress = WRAPAROUNDS_TO_WIN * flowerGroups.length;
function updateProgressBar() {
  const percent = Math.min(100, (progress / totalProgress) * 100);
  document.getElementById('progress-bar').style.width = percent + '%';
  // Update ARIA value
  const progressDiv = document.getElementById('level-progress');
  if (progressDiv) {
    progressDiv.setAttribute('aria-valuenow', Math.round(percent));
  }
}

// Track wraparounds
let wraparounds = 0;

// Reset progress bar and wraparounds on game start
function startGame() {
  // Hide the title screen (header)
  titleScreen.style.display = 'none';
  // Show the game layout
  gameContainer.style.display = 'block';
  // Set butterfly to leftmost flower
  butterflyIndex = 0; // Always start at the first (leftmost) flower
  moveButterfly(butterflyIndex);
  // Recalculate flower positions and move butterfly
  calculateFlowerCenters();
  moveButterfly(butterflyIndex);
  // Reset progress bar and wraparounds
  progress = 0;
  wraparounds = 0;
  updateProgressBar();
  tapActive = false;
  // Restore rightmost flower image
  const rightFlower = flowerGroups[flowerGroups.length - 1];
  rightFlower.innerHTML = '<img src="img/flowers.png" class="flower-img" alt="Flower">';
}

// Start raindrops when the game starts
startBtn.addEventListener('click', () => {
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
  // Start the game
  startGame();
});

// --- Touch Controls for Mobile ---
// Get touch control buttons
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnJump = document.getElementById('btn-jump');

function triggerKey(key) {
  // Create a fake KeyboardEvent for compatibility
  const event = new KeyboardEvent('keydown', { key });
  window.dispatchEvent(event);
}

if (btnLeft && btnRight && btnJump) {
  btnLeft.addEventListener('touchstart', e => { e.preventDefault(); triggerKey('a'); });
  btnRight.addEventListener('touchstart', e => { e.preventDefault(); triggerKey('d'); });
  btnJump.addEventListener('touchstart', e => { e.preventDefault(); triggerKey('w'); });
  // Also allow click for accessibility
  btnLeft.addEventListener('click', () => triggerKey('a'));
  btnRight.addEventListener('click', () => triggerKey('d'));
  btnJump.addEventListener('click', () => triggerKey('w'));
}

// --- Reset Button Logic ---
const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    // Only allow reset if not game over
    if (isGameOver) return; // Prevent reset if game is over
    // Hide game, show title
    gameContainer.style.display = 'none';
    titleScreen.style.display = 'block';
    // Reset hearts (add back SVGs if missing)
    const livesDiv = document.querySelector('.lives');
    while (livesDiv.children.length < 3) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.innerHTML = '<path d="M16 29s-13-8.35-13-16.5S10.5 2 16 8.5 29 2 29 12.5 16 29 16 29z" fill="#4fc3f7" stroke="#1976d2" stroke-width="2"/>';
      livesDiv.appendChild(svg);
    }
    // Reset lives and butterfly position
    lives = 3;
    gameOver = false;
    invincible = false;
    isGameOver = false;
    // Remove all raindrops
    document.querySelectorAll('.raindrop-anim').forEach(drop => drop.remove());
    // Reset progress bar and wraparounds
    progress = 0;
    wraparounds = 0;
    updateProgressBar();
    tapActive = false;
    // Restore rightmost flower image
    const rightFlower = flowerGroups[flowerGroups.length - 1];
    rightFlower.innerHTML = '<img src="img/flowers.png" class="flower-img" alt="Flower">';
    // Move butterfly to leftmost flower
    butterflyIndex = 0;
    moveButterfly(butterflyIndex);
    // Reset timer
    resetTimer();
  });
}

// --- Confetti celebration (js-confetti) ---
let jsConfetti;
window.addEventListener('DOMContentLoaded', () => {
  if (window.JSConfetti) {
    jsConfetti = new JSConfetti();
  }
});