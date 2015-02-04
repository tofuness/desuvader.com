$(function() {
	function pulsate() {
		$('#pulse-outer').velocity({
			opacity: [0, 1],
			scale: [1.2, 0],
			rotateZ: [45, 45]
		}, {
			delay: 1000,
			duration: 2000,
			easing: [0.215, 0.61, 0.355, 1]
		});

		$('#pulse-inner').velocity({
			opacity: [0, 1],
			scale: [1.2, 0],
			rotateZ: [45, 45]
		}, {
			delay: 1300,
			duration: 2500,
			easing: [0.215, 0.61, 0.355, 1],
			complete: pulsate
		});
	}

	pulsate();

	// Particle time

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var physics = new Physics(0);

	if (window.devicePixelRatio) {
		var canvasWidth = $(document).width();
		var canvasHeight = $(document).height();
		var canvasCssWidth = canvasWidth;
		var canvasCssHeight = canvasHeight;

		$(canvas).attr('width', canvasWidth * window.devicePixelRatio);
		$(canvas).attr('height', canvasHeight * window.devicePixelRatio);
		$(canvas).css('width', canvasCssWidth);
		$(canvas).css('height', canvasCssHeight);
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	Number.prototype.toRads = function() {
		return this * Math.PI / 180;
	}

	Number.prototype.getSign = function() {
		return this <= 0 ? -1 : 1;
	}

	var Trixel = function() {
		this.startX = 280;
		this.startY = 280;
		this.rotation = Math.random() * 360;
		this.rotationDirection = Math.random() > 0.5 ? -1 : 1;

		this.added = false;
		this.inVision = true;

		this.vel = 0;
		this.targetVel = 5;

		this.size = 0;
		this.targetSize = Math.random() * 10;

		this.alpha = 0;
		this.targetAlpha = Math.random();

		this.mass = this.targetSize / 4 + 1;

		// Only if it should cicle arund something
		this.anchor = physics.makeParticle(1, 0, 0);
		this.anchor.reset();
		this.anchor.position.x = this.startX;
		this.anchor.position.y = this.startY;
		this.anchor.makeFixed();

		this._draw = function() {
			ctx.fillStyle = 'rgba(243, 215, 127, ' + this.alpha + ')';
			ctx.save();
			ctx.beginPath();
			ctx.translate(this.particle.position.x, this.particle.position.y);
			ctx.rotate(this.rotation.toRads());
			ctx.rect(
				0,
				0,
				this.size,
				this.size
			);
			ctx.fill();
			ctx.restore();
		}

		Trixel.all.push(this);
	}

	Trixel.all = [];

	Trixel.prototype.add = function() {
		this.added = true;

		this.alpha = 0;
		this.size = 0;
		this.vel = 0;
		this.rotation = 0;

		this.particle = physics.makeParticle(this.mass, 0, 0);
		this.particle.position.x = this.startX;
		this.particle.position.y = this.startY;
		this.particle.velocity.x += (Math.random() - Math.random()) * 5;
		this.particle.velocity.y += (Math.random() - Math.random()) * 5;
		//physics.makeAttraction(this.particle, this.anchor, 50000, canvas.height);
	}

	Trixel.prototype.update = function() {
		if (!this.added) {
			console.log('Add should be called');
			this.add();
		}

		if (this.alpha < this.targetAlpha) this.alpha += 0.005;
		if (this.size < this.targetSize) this.size += 0.05;

		if (this.rotation > 360) this.rotation -= 360;
		this.rotation += 1 * this.rotationDirection;

		if (Math.random() > 1) {
			if (this.particle.velocity.x > this.particle.velocity.y) {
				this.particle.velocity.y += (Math.random() - Math.random()) * 2;
			} else {
				this.particle.velocity.x += (Math.random() - Math.random()) * 2;
			}
		}
	}

	Trixel.prototype.draw = function() {
		if (
			this.particle.position.x > $(document).width() + this.size
			|| this.particle.position.x < -this.size
			|| this.particle.position.y > $(document).height() + this.size
			|| this.particle.position.y < -this.size
		) {
			this.add();
		} else {
			this._draw();
		}
	}

	canvas.physics = physics;

	var $window = $(window);

	$window.on('resize', function() {
		$('#pulse').css({
			height: $(document).height()
		});
	});

	$window.resize();

	for (var i = 0; i < 50; i++) {
		new Trixel();
	}

	physics.play();

	function renderFrame() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		_.each(Trixel.all, function(trixel) {
			trixel.update();
			trixel.draw();
		});
		requestAnimationFrame(renderFrame);
	}

	renderFrame();
});
