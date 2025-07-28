window.addEventListener('load', function(){
    
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 500;
    document.documentElement.fullscreen = true;
    canvas.requestFullscreen();

    class Layer{
      constructor(game, image, speedModifier){
        this.game = game;
        this.image = image;
        this.speedModifier = speedModifier;
        this.width = 1768;
        this.height = 500;
        this.x = 0;
        this.y = 0;  
      }
      update(){
        if (this.x <= -this.width) this.x = 0;
        else this.x -= this.game.speed * this.speedModifier;
      }
      draw(context){
        context.drawImage(this.image, this.x, this.y)
        context.drawImage(this.image, this.x+this.width, this.y)
        
      }
    }  

    class Music{
      constructor(game){
        this.game = game;
        this.media = document.getElementById('backingtrack_music');
        this.sound_gaz = document.getElementById('sound_gaz');
        this.sound_stop = document.getElementById('sound_stop');
        
        //this.media.volume = 0.5;
        //this.media.loop = true;
        //this.media.play();
      }
    }
  
    class Background{
      constructor(game){
        this.game = game;
        this.image1 = document.getElementById('layer1');
        this.image2 = document.getElementById('layer2');
        this.image3 = document.getElementById('layer3');
        this.image4 = document.getElementById('layer4');
        this.layer1 = new Layer(this.game, this.image1, 0.2);
        this.layer2 = new Layer(this.game, this.image2, 0.5);
        this.layer3 = new Layer(this.game, this.image3, 1);
        this.layer4 = new Layer(this.game, this.image4, 1.7);
        this.layers = [this.layer1,this.layer2,this.layer3];
        }
      update(){
        this.layers.forEach(layer => layer.update());
      }
      draw(context){
        this.layers.forEach(layer => layer.draw(context));
      }
    }  
  
    class InputHandler {
       constructor(game){
         this.game = game;
         window.addEventListener('keydown',e=>{
           if ( ((e.key === 'ArrowUp') ||
                 (e.key === 'ArrowDown') ||
                 (e.key === 'ArrowLeft') ||
                 (e.key === 'ArrowRight')) 
               &&
                 (this.game.keys.indexOf(e.key) === -1)){
                    this.game.keys.push(e.key);
           }
         });
         window.addEventListener('keyup',e=>{
           if (this.game.keys.indexOf(e.key) > -1) {
             this.game.keys.splice(this.game.keys.indexOf(e.key),1);
             //console.log(this.game.keys);
           }
         });

         
         window.addEventListener('touchstart',e => {
           this.game.touchStartY = e.touches[0].clientY;
           this.game.touchStartX = e.touches[0].clientX;
           this.game.isSliding = true;
         });
         window.addEventListener('touchmove',e => {
           const currentY = e.touches[0].clientY;
           const currentX = e.touches[0].clientX;
           this.game.touchDeltaY = currentY - this.game.touchStartY;
           this.game.touchDeltaX = currentX - this.game.touchStartX;
         });
         window.addEventListener('touchend', e => {
           this.game.isSliding = false;
         });  

       }
    }
    
    class Player{
      constructor (game){
        this.game = game;
        this.width = 166;
        this.height = 215;
        
        // x,y position Player
        this.x = 20;
        this.y = 227;
        
        this.xLimitRight = this.game.width-this.width;
        this.xLimitLeft = 0;
        this.yLimitUp = 185;
        this.yLimitDown = this.game.height-this.height;
        
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 2;

        this.speedX = 0;
        this.speedY = 0;
        this.maxSpeedY = 3;
        this.maxSpeedX = 7;
        this.maxSpeedYslide = 0.5;
        this.maxSpeedXslide = 2;
        this.image = document.getElementById('player');
      }
      update(){

        if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeedY;
        else 
          if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeedY;
        else 
          if (this.game.keys.includes('ArrowLeft')) {
            this.speedX = -this.maxSpeedX;
            this.game.sound_stop_bool = true;
          }
        else 
          if (this.game.keys.includes('ArrowRight')) {
            this.speedX = this.maxSpeedX;
            this.game.sound_gaz_bool = true;
          }
        else {
          this.speedY = 0; this.speedX = 0;
          this.game.sound_gaz_bool = false;
          this.game.sound_stop_bool = true;
        }

        // checking touches by X

        if (this.game.touchDeltaX > 0) {
            this.game.sound_gaz_bool = true;
            this.speedX = this.maxSpeedXslide;
          }
        else
          if (this.game.touchDeltaX < 0) {
            this.game.sound_gaz_bool = false;
            this.speedX = -this.maxSpeedXslide;
          }
          
        if (this.game.isSliding == false) {
            this.game.sound_gaz_bool = false;
            this.speedX = 0;
          }
        
        
        // checking touches by Y

        if (this.game.touchDeltaY > 0) {
            this.speedY = this.maxSpeedYslide;
          }
        else
          if (this.game.touchDeltaY < 0) {
            this.speedY = -this.maxSpeedYslide;
          }
          
        if (this.game.isSliding == false) {
            this.speedY = 0;
          }
        
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.x < this.xLimitLeft) { this.x = this.xLimitLeft;}
        if (this.x > this.xLimitRight) { this.x = this.xLimitRight;}
        if (this.y > this.yLimitDown) { this.y = this.yLimitDown;}
        if (this.y < this.yLimitUp) { this.y = this.yLimitUp;}
        
        if (this.frameX < this.maxFrame) {
          this.frameX++;
        } else {
          this.frameX = 0;
        }
      }
      
      draw(context){
        // draw without animate
        // context.drawImage(this.image,this.x,this.y,this.width,this.height);
        // draw with frames
        // context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);

        if (this.game.sound_gaz_bool) {this.game.music.sound_gaz.play(); }
       //else
        if (this.game.sound_stop_bool) {this.game.music.sound_stop.play(); }
        //context.drawImage(this.image,this.frameX*320,50,1000,1200,this.x,this.y,this.width,this.height);        
      }
    }

    class Game{
      constructor(width, height){
        this.width = width;
        this.height = height;
        
        this.background = new Background(this);
        this.player = new Player(this);
        this.music = new Music(this);
        this.input = new InputHandler(this);
        
        this.keys = [];
        
        this.speed = 1;
        
        this.sound_gaz_bool = false;
        this.sound_stop_bool = true;

        
        // for Screen Touches Handler
        this.touchStartY = 0;
        this.touchStartX = 0;
        // this.touchEndY = 0;
        // this.touchEndY = 0;
        this.isSlidind = false;
        this.touchDeltaY = 0;
        this.touchDeltaX = 0;
      }
      update(){
  
        this.background.layer4.update();
        this.player.update();
        this.background.update();
        
      }
      draw(context){
        
        this.background.draw(context);
        this.player.draw(context);
        this.background.layer4.draw(context);
      }

    }
    
    const game = new Game(canvas.width,canvas.height);
     
    const audio = document.getElementById('backingtrack_music');
    audio.loop = true;
    audio.volume = 0.9;
    audio.play(); 
  
    function animate(){
      // ctx.clearRect(0,0,canvas.width,canvas.height);
      game.update();
      game.draw(ctx);
      requestAnimationFrame(animate);
    }
    animate();
})