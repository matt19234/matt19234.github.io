(function () {
	'use strict';

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	var exports = {};

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// creates a singleton web audio context
	function getWebAudio () {
		// create the singleton, if it doesn't exist
		if (getWebAudio.singleton === undefined) {
			getWebAudio.singleton = (
				window.AudioContext !== undefined ? new window.AudioContext() :
				window.WebkitAudioContext !== undefined ? new window.WebkitAudioContext() : null
			)
		}

		return getWebAudio.singleton;
	}

	// converts an array to an rgba color string
	function arrayRGBA (array) {
		return (
			'rgba(' +
			Math.round(array[0]) + ', ' +
			Math.round(array[1]) + ', ' +
			Math.round(array[2]) + ', ' +
			Math.round(array[3] * 100) / 100 + ')');
	}

	// randomly varies a scalar value given a base and a variance
	function vary (base, variance) {
		return base + variance * Math.random();
	}

	// same as vary, but does it for a color array
	function varyColor (base, variance) {
		return [
			base[0] + variance[0] * Math.random(),
			base[1] + variance[1] * Math.random(),
			base[2] + variance[2] * Math.random(),
			base[3] + variance[3] * Math.random()
		];
	}

	// same as vary, but does it for a vector
	function varyVector (base, variance) {
		return [
			base.x + variance.x * Math.random(),
			base.y + variance.y * Math.random(),
			base.z + variance.z * Math.random()
		];
	}

	// lerps a value between two values
	function lerp (start, end, alpha) {
		return (end - start) * alpha + start;
	}

	// same as lerp, but does it for a color array
	function lerpColor (start, end, alpha) {
		return [
			(end[0] - start[0]) * alpha + start[0],
			(end[1] - start[1]) * alpha + start[1],
			(end[2] - start[2]) * alpha + start[2],
			(end[3] - start[3]) * alpha + start[3]
		];
	}

	// converts from degrees to radians
	function degreesToRadians (degrees) {
		return degrees * Math.PI / 180;
	}

	// combines the prototype from one constructor with those of a list
	function getPrototype (Main, constructors) {
		var newPrototype = Object.create(Main.prototype);

		// iterate each constructor and inherit their prototypes
		for (var i = 0, length = constructors.length; i < length; i ++) {
			var Constructor = constructors[i];

			// iterate all properties of the constructors prototype
			for (var key in Constructor.prototype) {
				// make sure that property isn't farther up the prototype chain
				if (Constructor.prototype.hasOwnProperty(key)) {
					// copy the property over
					newPrototype[key] = Constructor.prototype[key];
				}
			}
		}

		return newPrototype;
	}

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// 2d vectors
	function Vec2 (x, y) {
		// cast the components to ensure they're numbers
		// default them to 0 as well
		x = Number(x) || 0;
		y = Number(y) || 0;

		// store components
		this.x = x;
		this.y = y;
	}

	// adds two vectors without changing the originals
	Vec2.prototype.plus = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the sum
		return new Vec2(this.x + x, this.y + y);
	};

	// subtracts two vectors without changing the originals
	Vec2.prototype.minus = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the difference
		return new Vec2(this.x - x, this.y - y);
	};

	// multiplies a vector by a scalar without changing the original
	Vec2.prototype.times = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		// compute the product
		return new Vec2(this.x * scalar, this.y * scalar);
	};

	// divides a vector by a scalar without changing the original
	Vec2.prototype.over = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		// compute the quotient
		return new Vec2(this.x / scalar, this.y / scalar);
	};

	// adds a vector to this one
	Vec2.prototype.add = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the sum
		this.x += x;
		this.y += y;

		// chain
		return this;
	};

	// subtracts a vector from this one
	Vec2.prototype.sub = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the difference
		this.x -= x;
		this.y -= y;

		// chain
		return this;
	};

	// multiplies this vector by a scalar
	Vec2.prototype.multiply = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		// compute the product
		this.x *= scalar;
		this.y *= scalar;

		// chain
		return this;
	};

	// divides this vector by a scalar
	Vec2.prototype.divide = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		// compute the quotient
		this.x /= scalar;
		this.y /= scalar;

		// chain
		return this;
	};

	// calculates the magnitude (length) of the vector
	Vec2.prototype.magnitude = function () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	// calculates the magnitude squared by not using the square root (faster for comparisons)
	Vec2.prototype.squareMagnitude = function () {
		return this.x * this.x + this.y * this.y;
	};

	// determines the area that the vector covers
	Vec2.prototype.area = function () {
		return this.x * this.y;
	};

	// determines the vector's normal
	Vec2.prototype.normal = function () {
		var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

		return new Vec2(this.x / magnitude, this.y / magnitude);
	};

	// calculates the dot product with another vector
	Vec2.prototype.dot = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the dot product
		return this.x * x + this.y * y;
	};

	// calculates the angle between this vector and another
	Vec2.prototype.angle = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the dot product
		var dot = this.x * x + this.y * y;

		// compute the product of the magnitudes
		var magnitudeProduct = Math.sqrt(this.x * this.x + this.y * this.y) * Math.sqrt(x * x + y * y);

		// compute the angle
		return Math.acos(dot / magnitudeProduct);
	};

	// projets this vector onto another one
	Vec2.prototype.project = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the projection
		var scalar = (this.x * x + this.y * y) / (x * x + y * y);

		return new Vec2(x * scalar, y * scalar);
	};

	// creates an identical clone of this vector
	Vec2.prototype.clone = function () {
		return new Vec2(this.x, this.y);
	};

	// applies a mapping function to the vector, producing a new vector
	Vec2.prototype.map = function (predicate) {
		return new Vec2(predicate(this.x), predicate(this.y));
	};

	// mixes another vector in with this one
	Vec2.prototype.mix = function (vector, predicate) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// use the predicate to compute the mix
		return new Vec2(predicate(this.x, x), predicate(this.y, y));
	};

	// checks if the magnitude of one vector is greater than or equal to the magnitude of another
	Vec2.prototype.geq = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the inequality
		return (this.x * this.x + this.y * this.y) >= (x * x + y * y);
	};

	// checks if the magnitude of one vector is less than or equal to the magnitude of another
	Vec2.prototype.leq = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the inequality
		return (this.x * this.x + this.y * this.y) <= (x * x + y * y);
	};

	// checks if the magnitude of one vector is greater than to the magnitude of another
	Vec2.prototype.gtr = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the inequality
		return (this.x * this.x + this.y * this.y) > (x * x + y * y);
	};

	// checks if the magnitude of one vector is less than to the magnitude of another
	Vec2.prototype.lss = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);

		// compute the inequality
		return (this.x * this.x + this.y * this.y) < (x * x + y * y);
	};

	// creates a vector from [2d] polar coordinates
	Vec2.polar = function (theta, magnitude) {
		var x = Math.cos(theta) * magnitude;
		var y = Math.sin(theta) * magnitude;

		return new Vec2(x, y);
	};

	// 2d zero vector
	Vec2.ZERO = new Vec2(0, 0);

	exports.Vec2 = Vec2;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// 3d vectors
	function Vec3 (x, y, z) {
		// cast the components to ensure they're numbers
		// default them to 0 as well
		x = Number(x) || 0;
		y = Number(y) || 0;
		z = Number(z) || 0;

		// store components
		this.x = x;
		this.y = y;
		this.z = z;
	}

	// adds two vectors without changing the originals
	Vec3.prototype.plus = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the sum
		return new Vec3(this.x + x, this.y + y, this.z + z);
	};

	// subtracts two vectors without changing the originals
	Vec3.prototype.minus = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the difference
		return new Vec3(this.x - x, this.y - y, this.z - z);
	};

	// multiplies a vector by a scalar without changing the original
	Vec3.prototype.times = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		// compute the product
		return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
	};

	// divides a vector by a scalar without changing the original
	Vec3.prototype.over = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		return new Vec3(this.x / scalar, this.y / scalar, this.z / scalar);
	};

	// adds a vector to this one
	Vec3.prototype.add = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the sum
		this.x += x;
		this.y += y;
		this.z += z;

		// chain
		return this;
	};

	// subtracts a vector from this one
	Vec3.prototype.sub = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the difference
		this.x -= x;
		this.y -= y;
		this.z -= z;

		// chain
		return this;
	};

	// multiplies this vector by a scalar
	Vec3.prototype.multiply = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		// compute the product
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		// chain
		return this;
	};

	// divides this vector by a scalar
	Vec3.prototype.divide = function (scalar) {
		// cast the scalar to ensure it's a number
		scalar = Number(scalar);

		// compute the quotient
		this.x /= scalar;
		this.y *= scalar;
		this.z /= scalar;

		// chain
		return this;
	};

	// calculates the magnitude (length) of the vector
	Vec3.prototype.magnitude = function () {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	};

	// calculates the magnitude without the square root (faster for comparisons)
	Vec3.prototype.squareMagnitude = function () {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	};

	// determines the vulme that the vector occupies
	Vec3.prototype.volume = function () {
		return this.x * this.y * this.z;
	};

	// determines the vector's normal
	Vec3.prototype.normal = function () {
		var magnitude = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

		return new Vec3(this.x / magnitude, this.y / magnitude, this.z / magnitude);
	};

	// calculates the dot product with another vector
	Vec3.prototype.dot = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the dot product
		return this.x * x + this.y * y + this.z * z;
	};

	// calculates the angle between this vector and another
	Vec3.prototype.angle = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the dot product
		var dot = this.x * x + this.y * y + this.z * z;

		// compute the product of the magnitudes
		var magnitudeProduct = (
			Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) *
			Math.sqrt(x * x + y * y + z * z)
		);

		// compute the angle
		return Math.acos(dot / magnitudeProduct);
	};

	// projets this vector onto another one
	Vec3.prototype.project = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the projection
		var scalar = (this.x * x + this.y * y + this.z * z) / (x * x + y * y + z * z);

		return new Vec3(x * scalar, y * scalar, z * scalar);
	};

	// creates an identical clone of this vector
	Vec3.prototype.clone = function () {
		return new Vec3(this.x, this.y, this.z);
	};

	// applies a mapping function to the vector, producing a new vector
	Vec3.prototype.map = function (predicate) {
		return new Vec3(predicate(this.x), predicate(this.y), predicate(this.z));
	};

	// mixes another vector in with this one
	Vec3.prototype.mix = function (vector, predicate) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.y);

		// use the predicate to compute the mix
		return new Vec3(predicate(this.x, x), predicate(this.y, y), predicate(this.z, z));
	};

	// checks if the magnitude of one vector is greater than or equal to the magnitude of another
	Vec3.prototype.geq = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the inequality
		return (this.x * this.x + this.y * this.y + this.z * this.z) >= (x * x + y * y + z * z);
	};

	// checks if the magnitude of one vector is less than or equal to the magnitude of another
	Vec3.prototype.leq = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the inequality
		return (this.x * this.x + this.y * this.y + this.z * this.z) <= (x * x + y * y + z * z);
	};

	// checks if the magnitude of one vector is greater than to the magnitude of another
	Vec3.prototype.gtr = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the inequality
		return (this.x * this.x + this.y * this.y + this.z * this.z) > (x * x + y * y + z * z);
	};

	// checks if the magnitude of one vector is less than to the magnitude of another
	Vec3.prototype.lss = function (vector) {
		// cast the vector to ensure it's an object
		vector = Object(vector);

		// cast the components to ensure they're numbers
		var x = Number(vector.x);
		var y = Number(vector.y);
		var z = Number(vector.z);

		// compute the inequality
		return (this.x * this.x + this.y * this.y + this.z * this.z) < (x * x + y * y + z * z);
	};

	// creates a vector from [2d] polar coordinates
	Vec3.polar = function (theta, magnitude) {
		var x = Math.cos(theta) * magnitude;
		var y = Math.sin(theta) * magnitude;

		return new Vec3(x, y, 0);
	};

	// 3d zero vector
	Vec3.ZERO = new Vec3(0, 0, 0);

	exports.Vec3 = Vec3;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// a container houses a stage, some utilities, and active scenes
	function Container (stage) {
		// create a dummy element for the stage if one wasn't provided
		if (stage === undefined) {
			stage = document.createElement('canvas');
		}

		// keep a reference to the stage
		this.stage = stage;

		// keep track of all active scenes
		this.scenes = [];

		// assets is a utility for easily loading different assets and putting them in one place
		this.assets = new Assets();

		// factory is a utility for creating and maintaining 'classes' of nodes and scenes
		this.factory = new Factory();
	}

	// removes all scenes and calls their die methods
	Container.prototype.clear = function () {
		// iterate each scene and run their die method if they have one
		for (var i = 0, length = this.scenes.length; i < length; i ++) {
			var scene = this.scenes[i];

			// stop the scene's engines
			scene.stop();

			// kill the scene
			scene.trigger('die');

			// iterate each node and run their die method if they have one
			for (var k = 0, max = scene.nodes.length; k < max; k ++) {
				var node = scene.nodes[k];

				// kill the node
				node.trigger('die');
			}
		}

		// clear the list of scenes
		this.scenes = [];

		// chain
		return this;
	};

	// adds a scene to the container
	Container.prototype.add = function (scene, args) {
		// add the scene to the list of scenes
		this.scenes.push(scene);

		// initialize the scene with the arguments given
		scene.trigger('init', args);

		// start the scene's engine
		scene.start();

		// chain
		return this;
	};

	// constructs a scene and adds it to the container
	Container.prototype.make = function (Constructor, args) {
		// construct the scene
		var scene = new Constructor(this);

		// add the scene
		this.add(scene, args);

		return scene;
	};

	// constructs a scenes but clears all the others first
	Container.prototype.solo = function (Constructor, args) {
		// clear the container first
		this.clear();

		// construct the scene
		var scene = new Constructor(this);

		// add the scene
		this.add(scene, args);

		return scene;
	};

	exports.Container = Container;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// scenes keeps track of its state and the engine for updating it
	function Scene (container, components) {
		// have a tantrum if no container is provided
		if (container === undefined) {
			throw new Error('Every scene needs to be given a parent container.');
		}

		// store the parent container
		this.container = container;

		// store the stage of the container
		this.stage = this.container.stage;

		// keep track of all the components, the default is just this scenes constructor
		this.components = components !== undefined ? components : [this.constructor];

		// frames per second metric, measured once per second
		this.fps = 0;

		// total elapsed time the engine has been running
		this.elapsed = 0;

		// flag for if the engine is on or not
		this.on = false;

		// timestep for the physics engine
		this.timestep = 1 / 60;

		// slow-motion factor scales the speed of the physics engine
		this.slowmo = 1;

		// maximum delta time that can be handled gracefully by the physics engine
		this.max = 1 / 15;

		// create a saving engine based on local storage
		this.saves = new LocalStorageSaves();

		// create a physics engine
		this.physics = new Physics();

		// create an events engine
		this.events = new Events(this.stage);

		// create a rendering engine
		this.renderer = new Renderer(this.stage);

		// this represents the boundaries of the scene that contain nodes as well as the viewport
		this.bounds = new Bounds(this.stage);

		// this represents the section of the scene that is visible as well as its depth, i.e. the camera
		this.viewport = new Viewport(this.stage, 1000, 100000);

		// store a list of all nodes in the scene
		this.nodes = [];
	}

	// starts the scene engine
	Scene.prototype.start = function () {
		// don't start if the scene engine is already on
		if (this.on) {
			return this;
		}

		// flag the scene engine as on
		this.on = true;

		// allow closure access to the context
		var self = this;

		// when the first frame runs, the time now (in seconds) will be the last time
		var lastTime = window.performance.now() / 1000;

		// frames and time are values for keeping track of the framerate
		var frames = 0;
		var time = 0;

		// an accumulator is used so the engine can run at non-fixed intervals, but can be updated at fixed intervals
		var accumulator = 0;

		// run the first frame
		(function frame () {
			// calculate the current time in seconds
			var currentTime = window.performance.now() / 1000;

			// calculate the change in time
			var dt = currentTime - lastTime;

			// on the next frame, the current time will become the last time
			lastTime = currentTime;

			// every second, calculate the frames per second rate of the engine
			frames ++;
			time += dt;

			if (time >= 1) {
				self.fps = frames / time;

				// reset frames and time
				frames = time = 0;
			}

			// update the elapsed time for this scene
			self.elapsed += dt;

			// schedule the next frame, ideally in 1/60s
			self.tracker = window.requestAnimationFrame(frame);

			// accumulate time
			accumulator += Math.min(dt, self.max);

			// run physics and events while the accumulator is above one timestep
			while (accumulator >= self.timestep) {
				// drain the accumulator
				accumulator -= self.timestep;

				// get apparent delta time scaled by the slow motion coefficient
				var apparentDT = self.timestep * self.slowmo;

				// update the physics engine
				self.physics.update(self, apparentDT);

				// update the events engine
				self.events.update(self, apparentDT);
			}

			// render the scene
			// alpha, the second parameter, is the interpolation factor between this and the last frame
			self.renderer.render(self, 1 - accumulator / dt);
		})();

		// chain
		return this;
	};

	// stops the scene engine
	Scene.prototype.stop = function () {
		// don't stop if the scene engine is already off
		if (!this.on) {
			return this;
		}

		// flag the scene engine as off
		this.on = false;

		// cancel the tracker
		window.cancelAnimationFrame(this.tracker);

		// chain
		return this;
	};

	// sets scene viewport and boundary attributes
	Scene.prototype.attr = function (data) {
		// cast the data to ensure it's an object
		data = Object(data);

		// if bounds data is provided
		if (typeof data.bounds === 'object') {
			// change width
			if (typeof data.bounds.width === 'number') {
				this.bounds.size.x = data.bounds.width;
			}

			else {
				this.bounds.size.x = this.stage.width;
			}

			// change height
			if (typeof data.bounds.height === 'number') {
				this.bounds.size.y = data.bounds.height;
			}

			else {
				this.bounds.size.y = this.stage.height;
			}

			// change x-pos
			if (typeof x === 'number') {
				this.bounds.pos.x = data.bounds.x;
			}

			else {
				this.bounds.pos.x = 0;
			}

			// change y-pos
			if (typeof y === 'number') {
				this.bounds.pos.y = data.bounds.y;
			}

			else {
				this.bounds.pos.y = 0;
			}

			// change left bounding
			if (typeof data.bounds.left === 'boolean') {
				this.bounds.left = data.bounds.left;
			}

			else {
				this.bounds.left = 'false';
			}

			// change top bounding
			if (typeof data.bounds.top === 'boolean') {
				this.bounds.top = data.bounds.top;
			}

			else {
				this.bounds.top = 'false';
			}

			// change right bounding
			if (typeof data.bounds.right === 'boolean') {
				this.bounds.right = data.bounds.right;
			}

			else {
				this.bounds.right = 'false';
			}

			// change bottom bounding
			if (typeof data.bounds.bottom === 'boolean') {
				this.bounds.bottom = data.bounds.bottom;
			}

			else {
				this.bounds.bottom = 'false';
			}
		}

		// chain
		return this;
	};

	// checks if one object is a complete subset of another
	function isSubset (object1, object2) {
		for (var key in object1) {
			if (object1.hasOwnProperty(key) && object1[key] != object2[key]) {
				return false;
			}
		}

		return true;
	}

	// gets the first node that matches a given set of properties
	Scene.prototype.get = function (properties) {
		// cast the properties to ensure it's an object
		properties = Object(properties);

		// iterate each node
		for (var i = 0, length = this.nodes.length; i < length; i ++) {
			var node = this.nodes[i];

			// check if this node has statisfies the properties given
			if (isSubset(properties, node)) {
				return node;
			}
		}

		// return null if no node was found
		return null;
	};

	// filters all nodes match a given set of properties
	Scene.prototype.filter = function (properties) {
		// cast the properties to ensure it's an object
		properties = Object(properties);

		// keep track of all nodes that have passed the test
		var result = [];

		// iterate each node
		for (var i = 0, length = this.nodes.length; i < length; i ++) {
			var node = this.nodes[i];

			// check if this node has statisfies the properties given
			if (isSubset(properties, node)) {
				result.push(node);
			}
		}

		return result;
	};

	// triggers a method to be called on all components
	Scene.prototype.trigger = function (method, args) {
		// iterate each component
		for (var i = 0, length = this.components.length; i < length; i ++) {
			var Component = this.components[i];

			// run its the method if it has one
			if (typeof Component.prototype[method] === 'function') {
				Component.prototype[method].apply(this, args);
			}
		}

		// find the immediate prototypal parent
		var parent = Object.getPrototypeOf(this);

		// call the method if it is directly in the parent and is a function
		if (typeof parent[method] === 'function' && parent.hasOwnProperty(method)) {
			parent[method].apply(this, args);
		}
	};

	// removes the scene from the container
	Scene.prototype.remove = function () {
		// shutdown the engine
		this.stop();

		// find the index within the scene list
		var index = this.container.scenes.indexOf(this);

		// remove it if it was found
		if (index !== -1) {
			this.container.scenes.splice(index, 1);
		}

		// kill the scene
		scene.trigger('die');

		// iterate each node and run their die method if they have one
		for (var i = 0, length = this.nodes.length; i < length; i ++) {
			var node = this.nodes[i];

			// kill the node
			node.trigger('die');
		}

		// chain
		return this;
	};

	// removes all nodes and calls their die methods
	Scene.prototype.clear = function () {
		// iterate each node and run their die method if they have one
		for (var i = 0, length = this.nodes.length; i < length; i ++) {
			var node = this.nodes[i];

			// kill the node
			node.trigger('die');
		}

		// clear the list of nodes
		this.nodes = [];

		// chain
		return this;
	};

	// adds a node to the scene
	Scene.prototype.add = function (node, args) {
		// add the node to the list of nodes
		this.nodes.push(node);

		// initialize the node with the arguments given
		node.trigger('init', args);

		// chain
		return this;
	};

	// constructs a node and adds it to the scene
	Scene.prototype.make = function (Constructor, args) {
		// construct the node
		var node = new Constructor(this);

		// add the node
		this.add(node, args);

		return node;
	};

	// constructs a nodes but clears all the others first
	Scene.prototype.solo = function (Constructor, args) {
		// clear the scene first
		this.clear();

		// construct the node
		var node = new Constructor(this);

		// add the node
		this.add(node, args);

		return node;
	};

	// this checks if a scene 'is' of a certain type by seeing if it's in the components
	Scene.prototype.is = function (Type) {
		// first, check if the type is somewhere up the prototype chain
		if (this instanceof Type) {
			return true;
		}

		// iterate each component
		for (var i = 0, length = this.components.length; i < length; i ++) {
			var Component = this.components[i];

			// check for a match
			if (Component === Type) {
				return true;
			}
		}

		// no matches we're found, so nope
		return false;
	};

	// creates a copy of the scene constructor
	Scene.copy = function (components) {
		// default the components to an empty list
		if (components === undefined) {
			components = [];
		}

		function S (scene) {
			// call the super constructor
			Scene.call(this, scene, components);
		}

		// the prototype chain should look like indivivual scene -> scene + components -> object
		S.prototype = Object.create(getPrototype(Scene, components));

		// refer to the right constructor
		S.prototype.constructor = S;

		// store the components on the constructor
		S.components = components;

		return S;
	};

	exports.Scene = Scene;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// core nodes that represent individual objects in a scene
	function Node (scene, components) {
		// have a tantrum if no scene is provided
		if (scene === undefined) {
			throw new Error('Every node needs to be given a parent scene.');
		}

		// store the parent scene
		this.scene = scene;

		// keep track of all the components, the default is just this nodes constructor
		this.components = components !== undefined ? components : [];

		// keep track of whether or not this node has physical behaviour
		this.physical = false;

		// keep track of whether or not this node is appears on screen
		this.graphical = false;

		// name is used for identification purposes
		this.name = null;
	}

	// sets the attributes of the node en masse
	Node.prototype.attr = function (arg1, arg2) {
		// domain
		var data = {};

		if (typeof arg1 === 'object') {
			data = arg1;
		}

		else if (typeof arg1 === 'string') {
			data[arg1] = arg2;
		}

		else {
			throw new TypeError('The provided arguments are not in either of the following forms: attr({...}), attr(key, value).');
		}

		// change graphical mode on and off
		if (typeof data.graphical === 'boolean') {
			// ensure the properties for graphical exist if it's being turned on
			if (data.graphical === true && this.graphical === false) {
				// ensure a sprite exists
				if (this.sprite === undefined) {
					this.sprite = new Sprite();
				}

				// ensure a body exists
				if (this.body === undefined) {
					this.body = new Body();
				}
			}

			this.graphical = data.graphical;
		}

		// change physical mode on and off
		if (typeof data.physical === 'boolean') {
			if (data.physical === true && this.physical === false) {
				// ensure body exists
				if (this.body === undefined) {
					this.body = new Body();
				}
			}

			this.physical = data.physical;
		}

		// change the name
		if (typeof data.name === 'string') {
			this.name = data.name;
		}

		// set body attributes
		if (typeof data.body === 'object') {
			// ensure body exists
			if (this.body === undefined) {
				this.body = new Body();
			}

			// set width if the given width is a number
			if (typeof data.body.width === 'number') {
				this.body.size.x = data.body.width;
			}

			// set height if the given height is a number
			if (typeof data.body.height === 'number') {
				this.body.size.y = data.body.height;
			}

			// set x-position (precedance is left, spine, right) given that they are numbers
			if (typeof data.body.left === 'number') {
				this.body.pos.x = data.body.left + this.scene.bounds.pos.x;
			}

			else if (typeof data.body.spine === 'number') {
				this.body.pos.x = data.body.spine + this.scene.bounds.pos.x + (this.scene.bounds.size.x - this.body.size.x) * 0.5;
			}

			else if (typeof data.body.right === 'number') {
				this.body.pos.x = data.body.right + this.scene.bounds.pos.x + (this.scene.bounds.size.x - this.body.size.x);
			}

			// set y-position (precedance is top, waist, bottom) given that they are numbers
			if (typeof data.body.top === 'number') {
				this.body.pos.y = data.body.top + this.scene.bounds.pos.y;
			}

			else if (typeof data.body.waist === 'number') {
				this.body.pos.y = data.body.waist + this.scene.bounds.pos.y + (this.scene.bounds.size.y - this.body.size.y) * 0.5;
			}

			else if (typeof data.body.bottom === 'number') {
				this.body.pos.y = data.body.bottom + this.scene.bounds.pos.y + (this.scene.bounds.size.y - this.body.size.y);
			}

			// set z-position if the given z-position is a number
			if (typeof data.body.z === 'number') {
				this.body.pos.z = data.body.z;
			}

			// set mass if the given mass is a number
			if (typeof data.body.mass === 'number') {
				this.body.mass = data.body.mass;
			}

			// set immovable flag the given immovable flag is a boolean
			if (typeof data.body.immovable === 'boolean') {
				this.body.immovable = data.body.immovable;
			}

			// set restitution the given restitution is a number
			if (typeof data.body.restitution === 'number') {
				this.body.restitution = data.body.restitution;
			}
		}

		// set sprite attributes
		if (typeof data.sprite === 'object') {
			// ensure sprite exists
			if (this.sprite === undefined) {
				this.sprite = new Sprite();
			}

			// set image if the given image is an image
			if (data.sprite.image instanceof Image) {
				this.sprite.image = data.sprite.image;

				// change the dimensions of the image to be the whole image
				this.sprite.size.x = this.sprite.image.width;
				this.sprite.size.y = this.sprite.image.height;

				this.sprite.pos.x = 0;
				this.sprite.pos.y = 0;
			}

			// set color if the given color is a string
			if (typeof data.sprite.color === 'string') {
				this.sprite.color = data.sprite.color;
			}

			// set sprite opacity if the given opacity is a number
			if (typeof data.sprite.opacity === 'number') {
				this.sprite.opacity = data.sprite.opacity;
			}

			// enable image repeating if the given repeating parameter is a boolean
			if (typeof data.sprite.repeat === 'boolean') {
				this.sprite.repeat = data.sprite.repeat;
			}

			// enable image fixing if the given fixing parameter is a boolean
			if (typeof data.sprite.fixed === 'boolean') {
				this.sprite.fixed = data.sprite.fixed;
			}

			// set layer if the given layer is a number
			if (typeof data.sprite.layer === 'number') {
				this.sprite.layer = data.sprite.layer;
			}

			// set width if the given width is a number
			if (typeof data.sprite.width === 'number') {
				this.sprite.size.x = data.sprite.width;
			}

			// set height if the given height is a number
			if (typeof data.sprite.height === 'number') {
				this.sprite.size.y = data.sprite.height;
			}

			// set x-position if the given x-position is a number
			if (typeof data.sprite.left === 'number') {
				this.sprite.pos.x = data.sprite.left;
			}

			// set y-position if the given y-position is a number
			if (typeof data.sprite.top === 'number') {
				this.sprite.pos.y = data.sprite.top;
			}
		}

		// chain
		return this;
	};

	// triggers a method to be called on all components
	Node.prototype.trigger = function (method, args) {
		// iterate each component
		for (var i = 0, length = this.components.length; i < length; i ++) {
			var Component = this.components[i];

			// run its the method if it has one
			if (typeof Component.prototype[method] === 'function') {
				Component.prototype[method].apply(this, args);
			}
		}

		// find the immediate prototypal parent
		var parent = Object.getPrototypeOf(this);

		// call the method if it is directly in the parent and is a function
		if (typeof parent[method] === 'function' && parent.hasOwnProperty(method)) {
			parent[method].apply(this, args);
		}
	};

	// removes the node from the parent scene
	Node.prototype.remove = function () {
		// find the index within the node list
		var index = this.scene.nodes.indexOf(this);

		// remove it if it was found
		if (index !== -1) {
			this.scene.nodes.splice(index, 1);
		}

		// kill this node
		this.trigger('die');

		// chain
		return this;
	};

	// this checks if a node 'is' of a certain type by seeing if it's in the components
	Node.prototype.is = function (Type) {
		// first, check if the type is somewhere up the prototype chain
		if (this instanceof Type) {
			return true;
		}

		// iterate each component
		for (var i = 0, length = this.components.length; i < length; i ++) {
			var Component = this.components[i];

			// check for a match
			if (Component === Type) {
				return true;
			}
		}

		// no matches we're found, so nope
		return false;
	};

	// creates a copy of the node constructor
	Node.copy = function (components) {
		// default the components to an empty list
		if (components === undefined) {
			components = [];
		}

		function N (scene) {
			// call the super constructor
			Node.call(this, scene, components);
		}

		// the prototype chain should look like indivivual node -> node + components -> object
		N.prototype = Object.create(getPrototype(Node, components));

		// refer to the right constructor
		N.prototype.constructor = N;

		// store the components on the constructor
		N.components = components;

		return N;
	};

	exports.Node = Node;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// non-rotating quadrilateral physics bodies
	function Body () {
		// size vector
		this.size = new Vec2(0, 0);

		// position vector for the top-left corner of the box
		this.pos = new Vec3(0, 0, 0);

		// define far as the far corner of the box
		Object.defineProperty(this, 'far', {
			get : function () {
				return new Vec3(this.pos.x + this.size.x, this.pos.y + this.size.y, this.pos.z);
			},

			set : function (vector) {
				this.pos.x = vector.x - this.size.x;
				this.pos.y = vector.y - this.size.y;
				this.pos.z = vector.z;
			}
		});

		// velocity vector
		this.vel = new Vec3(0, 0, 0);

		// acceleration vector
		this.acc = new Vec3(0, 0, 0);

		// previous acceleration vector
		this.preAcc = new Vec3(0, 0, 0);

		// mass scalar
		this.mass = 1;

		// immovable flag
		this.immovable = false;

		// resititution coefficient for collision resolution
		this.restitution = 0;
	}

	// applies a force to the body
	Body.prototype.applyForce = function (force) {
		this.acc.add(force.over(this.mass));

		// chain
		return this;
	};

	// applies an impulse to the body
	Body.prototype.applyImpulse = function (impulse) {
		this.vel.add(impulse.over(this.mass));

		// chain
		return this;
	};

	// lerps objects with a position given an alpha paramater
	Body.prototype.lerp = function (alpha) {
		// check if it's the first time lerping
		if (this.pre === undefined) {
			// set up lerping for the next frame
			this.pre = this.pos.clone();

			return this.pos.clone();
		}

		// calculate interpolated position
		var pos = (this.pos.minus(this.pre)).times(alpha).plus(this.pre);

		// store previous position
		this.pre = this.pos.clone();

		return pos;
	};

	exports.Body = Body;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// animatable sprites
	function Sprite () {
		// html image element for this sprite
		this.image = null;

		// css color string for this sprite
		this.color = null;

		// transparency of the sprite
		this.opacity = 1;

		// repeating paramater determines if the image or color will repeat itself across the whole stage
		this.repeat = false;

		// layer, used for determining the z order of sprites with the same z-position
		this.layer = 0;

		// source size vector, represents the size of the area in the image that should be rendered
		this.size = new Vec2(0, 0);

		// source position vector, represents the position of the area in the image that should be rendered
		this.pos = new Vec2(0, 0);

		// render size vector, represents the absolute size of the sprite when it will be rendered
		this.renderSize = new Vec2();

		// render position vector, represents the absolute position of the sprite when it will be rendered
		this.renderPos = new Vec2();

		// current frame of the animation
		this.frame = 0;

		// list of frames in the animation
		this.animation = [];
	}

	// sets the animation
	Sprite.prototype.setAnimation = function (animation) {
		// domain
		if (!(animation instanceof Array)) {
			throw new TypeError('The provided animation is not an array.');
		}

		// change the animation
		this.animation = animation;

		// wrap around the end
		this.frame %= this.animation.length;

		// change source position to match animation
		var currentFrame = this.animation[Math.floor(this.frame)];

		this.pos.x = currentFrame[0];
		this.pos.y = currentFrame[1];

		// chain
		return this;
	};

	// progresses the animation over a scalable period of time
	Sprite.prototype.animate = function (dt) {
		// domain
		if (this.animation.length === 0) {
			return this;
		}

		// progress the frame by dt
		this.frame += dt;

		// wrap around the end
		this.frame %= this.animation.length;

		// change source position to match animation
		var currentFrame = this.animation[Math.floor(this.frame)];

		this.pos.x = currentFrame[0];
		this.pos.y = currentFrame[1];

		// chain
		return this;
	};

	// resets the animation to the first frame
	Sprite.prototype.resetAnimation = function () {
		// domain
		if (!(this.animation instanceof Array) || this.animation.length === 0) {
			return this;
		}

		// set the frame back to the first one
		this.frame = 0;

		// change source position to match animation
		var currentFrame = this.animation[Math.floor(this.frame)];

		this.pos.x = currentFrame[0];
		this.pos.y = currentFrame[1];

		// chain
		return this;
	};

	// builds an animation represented by an array of coordinates
	Sprite.prototype.buildAnimation = function (start, end, gapX, gapY) {
		// domain
		if (!(this.image instanceof Image)) {
			throw new TypeError('The provided sprite does not contain an image.');
		}

		if (typeof start !== 'number') {
			start = 0;
		}

		if (typeof end !== 'number') {
			end = 0;
		}

		if (typeof gapX !== 'number') {
			gapX = 0;
		}

		if (typeof gapY !== 'number') {
			gapY = 0;
		}

		// resulting animation
		var result = [];

		// number of frames per row of the image
		var framesPerRow = Math.ceil((this.image.width + gapX) / (this.size.x + gapX));

		// iterate frames start to end
		for (var i = start; i < end; i ++) {
			result.push([
				(this.size.x + gapX) * (i % framesPerRow),
				(this.size.y + gapY) * Math.floor(i / framesPerRow)
			]);
		}

		return result;
	};

	exports.Sprite = Sprite;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	function LocalStorageSaves () {
		this.saveLocation = 'save';
	}

	LocalStorageSaves.prototype.save = function (scene) {		
		for (var index = 0, length = scene.nodes.length; index < length; index ++) {
			var node = scene.nodes[index];

			if (typeof node.save === 'function') {
				
			}
		}
	};

	LocalStorageSaves.prototype.load = function (scene) {
		var rawData = localStorage.getItem(this.saveLocation);

		if (rawData !== null) {
			var jsonData = JSON.parse(data);
		}
	};

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// boundary manager
	function Bounds (stage) {
		// keep a reference to the stage
		this.stage = stage;

		// boundary size
		this.size = new Vec2(this.stage.width, this.stage.height);

		// boundary position
		this.pos = new Vec2();

		// flags for which bounds are active
		this.left = true;
		this.top = true;
		this.right = true;
		this.bottom = true;
	}

	// inherit the body prototype
	Bounds.prototype = Object.create(Body.prototype);

	// contains a body
	Bounds.prototype.contain = function (body) {
		if (this.left === true && body.pos.x < this.pos.x) {
			body.pos.x = this.pos.x;

			if (body.vel !== undefined && body.vel.x < 0) {
				body.vel.x = 0;
			}
		}

		if (this.right === true && body.pos.x > this.pos.x + this.size.x - body.size.x) {
			body.pos.x = this.pos.x + this.size.x - body.size.x;

			if (body.vel !== undefined && body.vel.x > 0) {
				body.vel.x = 0;
			}
		}

		if (this.top === true && body.pos.y < this.pos.y) {
			body.pos.y = this.pos.y;

			if (body.vel !== undefined && body.vel.y < 0) {
				body.vel.y = 0;
			}
		}

		if (this.bottom === true && body.pos.y > this.pos.y + this.size.y - body.size.y) {
			body.pos.y = this.pos.y + this.size.y - body.size.y;

			if (body.vel !== undefined && body.vel.y > 0) {
				body.vel.y = 0;
			}
		}

		// chain
		return this;
	};

	exports.Bounds = Bounds;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// viewport manager
	function Viewport (stage, depth, max) {
		// domain
		if (typeof depth !== 'number') {
			depth = 1000;
		}

		if (typeof max !== 'number') {
			max = Infinity;
		}

		// store stage
		this.stage = stage;

		// make the viewport the same size as the stage
		this.size = new Vec2(this.stage.width, this.stage.height);

		// position the viewport so its back occupies the xy plane
		this.pos = new Vec3(0, 0, 0);

		// depth of field
		this.depth = depth;

		// maximum distance renderable
		this.max = max;
	}

	// inherit the body prototype
	Viewport.prototype = Object.create(Body.prototype);

	// focuses on the subject over a scalable period of time
	Viewport.prototype.focus = function (subject, dt) {
		// domain
		if (!(subject instanceof Node)) {
			throw new TypeError('The provided subject is of type "Node".');
		}

		if (typeof dt !== 'number') {
			dt = 1;
		}

		// vars
		var pos = subject.body.pos, size = subject.body.size;

		// move the toward the center of the subject over time dt
		this.pos.x += (pos.x + size.x / 2 - this.pos.x - this.size.x / 2) * dt;
		this.pos.y += (pos.y + size.y / 2 - this.pos.y - this.size.y / 2) * dt;

		// chain
		return this;
	};

	// zooms the viewport to a given zoom level over a scalable period of time
	Viewport.prototype.zoom = function (zoom, dt) {
		// domain
		if (typeof zoom !== 'number') {
			throw new TypeError('The provided zoom is not a number.');
		}

		if (typeof dt !== 'number') {
			dt = 1;
		}

		this.pos.z += (zoom - this.pos.z) * dt;

		// chain
		return this;
	};

	// shakes the viewport by a given amount
	Viewport.prototype.shake = function (shake) {
		// domain
		if (typeof shake !== 'number') {
			throw new TypeError('The provided shake is not a number.');
		}

		// add a random amount of shake to each axis between -shake and +shake
		this.pos.x += (Math.random() * 2 - 1) * shake;
		this.pos.y += (Math.random() * 2 - 1) * shake;

		// chain
		return this;
	};

	exports.Viewport = Viewport;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// fixed timestep physics engine
	function Physics () {
		// how many nodes should there be to start using a quadtree
		this.quadtreeThreshold = 200;
	}

	// applies physics to a scene over a change in time
	Physics.prototype.update = function (scene, dt) {
		// 1. create a list of only physical nodes
		// 2. integrate their positions
		// 3. contain them to the scene boundaries

		scene.physical = [];

		for (var index = 0, length = scene.nodes.length; index < length; index ++) {
			var node = scene.nodes[index];

			// don't consider non-physical nodes
			if (node.physical === false) {
				continue;
			}

			// add the node to the physical list
			scene.physical.push(node);

			var body = node.body;

			// integrate using verlet
			body.pos.x += (body.vel.x + body.preAcc.x / 2 * dt) * dt;
			body.pos.y += (body.vel.y + body.preAcc.y / 2 * dt) * dt;
			body.pos.z += (body.vel.z + body.preAcc.z / 2 * dt) * dt;

			body.vel.x += (body.preAcc.x + body.acc.x) / 2 * dt;
			body.vel.y += (body.preAcc.y + body.acc.y) / 2 * dt;
			body.vel.z += (body.preAcc.z + body.acc.z) / 2 * dt;

			body.preAcc.x = body.acc.x;
			body.preAcc.y = body.acc.y;
			body.preAcc.z = body.acc.z;

			// reset acceleration
			body.acc.x = 0;
			body.acc.y = 0;
			body.acc.z = 0;

			// contain the node to the boundaries
			scene.bounds.contain(body);
		}

		// find all pairs of nodes that could be colliding
		// use either the quadtree or brute force depending on how many nodes there are
		var pairs = (scene.physical.length >= this.quadtreeThreshold ? Quadtree.from(scene.physical) : new BruteForce(scene.physical)).getPairs();

		// iterate each pair
		for (var index = 0, length = pairs.length; index < length; index ++) {
			var pair = pairs[index];

			// check for a collision
			var collision = Collision.boxBox(pair[0], pair[1]);

			// attempt to resolve it if there was one
			if (collision !== null) {
				collision.attempt();
			}
		}

		// run the scene's update method if it has one
		if (typeof scene.update === 'function') {
			scene.update(dt);
		}

		// update all updatable nodes
		for (var index = scene.nodes.length - 1; index >= 0; index --) {
			var node = scene.nodes[index];

			// update if it has an update method
			if (typeof node.update === 'function') {
				node.update(dt);
			}
		}
	};

	exports.Physics = Physics;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// brute force is used in place of a quadtree when there are few nodes in a scene, a quadtree ends being slower in these cases
	function BruteForce (nodes) {
		// store the a list of movable nodes
		this.nodes = [];

		// store the a list of immovable nodes
		this.immovableNodes = [];

		// iterate the list of nodes
		for (var index = 0, length = nodes.length; index < length; index ++) {
			var node = nodes[index];

			// add it to the list of movables if the node isn't immovable
			if (node.body.immovable === false) {
				this.nodes.push(node);
			}

			// otherwise, add it the immovables
			else if (node.body.immovable === true) {
				this.immovableNodes.push(node);
			}
		}
	}

	// finds all possibly colliding pairs via brute force
	BruteForce.prototype.getPairs = function () {
		var result = [];

		// iterate each movable node
		for (var index1 = 0, length = this.nodes.length, max = this.immovableNodes.length; index1 < length; index1 ++) {
			var node = this.nodes[index1];

			// iterate each succeeding movable node
			for (var index2 = index1 + 1; index2 < length; index2 ++) {
				var other = this.nodes[index2];

				// check for collision
				result.push([node, other]);
			}

			// iterate each immovable node
			for (var index2 = 0; index2 < max; index2 ++) {
				var other = this.immovableNodes[index2];

				// check for collision
				result.push([node, other]);
			}
		}

		return result;
	};

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// a quadtree partitions a space recursively for more efficient collision detection
	function Quadtree (width, height, x, y, depth) {
		// cast the dimensions and positions to ensure they're numbers
		width = Number(width);
		height = Number(height);

		x = Number(x);
		y = Number(y);

		// cast the depth to ensure it's a number
		// default it to 0 as well
		depth = Number(depth) || 0;

		// boundary size vector
		this.size = new Vec2(width, height);

		// boundary position bound vector
		this.pos = new Vec2(x, y);

		// list of sub quadrants
		this.quads = [];

		// list of children nodes
		this.nodes = [];

		// list of immovable (infinite mass) children nodes
		this.immovableNodes = [];

		// depth of the quadtree in the entire quadtree structure
		this.depth = depth;

		// maximum number of nodes per leaf before splitting
		this.maxNodes = 10;

		// maximum depth of the entire quadtree hierarchy
		this.maxDepth = 10;
	}

	// splits the tree into four quadrants
	Quadtree.prototype.split = function () {
		// vars
		var i, length, node;

		var half = this.size.over(2);
		var middle = this.pos.plus(half);
		var corner = this.pos;

		// create the subnodes in their respective locations
		var nw = new Quadtree(half.x, half.y, corner.x, corner.y, this.depth + 1);
		var ne = new Quadtree(half.x, half.y, middle.x, corner.y, this.depth + 1);
		var sw = new Quadtree(half.x, half.y, corner.x, middle.y, this.depth + 1);
		var se = new Quadtree(half.x, half.y, middle.x, middle.y, this.depth + 1);

		// add them
		this.quads.push(nw, ne, sw, se);

		// re-add children nodes
		var nodes = this.nodes;

		this.nodes = [];

		for (i = 0, length = nodes.length; i < length; i ++) {
			node = nodes[i];

			this.add(node);
		}

		// re-add immovable children nodes
		var immovableNodes = this.immovableNodes;

		this.immovableNodes = [];

		for (i = 0, length = immovableNodes.length; i < length; i ++) {
			node = immovableNodes[i];

			this.add(node);
		}

		// chain
		return this;
	};

	// adds a node to the tree
	Quadtree.prototype.add = function (node) {
		// cast the node to ensure it's an object
		node = Object(node);

		// check the subtrees to see if the node fits in any of them
		for (var i = 0, length = this.quads.length; i < length; i ++) {
			var quad = this.quads[i];

			// use a simple SAT test to see if it fits completely into a quadtrant
			if (node.body.pos.x >= quad.pos.x &&
				node.body.pos.y >= quad.pos.y &&
				node.body.pos.x + node.body.size.x <= quad.pos.x + quad.size.x &&
				node.body.pos.y + node.body.size.y <= quad.pos.y + quad.size.y
			) {
				quad.add(node);

				return;
			}
		}

		// choose if it goes with the immovable nodes or movable nodes based on the boie's immovable flag
		// this is one of the most important optimizations in the quadtree
		if (node.body.immovable === true) {
			this.immovableNodes.push(node);
		}

		else {
			this.nodes.push(node);
		}

		// split the tree into quadrants when:
		// 1. the total number of nodes in this leaf exceeds the maximum
		// 2. this quadtrant has not split yet
		// 3. this quadrant is not at the maximum depth
		if (this.nodes.length + this.immovableNodes.length > this.maxNodes && this.quads.length === 0 && this.depth < this.maxDepth) {
			this.split();
		}
	};

	// finds all possible colliding pairs
	Quadtree.prototype.getPairs = function () {
		var result = [];

		// rain is a helper function that compares a node against all its descendants
		function rain (node, quadtree) {
			for (var i = 0, length = quadtree.quads.length; i < length; i ++) {
				var quad = quadtree.quads[i];

				for (var k = 0, max = quad.nodes.length; k < max; k ++) {
					var other = quad.nodes[k];

					result.push([node, other]);
				}

				if (node.body.immovable === false) {
					for (k = 0, max = quad.immovableNodes.length; k < max; k ++) {
						other = quad.immovableNodes[k];

						result.push([node, other]);
					}
				}

				// rain recursively
				rain(node, quad);
			}
		}

		// this recursively check each node against all the others at their level, as well as all their decendants
		function recurse (quadtree) {
			// iterate all movable nodes
			for (var i = 0, length = quadtree.nodes.length; i < length; i ++) {
				var node = quadtree.nodes[i];

				// compare against all movable nodes that come after this one
				for (var k = i + 1, max = length; k < max; k ++) {
					var other = quadtree.nodes[k];

					result.push([node, other]);
				}

				// compare against immovable nodes if this one is movable
				if (node.body.immovable === false) {
					for (k = 0, max = quadtree.immovableNodes.length; k < max; k ++) {
						other = quadtree.immovableNodes[k];

						result.push([node, other]);
					}
				}

				// compare this node against all its descendants
				rain(node, quadtree);
			}

			// check each immovable node against all its movable descendants
			for (i = 0, length = quadtree.immovableNodes.length; i < length; i ++) {
				node = quadtree.immovableNodes[i];

				// compare this node against all its descendants
				rain(node, quadtree);
			}

			// recurse into sub-quadrants
			for (i = 0, length = quadtree.quads.length; i < length; i ++) {
				var quad = quadtree.quads[i];

				recurse(quad);
			}
		}

		// start recursion
		recurse(this);

		return result;
	};

	// generates a quadtree from a list of nodes
	Quadtree.from = function (nodes) {
		// the following algorithm calculates the second largest box that contains all of the nodes provided
		// this is because the nodes beyond that box are outliers, and cannot collide with anything

		// the following variables start as far as possible from where they should end up
		// e.g, the farthest left var should start as far to the right as possible, i.e., +infinity

		// keep track of the farthest and second farthest x-pos to the left
		var minX1 = Infinity;
		var minX2 = Infinity;

		// keep track of the farthest and second farthest x-pos to the right
		var maxX1 = -Infinity;
		var maxX2 = -Infinity;

		// keep track of the farthest and second farthest x-pos to the top
		var minY1 = Infinity;
		var minY2 = Infinity;

		// keep track of the farthest and second farthest x-pos to the bottom
		var maxY1 = -Infinity;
		var maxY2 = -Infinity;

		// iterate all the nodes in the scene and calculate the second largest container
		for (var i = 0, length = nodes.length; i < length; i ++) {
			var body = nodes[i].body;

			// move the left bounds
			if (body.pos.x < minX1) {
				minX2 = minX1;
				minX1 = body.pos.x;
			}

			else if (body.pos.x < minX2) {
				minX2 = body.pos.x;
			}

			// move the right bounds
			if (body.pos.x + body.size.x > maxX1) {
				maxX2 = maxX1;
				maxX1 = body.pos.x + body.size.x;
			}

			else if (body.pos.x + body.size.x > maxX2) {
				maxX2 = body.pos.x + body.size.x;
			}

			// move the upper bounds
			if (body.pos.y < minY1) {
				minY2 = minY1;
				minY1 = body.pos.y;
			}

			else if (body.pos.y < minY2) {
				minY2 = body.pos.y;
			}

			// move the lower bounds
			if (body.pos.y + body.size.y > maxY1) {
				maxY2 = maxY1;
				maxY1 = body.pos.y + body.size.y;
			}

			else if (body.pos.y + body.size.y > maxY2) {
				maxY2 = body.pos.y + body.size.y;
			}
		}

		// generate a new quadtree with the size calculated
		var quadtree = new Quadtree(maxX2 - minX2, maxY2 - minY2, minX2, minY2);

		// iterate each node and add them to the quadtree
		for (i = 0, length = nodes.length; i < length; i ++) {
			var node = nodes[i];

			quadtree.add(node);
		}

		return quadtree;
	};

	exports.Quadtree = Quadtree;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// collision manifold generator
	function Collision (hit, node1, node2) {
		// the hit vector represents the area of collision relative to the first node
		this.hit = hit;

		// this flags if the collision has been resolved
		// it can also be set to true when it is desired that a collision not be resolve normally
		this.resolved = false;

		// store the nodes involved in the collision
		this.node1 = node1;
		this.node2 = node2;

		// this represents how much position correction should be applied to nodes in order to prevent 'sinking'
		this.correction = 0.7;

		// this represents how deep the hit must be before positional correction kicks in
		this.slop = 0;
	}

	// converts to the alternate collision which is relative to the second node instead
	Collision.prototype.alt = function () {
		// make the hit vector face the exact opposite direction
		this.hit.multiply(-1);

		// switch nodes 1 and 2 around
		var temp = this.node1;
		this.node1 = this.node2;
		this.node2 = temp;

		// chain
		return this;
	};

	// prevents collision resolution via the normal means
	Collision.prototype.prevent = function () {
		this.resolved = true;

		// chain
		return this;
	};

	// resolves the collision using impulse resolution
	Collision.prototype.resolve = function () {
		// proceed if the collision manifold hasn't been resolved yet
		if (this.resolved === false) {
			// set the flag to true so it doesn't get resolved twice
			this.resolved = true;

			// shorts
			var a = this.node1.body;
			var b = this.node2.body;

			// calulate the magnitude of the collision
			var magnitude = this.hit.magnitude();

			// calculate the collision normal
			var normal = this.hit.over(magnitude);

			// calculate relative velocity in terms of the normal direction
			var normalVel = (b.vel.minus(a.vel)).dot(normal);

			// don't resolve if velocities are seperating
			if (normalVel > 0) {
				return;
			}

			// calculate inverse masses
			var inverseMassA = 1 / a.mass;
			var inverseMassB = 1 / b.mass;

			// calculate the impulse scalar
			var impulseScalar = -(1 + Math.min(a.restitution, b.restitution)) * normalVel / (inverseMassA + inverseMassB);

			// calculate impulse vector
			var impulse = normal.times(impulseScalar);

			// apply impulse to velocity
			a.vel.sub(impulse.times(inverseMassA));
			b.vel.add(impulse.times(inverseMassB));

			// apply positional correction
			var correction = normal.times(Math.max(magnitude - this.slop, 0) / (inverseMassA + inverseMassB) * this.correction);

			a.pos.sub(correction.times(inverseMassA));
			b.pos.add(correction.times(inverseMassB));

			// prevent lerping for either body
			delete a.pre;
			delete b.pre;
		}

		// chain
		return this;
	};

	// resolves the collision purely with positional correction, facilitating 'stacking' behaviour
	Collision.prototype.stack = function () {
		// proceed if the collision manifold hasn't been resolved yet
		if (this.resolved === false) {
			// set the flag to true so it doesn't get resolved twice
			this.resolved = true;

			// shorts
			var a = this.node1.body;
			var b = this.node2.body;

			// apply positional correction to the first body
			a.pos.sub(this.hit);

			// slow the corrected body to the velocity of the other bodyif it moves into the collision
			if (a.vel.x * this.hit.x > 0) {
				a.vel.x = b.vel.x;
			}

			if (a.vel.y * this.hit.y > 0) {
				a.vel.y = b.vel.y;
			}

			// prevent lerping for the corrected body
			a.pre = a.pos.clone();
		}

		// chain
		return this;
	};

	// attempts to resolve the collision, but gives each node a chance to do it themselves first
	Collision.prototype.attempt = function () {
		// try to resolve using the resolution functions for a and b
		if (typeof this.node1.resolve === 'function') {
			this.node1.resolve(this);
		}

		if (typeof this.node2.resolve === 'function') {
			this.node2.resolve(this.alt());
		}

		// resolve it naturally
		this.resolve();

		// chain
		return this;
	};

	// box vs box collisions
	Collision.boxBox = function (node1, node2) {
		var a = node1.body;
		var b = node2.body;

		// run SAT test
		if (a.pos.x < b.pos.x + b.size.x &&
			a.pos.x + a.size.x > b.pos.x &&
			a.pos.y < b.pos.y + b.size.y &&
			a.pos.y + a.size.y > b.pos.y) {
			// calculate collision normal
			var min = a.far.minus(b.pos);
			var max = a.pos.minus(b.far);

			// use the smallest x's and y's
			var collision = new Vec3(
				Math.abs(min.x) < Math.abs(max.x) ? min.x : max.x,
				Math.abs(min.y) < Math.abs(max.y) ? min.y : max.y);

			// zero the larger axis so the collision has the shortest penatration
			collision[Math.abs(collision.x) >= Math.abs(collision.y) ? 'x' : 'y'] = 0;

			// create the collision manifold
			return new Collision(collision, node1, node2);
		}

		return null;
	};

	// circle vs circle collisions
	Collision.circleCircle = function (node1, node2) {
		var a = node1.body;
		var b = node2.body;

		// find (square) seperation between centers
		var seperation = (b.pos.x - a.pos.x) * (b.pos.x - a.pos.x) + (b.pos.y - a.pos.y) * (b.pos.y - a.pos.y);

		// find (square) sum of radii
		var radii = (a.radius + b.radius) * (a.radius + b.radius);

		// check if the distance between the centers is less than the sum of the radii
		if (seperation < radii) {
			// find actual seperation
			seperation = Math.sqrt(seperation);

			// find actual radii
			radii = a.radius + b.radius;

			// find the collision
			var collision = (new Vec3((b.pos.x - a.pos.x) / seperation, (b.pos.y - a.pos.y) / seperation)).times(radii - seperation);

			// create the collision manifold
			return new Collision(collision, node1, node2);
		}

		return null;
	};

	exports.Collision = Collision;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// the events engine is used for creating event listeners
	function Events (stage) {
		// cast the stage to an object defaulting to the body of the document
		stage = stage !== undefined ? Object(stage) : document.body;

		// store the stage
		this.stage = stage;

		// create an internal keyboard
		this.keyboard = new Keyboard();

		// create an internal mouse
		this.mouse = new Mouse(stage);

		// list of nodes that clicks are being listened for
		this.clickables = [];
	}

	// checks all events
	Events.prototype.update = function (scene, dt) {
		// check if the mouse is clicked
		if (this.mouse._clicked === true) {
			// iterate each clickable node
			for (var index = 0, length = this.clickables.length; index < length; index ++) {
				var node = this.clickables[index];

				// skip if the node has no body
				if (node.body === undefined) {
					continue;
				}

				// check if the mouse is over the node
				// the point on the node closest to the origin is in included and the point farthest is excluded
				if (
					this.mouse.pos.x > node.body.pos.x &&
					this.mouse.pos.y > node.body.pos.y &&
					this.mouse.pos.x < node.body.pos.x + node.body.size.x &&
					this.mouse.pos.y < node.body.pos.y + node.body.size.y
				) {
					// fire the node's click handler
					if (typeof node.click === 'function') {
						node.click();
					}

					// stop looking because only one node can be clicked at one time
					break;
				}
			}
		}
	};

	// causes the events engine to listen for a node getting clicked on
	Events.prototype.clickable = function (node) {
		this.clickables.push(node);

		// chain
		return this;
	};

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// utility that monitors keyboard input
	function Keyboard () {
		// actively pressed keys
		this.keys = [];

		// start listening for events
		this.listen();
	}

	// begins listening for keyboard events
	Keyboard.prototype.listen = function () {
		// vars
		var self = this;

		// event listeners
		window.addEventListener('keydown', function (event) {
			if (self.keys[event.keyCode] !== 'cancelled') {
				self.keys[event.keyCode] = true;
			}
		}, false);

		window.addEventListener('keyup', function (event) {
			delete self.keys[event.keyCode];
		}, false);

		// chain
		return this;
	};

	// checks if a key is pressed, cancels the key if specified
	Keyboard.prototype.pressed = function (key) {
		return this.keys[key] === true;
	};

	// cancels a key press so that a key has to be repressed
	Keyboard.prototype.cancel = function (key) {
		this.keys[key] = 'cancelled';

		// chain
		return this;
	};

	exports.Keyboard = Keyboard;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// utility that monitors mouse input
	function Mouse (stage) {
		// cast the stage to an object defaulting to the body of the document
		stage = stage !== undefined ? Object(stage) : document.body;

		// store the stage
		this.stage = stage;

		// flag for if the mouse is clicked
		this._clicked = false;

		// position of the mouse relative to the stage
		this.pos = new Vec2();

		// start listening for events
		this.listen();
	}

	// begins listening for mouse events
	Mouse.prototype.listen = function () {
		// vars
		var self = this;

		// event listeners
		this.stage.addEventListener('mousedown', function () {
			if (self._clicked !== 'cancelled') {
				self._clicked = true;
			}
		}, false);

		this.stage.addEventListener('mouseup', function () {
			self._clicked = false;
		}, false);

		this.stage.addEventListener('mousemove', function (event) {
			var box = self.stage.getBoundingClientRect();

			var body = document.body;
			var docElem = document.documentElement;

			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;

			var top = box.top + scrollTop - clientTop;
			var left = box.left + scrollLeft - clientLeft;

			var offset = {x : Math.round(left), y : Math.round(top)};

			self.pos.x = event.clientX - offset.x;
			self.pos.y = event.clientY - offset.y;
		}, false);

		// chain
		return this;
	};

	// checks if the mouse is clicked, cancels the click if specified
	Mouse.prototype.clicked = function (cancel) {
		if (this._clicked === true) {
			if (cancel === true) {
				this._clicked = 'cancelled';
			}

			return true;
		}

		else {
			return false;
		}
	};

	// determines if the mouse is over a body or not
	Mouse.prototype.overBody = function (body) {
		// domain
		if (!(body instanceof Body)) {
			throw new TypeError('The provided body is not of type "Body".');
		}

		return (
			this.pos.x > body.pos.x &&
			this.pos.y > body.pos.y &&
			this.pos.x < body.pos.x + body.size.x &&
			this.pos.y < body.pos.y + body.size.y);
	};

	exports.Mouse = Mouse;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// html5 canvas rendering engine
	function Renderer (stage) {
		// keep a reference to the stage
		this.stage = stage;

		// determines whether or not the renderer should clear the stage each frame
		this.clear = true;

		// create graphical rendering context
		this.ctx = this.stage.getContext('2d');
	}

	// renders a scene
	Renderer.prototype.render = function (scene, alpha) {
		// contain the viewport
		scene.bounds.contain(scene.viewport);

		// interpolate the viewport
		var viewportPos = scene.viewport.lerp(alpha);

		// store the list of graphical in the scene
		scene.graphical = [];

		// cull nodes and find their rendering locations
		for (var i = 0, length = scene.nodes.length; i < length; i ++) {
			var node = scene.nodes[i];

			// cull out non graphical nodes
			if (node.graphical === false) {
				continue;
			}

			// lerp the body
			var bodyPos = node.body.lerp(alpha);

			// cull out nodes without images, colors render function, size, and opacity, or if its outside the camera's range
			if (
				(node.sprite.image === null && node.sprite.color === null) ||
				node.body.size.x === 0 ||
				node.body.size.y === 0 ||
				node.sprite.opacity === 0 ||
				bodyPos.z <= viewportPos.z - scene.viewport.depth ||
				bodyPos.z >= scene.viewport.max
			) {
				continue;
			}

			// calculate scale factor into the rendering plane
			var scale = scene.viewport.depth / (bodyPos.z - viewportPos.z + scene.viewport.depth);

			// scale the size
			node.sprite.renderSize.x = node.body.size.x * scale;
			node.sprite.renderSize.y = node.body.size.y * scale;

			// if the sprite is fixed
			if (node.sprite.fixed === true) {
				// scale the position *not* relative to the viewport
				node.sprite.renderPos.x = bodyPos.x * scale | 0;
				node.sprite.renderPos.y = bodyPos.y * scale | 0;
			}

			else {
				// scale the position relative to the viewport
				node.sprite.renderPos.x = (bodyPos.x - viewportPos.x - scene.viewport.size.x / 2) * scale + scene.viewport.size.x / 2 | 0;
				node.sprite.renderPos.y = (bodyPos.y - viewportPos.y - scene.viewport.size.y / 2) * scale + scene.viewport.size.y / 2 | 0;
			}

			// cull out non-repating images that are outside the viewport
			if (node.sprite.repeat === false && (
				node.sprite.renderPos.x + node.sprite.renderSize.x <= 0 ||
				node.sprite.renderPos.y + node.sprite.renderSize.y <= 0 ||
				node.sprite.renderPos.x >= scene.viewport.size.x ||
				node.sprite.renderPos.y >= scene.viewport.size.y)) {
				continue;
			}

			// add it to the graphical list
			scene.graphical.push(node);
		}

		// z-sort the graphical list
		scene.graphical.sort(function (a, b) {
			return b.body.pos.z - a.body.pos.z || b.sprite.layer - a.sprite.layer;
		});

		// clear the stage if the clear flag is on
		if (this.clear === true) {
			this.ctx.clearRect(0, 0, this.stage.width, this.stage.height);
		}

		// render the sprites
		for (var i = 0, length = scene.graphical.length; i < length; i ++) {
			var node = scene.graphical[i];
			var sprite = node.sprite;

			this.ctx.globalAlpha = sprite.opacity;

			// call the node's custom render function if it exists
			if (typeof node.render === 'function') {
				node.render(sprite, this.ctx);
			}

			// render normally
			else {
				// render a solid color if the spirte has one
				if (sprite.color !== null) {
					// set the fill style to the color
					this.ctx.fillStyle = sprite.color;

					// repeated colors will simply fill the whole viewport
					if (sprite.repeat === true) {
						// fill the whole stage with the color
						this.ctx.fillRect(0, 0, scene.viewport.size.x, scene.viewport.size.y);
					}

					// render the color in its actual rendering location
					else {
						// calculate snipping values so only what will be seen gets rendered
						var snipLeft = Math.max(-sprite.renderPos.x, 0);
						var snipTop = Math.max(-sprite.renderPos.y, 0);
						var snipRight = Math.max(sprite.renderPos.x + sprite.renderSize.x - scene.viewport.size.x, 0);
						var snipBottom = Math.max(sprite.renderPos.y + sprite.renderSize.y - scene.viewport.size.y, 0);

						// render the color with snipping
						this.ctx.fillRect(
							sprite.renderPos.x + snipLeft,
							sprite.renderPos.y + snipTop,
							sprite.renderSize.x - snipLeft - snipRight,
							sprite.renderSize.y - snipTop - snipBottom);
					}
				}

				// render an image if the sprite has one
				if (sprite.image !== null) {
					// repeated sprites sprites render multiple times and cover the stage
					if (sprite.repeat === true) {
						var offsetLeft = sprite.renderPos.x % sprite.renderSize.x;
						if (offsetLeft > 0) offsetLeft -= sprite.renderSize.x;

						var offsetTop = sprite.renderPos.y % sprite.renderSize.y;
						if (offsetTop > 0) offsetTop -= sprite.renderSize.y;

						var cols = Math.ceil((scene.viewport.size.x - offsetLeft) / sprite.renderSize.x);
						var rows = Math.ceil((scene.viewport.size.y - offsetTop) / sprite.renderSize.y);

						var scaleX = sprite.size.x / sprite.renderSize.x;
						var scaleY = sprite.size.y / sprite.renderSize.y;

						for (var x = 0; x < cols; x ++) {
							for (var y = 0; y < rows; y ++) {
								// calculate snipping values so only what will be seen gets rendered
								var snipLeft = x === 0 ? -offsetLeft : 0;
								var snipTop = y === 0 ? -offsetTop : 0;
								var snipRight = x === cols - 1 ? sprite.renderSize.x * cols + offsetLeft - scene.viewport.size.x : 0;
								var snipBottom = y === rows - 1 ? sprite.renderSize.y * rows + offsetTop - scene.viewport.size.y : 0;

								this.ctx.drawImage(
									sprite.image,
									sprite.pos.x + snipLeft * scaleX,
									sprite.pos.y + snipTop * scaleY,
									sprite.size.x - (snipLeft + snipRight) * scaleX,
									sprite.size.y - (snipTop + snipBottom) * scaleY,
									sprite.renderSize.x * x + offsetLeft + snipLeft,
									sprite.renderSize.y * y + offsetTop + snipTop,
									sprite.renderSize.x - snipLeft - snipRight,
									sprite.renderSize.y - snipTop - snipBottom);
							}
						}
					}

					// draw sprite in its actual rendering location without repeating
					else {
						var scaleX = sprite.size.x / sprite.renderSize.x;
						var scaleY = sprite.size.y / sprite.renderSize.y;

						// calculate snipping values so only what will be seen gets rendered
						var snipLeft = Math.max(-sprite.renderPos.x, 0);
						var snipTop = Math.max(-sprite.renderPos.y, 0);
						var snipRight = Math.max(sprite.renderPos.x + sprite.renderSize.x - scene.viewport.size.x, 0);
						var snipBottom = Math.max(sprite.renderPos.y + sprite.renderSize.y - scene.viewport.size.y, 0);

						this.ctx.drawImage(
							sprite.image,
							sprite.pos.x + snipLeft * scaleX,
							sprite.pos.y + snipTop * scaleY,
							sprite.size.x - (snipLeft + snipRight) * scaleX,
							sprite.size.y - (snipTop + snipBottom) * scaleY,
							sprite.renderPos.x + snipLeft,
							sprite.renderPos.y + snipTop,
							sprite.renderSize.x - snipLeft - snipRight,
							sprite.renderSize.y - snipTop - snipBottom);
					}
				}
			}
		}
	};

	// renders a circle with a solid color
	Renderer.renderCircle = function (sprite, ctx) {
		if (sprite.color !== null) {
			// find the center of the rendering box
			var x = sprite.renderPos.x + sprite.renderSize.x / 2;
			var y = sprite.renderPos.y + sprite.renderSize.y / 2;

			// determine the radius to be half the average of the width and height
			var radius = (sprite.renderSize.x + sprite.renderSize.y) / 4;

			// compute the arc for the circle
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);

			// fill the arc
			ctx.fillStyle = sprite.color;
			ctx.fill();
		}
	};

	exports.Renderer = Renderer;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// utility that loads different multiple kinds of assets
	function Assets () {
		// maps file extensions to their associated loaders
		this.types = {
			jpg : this.loadImage,
			png : this.loadImage,
			bmp : this.loadImage,

			mp3 : this.loadAudioBuffer,
			ogg : this.loadAudioBuffer,
			wav : this.loadAudioBuffer,

			json : this.loadJSON,

			js : this.loadScript
		};

		// base url to which all paths are relative
		this.baseURL = '';
	}

	// loads an object mapping asset names to urls
	Assets.prototype.load = function (assets) {
		// cast the assets to ensure it is an object
		assets = Object(assets);

		// vars
		var self = this;

		// promise all assets (one for each key in assets) to load
		return window.Promise.all(Object.keys(assets).map(function (name) {
			// get the data from the asset name
			var data = assets[name];

			// store the asset as null to indicate that it hasn't loaded
			self[name] = null;

			// if the data is a url string
			if (typeof data === 'string') {
				var fileName = data;

				// find the file extension
				var extension = fileName.match(/(?:\.([^.]+))?$/)[1];

				// choose which loader to use based on the file extension
				var loader = self.types[extension];

				// if the loader for that extention exists
				if (loader !== undefined) {
					return loader.call(self, fileName).then(function (asset) {
						// attach the asset to the self
						self[name] = asset;
					});
				}

				// if no loader for that extention exists
				else {
					// return a rejected promise with an error message
					return new window.Promise(function (fulfill, reject) {
						reject(new RangeError('Unknown extension "' + extension + '".'));
					});
				}
			}

			// if the data is already a promise
			else if (data instanceof window.Promise) {
				return data.then(function (asset) {
					// attach the asset to the self
					self[name] = asset;
				});
			}
		}));
	};

	// creates a promise for an image element from a url
	Assets.prototype.loadImage = function (url) {
		// cast the url to ensure it's a string
		url = String(url);

		// make url relative to the base
		url = this.baseURL + url;

		return new window.Promise(function (fulfill, reject) {
			// create object
			var resource = new Image();

			// load
			resource.onload = function () {
				fulfill(this);
			};

			resource.src = url;
		});
	};

	// creates a promise for an audio media element from a url
	Assets.prototype.loadAudioMedia = function (url) {
		// cast the url to ensure it's a string
		url = String(url);

		// make url relative to the base
		url = this.baseURL + url;

		return new window.Promise(function (fulfill, reject) {
			// create object
			var resource = new Audio();

			resource.oncanplay = function () {
				fulfill(this);
			};

			// load
			resource.src = url;
		});
	};

	// creates a promise for an audio buffer from a url
	Assets.prototype.loadAudioBuffer = function (url) {
		// defer loading to load audio media if web audio is not implemented
		if (getWebAudio() === null) {
			return this.loadAudioMedia(url);
		}

		// cast the url to ensure it's a string
		url = String(url);

		// make url relative to the base
		url = this.baseURL + url;

		return new window.Promise(function (fulfill, reject) {
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			request.onload = function () {
				getWebAudio().decodeAudioData(request.response, function (buffer) {
					if (!buffer) {
						reject(new Error('Error decoding file data: ' + url));

						return;
					}

					fulfill(buffer);
				}, function (error) {
					reject(error);
				});
			};

			request.onerror = function() {
				reject('Audio failed to load.');
			};

			request.send();
		});
	};

	// creates a promise for json data
	Assets.prototype.loadJSON = function (url) {
		// cast the url to ensure it's a string
		url = String(url);

		// make url relative to the base
		url = this.baseURL + url;

		return new window.Promise(function (fulfill, reject) {
			// create object
			var httpRequest = new XMLHttpRequest();

			// load
			httpRequest.onreadystatechange = function () {
				if (httpRequest.readyState === 4 && httpRequest.status === 200) {
					fulfill(JSON.parse(this.responseText));
				}
			};

			httpRequest.open('GET', url);
			httpRequest.send();
		});
	};

	// creates a promise for an external script
	Assets.prototype.loadScript = function (url) {
		// cast the url to ensure it's a string
		url = String(url);

		// make url relative to the base
		url = this.baseURL + url;

		return new window.Promise(function (fulfill, reject) {
			// create object
			var resource = document.createElement('script');

			// load
			resource.onload = resource.onreadystatechange = function () {
				if (!this.readyState || this.readyState == 'complete') {
					fulfill(this);
				}
			};

			resource.src = url;

			// add to head
			document.getElementsByTagName('head')[0].appendChild(resource);
		});
	};

	exports.Assets = Assets;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	// factory is a utility that makes it easier to create different kinds of scenes and nodes
	function Factory () {}

	// scene creates a copy, or 'factory' of the scene constructor
	Factory.prototype.scene = function () {
		// create a copy of the scene constructor using the arguments as a list of components
		return Scene.copy([].slice.call(arguments));
	};

	// this creates a copy, or 'factory' of the node constructor
	Factory.prototype.node = function () {
		// create a copy of the node constructor using the arguments as a list of components
		return Node.copy([].slice.call(arguments));
	};

	// accepts a color and makes it into a fullscreen solid color background
	Factory.prototype.colorBackground = function (color) {
		// create a copy of the node constructor
		var ColorBackground = Node.copy();

		ColorBackground.prototype.init = function () {
			// give this node color background attributes
			this.attr({
				graphical : true,

				body : {
					width : this.scene.stage.width,
					height : this.scene.stage.height
				},

				sprite : {
					fixed : true,

					color : color
				}
			});
		};

		return ColorBackground;
	};

	// creates a fixed background that covers the whole scene
	Factory.prototype.background = function (image) {
		// create a copy of the node constructor
		var Background = Node.copy();

		Background.prototype.init = function () {
			// calculate the scale factor to make it cover the stage
			var scale = Math.max(this.scene.bounds.size.x / image.width, this.scene.bounds.size.y / image.height);

			// turn the thing into a background
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

					fixed : true,

					layer : Infinity
				}
			});
		};

		return Background;
	};

	// creates an infinite background in the distance 
	Factory.prototype.parallax = function (image, distance) {
		// create a copy of the node constructor
		var Parallax = Node.copy();

		Parallax.prototype.init = function () {
			// calculate the scale factor to make it cover the stage
			var scale = Math.max(this.scene.bounds.size.x / image.width, this.scene.bounds.size.y / image.height);

			// turn the thing into a background
			this.attr({
				graphical : true,

				body : {
					width : image.width * scale,
					height : image.height * scale,

					spine : 0,
					waist : 0,

					z : distance
				},

				sprite : {
					image : image,

					repeat : true,

					layer : Infinity
				}
			});
		};

		return Parallax;
	};

	// emitters generate varying particles at a fixed rate
	Factory.prototype.emitter = function (data) {
		// create a copy of the scene constructor
		var Emitter = Scene.copy();

		// get a particle constructor
		Emitter.Particle = this.particle();

		Emitter.prototype.update = function (dt) {
			this.accumulator += dt;

			while (this.accumulator >= this.interval && this.emitted <= this.max) {
				this.accumulator -= this.interval;

				this.emitted ++;

				this.make(Emitter.Particle, [this]);
			}
		};

		Emitter.prototype.init = function (emitter) {
			this.emitter = emitter;

			// store and process the data
			this.pos = data.pos;
			this.posVar = data.posVar;

			this.life = data.life;
			this.lifeVar = data.lifeVar;

			this.radiusStart = data.radiusStart;
			this.radiusEnd = data.radiusEnd;
			this.radiusVar = data.radiusVar;

			this.colorStart = data.colorStart;
			this.colorEnd = data.colorEnd;
			this.colorVar = data.colorVar;

			this.thetaStart = degreesToRadians(data.thetaStart);
			this.thetaEnd = degreesToRadians(data.thetaEnd);
			this.thetaVar = degreesToRadians(data.thetaVar);

			this.velocityStart = data.velocityStart;
			this.velocityEnd = data.velocityEnd;
			this.velocityVar = data.velocityVar;

			this.interval = 1 / data.rate;
			this.accumulator = 0;

			this.max = data.max;
			this.emitted = 0;
		};

		return Emitter;
	};

	// creates a particle for emitters
	Factory.prototype.particle = function () {
		// create a copy of the node constructor
		var Particle = Node.copy();

		Particle.prototype.init = function (emitter) {
			this.attr({
				graphical : true
			});

			this.body.pos = varyVector(emitter.pos, emitter.posVar);

			this.lifeStart = varyScalar(emitter.life, emitter.lifeVar);
			this.life = this.lifeStart;

			this.radiusStart = varyScalar(emitter.radiusStart, emitter.radiusVar);
			this.radiusEnd = varyScalar(emitter.radiusEnd, emitter.radiusVar);

			this.colorStart = varyColor(emitter.colorStart, emitter.colorVar);
			this.colorEnd = varyColor(emitter.colorEnd, emitter.colorVar);

			this.thetaStart = varyScalar(emitter.thetaStart, emitter.thetaVar);
			this.thetaEnd = varyScalar(emitter.thetaEnd, emitter.thetaVar);

			this.velocityStart = varyScalar(emitter.velocityStart, emitter.velocityVar);
			this.velocityEnd = varyScalar(emitter.velocityEnd, emitter.velocityVar);
		};

		Particle.prototype.update = function (dt) {
			// drain the amount of life remaining
			this.life -= dt;

			// once dead, knock the total emitted count down and remove the particle
			if (this.life <= 0) {
				this.emitter.emitted --;

				this.remove();
			}

			// calculate the alpha factor, the percentage of the particle's life that has passed
			var alpha = 1 - this.life / this.lifeStart;

			// calculate lerped values
			var radius = lerp(this.radiusStart, this.radiusEnd, alpha);
			var color = lerpColor(this.colorStart, this.colorEnd, alpha);
			var theta = lerp(this.thetaStart, this.thetaEnd, alpha);
			var velocity = lerp(this.velocityStart, this.velocityEnd, alpha);

			// apply the values
			this.body.size.x = this.body.size.y = radius * 2;
			this.sprite.color = arrayRGBA(color);
			this.body.vel = Vec3.polar(theta, velocity);

			// run the update particle function if one was inheritted from the emitter
			if (typeof this.updateParticle === 'function') {
				this.updateParticle(dt);
			}
		};
	};

	exports.Factory = Factory;	

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

	window.blu = exports;

	// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
})();