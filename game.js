// Flappy Bird Game Engine
class FlappyBirdGame {
  constructor(environment) {
    this.environment = environment;
    this.canvas = null;
    this.ctx = null;
    this.bird = { x: 100, y: 300, velocity: 0, rotation: 0 };
    this.pipes = [];
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('flappyBirdHighScore') || '0');
    this.isPlaying = false;
    this.isGameOver = false;
    this.gameWidth = 800;
    this.gameHeight = 600;
    this.gravity = 0.5;
    this.jumpForce = -8;
    this.pipeSpeed = 2;
    this.pipeGap = 150;
    this.birdSize = 30;
    this.pipeWidth = 60;
    this.groundHeight = 50;
    this.pipeSpacing = 300;
    
    this.init();
  }

  init() {
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.style.cssText = `
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${this.environment.background};
    `;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.gameWidth;
    this.canvas.height = this.gameHeight;
    this.canvas.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      max-width: 100vw;
      max-height: 100vh;
    `;
    
    this.ctx = this.canvas.getContext('2d');
    
    // Create UI overlay
    this.createUI(gameContainer);
    
    gameContainer.appendChild(this.canvas);
    document.body.appendChild(gameContainer);
    
    // Event listeners
    gameContainer.addEventListener('click', () => this.jump());
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.jump();
      }
    });
    
    this.gameLoop();
  }

  createUI(container) {
    // Score display
    this.scoreElement = document.createElement('div');
    this.scoreElement.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 48px;
      font-weight: bold;
      color: ${this.environment.textColor};
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      z-index: 10;
    `;
    this.scoreElement.textContent = '0';
    
    // Game over / start screen
    this.menuElement = document.createElement('div');
    this.menuElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    `;
    
    const menuContent = document.createElement('div');
    menuContent.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      max-width: 400px;
      margin: 20px;
    `;
    
    const title = document.createElement('h1');
    title.textContent = '🐦 Flappy Bird';
    title.style.cssText = `
      font-size: 32px;
      margin-bottom: 20px;
      color: #333;
    `;
    
    this.gameOverText = document.createElement('div');
    this.gameOverText.style.cssText = `
      font-size: 24px;
      margin-bottom: 20px;
      color: #666;
    `;
    
    this.startButton = document.createElement('button');
    this.startButton.textContent = 'Start Game';
    this.startButton.style.cssText = `
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 18px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    this.startButton.onmouseover = () => {
      this.startButton.style.background = '#45a049';
      this.startButton.style.transform = 'scale(1.05)';
    };
    this.startButton.onmouseout = () => {
      this.startButton.style.background = '#4CAF50';
      this.startButton.style.transform = 'scale(1)';
    };
    this.startButton.onclick = () => this.startGame();
    
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div style="margin-top: 20px; font-size: 14px; color: #888;">
        Click or press <kbd style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">SPACE</kbd> to flap
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #aaa;">
        Environment: ${this.environment.name.toUpperCase()}
      </div>
    `;
    
    menuContent.appendChild(title);
    menuContent.appendChild(this.gameOverText);
    menuContent.appendChild(this.startButton);
    menuContent.appendChild(instructions);
    this.menuElement.appendChild(menuContent);
    
    container.appendChild(this.scoreElement);
    container.appendChild(this.menuElement);
  }

  startGame() {
    this.isPlaying = true;
    this.isGameOver = false;
    this.bird = { x: 100, y: 300, velocity: 0, rotation: 0 };
    this.pipes = [];
    this.score = 0;
    this.menuElement.style.display = 'none';
  }

  jump() {
    if (!this.isPlaying && !this.isGameOver) {
      this.startGame();
    }
    
    if (this.isPlaying && !this.isGameOver) {
      this.bird.velocity = this.jumpForce;
      this.bird.rotation = -20;
    }
  }

  generatePipe(x) {
    const topHeight = Math.random() * (400 - this.pipeGap - 100) + 50;
    return {
      x,
      topHeight,
      gap: this.pipeGap,
      passed: false,
      id: Date.now() + Math.random(),
    };
  }

  updateGame() {
    if (!this.isPlaying || this.isGameOver) return;

    // Update bird
    this.bird.y += this.bird.velocity;
    this.bird.velocity += this.gravity;
    this.bird.rotation = Math.min(this.bird.velocity * 3, 45);

    // Update pipes
    this.pipes = this.pipes
      .map(pipe => ({ ...pipe, x: pipe.x - this.pipeSpeed }))
      .filter(pipe => pipe.x > -this.pipeWidth);

    // Add new pipes
    if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.gameWidth - this.pipeSpacing) {
      this.pipes.push(this.generatePipe(this.gameWidth));
    }

    // Check score
    this.pipes.forEach(pipe => {
      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
        this.scoreElement.textContent = this.score;
      }
    });

    // Check collisions
    if (this.checkCollision()) {
      this.gameOver();
    }
  }

  checkCollision() {
    // Ground collision
    if (this.bird.y + this.birdSize >= this.gameHeight - this.groundHeight) {
      return true;
    }

    // Ceiling collision
    if (this.bird.y <= 0) {
      return true;
    }

    // Pipe collision
    for (const pipe of this.pipes) {
      if (
        this.bird.x + this.birdSize > pipe.x &&
        this.bird.x < pipe.x + this.pipeWidth &&
        (this.bird.y < pipe.topHeight || this.bird.y + this.birdSize > pipe.topHeight + pipe.gap)
      ) {
        return true;
      }
    }

    return false;
  }

  gameOver() {
    this.isGameOver = true;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('flappyBirdHighScore', this.highScore.toString());
    }
    
    this.gameOverText.innerHTML = `
      <div style="font-size: 48px; color: #e74c3c; margin-bottom: 10px;">${this.score}</div>
      <div style="font-size: 16px; color: #666;">
        High Score: <span style="color: #27ae60; font-weight: bold;">${this.highScore}</span>
      </div>
      ${this.score === this.highScore && this.score > 0 ? 
        '<div style="font-size: 14px; color: #f39c12; margin-top: 8px;">🎉 New High Score!</div>' : ''}
    `;
    this.startButton.textContent = 'Play Again';
    this.menuElement.style.display = 'flex';
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = this.environment.background;
    this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Draw environment elements
    this.drawEnvironment();

    // Draw pipes
    this.pipes.forEach(pipe => this.drawPipe(pipe));

    // Draw ground
    this.ctx.fillStyle = this.environment.groundColor;
    this.ctx.fillRect(0, this.gameHeight - this.groundHeight, this.gameWidth, this.groundHeight);

    // Draw bird
    this.drawBird();
  }

  drawEnvironment() {
    // Draw clouds
    this.environment.cloudPositions.forEach((cloud, index) => {
      this.ctx.fillStyle = this.environment.cloudColor;
      this.ctx.beginPath();
      const x = parseFloat(cloud.left || cloud.right) / 100 * this.gameWidth;
      const y = parseFloat(cloud.top) / 100 * this.gameHeight;
      const width = parseFloat(cloud.width);
      const height = parseFloat(cloud.height);
      this.ctx.arc(x, y, width/2, 0, Math.PI * 2);
      this.ctx.arc(x + width/3, y, width/3, 0, Math.PI * 2);
      this.ctx.arc(x - width/3, y, width/3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw stars (night only)
    if (this.environment.hasStars && this.environment.starPositions) {
      this.ctx.fillStyle = 'white';
      this.environment.starPositions.forEach(star => {
        const x = parseFloat(star.left) / 100 * this.gameWidth;
        const y = parseFloat(star.top) / 100 * this.gameHeight;
        const size = parseFloat(star.size);
        this.ctx.beginPath();
        this.ctx.arc(x, y, size/2, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    // Draw sun/moon
    this.ctx.fillStyle = this.environment.name === 'day' ? '#FFD700' : '#F5F5DC';
    this.ctx.beginPath();
    this.ctx.arc(this.gameWidth - 80, 80, 30, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawBird() {
    this.ctx.save();
    this.ctx.translate(this.bird.x + this.birdSize/2, this.bird.y + this.birdSize/2);
    this.ctx.rotate(this.bird.rotation * Math.PI / 180);
    
    // Bird body
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.birdSize/2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bird eye
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(-5, -5, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Bird beak
    this.ctx.fillStyle = '#FF8C00';
    this.ctx.beginPath();
    this.ctx.moveTo(this.birdSize/2 - 5, 0);
    this.ctx.lineTo(this.birdSize/2 + 5, 0);
    this.ctx.lineTo(this.birdSize/2 - 2, 5);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  drawPipe(pipe) {
    // Top pipe
    this.ctx.fillStyle = this.environment.pipeColor;
    this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
    
    // Top pipe cap
    this.ctx.fillStyle = this.environment.pipeBorderColor;
    this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
    
    // Bottom pipe
    const bottomPipeY = pipe.topHeight + pipe.gap;
    const bottomPipeHeight = this.gameHeight - bottomPipeY - this.groundHeight;
    this.ctx.fillStyle = this.environment.pipeColor;
    this.ctx.fillRect(pipe.x, bottomPipeY, this.pipeWidth, bottomPipeHeight);
    
    // Bottom pipe cap
    this.ctx.fillStyle = this.environment.pipeBorderColor;
    this.ctx.fillRect(pipe.x - 5, bottomPipeY, this.pipeWidth + 10, 30);
  }

  gameLoop() {
    this.updateGame();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Export for use with environment files
window.FlappyBirdGame = FlappyBirdGame;

// Auto-start if environment is already loaded
if (window.ENVIRONMENT_CONFIG) {
  new FlappyBirdGame(window.ENVIRONMENT_CONFIG);
}