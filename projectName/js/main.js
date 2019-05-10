'use strict';

// define game and game variables
var game = new Phaser.Game(1000, 400, Phaser.AUTO, 'phaser');
var scoreText;
var platforms;
var player;
var enemy;
var treats;
var pickup2;
var obstacles;
var playerVelocity = 50;
var obstacleSpeed = -100;
var extremeMODE;
var level=0;
var highScore;
var newHighScore;
var cursors;
var collectSound;
var enemySound;
var backSound;
var time=0;
// define MainMenu state and methods
var MainMenu = function(game) {};
MainMenu.prototype = {
		//load game assets
		preload: function() {
		game.load.path = 'assets/img/'; 
		game.load.image('treat','treat.png'); //star asset from CMPM120 class example
		game.load.image('ground', 'platform.png');
		game.load.image('obstacle1', 'obstacle1.png'); 
		game.load.atlasJSONHash('atlas1', 'AI.png', 'AI.json'); 
		game.load.image('sky', 'sky.png');
		game.load.atlasJSONHash('atlas2', 'dog.png', 'dog.json');
		

		// load audio assets
		game.load.path = 'assets/audio/';
		game.load.audio('collectible', ['collectible.mp3']); //collectible sound
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
		printMessages('Dog Run!', 'Use UP key to jump','Press [Space] to begin');

	},
	update: function() {
		// go to play stage when spacebar is pressed
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.state.start('Play', true, false, this.score, this.life);
		}
	}
}

// define Play state and methods
var Play = function(game) {
	
	// this.planet;
};
Play.prototype = {
	init: function(scr, life) {
		// get score & life from previous state
		this.score = scr;
		this.life = life;

	},
	create: function() {
		//enable Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);
		//add game background
		game.add.sprite(0,0,'sky');
		collectSound = game.add.audio('collectible');
		enemySound = game.add.audio('die');
		backSound = game.add.audio('backMusic');
		backSound.loop=true;
		backSound.play();

		//create platforms group
		platforms = game.add.group();
		platforms.enableBody = true; //enable physics for platforms

		//create ground
		var ground = platforms.create(0, game.world.height-60, 'ground');
		ground.scale.setTo(2, 2); //scale ground
		ground.body.immovable = true; //prevent ground from moving
		

		//create enemies at different locations and enable physics
		enemy = game.add.sprite(350, game.height-177, 'atlas1', 'walk1');
		game.physics.arcade.enable(enemy);
		enemy.body.collideWorldBounds = true; 
		enemy.animations.add('walk',['walk1', 'walk2'], 5, true); //create enemy left movement

			// 	// setup planet group
		// this.planetGroup = game.add.group();
		// this.addPlanet(this.planetGroup);

		//create player
		player = game.add.sprite(32, game.height-148, 'atlas2', 'dog_1');

		//enable physics and set bounce and gravity for player 
		game.physics.arcade.enable(player);
		// player.body.drag.set(6500);
		player.body.bounce.y = 0.2; 
		player.body.gravity.y = 600; 
		player.body.collideWorldBounds = true; //prevent player from going off screen
		//player.body.immovable = true;

		//create player animation
		player.animations.add('right', ['dog_1', 'dog_2'], 5, true);


	
		obstacles = game.add.group();
		obstacles.enableBody = true;
		//for (var k=0; k<1000; k++){
			var obstacle1 =  obstacles.create(enemy.body.x-10, enemy.body.y+80, 'obstacle1');
			obstacle1.body.velocity.x = obstacleSpeed;

		//}
		// 	//for (var k=0; k<1000; k++){
		// 	var planet =  planets.create(enemy.body.x-10 * k +Math.random(), enemy.body.y+60, 'planet');
		// 	planet.body.velocity.x = planetSpeed;

		// //}

		//add star group
		treats = game.add.group();
		treats.enableBody = true;

		var treat =  treats.create(enemy.body.x-80, enemy.body.y+80, 'treat');
		treat.body.velocity.x = obstacleSpeed;
		treat.body.bounce.y = 0.5;
		//create 12 stars with gravity and bounce
		// for (var i = 0; i < 12; i++){
		// 	var star = stars.create(i * 50, 0, 'star');
		// 	star.body.gravity.y = 60;
		// 	star.body.bounce.y = 0.5 + Math.random() * 0.2;
		// }
	
		// this.planet = new Planet(game, planetSpeed, Phaser.Color.getRandomColor(0, 255, 255));
		// game.add.existing(this.planet);
	

		//for (var i=0; i < 100; i++){
			//this.planet = new Planet(game, planetSpeed, enemy.body.x, enemy.body.y+50);
			//game.add.existing(this.planet);
		//}

		//set score's text size, color, and position
		scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});

	},
	update: function() {
		var hitPlatform = game.physics.arcade.collide(player, platforms);
		level = level + 1;

		var obstacle1New;
		var treatNew;
		if (level%150==0){
		 	obstacle1New = obstacles.create(enemy.body.x-10, enemy.body.y+80, 'obstacle1');
		 	obstacle1New.body.velocity.x = obstacleSpeed;
		 	game.physics.arcade.overlap(player, obstacles, hitObstacle, null, this);

		 	treatNew =  treats.create(enemy.body.x-50, enemy.body.y+80, 'treat');
			treatNew.body.velocity.x = obstacleSpeed;
			treatNew.body.bounce.y = 0.5;
			game.physics.arcade.overlap(player, treats, collectTreat, null, this);
		  
		}
	

		//set player velocity to 0 
		player.body.velocity.x = 0;

		//play enemy animations
		enemy.animations.play('walk');
		player.animations.play('right');

		//enables Phaser Keyboard manager
		cursors = game.input.keyboard.createCursorKeys();

		// if (cursors.left.isDown){
		// 	//move player to left
		// 	player.body.velocity.x = -150;
		// }
		// if (cursors.right.isDown){
		// 	//move player to right
		// 	player.body.velocity.x = 150;
		// 	player.animations.play('right');
		// }

		//allow player to jump when on ground
		if (cursors.up.isDown && player.body.touching.down && hitPlatform){
			player.body.velocity.y = -400;
		}
		//check for star collision with platform
		game.physics.arcade.collide(treats, platforms);

	//check for player collision with obstacle
		game.physics.arcade.overlap(player, obstacles, hitObstacle, null, this);

		//check for player overlap with star
		game.physics.arcade.overlap(player, treats, collectTreat, null, this);

		//check for player collision with enemy
		game.physics.arcade.overlap(player, enemy, hitEnemy, null, this);


		// check for collision
		// if(!player.destroyed) {
		// 	game.physics.arcade.collide(player, this.planetGroup, this.planetCollision, null, this);
		// }
		// // check for collision
		//  if(!player.destroyed) {
		//  	game.physics.arcade.collide(player, this.planet, this.playerCollision, null, this);
		//  }

		// game.physics.arcade.overlap(player, planet, this.planetCollision, null, this);

		//go to game over screen when player has no more lives (touches AI)
		if (this.life < 1){
			game.state.start('GameOver', true, false, this.score, this.life);
		}
	},

	// addPlanet: function(group){
	// 	// construct new Planet object, add it to the game world and group
	// 	//if (level%5==0){
	// 	// //var planet = new Planet(game, planetSpeed, enemy.body.x-100, enemy.body.y+100);
	// 	// game.add.existing(planet);
	// 	// group.add(planet);
	// 	//}
	// },

	// planetCollision: function(player, planet){
 // 		planet.kill();
 // 		this.score = this.score - 5;
 // 		scoreText.text = 'score: ' + this.score;
 // 	}

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
	//play sound when star is collected
	collectSound.play();
 	//delete star from screen
	treat.kill();
 	//increase score by 10 when star is collected
	this.score = this.score + 5; 
	scoreText.text = 'score: ' + this.score;
}

 function hitObstacle(player, obstacle) {

 	obstacle.kill();
 	this.score = this.score - 5;
 	scoreText.text = 'score: ' + this.score;
 	//add distance stuff
 }

 //  function hitNew(player, planetNew) {
 // 	planetNew.kill();
 // 	this.score = this.score - 5;
 // 	scoreText.text = 'score: ' + this.score;
 // 	//add distance stuff
 // }

 function hitEnemy (player, enemy){ 
	//delete enemy from screen and decrease player's life
	enemySound.play();
	backSound.stop();
	collectSound.stop();
	enemy.kill();
	this.life--; 
 }



//add all game states to game and start game with main menu screen
game.state.add('MainMenu', MainMenu);
game.state.add('Play', Play);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');
