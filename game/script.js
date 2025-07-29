    window.addEventListener('load', function() {
        const canvas = document.getElementById('canvas1');
        const ctx = canvas.getContext('2d');
        canvas.width = 1500;
        canvas.height = 500;
        
        // Try fullscreen (may not work without user gesture)
        try {
            document.documentElement.requestFullscreen();
        } catch (e) { console.log(e); }

        class Layer {
            constructor(game, image, speedModifier) {
                this.game = game;
                this.image = image;
                this.speedModifier = speedModifier;
                this.width = 1768;
                this.height = 500;
                this.x = 0;
                this.y = 0;
            }
            update() {
                if (this.x <= -this.width) this.x = 0;
                else this.x -= this.game.speed * this.speedModifier;
            }
            draw(context) {
                context.drawImage(this.image, this.x, this.y);
                context.drawImage(this.image, this.x + this.width, this.y);
            }
        }

        class Music {
            constructor(game) {
                this.game = game;
                this.media = document.getElementById('backingtrack_music');
                this.sound_gaz = document.getElementById('sound_gaz');
                this.sound_stop = document.getElementById('sound_stop');
                this.sound_cow = document.getElementById('sound_cow');
                this.media.volume = 0.5;
                this.sound_gaz.volume = 0.3;
                this.sound_stop.volume = 0.3;
            }
        }

        class Background {
            constructor(game) {
                this.game = game;
                this.image1 = document.getElementById('layer1');
                this.image2 = document.getElementById('layer2');
                this.image3 = document.getElementById('layer3');
                this.image4 = document.getElementById('layer4');
                this.layer1 = new Layer(this.game, this.image1, 0.2);
                this.layer2 = new Layer(this.game, this.image2, 0.5);
                this.layer3 = new Layer(this.game, this.image3, 1);
                this.layer4 = new Layer(this.game, this.image4, 1.7);
                this.layers = [this.layer1, this.layer2, this.layer3];
            }
            update() {
                this.layers.forEach(layer => layer.update());
            }
            draw(context) {
                this.layers.forEach(layer => layer.draw(context));
            }
        }

class Cow {
    constructor(game) {
        this.game = game;
        this.image = document.getElementById('cow');
        
        // Original image dimensions (840x679)
        this.spriteWidth = 840;
        this.spriteHeight = 679;
        
        // Scaled display size (150x120)
        this.width = 100;
        this.height = 80;
        
        // Alternative random sizing (commented out)
        // this.sizeModifier = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
        // this.width = 150 * this.sizeModifier;
        // this.height = 120 * this.sizeModifier;
        
        // this.x = this.game.width;
        // this.y = this.game.height - this.height - 100;
        this.x = 30;
        this.y = 337;    
        this.speed = Math.random() * 2 + 1;
        this.markedForDeletion = false;
        this.frameX = 0;
        this.maxFrame = 0; // Set to 0 if not using sprite sheet
        this.frameTimer = 0;
        this.frameInterval = 200;
    }
    
    update(deltaTime) {
        this.x -= this.speed + this.game.speed;
        
        // Animation (if using sprite sheet)
        if (this.maxFrame > 0) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
        }
        
        if (this.x < -this.width) {
            this.markedForDeletion = true;
        }
        
        if (this.game.checkCollision(this, this.game.player)) {
            this.game.hitCow();
            this.markedForDeletion = true;
        }
    }
    
    draw(context) {
        // For single image (not sprite sheet)
        context.drawImage(
            this.image,
            this.x, this.y,
            this.width, this.height
        );
        
        /* For sprite sheet version:
        context.drawImage(
            this.image,
            this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x, this.y,
            this.width, this.height
        );
        */
    }
}
        class CowSpawner {
            constructor(game) {
                this.game = game;
                this.cows = [];
                this.spawnTimer = 0;
                this.spawnInterval = 2000;
            }
            
            update(deltaTime) {
                if (this.spawnTimer > this.spawnInterval) {
                    this.cows.push(new Cow(this.game));
                    this.spawnTimer = 0;
                    this.spawnInterval = 1500 + Math.random() * 2000;
                } else {
                    this.spawnTimer += deltaTime;
                }
                
                this.cows.forEach(cow => cow.update(deltaTime));
                this.cows = this.cows.filter(cow => !cow.markedForDeletion);
            }
            
            draw(context) {
                this.cows.forEach(cow => cow.draw(context));
            }
        }

        class InputHandler {
            constructor(game) {
                this.game = game;
                this.touchId = null;
                this.touchThreshold = 10;
                this.maxSpeed = 5;
                this.acceleration = 0.6;
                this.deceleration = 0.1;
                
                // Keyboard controls
                window.addEventListener('keydown', e => {
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
                        !this.game.keys.includes(e.key)) {
                        this.game.keys.push(e.key);
                    }
                });
                
                window.addEventListener('keyup', e => {
                    const index = this.game.keys.indexOf(e.key);
                    if (index > -1) {
                        this.game.keys.splice(index, 1);
                    }
                });

                // Touch controls
                window.addEventListener('touchstart', e => {
                    if (this.touchId === null) {
                        const touch = e.touches[0];
                        this.touchId = touch.identifier;
                        this.game.touchStartY = touch.clientY;
                        this.game.currentTouchY = touch.clientY;
                        this.game.touchStartX = touch.clientX;
                        this.game.currentTouchX = touch.clientX;
                        this.game.isTouching = true;
                        this.game.touchVelocityY = 0;
                        this.game.touchVelocityX = 0;
                    }
                });

                window.addEventListener('touchmove', e => {
                    if (!this.game.isTouching) return;
                    
                    const touch = Array.from(e.touches).find(t => t.identifier === this.touchId);
                    if (!touch) return;
                    
                    // Y-axis
                    const previousY = this.game.currentTouchY;
                    this.game.currentTouchY = touch.clientY;
                    const deltaY = this.game.currentTouchY - previousY;
                    
                    // X-axis
                    const previousX = this.game.currentTouchX;
                    this.game.currentTouchX = touch.clientX;
                    const deltaX = this.game.currentTouchX - previousX;
                    
                    // Apply acceleration
                    if (Math.abs(deltaY) > 0) {
                        const direction = deltaY > 0 ? 1 : -1;
                        this.game.touchVelocityY = Math.min(
                            this.maxSpeed,
                            Math.max(
                                -this.maxSpeed,
                                this.game.touchVelocityY + (direction * this.acceleration)
                            )
                        );
                    }
                    
                    if (Math.abs(deltaX) > 0) {
                        const direction = deltaX > 0 ? 1 : -1;
                        this.game.touchVelocityX = Math.min(
                            this.maxSpeed,
                            Math.max(
                                -this.maxSpeed,
                                this.game.touchVelocityX + (direction * this.acceleration)
                            )
                        );
                    }
                    
                    this.game.touchDeltaY = this.game.touchVelocityY;
                    this.game.touchDeltaX = this.game.touchVelocityX;
                });

                window.addEventListener('touchend', e => {
                    const touch = Array.from(e.changedTouches).find(t => t.identifier === this.touchId);
                    if (touch) {
                        this.game.isTouching = false;
                        this.touchId = null;
                    }
                });
            }

            update() {
                // Apply deceleration when not touching
                if (!this.game.isTouching) {
                    // Y-axis
                    if (this.game.touchVelocityY > 0) {
                        this.game.touchVelocityY = Math.max(0, this.game.touchVelocityY - this.deceleration);
                    } else {
                        this.game.touchVelocityY = Math.min(0, this.game.touchVelocityY + this.deceleration);
                    }
                    
                    // X-axis
                    if (this.game.touchVelocityX > 0) {
                        this.game.touchVelocityX = Math.max(0, this.game.touchVelocityX - this.deceleration);
                    } else {
                        this.game.touchVelocityX = Math.min(0, this.game.touchVelocityX + this.deceleration);
                    }
                    
                    this.game.touchDeltaY = this.game.touchVelocityY;
                    this.game.touchDeltaX = this.game.touchVelocityX;
                    
                    if (Math.abs(this.game.touchVelocityY) < 0.05) {
                        this.game.touchVelocityY = 0;
                        this.game.touchDeltaY = 0;
                    }
                    
                    if (Math.abs(this.game.touchVelocityX) < 0.05) {
                        this.game.touchVelocityX = 0;
                        this.game.touchDeltaX = 0;
                    }
                }
            }
        }

        class Player {
            constructor(game) {
                this.game = game;
                this.width = 166;
                this.height = 215;
                this.x = 20;
                this.y = 227;
                this.xLimitRight = this.game.width - this.width;
                this.xLimitLeft = 0;
                this.yLimitUp = 185;
                this.yLimitDown = this.game.height - this.height;
                this.frameX = 0;
                this.frameY = 0;
                this.maxFrame = 2;
                this.frameTimer = 0;
                this.frameInterval = 100;
                this.speedX = 0;
                this.speedY = 0;
                this.maxSpeedY = 3;
                this.maxSpeedX = 7;
                this.maxSpeedYslide = 0.5;
                this.maxSpeedXslide = 2;
                this.image = document.getElementById('player');
                this.collisionCount = 0;
            }
            
            update(deltaTime) {
                // Keyboard controls
                if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeedY;
                else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeedY;
                
                if (this.game.keys.includes('ArrowLeft')) {
                    this.speedX = -this.maxSpeedX;
                    this.game.sound_stop_bool = true;
                }
                else if (this.game.keys.includes('ArrowRight')) {
                    this.speedX = this.maxSpeedX;
                    this.game.sound_gaz_bool = true;
                }
                
                // Touch controls (only if no keyboard input)
                if (!this.game.keys.length && this.game.isTouching) {
                    if (Math.abs(this.game.touchDeltaX) > 0) {
                        this.speedX = this.game.touchDeltaX * this.maxSpeedXslide;
                        this.game.sound_gaz_bool = this.game.touchDeltaX > 0;
                    }
                    
                    if (Math.abs(this.game.touchDeltaY) > 0) {
                        this.speedY = this.game.touchDeltaY * this.maxSpeedYslide;
                    }
                }
                
                // Deceleration
                if (!this.game.isTouching && !this.game.keys.length) {
                    this.speedX *= 0.9;
                    this.speedY *= 0.9;
                    if (Math.abs(this.speedX) < 0.1) this.speedX = 0;
                    if (Math.abs(this.speedY) < 0.1) this.speedY = 0;
                    this.game.sound_gaz_bool = false;
                }
                
                // Movement
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Boundaries
                if (this.x < this.xLimitLeft) this.x = this.xLimitLeft;
                if (this.x > this.xLimitRight) this.x = this.xLimitRight;
                if (this.y > this.yLimitDown) this.y = this.yLimitDown;
                if (this.y < this.yLimitUp) this.y = this.yLimitUp;
                
                // Animation
                if (this.frameTimer > this.frameInterval) {
                    if (this.frameX < this.maxFrame) this.frameX++;
                    else this.frameX = 0;
                    this.frameTimer = 0;
                } else {
                    this.frameTimer += deltaTime;
                }
            }
            
            draw(context) {
                context.drawImage(
                    this.image,
                    this.frameX * this.width, this.frameY * this.height,
                    this.width, this.height,
                    this.x, this.y,
                    this.width, this.height
                );

                if (this.game.sound_gaz_bool) this.game.music.sound_gaz.play();
                if (this.game.sound_stop_bool) this.game.music.sound_stop.play();
            }
        }

        class Game {
            constructor(width, height) {
                this.width = width;
                this.height = height;
                this.background = new Background(this);
                this.player = new Player(this);
                this.music = new Music(this);
                this.input = new InputHandler(this);
                this.cowSpawner = new CowSpawner(this);
                
                this.keys = [];
                this.speed = 1;
                this.score = 0;
                this.sound_gaz_bool = false;
                this.sound_stop_bool = true;
                
                // Touch properties
                this.touchStartY = 0;
                this.touchStartX = 0;
                this.currentTouchY = 0;
                this.currentTouchX = 0;
                this.touchDeltaY = 0;
                this.touchDeltaX = 0;
                this.touchVelocityY = 0;
                this.touchVelocityX = 0;
                this.isTouching = false;
                
                // Start music
                this.music.media.loop = true;
                this.music.media.play();
            }
            
            checkCollision(object1, object2) {
                return (
                    object1.x < object2.x + object2.width &&
                    object1.x + object1.width > object2.x &&
                    object1.y < object2.y + object2.height &&
                    object1.y + object1.height > object2.y
                );
            }
            
            hitCow() {
                this.speed *= 0.5; // Slow down
                this.player.collisionCount++;
                this.music.sound_cow.currentTime = 0;
                this.music.sound_cow.play();
                
                // Game over after 3 collisions
                if (this.player.collisionCount >= 3) {
                    alert('Game Over! You hit too many cows!');
                    document.location.reload();
                }
            }
            
            update(deltaTime) {
                this.input.update();
                this.background.layer4.update();
                this.player.update(deltaTime);
                this.background.update();
                this.cowSpawner.update(deltaTime);
                
                // Score increases with time
                this.score += this.speed * 0.1;
                
                // Gradually restore speed after collision
                if (this.speed < 1) {
                    this.speed += 0.005;
                }
            }
            
            draw(context) {
                // Clear canvas
                context.clearRect(0, 0, this.width, this.height);
                
                // Draw game elements
                this.background.draw(context);
                this.cowSpawner.draw(context);
                this.player.draw(context);
                this.background.layer4.draw(context);
                
                // Draw UI
                context.fillStyle = 'white';
                context.font = '30px Arial';
                context.fillText(`Score: ${Math.floor(this.score)}`, 20, 40);
                context.fillText(`Cows Hit: ${this.player.collisionCount}/3`, 20, 80);
            }
        }
        
        const game = new Game(canvas.width, canvas.height);
        
        let lastTime = 0;
        function animate(timestamp) {
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;
            
            game.update(deltaTime);
            game.draw(ctx);
            requestAnimationFrame(animate);
        }
        
        animate(0);
    });
