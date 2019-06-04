//Team Name: Area 53
//Team Members: Cheryl Kulkarni, Galen Turoci, Hongyu Chen
//Group 53
//GitHub Repository: https://github.com/chkulkar/EndlessRunner
'use strict';
// define game and game variables
var game = new Phaser.Game(1000, 400, Phaser.AUTO, 'phaser');
var scoreText;
var levelCounter;
var platforms;
var benches;
var fence;
var rain;
var rains;
var player;
var enemy;
var treats;
var treat1;
var treat2;
var obstacles;
var obstacle1;
var stars;
var star;
var trash;
var trash1;
var objectSpeed = -170;
var cursors;
var collectSound;
var collideObstacleSound;
var posDropSound;
var negDropSound;
var enemySound;
var backSound;
var level=0;
var background;
var clouds;
var cloud1;
var cloud2;
var cloud3;
var cloud4;
var cloud5;
var cloudSpeed = -170;
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
		game.load.image('obstacle1', 'obstacle1.png'); 
		game.load.image('trash','Trash.png');
		game.load.atlasJSONHash('atlas1', 'AI.png', 'AI.json'); 
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
		var treat = game.add.sprite(655, 250, 'treat1');
		var treat2 = game.add.sprite(690, 250, 'treat2');
		var obs = game.add.sprite(820, 240, 'obstacle1');
		printMessages('Dog Chase!', 'You are a dog who needs training. Use UP key to jump! Collect                 and avoid      ','Hit too many obstacles and the trainer will leave you for good. Press [Space] to begin.');

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
		background.scale.setTo(20,20);

		//create clouds at random positions
		cloud1 = game.add.sprite(game.rnd.integerInRange(2, game.world.width-5), game.rnd.integerInRange(2, game.world.height-200), 'cloud1');
		game.physics.arcade.enable(cloud1);
		cloud1.enableBody = true;
		cloud1.scale.setTo(game.rnd.integerInRange(0.5, 1));

		cloud2 = game.add.sprite(game.rnd.integerInRange(2, game.world.width-5), game.rnd.integerInRange(2, game.world.height-180), 'cloud2');
		game.physics.arcade.enable(cloud2);
		cloud2.enableBody = true;
		cloud2.scale.setTo(game.rnd.integerInRange(0.5, 1));

		cloud3 = game.add.sprite(game.rnd.integerInRange(2, game.world.width-5), game.rnd.integerInRange(2, game.world.height-160), 'cloud3');
		game.physics.arcade.enable(cloud3);
		cloud3.enableBody = true;
		cloud3.scale.setTo(game.rnd.integerInRange(0.5, 1));

		cloud4 = game.add.sprite(game.rnd.integerInRange(2, game.world.width-5), game.rnd.integerInRange(2, game.world.height-140), 'cloud4');
		game.physics.arcade.enable(cloud4);
		cloud4.enableBody = true;
		cloud4.scale.setTo(game.rnd.integerInRange(0.5, 1));

		cloud5 = game.add.sprite(game.rnd.integerInRange(2, game.world.width-5), game.rnd.integerInRange(2, game.world.height-120), 'cloud5');
		game.physics.arcade.enable(cloud5);
		cloud5.enableBody = true;
		cloud5.scale.setTo(game.rnd.integerInRange(0.5, 1));

		benches = game.add.group();
		game.physics.arcade.enable(benches);
		benches.enableBody = true;

		game.time.events.repeat(Phaser.Timer.SECOND*20, 400, createBench, this);

		// fence = game.add.sprite(0, game.world.height-200,'fence');
		// fence.scale.setTo(1,1);
		// game.physics.arcade.enable(fence);
		// fence.enableBody = true;


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
		ground.scale.setTo(60, 2); //scale ground
		ground.body.immovable = true; //prevent ground from moving
		
		// var grass = game.add.sprite(5, game.world.height-200, 'grass');
		// grass.scale.setTo(1.5,1.5);
		
	
		//create enemies at different locations and enable physics
		enemy = game.add.sprite(350, game.height-168, 'atlas1', 'walk1');
		game.physics.arcade.enable(enemy);
		enemy.body.collideWorldBounds = false; 
		enemy.animations.add('walk',['walk1', 'walk2', 'walk3', 'walk4'], 4, true); //create enemy left movement

		//create player
		player = game.add.sprite(32, game.height-135, 'atlas2', 'dog_1');

		//enable physics and set bounce and gravity for player 
		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.2; 
		player.body.gravity.y = 500; 
		player.body.collideWorldBounds = true; //prevent player from going off screen

		//create player animations and set speed of dog animations
		player.animations.add('run', ['dog_1', 'dog_2','dog_3', 'dog_4', 'dog_5', 'dog_6'], 12, true);
		player.animations.add('jump', ['dog_1'], 0, true);

		var timer = game.time.create(false);

    	//  Set a TimerEvent to occur after 1 seconds
    	timer.loop(1000, counter, this);
    
    	timer.start();

    	function counter(){
        	this.score++;  //make the score goes up by time
        	scoreText.text = 'score: ' + this.score;
    	}
    	//create timer to spawn obstacles 
		
		this.dropObstacleTimer = timer.loop(0, createObstacle, this);
		//add obstacles group
		obstacles = game.add.group();
		game.physics.enable(obstacles, Phaser.Physics.ARCADE);
		obstacles.enableBody = true;
		obstacle1 = game.add.group();
		obstacle1.enableBody = true;
		game.physics.enable(obstacle1, Phaser.Physics.ARCADE);

		//create timer to spawn treats 
		
		
		this.dropTreatTimer = timer.loop(0, createTreat, this);
		

		//game.time.events.repeat(Phaser.Timer.SECOND*3, 500, createTreat, this);
		//add treats group
		treats = game.add.group();
		treats.enableBody = true;

		stars = game.add.group();
		stars.enableBody = true;

		
    	    // add rain to the game to make it interesting
    	rains = game.add.group();
    	rains.enableBody = true;
   		rains.physicsBodyType = Phaser.Physics.ARCADE;

    	// for (var y = 0; y < 30; y++)
    	// {
     //    	for (var x = 0; x < 60; x++)
     //    	{
     //        	rain = rains.create( x * Math.random() *  50, y * Math.random() *  100, 'rain');
            
     //        	rain.alpha = 0.3; 
     //        	rain.scale.setTo(0.01);

     //        	rain.checkWorldBounds = true;
     //        	rain.events.onOutOfBounds.add(rainOut, this);
     //        	rain.body.velocity.y = 50 + Math.random() * 200;
     //    	}
    	// }


		// // function of rain go out
 	// 	function rainOut(rain) {

  //   	//  Move the rain to the top of the screen again
  //  		rain.reset(rain.x, 0);

  //   	//  And give it a new random velocity
  //   	rain.body.velocity.y = 50 + Math.random() * 200;

		// }
		//set score's text size, color, and position
		scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});

	},
	update: function() {
		//set speed of clouds and bench so they are scrolling
		cloud1.body.velocity.x = cloudSpeed;
		cloud2.body.velocity.x = cloudSpeed;
		cloud3.body.velocity.x = cloudSpeed;
		cloud4.body.velocity.x = cloudSpeed;
		cloud5.body.velocity.x = cloudSpeed;
		
		// wrap clouds so they come back on screen
		game.world.wrap(cloud1, game.rnd.integerInRange(1, game.world.width-5), true);
		game.world.wrap(cloud2, game.rnd.integerInRange(1, game.world.width-5), true);
		game.world.wrap(cloud3, game.rnd.integerInRange(1, game.world.width-5), true);
		game.world.wrap(cloud4, game.rnd.integerInRange(1, game.world.width-5), true);
		game.world.wrap(cloud5, game.rnd.integerInRange(1, game.world.width-5), true);
		
		//create collision variable for player and platform
		var hitPlatform = game.physics.arcade.collide(player, platforms);

		//var hitTrash = game.physics.arcade.collide(enemy, obstacles);

		//collision of platform and treats
		game.physics.arcade.collide(platforms, treats);

		//set player velocity to 0 
		player.body.velocity.x = 0;

		//play enemy animations
		enemy.animations.play('walk');
		//player.animations.play('run');

		//enables Phaser Keyboard manager
		cursors = game.input.keyboard.createCursorKeys();

		//allow player to jump when on ground
		if(player.body.touching.down && hitPlatform){
			player.animations.play('run');
		}
		if (cursors.up.isDown && player.body.touching.down && hitPlatform){
			player.animations.play('jump');
			player.body.velocity.y = -400;
		}
		
		// if(cursors.down.isDown && !player.body.touching.down){
		// 	player.body.velocity.y = 200;
		// }

		//check for player collision with obstacle
		game.physics.arcade.overlap(player, obstacles, hitObstacle, null, this);

		//check for enemy collision with obstacle
		//game.physics.arcade.overlap(enemy, obstacles, hitTrash, null, this);

		//check for player overlap with treat
		game.physics.arcade.overlap(player, treats, collectTreat, null, this);

		// if(enemy.body.x==trash.body.x){
		// 	trash.kill();
		// }
		
		//Make the drop timer delay randomly
		this.dropTreatTimer.delay = game.rnd.integerInRange(3000,9000);
		this.dropObstacleTimer.delay = game.rnd.integerInRange(2000,5000);

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
		objectSpeed= objectSpeed - 5;
		cloudSpeed = cloudSpeed -5;

		if(level%50 == 0) {
		 	// increase audio rate at higher level
			backSound._sound.playbackRate.value += 0.00020;
		}

		if(level==10){
			for (var y = 0; y < 30; y++)
    	{
        	for (var x = 0; x < 60; x++)
        	{
            	rain = rains.create( x * Math.random() *  50, y * Math.random() *  100, 'rain');
            
            	rain.alpha = 0.3; 
            	rain.scale.setTo(0.01);

            	rain.checkWorldBounds = true;
            	rain.events.onOutOfBounds.add(rainOut, this);
            	rain.body.velocity.y = 50 + Math.random() * 200;
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
	// //spawn star in place of treats
	// var star = stars.create(treat1.body.x, treat1.body.y-60, 'star');
	// star.body.velocity.x = objectSpeed;

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
		//spawn diff treats randomly
		treat1 = treats.create((enemy.body.x-10)-(Math.random()*100), this.game.height-100, 'treat1');
		treat1.body.velocity.x = objectSpeed;
		treat1.body.gravity.y = 50;
		treat1.body.bounce.y = 0.5 + Math.random() * 0.3;

		treat2 = treats.create((enemy.body.x-10)-(Math.random()*100), this.game.height-100, 'treat2');
		treat2.body.velocity.x = objectSpeed;
		treat2.body.gravity.y = 50;
		treat2.body.bounce.y = 0.5 + Math.random() * 0.3;
		


	}

}

function createObstacle(){
	//play negative sound when obstacle is dropped
	negDropSound.play();
	//spawn obstacle at random location
	for (var i=0; i<Math.random(); i++){
		trash = obstacles.create(game.world.width, this.game.height-85, "trash");
		trash.body.velocity.x = objectSpeed;
		// var obstacle1 = obstacles.create((enemy.body.x-10)-(Math.random()*100), this.game.height-70, 'obstacle1');
  //       obstacle1.body.velocity.x = objectSpeed;
	}
	// if(enemy.body.x==trash.body.x){
	// 	trash.kill();
	// }
}
// function hitTrash(){
// 	trash.kill();
// 	// for (var i=0; i<Math.random(); i++){
// 	// 	var trash = obstacles.create(game.world.width, this.game.height-85, "trash");
// 	// 	trash.body.velocity.x = objectSpeed;
// 	var obstacle1 = obstacles.create(enemy.body.x-10, this.game.height-70, 'obstacle1');
//     obstacle1.body.velocity.x = objectSpeed;
	
// }
function createBench(){
	var bench = benches.create(game.world.width, game.world.height-96, 'bench');
	bench.body.velocity.x = objectSpeed;
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

 	for (var i=0; i<Math.random(); i++){
	trash1= obstacle1.create(player.body.x+50, this.game.height-70, 'obstacle1');
    trash1.body.velocity.x = objectSpeed;
	
 }
}

//add all game states to game and start game with main menu screen
game.state.add('MainMenu', MainMenu);
game.state.add('Play', Play);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');
