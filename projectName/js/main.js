//Team Name: Area 53
//Team Members: Cheryl Kulkarni, Galen Turoci, Hongyu Chen
//Group 53
//GitHub Repository: https://github.com/chkulkar/EndlessRunner
'use strict';
// define game and game variables
var game = new Phaser.Game(900, 400, Phaser.AUTO, 'phaser');
var scoreText;
var levelCounter;
var platforms;
var benches;
var fence;
var rain;
var rains;
var player;
var enemy;
var timer;
var treats;
var treat1;
var treat2;
var obstacles;
var obstacle1;
var obstacle2;
var obstacles2;
var spilledTrashes;
var trash1;
var stars;
var star;
var trash;
var objectSpeed;
var colors = [0x1BE7FF, 0x6EEB83, 0xE4FF1A, 0xE8AA14]; 
var colorIndex = 0;
var cursors;
var collectSound;
var collideObstacleSound;
var jumpSound;
var posDropSound;
var negCollideSound;
var enemySound;
var backSound;
var endgame;
var level;
var background;
var clouds;
var cloud1;
var cloud2;
var cloud3;
var cloud4;
var cloud5;
// define MainMenu state and methods
var MainMenu = function(game) {};
MainMenu.prototype = {
		//load game assets
		preload: function() {
		game.load.path = 'assets/img/'; 
		game.load.image('sky', 'Sky.png');
		game.load.image('rain', 'rain.png'); 
		game.load.image('cloud1','Cloud1.png');
		game.load.image('cloud2','Cloud2.png');
		game.load.image('cloud3','Cloud3.png');
		game.load.image('cloud4','Cloud4.png');
		game.load.image('cloud5','Cloud5.png');
		game.load.image('star','star.png');
		game.load.image('bench','Bench.png');
		game.load.image('fence','Fence.png');
		game.load.image('ground', 'Ground.png');
		game.load.image('grass', 'Grass.png');
		game.load.image('treat1','treat.png'); 
		game.load.image('treat2', 'treat2.png');
		game.load.image('spilledTrash', 'spilledTrash.png'); 
		game.load.image('obstacle2', 'obstacle2.png');
		game.load.image('trash','Trash.png');
		game.load.atlasJSONHash('atlas1', 'AI.png', 'AI.json'); 
		game.load.atlasJSONHash('atlas2', 'dog.png', 'dog.json');
		
		// load audio assets
		game.load.path = 'assets/audio/';
		game.load.audio('collideObstacleSound',['collideSound.mp3']); //collision with obstacle sound 
		game.load.audio('collectible', ['collectible.mp3']); //collectible sound
		game.load.audio('posDropSound',['posDrop.mp3']); //sound played when treat is dropped
		game.load.audio('negCollideSound', ['damage.wav']); //sound from OpenGameArt.org by Juhani Junkala
		game.load.audio('backMusic', ['backMusic.mp3']); //background music from https://www.bensound.com
		game.load.audio('jumpSound', ['jump.mp3']); //jump sound from https://www.bensound.com
		game.load.audio('die', ['die.mp3']); //death sound
		game.load.audio('endgame', ['endgame.mp3']);//game over music from OpenGameArt.org by Machine
	},
	init: function() {
		this.score = 0; // tracks the player's score
		this.life = 1;	// tracks the player's life
	},
	create: function() {
		// set bg color to blue
		game.stage.backgroundColor = '#E8AA14';
		var treat = game.add.sprite(655, 250, 'treat1');
		var treat2 = game.add.sprite(690, 250, 'treat2');
		var obs = game.add.sprite(820, 240, 'spilledTrash');
		printMessages('Dog Chase!', 'You are a dog who needs training. Use UP key to jump! Collect                 and avoid      ','Hit too many obstacles and the trainer will leave you for good. Press [Space] to begin.');

	},
	update: function(){
		//go to play stage when spacebar is pressed
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.state.start('Play', true, false, this.score, this.life);
		}
	}
}

// define Play state and methods
var Play = function(game) {};
Play.prototype = {
	init: function(scr, life) {
		// get score & life from previous state
		this.score = scr;
		this.life = life;
	},
	create: function() {
		//reset object speed, level, score, and life
		objectSpeed = -200;
		level = 0;
		this.score=0;
		this.life=1;

		//setup level up counter
		levelCounter = game.time.create(false);
		levelCounter.loop(1000, levelBump, this); 
		levelCounter.start();	

		//enable Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//add game background
		background = game.add.sprite(0,0,'sky');
		background.scale.setTo(20,20);

		//create timer
		timer = game.time.create(false);

		//Set a TimerEvent to occur after 1 seconds
    	timer.loop(1000, counter, this);
    
    	timer.start();

    	function counter(){
        	this.score++;  //make the score goes up by time
        	scoreText.text = 'score: ' + this.score;
    	}

    	//create cloud timers and clouds group
    	this.cloudTimer1 = timer.loop(0, createCloud1, this);
    	this.cloudTimer2 = timer.loop(0, createCloud2, this);
    	this.cloudTimer3 = timer.loop(0, createCloud3, this);
    	this.cloudTimer4 = timer.loop(0, createCloud4, this);
    	this.cloudTimer5 = timer.loop(0, createCloud5, this);
    	clouds = game.add.group();
		game.physics.enable(clouds, Phaser.Physics.ARCADE);
		clouds.enableBody = true;

		//add benches group
		benches = game.add.group();
		game.physics.arcade.enable(benches);
		benches.enableBody = true;

		//create timer to spawn bench every 20 seconds
		game.time.events.repeat(Phaser.Timer.SECOND*20, 400, createBench, this);


		//add game sounds and music
		collectSound = game.add.audio('collectible');
		collideObstacleSound = game.add.audio('collideObstacleSound');
		collideObstacleSound.volume = 0.6;
		jumpSound = game.add.audio('jumpSound');
		jumpSound.volume = 0.6;
		posDropSound = game.add.audio('posDropSound');
		posDropSound.volume = 0.8;
		negCollideSound = game.add.audio('negCollideSound');
		negCollideSound.volume =1.3;
		enemySound = game.add.audio('die');
		endgame = game.add.audio('endgame');
		endgame.volume = 5;
		backSound = game.add.audio('backMusic');
		backSound.volume = 1.1;
		backSound.loop=true; //loop background music
		backSound.play();

		//create platforms group
		platforms = game.add.group();
		platforms.enableBody = true; //enable physics for platforms

		//create ground
		var ground = platforms.create(0, game.world.height-60, 'ground');
		ground.scale.setTo(60, 2); //scale ground
		ground.body.immovable = true; //prevent ground from moving
	
	
		//create enemies at different locations and enable physics
		enemy = game.add.sprite(350, game.height-168, 'atlas1', 'walk1');
		game.physics.arcade.enable(enemy);
		enemy.body.collideWorldBounds = false; 
		enemy.animations.add('walk',['walk1', 'walk2', 'walk3', 'walk4'], 5, true); //create enemy left movement

		//create player
		player = game.add.sprite(32, game.height-135, 'atlas2', 'dog_1');

		//enable physics and set bounce and gravity for player 
		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.2; 
		player.body.gravity.y = 800; 
		player.body.collideWorldBounds = true; //prevent player from going off screen

		//create player animations and set speed of dog animations
		player.animations.add('run', ['dog_1', 'dog_2','dog_3', 'dog_4', 'dog_5', 'dog_6'], 14, true);
		player.animations.add('jump', ['dog_1'], 0, true);

    	
    	//create timer to spawn obstacles 
		this.dropObstacleTimer = timer.loop(0, createObstacle, this);
		this.dropObstacle2Timer = timer.loop(0, createObstacle2, this);

		//add obstacles group
		obstacles = game.add.group();
		game.physics.enable(obstacles, Phaser.Physics.ARCADE);
		obstacles.enableBody = true;

		obstacles2 = game.add.group();
		game.physics.enable(obstacles2, Phaser.Physics.ARCADE);
		obstacles2.enableBody = true;

		spilledTrashes = game.add.group();
		game.physics.enable(spilledTrashes, Phaser.Physics.ARCADE);
		spilledTrashes.enableBody = true;
	

		//create timer to spawn treats 
		this.dropTreatTimer = timer.loop(0, createTreat, this);

		
		//add treats group
		treats = game.add.group();
		treats.enableBody = true;

		//add stars group
		stars = game.add.group();
		stars.enableBody = true;

    	// add rain to the game to make it interesting
    	rains = game.add.group();
    	rains.enableBody = true;
   		rains.physicsBodyType = Phaser.Physics.ARCADE;

		//set score's text size, color, and position
		scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});

	},
	update: function() {	
		//create collision variable for player and platform
		var hitPlatform = game.physics.arcade.collide(player, platforms);

		//collision of platform and treats
		game.physics.arcade.collide(platforms, treats);

		//set player velocity to 0 
		player.body.velocity.x = 0;

		//play enemy animations
		enemy.animations.play('walk');
		//player.animations.play('run');

		//enables Phaser Keyboard manager
		cursors = game.input.keyboard.createCursorKeys();

		
		if(player.body.touching.down && hitPlatform){
			player.animations.play('run');
		}

		//allow player to jump when on ground
		if (cursors.up.isDown && player.body.touching.down && hitPlatform){
			player.animations.play('jump');
			jumpSound.play();
			player.body.velocity.y = -400;
		}
		if(cursors.up.isDown && !player.body.touching.down){
			player.animations.play('jump');
			jumpSound.play();
			player.body.velocity.y = -400;  //HOW TO DO DOUBLE JUMP
		}

		
		//check for player collision with obstacle
		game.physics.arcade.overlap(player, spilledTrashes, hitObstacle, null, this);

		//check for player collision with obstacle
		game.physics.arcade.overlap(player, obstacles2, hitObstacle2, null, this);

		//check for enemy collision with obstacle
		game.physics.arcade.overlap(enemy, obstacles, hitTrash, null, this);

		//check for player overlap with treat
		game.physics.arcade.overlap(player, treats, collectTreat, null, this);

		//Make the timers delay randomly
		this.cloudTimer1.delay = game.rnd.integerInRange(1000,7000);
    	this.cloudTimer2.delay = game.rnd.integerInRange(1000,7000);
    	this.cloudTimer3.delay = game.rnd.integerInRange(1000,7000);
    	this.cloudTimer4.delay = game.rnd.integerInRange(1000,7000);
    	this.cloudTimer5.delay = game.rnd.integerInRange(1000,7000);
		this.dropTreatTimer.delay = game.rnd.integerInRange(1000,7000);
		this.dropObstacleTimer.delay = game.rnd.integerInRange(2000,5000);
		this.dropObstacle2Timer.delay = game.rnd.integerInRange(2000, 5000);

		//go to game over screen if AI goes off screen
		if (enemy.body.x>=game.width){
			enemy.kill();
			this.life--;
			backSound.stop();
			jumpSound.stop();
			collectSound.stop();
			collideObstacleSound.stop();
			negCollideSound.stop();
			posDropSound.stop();
		}

		//go to game over screen when player has no more lives (touches AI)
		if (this.life < 1){
			levelCounter.stop();
			game.state.start('GameOver', true, false, this.score, this.life);
		}
	},
}

// define GameOver state and methods
var GameOver = function(game) {};
GameOver.prototype = {
	init: function(scr, life) {
		//get score and life
		this.score = scr;
		this.life = life;
	},
	create: function() {
		//play game over sound
		enemySound.play();
		//play game over music
		endgame.play();
		//set bg to blue and print game over messages
		game.stage.backgroundColor = '#4488AA';
		printMessages('Game Over', 'Final Score: ' + this.score, 'Press [SPACE] to Retry');
	},
	update: function() {
		//go back to menu when spacebar is pressed
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			endgame.stop();
			game.state.start('Play');
		}
	}
}

function levelBump() {
		// increase object speed, increment level
		level = level + 1;
		objectSpeed= objectSpeed - 5;

		if(level%5==0){
			//play a level up sound! 

			// scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});

		// 	let color = colors[colorIndex].toString(16);	// get color at index, convert to hex
		// 	if(colorIndex < colors.length-1) {	// increment next index value
		// 		colorIndex++; 
		// 	} else { 
		// 		colorIndex = 0;
		// 	}
		// 	// document.getElementById('myGame').style.borderColor = '#' + color;	// change border
		 }

		if(level%50 == 0) {
		 	// increase audio rate at higher level
			backSound._sound.playbackRate.value += 0.020;
		}

		if(level==30){
			//create timer to drop second treat randomly
			this.dropTreat2Timer = timer.loop(0, createTreat2, this);
			this.dropTreat2Timer.delay = game.rnd.integerInRange(2000,9000);
			
			//create rain effect
			for (var y = 0; y < 30; y++){
        		for (var x = 0; x < 60; x++){
            		rain = rains.create( x * Math.random() *  50, y * Math.random() *  100, 'rain');
            		rain.alpha = 0.3; 
            		rain.scale.setTo(0.01);
            		rain.checkWorldBounds = true;
            		rain.events.onOutOfBounds.add(rainOut, this);
            		rain.body.velocity.y = 50 + Math.random() * 200; //set rain speed
        		}
    		}
		}
		// // decrease player scale at level 50
		// if(level == 50) {
		// 	player.scale= player.scale - 10;
		// }

		// // make player smaller at higher level
		// if(level == 100) {
		// 	player.scale= player.scale-10;
		// }
	}
    	// function of rain go out
 		function rainOut(rain) {
    	//  Move the rain to the top of the screen again
   		rain.reset(rain.x, 0);

    	//  And give it a new random velocity
    	rain.body.velocity.y = 50 + Math.random() * 200;

		}

function printMessages(top_msg, mid_msg, btm_msg) {
	//print messages for main menu and gameover screens
	let message = '';
    let style1 = { font: '28px Helvetica', fill: '#FFF', align: "center" };
    let style2 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
    let style3 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
	message = game.add.text(400, game.world.centerY-40, top_msg, style1);
	message = game.add.text(150, game.world.centerY+48, mid_msg, style2);
	message = game.add.text(150, game.world.centerY+86, btm_msg, style3);
}

function collectTreat (player, treat){
	//play sound when treat is collected
	collectSound.play();
	collideObstacleSound.stop();
 	//delete treat from screen
	treat.kill();
	//create star effect
	var emitter = game.add.emitter(player.body.x+55, player.body.y-20, 5);
	emitter.makeParticles('star');	//image for particles
	emitter.setAlpha(0.5, 1);		// set particle alpha (min, max)
	emitter.minParticleScale = 0.4;	// set min/max particle size
	emitter.maxParticleScale = 0.6;
	emitter.setXSpeed(-50,100);		// set min/max horizontal speed
	emitter.setYSpeed(-500,100);	// set min/max vertical speed
	emitter.start(true, 2000, null, 200);

 	//increase score by 5 when treat is collected
	this.score = this.score + 5; 
	scoreText.text = 'score: ' + this.score;
}

function createTreat(){
	//play positive sound when treat is dropped
	posDropSound.play();
	//spawn treat at random location
	for (var i=0; i< Math.random(); i++){
		treat1 = treats.create((enemy.body.x-10)-(Math.random()*100), this.game.height-100, 'treat1');
		treat1.body.velocity.x = objectSpeed;
		treat1.body.gravity.y = 50;
		treat1.body.bounce.y = 0.5 + Math.random() * 0.3;
	}
}

function createTreat2(){
	//play positive sound when treat is dropped
	posDropSound.play();
	//spawn treat at random location
	for (var i=0; i< Math.random(); i++){
		treat2 = treats.create((enemy.body.x-10)-(Math.random()*100), this.game.height-100, 'treat2');
		treat2.body.velocity.x = objectSpeed;
		treat2.body.gravity.y = 50;
		treat2.body.bounce.y = 0.5 + Math.random() * 0.3;
	}
}

function createObstacle(){
	//spawn obstacle at random location
	for (var i=0; i<Math.random(); i++){
		trash = obstacles.create(game.world.width, this.game.height-85, "trash");
		trash.body.velocity.x = objectSpeed;
	}
}
function createObstacle2(){
	//play negative sound when obstacle is dropped
    collideObstacleSound.play();
	for (var i=0; i<Math.random(); i++){
		obstacle2 = obstacles2.create((enemy.body.x-10)-(Math.random()*100), this.game.height-100, 'obstacle2');
		obstacle2.body.velocity.x = objectSpeed;
	}
}

function hitTrash(enemy, obstacle){
	//kill unspilled trash from screen
	obstacle.kill();
    //play negative sound when obstacle is dropped
    collideObstacleSound.play();
	//spawn spilled trash as if enemy kicked trash can
	for (var i=0; i<Math.random(); i++){
		trash1= spilledTrashes.create(enemy.body.x-10, this.game.height-70, 'spilledTrash');
    	trash1.body.velocity.x = objectSpeed;
   }
}

function createBench(){
	//create bench
	var bench = benches.create(game.world.width, game.world.height-96, 'bench');
	bench.body.velocity.x = objectSpeed;
}

//spawn 5 randomly sized clouds at random locations
function createCloud1(){
	for (var i=0; i<Math.random(); i++){
		cloud1 = clouds.create(game.world.width-5, game.rnd.integerInRange(2, game.world.height-200), 'cloud1');
		cloud1.body.velocity.x = objectSpeed;
		cloud1.scale.setTo(game.rnd.integerInRange(0.5, 1));
	}
}
function createCloud2(){
	for (var i=0; i<Math.random(); i++){
		cloud2 = clouds.create(game.world.width-5, game.rnd.integerInRange(2, game.world.height-200), 'cloud2');
		cloud2.body.velocity.x = objectSpeed;
		cloud2.scale.setTo(game.rnd.integerInRange(0.5, 1));
	}
}
function createCloud3(){
	for (var i=0; i<Math.random(); i++){
		cloud3 = clouds.create(game.world.width-5, game.rnd.integerInRange(2, game.world.height-200), 'cloud3');
		cloud3.body.velocity.x = objectSpeed;
		cloud3.scale.setTo(game.rnd.integerInRange(0.5, 1));
	}
}
function createCloud4(){
	for (var i=0; i<Math.random(); i++){
		cloud4 = clouds.create(game.world.width-5, game.rnd.integerInRange(2, game.world.height-200), 'cloud4');
		cloud4.body.velocity.x = objectSpeed;
		cloud4.scale.setTo(game.rnd.integerInRange(0.5, 1));
	}
}
function createCloud5(){
	for (var i=0; i<Math.random(); i++){
		cloud5 = clouds.create(game.world.width-5, game.rnd.integerInRange(2, game.world.height-200), 'cloud5');
		cloud5.body.velocity.x = objectSpeed;
		cloud5.scale.setTo(game.rnd.integerInRange(0.5, 1));
	}
}

function hitObstacle(player, spilled) {
 	//play collision sound when player hits obstacle
 	negCollideSound.play();
 	// collideObstacleSound.play();
 	collectSound.stop();

 	//destroy spilled trash from screen and lower score
 	spilled.kill();
 	this.score = this.score - 5;
 	scoreText.text = 'score: ' + this.score;
 	enemy.body.x = enemy.body.x + 50; //each time player hits obstacle, increase distance between player and enemy
 }
 function hitObstacle2(player, obs2){
 	//play collision sound when player hits obstacle
 	negCollideSound.play();
 	// collideObstacleSound.play();
 	collectSound.stop();
 	obs2.kill();
 	this.score = this.score - 5;
 	scoreText.text = 'score: ' + this.score;
 	enemy.body.x = enemy.body.x + 50; //each time player hits obstacle, increase distance between player and enemy

 }

//add all game states to game and start game with main menu screen
game.state.add('MainMenu', MainMenu);
game.state.add('Play', Play);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');
