/**
 * Breakout Game - Main JavaScript File
 * Implements core game mechanics using HTML5 Canvas
 */

// Wait for the DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Game elements
    let ball, paddle, bricks;
    
    // Game state variables
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let gamePaused = false;
    let ballReleased = false;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const restartButton = document.getElementById('restartButton');
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Game constants
    const BALL_RADIUS = 10;
    const PADDLE_HEIGHT = 15;
    const PADDLE_WIDTH = 100;
    const BRICK_ROW_COUNT = 5;
    const BRICK_COLUMN_COUNT = 9;
    const BRICK_WIDTH = 75;
    const BRICK_HEIGHT = 20;
    const BRICK_PADDING = 10;
    const BRICK_OFFSET_TOP = 60;
    const BRICK_OFFSET_LEFT = 30;
    const BALL_SPEED_INITIAL = 5;
    const PADDLE_SPEED = 7;
    
    // Brick colors by row (for different point values)
    const BRICK_COLORS = [
        '#FF6B6B', // Red - 5 points
        '#FFD166', // Yellow - 4 points
        '#06D6A0', // Green - 3 points
        '#118AB2', // Blue - 2 points
        '#073B4C'  // Navy - 1 point
    ];
    
    // Brick point values by row
    const BRICK_POINTS = [5, 4, 3, 2, 1];
    
    // Initialize game
    function init() {
        // Reset game state
        score = 0;
        lives = 3;
        level = 1;
        gameRunning = false;
        gamePaused = false;
        ballReleased = false;
        
        // Update UI
        updateScoreDisplay();
        
        // Create game objects
        createBall();
        createPaddle();
        createBricks();
        
        // Draw initial game state
        draw();
        
        // Display start message
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Press START to play', canvas.width / 2, canvas.height / 2);
    }
    
    // Create the ball object
    function createBall() {
        const speedMultiplier = 1 + (level - 1) * 0.2; // Increase speed with level
        ball = {
            x: canvas.width / 2,
            y: canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 10,
            dx: BALL_SPEED_INITIAL * speedMultiplier * (Math.random() > 0.5 ? 1 : -1),
            dy: -BALL_SPEED_INITIAL * speedMultiplier,
            radius: BALL_RADIUS,
            speed: BALL_SPEED_INITIAL * speedMultiplier
        };
    }
    
    // Create the paddle object
    function createPaddle() {
        paddle = {
            x: (canvas.width - PADDLE_WIDTH) / 2,
            y: canvas.height - PADDLE_HEIGHT - 10,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            dx: 0,
            speed: PADDLE_SPEED
        };
    }
    
    // Create the brick grid
    function createBricks() {
        bricks = [];
        
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            bricks[r] = [];
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
                bricks[r][c] = { 
                    x: brickX, 
                    y: brickY, 
                    status: 1, 
                    color: BRICK_COLORS[r],
                    points: BRICK_POINTS[r]
                };
            }
        }
    }
    
    // Draw the ball
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.closePath();
    }
    
    // Draw the paddle
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.fillStyle = '#4A6CFF';
        ctx.fill();
        ctx.closePath();
    }
    
    // Draw the bricks
    function drawBricks() {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                const brick = bricks[r][c];
                if (brick.status === 1) {
                    ctx.beginPath();
                    ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                    ctx.fillStyle = brick.color;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }
    
    // Draw game elements
    function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements
        drawBricks();
        drawPaddle();
        drawBall();
    }
    
    // Update ball position
    function updateBall() {
        if (!ballReleased) {
            // Ball sticks to paddle before release
            ball.x = paddle.x + paddle.width / 2;
            return;
        }
        
        // Move the ball
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Wall collision detection
        // Right and left walls
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx;
            playSound('wall');
        }
        
        // Top wall
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
            playSound('wall');
        }
        
        // Bottom wall - lose a life
        if (ball.y + ball.radius > canvas.height) {
            lives--;
            livesElement.textContent = lives;
            playSound('life-lost');
            
            if (lives <= 0) {
                gameOver(false);
                return;
            }
            
            // Reset ball and paddle
            ballReleased = false;
            createBall();
            createPaddle();
        }
        
        // Paddle collision detection
        if (
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width
        ) {
            // Calculate bounce angle based on where ball hits paddle
            // Middle of paddle = straight up, edges = angled bounce
            const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            
            // Limit the angle to avoid horizontal bouncing
            const bounceAngle = hitPoint * Math.PI / 3; // Max 60 degree angle
            
            // Calculate new velocity
            ball.dy = -ball.speed * Math.cos(bounceAngle);
            ball.dx = ball.speed * Math.sin(bounceAngle);
            
            playSound('paddle');
        }
        
        // Brick collision detection
        brickCollisionDetection();
    }
    
    // Update paddle position
    function updatePaddle() {
        paddle.x += paddle.dx;
        
        // Keep paddle within canvas boundaries
        if (paddle.x < 0) {
            paddle.x = 0;
        } else if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }
    
    // Detect collisions between ball and bricks
    function brickCollisionDetection() {
        let bricksRemaining = 0;
        
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                const brick = bricks[r][c];
                
                if (brick.status === 1) {
                    bricksRemaining++;
                    
                    // Check for collision
                    if (
                        ball.x > brick.x &&
                        ball.x < brick.x + BRICK_WIDTH &&
                        ball.y > brick.y &&
                        ball.y < brick.y + BRICK_HEIGHT
                    ) {
                        ball.dy = -ball.dy;
                        brick.status = 0;
                        score += brick.points;
                        updateScoreDisplay();
                        playSound('brick');
                        
                        // Check if all bricks are destroyed
                        if (bricksRemaining === 1) {
                            // Level completed
                            levelUp();
                        }
                    }
                }
            }
        }
    }
    
    // Update score display
    function updateScoreDisplay() {
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        levelElement.textContent = level;
    }
    
    // Level up
    function levelUp() {
        level++;
        levelElement.textContent = level;
        
        // Pause the game briefly
        gamePaused = true;
        
        // Show level up message
        ctx.font = '30px Arial';
        ctx.fillStyle = '#FFD166';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${level}!`, canvas.width / 2, canvas.height / 2);
        
        // Resume after delay
        setTimeout(() => {
            ballReleased = false;
            createBall();
            createPaddle();
            createBricks();
            gamePaused = false;
            playSound('level-up');
        }, 2000);
    }
    
    // Game over
    function gameOver(won) {
        gameRunning = false;
        
        // Show game over message
        ctx.font = '30px Arial';
        ctx.fillStyle = won ? '#06D6A0' : '#FF6B6B';
        ctx.textAlign = 'center';
        
        const message = won ? 'You Win!' : 'Game Over';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Press RESTART to play again', canvas.width / 2, canvas.height / 2 + 80);
        
        playSound(won ? 'win' : 'game-over');
    }
    
    // Main game loop
    function gameLoop() {
        if (!gameRunning || gamePaused) return;
        
        // Update game objects
        updatePaddle();
        updateBall();
        
        // Draw everything
        draw();
        
        // Continue the game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Play sound effects (stub function - would implement with actual audio)
    function playSound(sound) {
        // In a full implementation, this would play actual sounds
        // console.log(`Playing sound: ${sound}`);
    }
    
    // Handle keyboard controls
    function keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            paddle.dx = paddle.speed;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            paddle.dx = -paddle.speed;
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            // Space bar releases the ball
            if (gameRunning && !ballReleased) {
                ballReleased = true;
            }
        }
    }
    
    function keyUpHandler(e) {
        if (
            e.key === 'Right' ||
            e.key === 'ArrowRight' ||
            e.key === 'Left' ||
            e.key === 'ArrowLeft'
        ) {
            paddle.dx = 0;
        }
    }
    
    // Handle mouse controls
    function mouseMoveHandler(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddle.x = relativeX - paddle.width / 2;
        }
    }
    
    // Handle touch controls for mobile devices
    function touchMoveHandler(e) {
        if (e.touches.length > 0) {
            const relativeX = e.touches[0].clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddle.x = relativeX - paddle.width / 2;
            }
            e.preventDefault();
        }
    }
    
    // Handle window resize
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        const containerWidth = container.clientWidth;
        
        // Maintain aspect ratio
        const aspectRatio = canvas.height / canvas.width;
        const newWidth = Math.min(containerWidth, 800);
        const newHeight = newWidth * aspectRatio;
        
        // Update canvas display size (CSS)
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        
        // Note: We keep the canvas internal resolution the same
        // This prevents having to recalculate game coordinates
    }
    
    // Button event handlers
    startButton.addEventListener('click', () => {
        if (!gameRunning) {
            gameRunning = true;
            ballReleased = false;
            gameLoop();
            startButton.textContent = 'Resume';
        } else if (gamePaused) {
            gamePaused = false;
            gameLoop();
        }
    });
    
    pauseButton.addEventListener('click', () => {
        if (gameRunning && !gamePaused) {
            gamePaused = true;
            
            // Show pause message
            ctx.font = '30px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText('Game Paused', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Press START to resume', canvas.width / 2, canvas.height / 2 + 40);
        }
    });
    
    restartButton.addEventListener('click', () => {
        init();
    });
    
    // Add event listeners
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize the game
    resizeCanvas();
    init();
});