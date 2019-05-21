//Team Name: Area 53
//Team Members: Cheryl Kulkarni, Galen Turoci, Hongyu Chen
//Group 53
//GitHub Repository: https://github.com/chkulkar/EndlessRunner
'use strict';
// define game and game variables
var game = new Phaser.Game(1400, 400, Phaser.AUTO, 'phaser');
var scoreText;
var levelCounter;
var platforms;
var player;
var enemy;
var treats;
var pickup2;
var obstacles;
var playerVelocity = 50;
var objectSpeed = -90;
var cursors;
var collectSound;
var collideObstacleSound;
var posDropSound;
var negDropSound;
var enemySound;
var backSound;
var level=0;
var background;
// define MainMenu state and methods
var MainMenu = function(game) {};
MainMenu.prototype = {
		//load game assets
		preload: function() {
		game.load.path = 'assets/img/'; 
		game.load.image('treat1','treat.png'); 
		game.load.image('ground', 'platform.png');
		game.load.image('obstacle1', 'obstacle1.png'); 
		game.load.atlasJSONHash('atlas1', 'AI.png', 'AI.json'); 
		game.load.image('sky', 'sky.png');
		game.load.atlasJSONHash('atlas2', 'dog.png', 'dog.json');
		
		// load audio assets
		game.load.path = 'assets/audio/';
		game.load.audio('collideObstacleSound',['collideSound.mp3']); //collision with obstacle sound 
		game.load.audio('collectible', ['collectible.mp3']); //collectible sound
		game.load.audio('posDropSound',['posDrop.mp3']); //sound played when treat is dropped
		game.load.audio('negDropSound', ['negDrop.mp3']); //sound played when obstacle is dropped
		game.load.audio('backMusic', ['backMusic.mp3']); //background music
		game.load.audio('die', ['die.mp3']); //death sound
	},
	init: function() {
		this.score = 0; // tracks the player's score
		this.life = 1;	// tracks the player's life
	},
	create: function() {
		// set bg color to blue
		game.stage.backgroundColor = '#4488AA';
		printMessages('Dog Chase!', 'Use UP key to jump! Collect treats and avoid obstacles.','Press [Space] to begin');

	},
	update: function() {
		// go to play stage when spacebar is pressed
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
		//setup level up counter
		levelCounter = game.time.create(false);
		levelCounter.loop(1000, levelBump, this); 
		levelCounter.start();	

		//enable Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//add game background and sounds
		background = game.add.sprite(0,0,'sky');
		background.scale.setTo(2,2);

		collectSound = game.add.audio('collectible');
		collideObstacleSound = game.add.audio('collideObstacleSound');
		posDropSound = game.add.audio('posDropSound');
		negDropSound = game.add.audio('negDropSound');
		enemySound = game.add.audio('die');
		backSound = game.add.audio('backMusic');
		backSound.loop=true; //loop background music
		backSound.play();

		//create platforms group
		platforms = game.add.group();
		platforms.enableBody = true; //enable physics for platforms

		//create ground
		var ground = platforms.create(0, game.world.height-60, 'ground');
		ground.scale.setTo(3, 2); //scale ground
		ground.body.immovable = true; //prevent ground from moving
		
		//create enemies at different locations and enable physics
		enemy = game.add.sprite(350, game.height-177, 'atlas1', 'walk1');
		game.physics.arcade.enable(enemy);
		enemy.body.collideWorldBounds = false; 
		enemy.animations.add('walk',['walk1', 'walk2'], 5, true); //create enemy left movement

		//create player
		player = game.add.sprite(32, game.height-148, 'atlas2', 'dog_1');

		//enable physics and set bounce and gravity for player 
		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.2; 
		player.body.gravity.y = 550; 
		player.body.collideWorldBounds = true; //prevent player from going off screen

		//create player animation
		player.animations.add('right', ['dog_1', 'dog_2'], 5, true);

		//create timer to spawn obstacles repeatedly
		game.time.events.repeat(Phaser.Timer.SECOND*2, 100, createObstacle, this);
	
		//add obstacles group
		obstacles = game.add.group();
		game.physics.enable(obstacles, Phaser.Physics.ARCADE);
		obstacles.enableBody = true;

		//create timer to spawn treats repeatedly
		//game.time.events.repeat(Phaser.Timer.SECOND*(game.rnd.integerInRange(2,3)), 100, createTreat, this);
		game.time.events.repeat(Phaser.Timer.SECOND*3, 100, createTreat, this);

		//add treats group
		treats = game.add.group();
		treats.enableBody = true;

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
		player.animations.play('right');

		//enables Phaser Keyboard manager
		cursors = game.input.keyboard.createCursorKeys();

		//allow player to jump when on ground
		if (cursors.up.isDown && player.body.touching.down && hitPlatform){
			player.body.velocity.y = -400;
		}

		//check for player collision with obstacle
		game.physics.arcade.overlap(player, obstacles, hitObstacle, null, this);

		//check for player overlap with treat
		game.physics.arcade.overlap(player, treats, collectTreat, null, this);

		//go to game over screen if AI goes off screen
		if (enemy.body.x>=game.width){
			enemy.kill();
			this.life--;
			backSound.stop();
			collectSound.stop();
			collideObstacleSound.stop();
			negDropSound.stop();
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
		//set bg to blue and print game over messages
		game.stage.backgroundColor = '#4488AA';
		printMessages('Game Over', 'Final Score: ' + this.score, 'Press [SPACE] to Retry');
	},
	update: function() {
		
		//go back to menu when spacebar is pressed
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.state.start('MainMenu');
		}
	}
}

function levelBump() {
		// increase object speed, increment level
		level = level + 1;
		objectSpeed= objectSpeed - 2;

		if(level%50 == 0) {
		 	// increase audio rate at higher level
			backSound._sound.playbackRate.value += 0.00020;
		}
		// decrease player scale at level 50
		if(level == 50) {
			player.scale.setTo(0.8);
		}

		// make player smaller at higher level
		if(level == 100) {
			player.scale.setTo(0.7);
		}
	}

function printMessages(top_msg, mid_msg, btm_msg) {
	//print messages for main menu and gameover screens
	let message = '';
    let style1 = { font: '28px Helvetica', fill: '#FFF', align: "center" };
    let style2 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
    let style3 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
	message = game.add.text(50, game.world.centerY, top_msg, style1);
	message = game.add.text(50, game.world.centerY+48, mid_msg, style2);
	message = game.add.text(50, game.world.centerY+86, btm_msg, style3);
}

function collectTreat (player, treat){
	//play sound when treat is collected
	collectSound.play();
	collideObstacleSound.stop();
 	//delete treat from screen
	treat.kill();
 	//increase score by 5 when treat is collected
	this.score = this.score + 5; 
	scoreText.text = 'score: ' + this.score;
}

function createTreat(){
	//play positive sound when treat is dropped
	posDropSound.play();
	//spawn treat at random location
	for (var i=0; i< Math.random(); i++){
		var treat1 = treats.create((enemy.body.x-10)-(Math.random()*100), this.game.height-100, 'treat1');
		treat1.scale.setTo(0.9);
		treat1.body.velocity.x = objectSpeed-90;
		treat1.body.gravity.y = 100;
		treat1.body.bounce.y = 0.5 + Math.random() * 0.3;
	}
}

function createObstacle(){
	//play negative sound when obstacle is dropped
	negDropSound.play();
	//spawn obstacle at random location
	for (var i=0; i< Math.random(); i++){
		var obstacle1 = obstacles.create((enemy.body.x-10)-(Math.random()*100), this.game.height-75, 'obstacle1');
		obstacle1.scale.setTo(1.3);
        obstacle1.body.velocity.x = objectSpeed;
	}
}
 function hitObstacle(player, obstacle) {
 	//play collision sound when player hits obstacle
 	collideObstacleSound.play();
 	collectSound.stop();
 	//destroy obstacle from screen and lower score
 	obstacle.kill();
 	this.score = this.score - 5;
 	scoreText.text = 'score: ' + this.score;
 	enemy.body.x = enemy.body.x + 50; //each time player hits obstacle, increase distance between player and enemy
 }

//add all game states to game and start game with main menu screen
game.state.add('MainMenu', MainMenu);
game.state.add('Play', Play);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');








// //Team Name: Area 53
// //Team Members: Cheryl Kulkarni, Galen Turoci, Hongyu Chen
// //Group 53
// //GitHub Repository: https://github.com/chkulkar/EndlessRunner
// 'use strict';
// // define game and game variables
// var game = new Phaser.Game(1400, 400, Phaser.AUTO, 'phaser');
// var scoreText;
// var levelCounter;
// var platforms;
// var player;
// var enemy;
// var treats;
// var pickup2;
// var obstacles;
// var playerVelocity = 50;
// var objectSpeed = -90;
// var cursors;
// var collectSound;
// var collideObstacleSound;
// var posDropSound;
// var negDropSound;
// var enemySound;
// var backSound;
// var level=0;
// var background;
// // define MainMenu state and methods
// var MainMenu = function(game) {};
// MainMenu.prototype = {
// 		//load game assets
// 		preload: function() {
// 		game.load.path = 'assets/img/'; 
// 		game.load.image('treat1','treat.png'); 
// 		game.load.image('ground', 'platform.png');
// 		game.load.image('obstacle1', 'obstacle1.png'); 
// 		game.load.atlasJSONHash('atlas1', 'AI.png', 'AI.json'); 
// 		game.load.image('sky', 'sky.png');
// 		game.load.atlasJSONHash('atlas2', 'dog.png', 'dog.json');
		
// 		// load audio assets
// 		game.load.path = 'assets/audio/';
// 		game.load.audio('collideObstacleSound',['collideSound.mp3']); //collision with obstacle sound 
// 		game.load.audio('collectible', ['collectible.mp3']); //collectible sound
// 		game.load.audio('posDropSound',['posDrop.mp3']); //sound played when treat is dropped
// 		game.load.audio('negDropSound', ['negDrop.mp3']); //sound played when obstacle is dropped
// 		game.load.audio('backMusic', ['backMusic.mp3']); //background music
// 		game.load.audio('die', ['die.mp3']); //death sound
// 	},
// 	init: function() {
// 		this.score = 0; // tracks the player's score
// 		this.life = 1;	// tracks the player's life
// 	},
// 	create: function() {
// 		// set bg color to blue
// 		game.stage.backgroundColor = '#4488AA';
// 		printMessages('Dog Chase!', 'Use UP key to jump! Collect treats and avoid obstacles.','Press [Space] to begin');

// 	},
// 	update: function() {
// 		// go to play stage when spacebar is pressed
// 		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
// 			game.state.start('Play', true, false, this.score, this.life);
// 		}
// 	}
// }

// // define Play state and methods
// var Play = function(game) {};
// Play.prototype = {
// 	init: function(scr, life) {
// 		// get score & life from previous state
// 		this.score = scr;
// 		this.life = life;
// 	},
// 	create: function() {
// 		//setup level up counter
// 		levelCounter = game.time.create(false);
// 		levelCounter.loop(1000, levelBump, this); 
// 		levelCounter.start();	

// 		//enable Arcade Physics system
// 		game.physics.startSystem(Phaser.Physics.ARCADE);

// 		//add game background and sounds
// 		background = game.add.sprite(0,0,'sky');
// 		background.scale.setTo(2,2);

// 		collectSound = game.add.audio('collectible');
// 		collideObstacleSound = game.add.audio('collideObstacleSound');
// 		posDropSound = game.add.audio('posDropSound');
// 		negDropSound = game.add.audio('negDropSound');
// 		enemySound = game.add.audio('die');
// 		backSound = game.add.audio('backMusic');
// 		backSound.loop=true; //loop background music
// 		backSound.play();

// 		//create platforms group
// 		platforms = game.add.group();
// 		platforms.enableBody = true; //enable physics for platforms

// 		//create ground
// 		var ground = platforms.create(0, game.world.height-60, 'ground');
// 		ground.scale.setTo(3, 2); //scale ground
// 		ground.body.immovable = true; //prevent ground from moving
		
// 		//create enemies at different locations and enable physics
// 		enemy = game.add.sprite(350, game.height-177, 'atlas1', 'walk1');
// 		game.physics.arcade.enable(enemy);
// 		enemy.body.collideWorldBounds = false; 
// 		enemy.animations.add('walk',['walk1', 'walk2'], 5, true); //create enemy left movement

// 		//create player
// 		player = game.add.sprite(32, game.height-148, 'atlas2', 'dog_1');

// 		//enable physics and set bounce and gravity for player 
// 		game.physics.arcade.enable(player);
// 		player.body.bounce.y = 0.2; 
// 		player.body.gravity.y = 550; 
// 		player.body.collideWorldBounds = true; //prevent player from going off screen

// 		//create player animation
// 		player.animations.add('right', ['dog_1', 'dog_2'], 5, true);

// 		//create timer to spawn obstacles repeatedly
// 		game.time.events.repeat(Phaser.Timer.SECOND*2, 100, createObstacle, this);
	
// 		//add obstacles group
// 		obstacles = game.add.group();
// 		game.physics.enable(obstacles, Phaser.Physics.ARCADE);
// 		obstacles.enableBody = true;

// 		//create timer to spawn treats repeatedly
// 		game.time.events.repeat(Phaser.Timer.SECOND*(game.rnd.integerInRange(2,3)), 100, createTreat, this);

// 		//add treats group
// 		treats = game.add.group();
// 		game.physics.enable(treats, Phaser.Physics.ARCADE);
// 		treats.enableBody = true;

// 		//set score's text size, color, and position
// 		scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});

// 	},
// 	update: function() {
// 		//create collision variable for player and platform
// 		var hitPlatform = game.physics.arcade.collide(player, platforms);

// 		//set player velocity to 0 
// 		player.body.velocity.x = 0;

// 		//play enemy animations
// 		enemy.animations.play('walk');
// 		player.animations.play('right');

// 		//enables Phaser Keyboard manager
// 		cursors = game.input.keyboard.createCursorKeys();

// 		//allow player to jump when on ground
// 		if (cursors.up.isDown && player.body.touching.down && hitPlatform){
// 			player.body.velocity.y = -400;
// 		}

// 		//check for player collision with obstacle
// 		game.physics.arcade.overlap(player, obstacles, hitObstacle, null, this);

// 		//check for player overlap with treat
// 		game.physics.arcade.overlap(player, treats, collectTreat, null, this);

// 		//check for obstacle collision with treat
// 		game.physics.arcade.overlap(obstacles, treats, obstacleHittreat, null, this);

// 		//go to game over screen if AI goes off screen
// 		if (enemy.body.x>=game.width){
// 			enemy.kill();
// 			this.life--;
// 			backSound.stop();
// 			collectSound.stop();
// 			collideObstacleSound.stop();
// 			negDropSound.stop();
// 			posDropSound.stop();
// 		}

// 		//go to game over screen when player has no more lives (touches AI)
// 		if (this.life < 1){
// 			levelCounter.stop();
// 			game.state.start('GameOver', true, false, this.score, this.life);
// 		}
// 	},
// }

// // define GameOver state and methods
// var GameOver = function(game) {};
// GameOver.prototype = {
// 	init: function(scr, life) {
// 		//get score and life
// 		this.score = scr;
// 		this.life = life;
// 	},
// 	create: function() {
// 		//play game over sound
// 		enemySound.play();
// 		//set bg to blue and print game over messages
// 		game.stage.backgroundColor = '#4488AA';
// 		printMessages('Game Over', 'Final Score: ' + this.score, 'Press [SPACE] to Retry');
// 	},
// 	update: function() {
		
// 		//go back to menu when spacebar is pressed
// 		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
// 			game.state.start('MainMenu');
// 		}
// 	}
// }

// function levelBump() {
// 		// increase object speed, increment level
// 		level = level + 1;
// 		objectSpeed= objectSpeed - 2;

// 		// // show timer outside canvas
// 		// document.getElementById('gameTitle').innerHTML = 'Galaxy Run! Score: ' + level + ' miles';

// 		if(level%50 == 0) {
// 		 	// increase audio rate at higher level
// 			backSound._sound.playbackRate.value += 0.00020;

// 		// 	// play level up sound
// 		// 	//this.levelup.play('', 0, 0.75, false);

// 		// 	// change border color
// 		// 	let color = colors[colorIndex].toString(16);	// get color at index, convert to hex
// 		// 	if(colorIndex < colors.length-1) {	// increment next index value
// 		// 		colorIndex++; 
// 		// 	} else { 
// 		// 		colorIndex = 0;
// 		// 	}
// 		// 	document.getElementById('myGame').style.borderColor = '#' + color;	// change border
// 		// 	document.getElementById('gameTitle').style.color = '#' + color;	// change title
// 		}
// 		// decrease player scale at level 50
// 		if(level == 50) {
// 			player.scale.setTo(0.8);
// 		}

// 		// make player smaller at higher level
// 		if(level == 100) {
// 			player.scale.setTo(0.7);
// 		}
// 	}

// function printMessages(top_msg, mid_msg, btm_msg) {
// 	//print messages for main menu and gameover screens
// 	let message = '';
//     let style1 = { font: '28px Helvetica', fill: '#FFF', align: "center" };
//     let style2 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
//     let style3 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
// 	message = game.add.text(50, game.world.centerY, top_msg, style1);
// 	message = game.add.text(50, game.world.centerY+48, mid_msg, style2);
// 	message = game.add.text(50, game.world.centerY+86, btm_msg, style3);
// }

// function collectTreat (player, treat){
// 	//play sound when treat is collected
// 	collectSound.play();
// 	collideObstacleSound.stop();
//  	//delete treat from screen
// 	treat.kill();
//  	//increase score by 5 when treat is collected
// 	this.score = this.score + 5; 
// 	scoreText.text = 'score: ' + this.score;
// }

// function createTreat(){
// 	//play positive sound when treat is dropped
// 	posDropSound.play();
// 	//spawn treat at random location
// 	for (var i=0; i< Math.random(); i++){
// 		var treat1 = treats.create((enemy.body.x-10)-(Math.random()*100), enemy.body.y+80, 'treat1');
// 		treat1.scale.setTo(0.9);
// 		treat1.body.velocity.x = objectSpeed;
// 		treat1.body.bounce.y = 0.5;
// 	}
// }

// function createObstacle(){
// 	//play negative sound when obstacle is dropped
// 	negDropSound.play();
// 	//spawn obstacle at random location
// 	for (var i=0; i< Math.random(); i++){
// 		var obstacle1 = obstacles.create((enemy.body.x-10)-(Math.random()*100), enemy.body.y+80, 'obstacle1');
// 		obstacle1.scale.setTo(0.9);
//         obstacle1.body.velocity.x = objectSpeed;
// 	}
// }
//  function hitObstacle(player, obstacle) {
//  	//play collision sound when player hits obstacle
//  	collideObstacleSound.play();
//  	collectSound.stop();
//  	//destroy obstacle from screen and lower score
//  	obstacle.kill();
//  	this.score = this.score - 5;
//  	scoreText.text = 'score: ' + this.score;
//  	enemy.body.x = enemy.body.x + 50; //each time player hits obstacle, increase distance between player and enemy
//  }

//  function obstacleHittreat(obstacles, treats){
//  	//destroy obstacle from screen
//  	obstacles.kill();
//  }

// //add all game states to game and start game with main menu screen
// game.state.add('MainMenu', MainMenu);
// game.state.add('Play', Play);
// game.state.add('GameOver', GameOver);
// game.state.start('MainMenu');
