// Get the Start Game button, the game UI, the game container, and the title screen
const startBtn = document.getElementById('start-btn');
const gameUI = document.getElementById('game-ui');
const gameContainer = document.getElementById('game-container');
const titleScreen = document.getElementById('title-screen');

// When the Start Game button is clicked, hide the title screen and show the game UI
startBtn.addEventListener('click', () => {
  // Hide the title screen (header)
  titleScreen.style.display = 'none';
  // Show the game UI
  gameUI.style.display = 'flex';
  // Make sure the game container fills the background
  gameContainer.style.position = 'absolute';
  gameContainer.style.top = '0';
  gameContainer.style.left = '0';
  gameContainer.style.width = '100vw';
  gameContainer.style.minHeight = '100vh';
  gameContainer.style.background = 'none';
  gameContainer.style.border = 'none';
  gameContainer.style.boxShadow = 'none';

  // Show the grass and flowers (if hidden for any reason)
  const grass = document.querySelector('.grass-floor');
  const flowers = document.querySelector('.flowers-row');
  if (grass) {
    grass.style.display = 'flex';
  }
  if (flowers) {
    flowers.style.display = 'flex';
  }
});