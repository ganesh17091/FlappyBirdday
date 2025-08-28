// Day Environment Configuration
window.ENVIRONMENT_CONFIG = {
  name: 'day',
  background: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%)',
  groundColor: '#8FBC8F',
  cloudColor: 'rgba(255, 255, 255, 0.8)',
  textColor: '#2D5016',
  pipeColor: '#228B22',
  pipeBorderColor: '#006400',
  cloudPositions: [
    { top: '20%', left: '5%', width: '80px', height: '48px', opacity: 0.6 },
    { top: '32%', right: '8%', width: '64px', height: '40px', opacity: 0.6 },
    { top: '40%', left: '50%', width: '96px', height: '56px', opacity: 0.6 },
    { top: '15%', left: '70%', width: '72px', height: '44px', opacity: 0.5 },
    { top: '45%', right: '25%', width: '88px', height: '52px', opacity: 0.4 },
  ],
  hasStars: false,
};

// Auto-start game if game engine is already loaded
if (window.FlappyBirdGame) {
  new window.FlappyBirdGame(window.ENVIRONMENT_CONFIG);
}

console.log('🌅 Day Environment Loaded - Bright and sunny!');