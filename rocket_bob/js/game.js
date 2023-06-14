(function () {
	'use strict';

	var canvas = document.getElementById('canvas');
	canvas.width = window.GAME_SPACE.width;
	canvas.height = window.GAME_SPACE.height;

	var game = new blu.Container(canvas);

	window.game = game

	game.assets.baseURL = "";

	// load the game
	game.assets.load({
		// world
		music : game.assets.loadAudioMedia('audio/world/music.mp3'),

		// sparkle : 'audio/world/sparkle.mp3',
		// munch : 'audio/world/munch.mp3',
		pop : 'audio/world/pop.mp3',
		boom : 'audio/world/boom.mp3',

		background : 'images/world/background.jpg',
		player : 'images/world/player.png',
		explosion : 'images/world/explosion.png',
		nyan : 'images/world/nyan.png',
		banana : 'images/world/banana.png',
		heart : 'images/world/heart.png',
		asteroid : 'images/world/asteroid.png',
	}).then(function () {
		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		var Vec3 = blu.Vec3;

		var OBJECT_SIZE = 64;

		var KM_PER_PIXEL = 11.488928 / 400;

		var SPACE_KEY = 32;

		var km = function (number) {
			return number ? Math.floor(number).toString().replace(/(\d)( ? =(\d{3})+$)/g, '$1,') + 'km' : '0km';
		};

		var clamp = function (number, min, max) {
			return number < min ? min : number > max ? max : number;
		};

		var selectByProbability = function (list) {
			var total = 0;

			for (var i = 0, length = list.length; i < length; i ++) {
				total += list[i][1];
			}

			var randomBar = Math.random() * total;

			var counter = 0;

			for (var i = 0, length = list.length; i < length; i ++) {
				counter += list[i][1];

				if (counter >= randomBar) {
					return list[i][0];
				}
			}

			return null;
		};

		var randomBetween = function (min, max) {
			var random = Math.random() * (max - min) + min;

			return random;
		};

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		var fadeChainTracker;

		function startFadeChain (element, time) {
			var children = element.children();
			var current = children.first();

			function nextItem () {
				children.hide();
				current.fadeIn();

				current = current.next();

				if (current.length) {
					fadeChainTracker = setTimeout(nextItem, time * 1000);
				}
			}

			nextItem();

			window.nextItem = nextItem;
		}

		function stopFadeChain () {
			clearTimeout(fadeChainTracker);
		}

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		function Sounds () {
			// store context
			this.ctx = new AudioContext();

			// store sound gain
			this.sound = this.ctx.createGain();

			// store music gain
			this.music = this.ctx.createGain();

			// store master gain
			this.master = this.ctx.createGain();

			// wire the sounds to the master
			this.sound.connect(this.master);

			// wire the music to the master
			this.music.connect(this.master);

			// wire the master to the speakers
			this.master.connect(this.ctx.destination);
		}

		Sounds.prototype.playSound = function (buffer) {
			// create sound source
			var source = this.ctx.createBufferSource();
			source.buffer = buffer;

			// wire the source to the sound gain
			source.connect(this.sound);

			// play the sound
			source.start();

			// chain
			return this;
		};

		Sounds.prototype.playMusic = function (element) {
			try {
				// create media source
				var source = this.ctx.createMediaElementSource(element);

				// set the source to loop
				source.loop = true;

				// wire the source to the music gain
				source.connect(this.music);

				// play the sound
				element.play();
			}

			catch (error) {}

			// chain
			return this;
		};

		Sounds.prototype.fadeVolume = function (volume, time) {
			this.master.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + time);

			// chain
			return this;
		};

		game.sounds = new Sounds();

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		var StarWars = game.factory.node();

		StarWars.prototype.init = function () {
			var image = game.assets.background;
			var scale = Math.max(canvas.width / image.width, canvas.height / image.height);

			this.attr({
				graphical : true,

				body : {
					width : image.width * scale,
					height : image.height * scale,

					spine : 0,
					waist : 0
				},

				sprite : {
					image : image,

					repeat : true
				}
			});

			this.speed = 15;
		};

		StarWars.prototype.update = function (dt) {
			this.body.pos.y += this.speed * dt;
		};

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		var Start = game.factory.scene();

		Start.prototype.init = function () {
			game.sounds.playMusic(game.assets.music);
			game.sounds.fadeVolume(0.5, 1);

			this.make(StarWars);

			startFadeChain($('#start-intro'), 4);

			this.element = document.getElementById('start');
			this.element.style.opacity = 1;

			this.startKey = SPACE_KEY;
		};

		Start.prototype.update = function () {
			if (this.events.keyboard.pressed(this.startKey)) {
				this.events.keyboard.cancel(this.startKey);

				game.solo(CountDown);
			}
		};

		Start.prototype.die = function () {
			stopFadeChain();

			this.element.style.opacity = 0;
		};

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		var CountDown = game.factory.scene();

		CountDown.prototype.init = function () {
			game.sounds.fadeVolume(0.5, 1);

			this.make(StarWars);

			startFadeChain($('#count-down-intro'), 4);

			this.element = document.getElementById('count-down');
			this.element.style.opacity = 1;

			this.countDownELement = document.getElementById('count-down-number');

			this.startKey = SPACE_KEY;
			this.countDown = -20;
		};

		CountDown.prototype.update = function (dt) {
			this.countDown += dt;

			this.countDownELement.innerHTML = 't = ' + Math.floor(this.countDown) + 's';

			if (this.countDown >= 0 || this.events.keyboard.pressed(this.startKey)) {
				this.events.keyboard.cancel(this.startKey);

				game.solo(World);
			}
		};

		CountDown.prototype.die = function () {
			stopFadeChain();

			this.element.style.opacity = 0;
		};

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		var Background = game.factory.node(game.factory.parallax(game.assets.background, 10000));

		Background.prototype.init = function () {
			this.attr({
				name : 'Background'
			});
		};

		var Player = game.factory.node();

		Player.prototype.init = function () {
			this.attr({
				graphical : true,
				physical : true,

				name : 'Player',

				body : {
					width : 128,
					height : 232,

					spine : 0,
					bottom : 0
				},

				sprite : {
					image : game.assets.player,

					width : 128,
					height : 232
				}
			});

			this.yThrust = 200;
			this.yFriction = 0.5;
			this.xFriction = 8;
			this.xThrust = 6000;

			this.powerThrust = 600;

			this.health = this.healthMax = 3;
			this.fuel = this.fuelMax = 5;
			this.power = 0;
			this.powerMax = 7;
			this.initial = this.body.pos.y;

			this.controls = {
				left : 37,
				right : 39
			};

			this.normal3 = this.sprite.buildAnimation(0, 8, 2, 2);
			this.normal2 = this.sprite.buildAnimation(8, 16, 2, 2);
			this.normal1 = this.sprite.buildAnimation(16, 24, 2, 2);

			this.power3 = this.sprite.buildAnimation(24, 32, 2, 2);
			this.power2 = this.sprite.buildAnimation(32, 40, 2, 2);
			this.power1 = this.sprite.buildAnimation(40, 48, 2, 2);

			this.sprite.setAnimation(this.normal3);

			this.score = 0;
			this.highscore = parseFloat(localStorage.getItem('rocket-bob/highscore')) || 0;
		};

		Player.prototype.die = function () {
			if (this.score > this.highscore) {
				this.highscore = this.score;

				localStorage.setItem('rocket-bob/highscore', this.highscore);
			}
		};

		Player.prototype.update = function (dt) {
			// drain power
			this.power -= 1 * dt;

			// drain fuel
			this.fuel -= 0.5 * dt;

			// clamp power meter
			this.power = clamp(this.power, 0, this.powerMax);

			// clamp fuel
			this.fuel = clamp(this.fuel, 0, this.fuelMax);

			// clamp health
			this.health = clamp(this.health, 0, this.healthMax);

			// game over if there are no more health
			if (this.health <= 0) {
				game.solo(Gameover, ['You were killed by an asteroid.']);

				return;
			}

			// game over if no fuel is left
			if (this.fuel <= 0) {
				game.solo(Gameover, ['You ran out of banana fuel.']);

				return;
			}

			if (this.power <= 0) {
				if (this.health === 3) {
					this.sprite.setAnimation(this.normal3);
				}

				else if (this.health === 2) {
					this.sprite.setAnimation(this.normal2);
				}

				else if (this.health === 1) {
					this.sprite.setAnimation(this.normal1);
				}
			}

			else {
				if (this.health === 3) {
					this.sprite.setAnimation(this.power3);
				}

				else if (this.health === 2) {
					this.sprite.setAnimation(this.power2);
				}

				else if (this.health === 1) {
					this.sprite.setAnimation(this.power1);
				}
			}

			this.sprite.animate(20 * dt);

			this.score = (this.initial - this.body.pos.y) * KM_PER_PIXEL;

			this.scene.viewport.focus(this, 1);

			this.scene.viewport.pos.y -= 150;

			this.scene.bounds.pos.y = this.scene.viewport.pos.y - canvas.height / 2;

			// gather input
			var leftKey = this.scene.events.keyboard.pressed(this.controls.left);
			var rightKey = this.scene.events.keyboard.pressed(this.controls.right);

			// net forces
			var forces = new Vec3();

			// apply left force
			forces.x += leftKey ? -this.xThrust : 0;

			// apply right force
			forces.x += rightKey ? this.xThrust : 0;

			// apply x friction
			forces.x += -1 * this.xFriction * this.body.vel.x;

			// apply y thrust or power thurst depending on if there's a powerup
			forces.y += this.power > 0 ? -1 * this.powerThrust : -1 * this.yThrust;

			// apply y friction
			forces.y += -1 * this.yFriction * this.body.vel.y;

			this.body.applyForce(forces);
		};

		Player.prototype.resolve = function (collision) {
			var node = collision.node2;

			if (node instanceof NyanCat) {
				this.power = this.powerMax;

				// game.sounds.play(game.assets.sparkle);
			}

			if (node instanceof Heart) {
				this.health += 1;

				game.sounds.playSound(game.assets.pop);
			}

			if (node instanceof Banana) {
				this.fuel += 1;

				// game.sounds.play(game.assets.munch)
			}

			if (node instanceof Asteroid) {
				this.health -= 1;

				game.sounds.playSound(game.assets.boom);
			}

			collision.prevent();
		};

		var UI = game.factory.node();

		UI.prototype.init = function () {
			this.attr({
				name : 'UI'
			});

			this.element = document.getElementById('ui');
			this.element.style.opacity = 1;

			this.health = document.getElementById('health');
			this.fuel = document.getElementById('fuel');
			this.power = document.getElementById('power');

			this.highscore = document.getElementById('high-score');
			this.score = document.getElementById('current-score');

			this.player = this.scene.getPlayer();
		};

		UI.prototype.update = function (dt) {
			var health = this.player.health / this.player.healthMax;

			this.health.style.opacity = health > 0 ? 1 : 0;
			this.health.style.width = Math.min(health * 100, 100) + '%';

			var fuel = this.player.fuel / this.player.fuelMax;

			this.fuel.style.opacity = fuel > 0 ? 1 : 0;
			this.fuel.style.width = Math.min(fuel * 100, 100) + '%';

			var power = this.player.power / this.player.powerMax;

			this.power.style.opacity = power > 0 ? 1 : 0;
			this.power.style.width = Math.min(power * 100, 100) + '%';

			this.highscore.innerHTML = km(this.player.highscore);
			this.score.innerHTML = km(this.player.score);
		};

		UI.prototype.die = function () {
			this.element.style.opacity = 0;
		};

		var Spawner = game.factory.node();

		Spawner.prototype.init = function () {
			this.attr({
				name : 'Spawner'
			});

			this.interval = 0.5;
			this.powerInterval = 0.1;
			this.counter = 0;

			this.player = this.scene.get({name : 'Player'});
		};

		Spawner.prototype.update = function (dt) {
			this.counter += dt;

			if (this.player.power > 0) {
				while (this.counter >= this.powerInterval) {
					this.counter -= this.powerInterval;

					this.scene.add(this.powerObject());
				}
			}

			else {
				while (this.counter >= this.interval) {
					this.counter -= this.interval;

					this.scene.add(this.random());
				}
			}
		};

		Spawner.prototype.powerObject = function () {
			return new Banana(this.scene).attr({
				body : {
					left : randomBetween(0, canvas.width)
				}
			});
		};

		Spawner.prototype.random = function () {
			var Type = selectByProbability([
				[NyanCat, 1],
				[Heart, 5],
				[Banana, 12],
				[Asteroid, 12]
			]);

			return new Type(this.scene).attr({
				body : {
					left : randomBetween(0, canvas.width)
				}
			});
		};

		var SpaceObject = game.factory.node();

		SpaceObject.prototype.update = function () {
			if (this.body.pos.y >= this.scene.viewport.pos.y + this.scene.viewport.size.y) {
				this.remove();
			}
		};

		SpaceObject.prototype.resolve = function (collision) {
			var node = collision.node2;

			if (node instanceof Player) {
				this.remove();
			}

			collision.prevent();
		};

		var NyanCat = game.factory.node(SpaceObject);

		NyanCat.prototype.init = function () {
			this.attr({
				graphical : true,
				physical : true,

				name : 'Nyan Cat',

				body : {
					width : OBJECT_SIZE,
					height : OBJECT_SIZE,

					top : -OBJECT_SIZE,

					immovable : true
				},

				sprite : {
					image : game.assets.nyan
				}
			});
		};

		var Heart = game.factory.node(SpaceObject);

		Heart.prototype.init = function () {
			this.attr({
				graphical : true,
				physical : true,

				name : 'Heart',

				body : {
					width : OBJECT_SIZE,
					height : OBJECT_SIZE,

					top : -OBJECT_SIZE,

					immovable : true
				},

				sprite : {
					image : game.assets.heart
				}
			});
		};

		var Banana = game.factory.node(SpaceObject);

		Banana.prototype.init = function () {
			this.attr({
				graphical : true,
				physical : true,

				name : 'Banana',

				body : {
					width : OBJECT_SIZE,
					height : OBJECT_SIZE,

					top : -OBJECT_SIZE,

					immovable : true
				},

				sprite : {
					image : game.assets.banana
				}
			});
		};

		var Asteroid = game.factory.node(SpaceObject);

		Asteroid.prototype.init = function () {
			this.attr({
				graphical : true,
				physical : true,

				name : 'Asteroid',

				body : {
					width : OBJECT_SIZE,
					height : OBJECT_SIZE,

					top : -OBJECT_SIZE,

					immovable : true
				},

				sprite : {
					image : game.assets.asteroid
				}
			});
		};

		Asteroid.prototype.resolve = function (collision) {
			var node = collision.node2;

			if (node instanceof Player) {
				this.scene.make(Explosion, [this]);

				this.remove();
			}

			collision.prevent();
		};

		var Explosion = game.factory.node();

		Explosion.prototype.init = function (asteroid) {
			this.attr({
				graphical : true,

				name : 'Explosion',

				body : {
					width : OBJECT_SIZE,
					height : OBJECT_SIZE
				},

				sprite : {
					image : game.assets.explosion,

					width : 64,
					height : 64
				}
			});

			this.body.pos.x = asteroid.body.pos.x;
			this.body.pos.y = asteroid.body.pos.y;

			this.sprite.setAnimation(this.sprite.buildAnimation(0, 7));

			this.animationSpeed = 15;

			this.life = 7 / this.animationSpeed * 0.9;
		};

		Explosion.prototype.update = function (dt) {
			this.sprite.animate(this.animationSpeed * dt);

			this.life -= dt;

			if (this.life <= 0) {
				this.remove();
			}
		};

		var World = game.factory.scene();

		World.prototype.init = function () {
			game.sounds.fadeVolume(1, 1);

			this.physics.timestep = 1 / 120;

			this.bounds.left = true;
			this.bounds.top = false;
			this.bounds.right = true;
			this.bounds.bottom = false;

			this.make(Background);
			this.make(Player);
			this.make(UI);
			this.make(Spawner);

			this.pause = SPACE_KEY;

			this.paused = false;

			this.pauseIcon = document.getElementById('pause-icon');
		};

		World.prototype.update = function (dt) {
			if (this.events.keyboard.pressed(this.pause)) {
				this.events.keyboard.cancel(this.pause);

				this.paused = !this.paused;

				if (this.paused === true) {
					this.pauseIcon.style.opacity = 1;

					game.sounds.fadeVolume(0.03, 0.15);

					this.physics.paused = true;
				}

				else {
					this.pauseIcon.style.opacity = 0;

					game.sounds.fadeVolume(1, 0.15);

					this.physics.paused = false;
				}
			}
		};

		World.prototype.getPlayer = function () {
			return this.get({name : 'Player'});
		};

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		var Gameover = game.factory.scene();

		Gameover.prototype.init = function (reason) {
			game.sounds.fadeVolume(0.25, 1);

			this.make(StarWars);

			this.element = document.getElementById('game-over');
			this.element.style.opacity = 1;

			document.getElementById('game-over-reason').innerHTML = reason;

			this.restartKey = SPACE_KEY;
		};

		Gameover.prototype.update = function (dt) {
			if (this.events.keyboard.pressed(this.restartKey)) {
				this.events.keyboard.cancel(this.restartKey);

				game.solo(World);
			}
		};

		Gameover.prototype.die = function () {
			this.element.style.opacity = 0;
		};

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

		// create the start screen
		game.solo(Start);

		// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
	});
}());