// Game configuration
const GameConfig = {
    updateInterval: 16, // ~60fps
    virusSpawnInterval: 2000,
    initialVirusSpeed: 2,
    speedIncrease: 0.1,
    pointsPerVirus: 10,
    coinsPerVirus: 1,
    xpPerVirus: 5,
    levelUpXP: 100
};

// Game class
class Game {
    constructor() {
        this.container = document.getElementById('gameContainer');
        this.isRunning = false;
        this.gameLoop = null;
        this.spawnInterval = null;
        this.viruses = new Set();
        this.shields = new Set();
        this.cat = null;
        this.virusSpeed = GameConfig.initialVirusSpeed;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.spawnVirus = this.spawnVirus.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // Initialize game
        this.init();
    }
    
    init() {
        // Create cyber cat
        this.cat = document.createElement('img');
        this.cat.src = 'assets/images/cyber_cat.png';
        this.cat.className = 'cyber-cat';
        this.container.appendChild(this.cat);
        
        // Position cat in center
        this.cat.style.left = '50%';
        this.cat.style.bottom = '20px';
        this.cat.style.transform = 'translateX(-50%)';
        
        // Add event listeners
        this.container.addEventListener('click', this.handleClick);
        
        // Start game
        this.start();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameLoop = setInterval(this.update, GameConfig.updateInterval);
        this.spawnInterval = setInterval(this.spawnVirus, GameConfig.virusSpawnInterval);
    }
    
    stop() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        clearInterval(this.spawnInterval);
    }
    
    update() {
        // Update virus positions
        this.viruses.forEach(virus => {
            const rect = virus.getBoundingClientRect();
            const y = parseFloat(virus.style.top) || 0;
            
            // Move virus down
            virus.style.top = (y + this.virusSpeed) + 'px';
            
            // Check if virus hit bottom
            if (y > this.container.clientHeight) {
                this.gameOver();
            }
            
            // Check shield collisions
            this.shields.forEach(shield => {
                if (this.checkCollision(virus, shield)) {
                    this.destroyVirus(virus, true);
                }
            });
        });
        
        // Update shield positions (follow cat)
        this.shields.forEach(shield => {
            const catRect = this.cat.getBoundingClientRect();
            shield.style.left = (catRect.left + catRect.width/2 - shield.clientWidth/2) + 'px';
            shield.style.bottom = '80px';
        });
    }
    
    spawnVirus() {
        const virus = document.createElement('img');
        virus.src = 'assets/images/virus.png';
        virus.className = 'virus';
        
        // Random position at top
        const x = Math.random() * (this.container.clientWidth - 40);
        virus.style.left = x + 'px';
        virus.style.top = '-40px';
        
        this.container.appendChild(virus);
        this.viruses.add(virus);
    }
    
    handleClick(e) {
        // Get click position relative to container
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create shield at click position
        const shield = document.createElement('img');
        shield.src = 'assets/images/shield.png';
        shield.className = 'shield';
        
        shield.style.left = (x - 30) + 'px';
        shield.style.top = (y - 30) + 'px';
        
        this.container.appendChild(shield);
        this.shields.add(shield);
        
        // Remove shield after 2 seconds
        setTimeout(() => {
            this.container.removeChild(shield);
            this.shields.delete(shield);
        }, 2000);
        
        SoundManager.play('click');
    }
    
    destroyVirus(virus, wasBlocked) {
        this.container.removeChild(virus);
        this.viruses.delete(virus);
        
        if (wasBlocked) {
            // Award points
            GameState.score += GameConfig.pointsPerVirus;
            GameState.coins += GameConfig.coinsPerVirus;
            GameState.xp += GameConfig.xpPerVirus;
            
            // Check for level up
            if (GameState.xp >= GameConfig.levelUpXP) {
                GameState.level++;
                GameState.xp = 0;
                this.virusSpeed += GameConfig.speedIncrease;
            }
            
            // Update displays
            updateScoreDisplay();
            GameState.save();
            
            SoundManager.play('collect');
        }
    }
    
    gameOver() {
        this.stop();
        SoundManager.play('gameover');
        
        // Show game over message
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        gameOver.innerHTML = `
            <h2>Game Over!</h2>
            <p>Final Score: ${GameState.score}</p>
            <button class="btn" onclick="location.reload()">Try Again</button>
        `;
        this.container.appendChild(gameOver);
    }
    
    checkCollision(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
}

// Initialize game when screen is shown
document.addEventListener('DOMContentLoaded', () => {
    let game = null;
    
    // Watch for screen changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'gameScreen' && 
                mutation.target.style.display === 'block' && 
                !game) {
                game = new Game();
            }
        });
    });
    
    observer.observe(document.getElementById('gameScreen'), {
        attributes: true,
        attributeFilter: ['style']
    });
}); 