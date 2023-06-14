/*
	The Toasty Ember v0.0.0
	By Matt Regehr
*/

'use strict';

(function () {
	// ::::::::::::::::::::::::: Helpers ::::::::::::::::::::::::: //

	// Vector sugars
	var rgba = pos = vel = function (x, y, z, w) {
		return new math.Vector(x, y, z, w);
	};

	// Shallowly combines objects' properties to create a new one
	var combine = function () {
		var target = {};

		// Iterate through all args
		for (var i = 0, l = arguments.length; i < l; i ++) {
			// Iterate through all the properties
			for (var k in arguments[i]) {
				// Prototype safe
				if (!arguments[i].hasOwnProperty(k)) continue;

				// Add the property
				target[k] = arguments[i][k];
			}
		}

		return target;
	};

	// ::::::::::::::::::::::::: Shorts ::::::::::::::::::::::::: //

	var Game = blu.Game;
	var State = blu.State;
	var Entity = blu.Entity;
	var Emitter = blu.Emitter;
	var Camera = blu.Camera;
	var keyboard = blu.keyboard;
	var mouse = blu.mouse;

	// ::::::::::::::::::::::::: Camp Fire ::::::::::::::::::::::::: //

	// Night-sky
	var Sky = function () {
		// Super
		Entity.call(this);

		this.setWidth(WIDTH)
			.setHeight(HEIGHT)
			.setLeft(0)
			.setTop(0);

		this.sprite = main.assets.sky;
	};

	Sky.prototype = combine(Entity.prototype, {});

	// Ground with fire-light
	var Ground = function () {
		// Super
		Entity.call(this);

		this.setWidth(WIDTH)
			.setHeight(350)
			.setLeft(0)
			.setBottom(HEIGHT);

		this.sprite = main.assets.ground;
	};

	Ground.prototype = combine(Entity.prototype, {});

	// Toasty logs
	var Logs = function () {
		// Super
		Entity.call(this);

		this.setWidth(256)
			.setHeight(160)
			.setSpine(WIDTH / 2)
			.setWaist(HEIGHT - 220);

		this.sprite = main.assets.logs;
	};

	Logs.prototype = combine(Entity.prototype, {});

	// Red-hot flames
	var Flames = function () {
		Emitter.call(this, {
			rate : 100,
			max : 1000,

			life : 3,
			lifeVar : 1,

			shape : 'circle',

			color : rgba(252, 60, 72, 0.5),
			colorVar : rgba(40, 50, 20, 0.1),
			colorEnd : rgba(120, 33, 60, 0.3),

			radius : 30,
			radiusVar : 15,
			radiusEnd : 0,

			pos : pos(WIDTH / 2, HEIGHT - 225),
			posVar : pos(30, 0),
			vel : vel(0, -50),
			velVar : vel(150, 10)
		});
	};

	Flames.prototype = combine(Emitter.prototype, {
		physics : function (particle, delta) {
			// Updraft
			particle.vel.y -= 60 * delta;

			// Indraft
			particle.vel.x -= math.sign(particle.vel.x) * 75 * delta;

			// Wind
			particle.pos.add(main.state.wind);
		}
	});

	// Smoggy-grey smoke
	var Smoke = function () {
		Emitter.call(this, {
			rate : 6.5,
			max : 1000,

			life : 4,
			lifeVar : 1,

			shape : 'circle',

			color : rgba(255, 255, 255, 0.3),
			colorVar : rgba(0, 0, 0, 0.1),
			colorEnd : rgba(255, 255, 255, 0),

			radius : 25,
			radiusVar : 5,
			radiusEnd : 50,

			pos : pos(WIDTH / 2, HEIGHT - 225),
			posVar : pos(50, 0),
			vel : vel(0, -200),
			velVar : vel(0, 30)
		});
	};

	Smoke.prototype = combine(Emitter.prototype, {
		physics : function (particle, delta) {
			// Updraft
			particle.vel.y -= 10 * delta;

			// Outdraft
			particle.vel.x += (particle.pos.x - WIDTH / 2) / 100 * delta * 50;

			// Wind
			particle.pos.add(main.state.wind);
		}
	});

	// Popping Sparks
	var Sparks = function () {
		Emitter.call(this, {
			rate : 2,
			max : 20,

			life : 3,
			lifeVar : 1,

			shape : 'circle',

			color : rgba(252, 210, 32, 1),
			colorVar : rgba(0, 0, 0, 0.1),
			colorEnd : rgba(252, 112, 32, 0),

			radius : 3,
			radiusVar : 2,
			radiusEnd : 0,

			pos : pos(WIDTH / 2, HEIGHT - 225),
			posVar : pos(30, 0),
			vel : vel(0, -600),
			velVar : vel(150, 30)
		});
	};

	Sparks.prototype = combine(Emitter.prototype, {
		physics : function (particle, delta) {
			// Gravity
			particle.vel.y += 500 * delta;

			// Wind
			particle.pos.add(main.state.wind);
		}
	});

	var Torch = function () {
		Emitter.call(this, {
			rate : 100,
			max : 1000,

			life : 0.5,
			lifeVar : 0,

			shape : 'circle',

			color : rgba(252, 60, 72, 0.5),
			colorVar : rgba(0, 0, 0, 0),
			colorEnd : rgba(252, 60, 72, 0),

			radius : 30,
			radiusVar : 0,
			radiusEnd : 0,

			pos : pos(WIDTH / 2, HEIGHT - 225),
			posVar : pos(0, 0),
			vel : vel(0, -500),
			velVar : vel(0, 0)
		});
	};

	Torch.prototype = combine(Emitter.prototype, {});

	// Complete camp-fire
	var CampFire = function () {
		$(canvas).css('background-color', '#112');
		$('h1').css('color', '#fff');

		this.windSource = new math.Vector(WIDTH / 2, HEIGHT - 225);
		this.windMax = (new math.Vector()).minus(this.windSource).length();
		this.wind = new math.Vector();

		this.sky = new Sky();
		this.ground = new Ground();
		this.logs = new Logs();
		this.flames = new Flames();
		this.smoke = new Smoke();
		this.sparks = new Sparks();
		// this.torch = new Torch();
	};

	CampFire.prototype = {
		update : function (delta) {
			if (mouse.pressed()) {
				this.wind = mouse.pos.minus(this.windSource).times(1 / 6 * delta);

				main.assets.wind.volume = this.wind.length() / this.windMax;
				main.assets.wind.play();
			}

			this.sky.update(delta);
			this.ground.update(delta);
			this.logs.update(delta);
			this.flames.update(delta);
			this.smoke.update(delta);
			this.sparks.update(delta);
			// this.torch.update(delta);
		},

		draw : function () {
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			this.sky.draw(ctx);
			this.ground.draw(ctx);
			this.logs.draw(ctx);
			this.flames.draw(ctx);
			this.smoke.draw(ctx);
			this.sparks.draw(ctx);
			// this.torch.draw(ctx);
		}
	};

	// ::::::::::::::::::::::::: Build ::::::::::::::::::::::::: //

	// Static
	var WIDTH = document.body.clientWidth;
	var HEIGHT = document.body.clientHeight;

	// Canvas
	var canvas = document.getElementById('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	mouse.target = canvas;

	var ctx = canvas.getContext('2d');
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';

	// Main
	var main = new Game();

	blu.getAssets({
		wind : '_audio/camp-fire/wind.mp3',
		logs : '_images/camp-fire/logs.png',
		sky : '_images/camp-fire/sky.png',
		ground : '_images/camp-fire/ground.png'
	})
	.then(function (assets) {
		// Store the assets
		main.assets = assets;

		// Go to the camp fire
		main.setState(new CampFire());

		// Start the loop
		main.start();
	});

	// ::::::::::::::::::::::::: K, all done ::::::::::::::::::::::::: //

	// **For testing purposes only
	window.main = main;
}());