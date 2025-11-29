// ============================================
// LOGIA GENESIS - Particles "Net" Background
// Clean implementation based on particles.js library
// Compatible with particles.js configuration format
// ============================================

/**
 * Default configuration (fallback if JSON fails to load)
 * Based on particles.js format
 */
const DEFAULT_CONFIG = {
	particles: {
		number: {
			value: 80,
			density: {
				enable: true,
				value_area: 800
			}
		},
		color: {
			value: "#00D9FF"
		},
		opacity: {
			value: 0.5,
			random: false
		},
		size: {
			value: 3,
			random: true
		},
		line_linked: {
			enable: true,
			distance: 150,
			color: "#00D9FF",
			opacity: 0.4,
			width: 1
		},
		move: {
			enable: true,
			speed: 6,
			direction: "none",
			random: true,
			straight: false,
			out_mode: "out",
			bounce: false
		}
	},
	interactivity: {
		detect_on: "canvas",
		events: {
			onhover: {
				enable: true,
				mode: "repulse"
			},
			onclick: {
				enable: true,
				mode: "push"
			},
			resize: true
		},
		modes: {
			repulse: {
				distance: 87.60263445013419,
				duration: 0.4
			},
			push: {
				particles_nb: 4
			}
		}
	},
	retina_detect: true
};

/**
 * Load and parse particles.js configuration
 * @returns {Promise<Object>} Configuration object
 */
const loadConfig = async () => {
	try {
		const { getResourcePath } = await import('../utils/path.js');
		const configPath = getResourcePath('/js/particlesjs-config.json');

		const response = await fetch(configPath);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: Config file not found at ${configPath}`);
		}

		const config = await response.json();

		// Validate config structure
		if (!config.particles || !config.particles.number) {
			throw new Error('Invalid config format: missing particles.number');
		}

		return config;
	} catch (error) {
		console.warn('[Particles] Failed to load config, using defaults:', error.message);
		return DEFAULT_CONFIG;
	}
};

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string
 * @returns {{r: number, g: number, b: number}|null}
 */
const hexToRgb = (hex) => {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
};

/**
 * Clamp a number between min and max
 * @param {number} number
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (number, min, max) => {
	return Math.min(Math.max(number, min), max);
};

/**
 * Check if value is in array
 * @param {*} value
 * @param {Array} array
 * @returns {boolean}
 */
const isInArray = (value, array) => {
	return array.indexOf(value) > -1;
};

/**
 * Deep extend object (like particles.js Object.deepExtend)
 * @param {Object} destination
 * @param {Object} source
 * @returns {Object}
 */
const deepExtend = (destination, source) => {
	for (const property in source) {
		if (source[property] && source[property].constructor === Object) {
			destination[property] = destination[property] || {};
			deepExtend(destination[property], source[property]);
		} else {
			destination[property] = source[property];
		}
	}
	return destination;
};

/**
 * Particles.js compatible particle system
 * Based on particles.js v2.0.0 architecture
 */
class ParticlesSystem {
	constructor(container, config) {
		this.container = container;
		this.config = config;

		// Canvas setup
		this.canvas = null;
		this.ctx = null;
		this.width = 0;
		this.height = 0;
		this.pxratio = 1;

		// Particles
		this.particles = [];

		// Animation
		this.animationId = null;
		this.isVisible = true;

		// Mouse interaction
		this.mouse = {
			pos_x: null,
			pos_y: null,
			click_pos_x: null,
			click_pos_y: null,
			click_time: null
		};
		this.status = 'mouseleave';

		// Temporary state
		this.tmp = {
			retina: false,
			repulse_clicking: false,
			repulse_count: 0,
			repulse_finish: false,
			bubble_clicking: false,
			bubble_duration_end: false,
			pushing: false
		};

		// Store original values for retina scaling
		// Note: We keep mouse and particle coordinates in logical space (not retina-scaled)
		// Only visual properties (size, line width) are scaled for retina
		this.tmp_obj = {
			size_value: config.particles.size.value,
			move_speed: config.particles.move.speed,
			line_linked_distance: config.particles.line_linked.distance,
			line_linked_width: config.particles.line_linked.width,
			mode_repulse_distance: config.interactivity.modes.repulse.distance
		};

		// Initialize
		this.init();
	}

	/**
	 * Initialize retina detection and canvas
	 */
	retinaInit() {
		if (this.config.retina_detect && window.devicePixelRatio > 1) {
			this.pxratio = window.devicePixelRatio;
			this.tmp.retina = true;
		} else {
			this.pxratio = 1;
			this.tmp.retina = false;
		}

		const rect = this.container.getBoundingClientRect();
		this.width = Math.floor(rect.width * this.pxratio);
		this.height = Math.floor(rect.height * this.pxratio);

		// Scale config values for retina
		// Note: Keep distances in logical coordinates for mouse interaction
		// Only scale visual properties (size, line width) and movement speed
		if (this.tmp.retina) {
			this.config.particles.size.value = this.tmp_obj.size_value * this.pxratio;
			this.config.particles.move.speed = this.tmp_obj.move_speed * this.pxratio;
			this.config.particles.line_linked.width = this.tmp_obj.line_linked_width * this.pxratio;
			// line_linked.distance and repulse.distance stay in logical coordinates
			// (particles and mouse are in logical coordinates)
		}
	}

	/**
	 * Create canvas element
	 */
	canvasInit() {
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'particles-net-canvas';
		this.canvas.setAttribute('aria-hidden', 'true');
		this.canvas.style.pointerEvents = 'auto';
		this.container.appendChild(this.canvas);

		this.ctx = this.canvas.getContext('2d');
	}

	/**
	 * Set canvas size
	 */
	canvasSize() {
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.style.width = `${this.width / this.pxratio}px`;
		this.canvas.style.height = `${this.height / this.pxratio}px`;

		if (this.tmp.retina) {
			this.ctx.setTransform(this.pxratio, 0, 0, this.pxratio, 0, 0);
		}
	}

	/**
	 * Calculate particle count based on density
	 */
	computeParticleCount() {
		const area = (this.width / this.pxratio) * (this.height / this.pxratio) / 1000;
		const numConfig = this.config.particles.number;

		let count;
		if (numConfig.density && numConfig.density.enable) {
			count = Math.floor(area * numConfig.value / numConfig.density.value_area);
		} else {
			count = numConfig.value;
		}

		// Clamp to sensible bounds
		count = Math.max(18, Math.min(200, count));

		// Reduce on low-power devices
		const isReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const isMobile = /Mobi|Android/i.test(navigator.userAgent);
		if (isReduced) return Math.floor(count * 0.4);
		if (isMobile) return Math.floor(count * 0.6);

		return count;
	}

	/**
	 * Create a particle (particles.js compatible)
	 */
	createParticle(position = null) {
		const p = {};

		// Size
		p.radius = (this.config.particles.size.random ? Math.random() : 1) * this.config.particles.size.value;

		// Position
		p.x = position ? position.x : Math.random() * (this.width / this.pxratio);
		p.y = position ? position.y : Math.random() * (this.height / this.pxratio);

		// Ensure particle is within canvas
		if (p.x > (this.width / this.pxratio) - p.radius * 2) p.x = p.x - p.radius;
		else if (p.x < p.radius * 2) p.x = p.x + p.radius;
		if (p.y > (this.height / this.pxratio) - p.radius * 2) p.y = p.y - p.radius;
		else if (p.y < p.radius * 2) p.y = p.y + p.radius;

		// Color
		const colorValue = this.config.particles.color.value;
		p.color = {};
		if (typeof colorValue === 'string') {
			p.color.rgb = hexToRgb(colorValue);
		}

		// Opacity
		p.opacity = (this.config.particles.opacity.random ? Math.random() : 1) * this.config.particles.opacity.value;

		// Velocity (particles.js style)
		const moveConfig = this.config.particles.move;
		let velbase = { x: 0, y: 0 };

		// Direction
		switch (moveConfig.direction) {
			case 'top': velbase = { x: 0, y: -1 }; break;
			case 'top-right': velbase = { x: 0.5, y: -0.5 }; break;
			case 'right': velbase = { x: 1, y: 0 }; break;
			case 'bottom-right': velbase = { x: 0.5, y: 0.5 }; break;
			case 'bottom': velbase = { x: 0, y: 1 }; break;
			case 'bottom-left': velbase = { x: -0.5, y: 1 }; break;
			case 'left': velbase = { x: -1, y: 0 }; break;
			case 'top-left': velbase = { x: -0.5, y: -0.5 }; break;
			default: velbase = { x: 0, y: 0 }; break;
		}

		if (moveConfig.straight) {
			p.vx = velbase.x;
			p.vy = velbase.y;
			if (moveConfig.random) {
				p.vx = p.vx * Math.random();
				p.vy = p.vy * Math.random();
			}
		} else {
			p.vx = velbase.x + Math.random() - 0.5;
			p.vy = velbase.y + Math.random() - 0.5;
		}

		// Store initial velocity
		p.vx_i = p.vx;
		p.vy_i = p.vy;

		return p;
	}

	/**
	 * Create all particles
	 */
	particlesCreate() {
		const count = this.computeParticleCount();
		this.particles = [];
		for (let i = 0; i < count; i++) {
			this.particles.push(this.createParticle());
		}
	}

	/**
	 * Draw a particle
	 */
	drawParticle(p) {
		const radius = p.radius_bubble !== undefined ? p.radius_bubble : p.radius;
		const opacity = p.opacity_bubble !== undefined ? p.opacity_bubble : p.opacity;

		const color = `rgba(${p.color.rgb.r}, ${p.color.rgb.g}, ${p.color.rgb.b}, ${opacity})`;

		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
		this.ctx.closePath();
		this.ctx.fill();
	}

	/**
	 * Link particles (draw lines between nearby particles)
	 */
	linkParticles(p1, p2) {
		const dx = p1.x - p2.x;
		const dy = p1.y - p2.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		if (dist <= this.config.particles.line_linked.distance) {
			const opacity_line = this.config.particles.line_linked.opacity - (dist / (1 / this.config.particles.line_linked.opacity)) / this.config.particles.line_linked.distance;

			if (opacity_line > 0) {
				const lineColor = hexToRgb(this.config.particles.line_linked.color);
				this.ctx.strokeStyle = `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, ${opacity_line})`;
				this.ctx.lineWidth = this.config.particles.line_linked.width;
				this.ctx.beginPath();
				this.ctx.moveTo(p1.x, p1.y);
				this.ctx.lineTo(p2.x, p2.y);
				this.ctx.stroke();
				this.ctx.closePath();
			}
		}
	}

	/**
	 * Repulse particle from mouse (particles.js style)
	 */
	repulseParticle(p) {
		const hoverConfig = this.config.interactivity.events.onhover;
		const clickConfig = this.config.interactivity.events.onclick;
		const repulseConfig = this.config.interactivity.modes.repulse;

		// Check if mode matches (handle both string and array)
		const hoverModeMatches = hoverConfig.enable &&
			(typeof hoverConfig.mode === 'string' ? hoverConfig.mode === 'repulse' : isInArray('repulse', hoverConfig.mode));

		// Hover repulse
		if (hoverModeMatches && this.status === 'mousemove' && this.mouse.pos_x !== null && this.mouse.pos_y !== null) {
			const dx_mouse = p.x - this.mouse.pos_x;
			const dy_mouse = p.y - this.mouse.pos_y;
			const dist_mouse = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);

			if (dist_mouse <= repulseConfig.distance) {
				const normVec = { x: dx_mouse / dist_mouse, y: dy_mouse / dist_mouse };
				const repulseRadius = repulseConfig.distance;
				const velocity = 100;
				const repulseFactor = clamp((1 / repulseRadius) * (-1 * Math.pow(dist_mouse / repulseRadius, 2) + 1) * repulseRadius * velocity, 0, 50);

				const pos = {
					x: p.x + normVec.x * repulseFactor,
					y: p.y + normVec.y * repulseFactor
				};

				if (this.config.particles.move.out_mode === 'bounce') {
					if (pos.x - p.radius > 0 && pos.x + p.radius < (this.width / this.pxratio)) p.x = pos.x;
					if (pos.y - p.radius > 0 && pos.y + p.radius < (this.height / this.pxratio)) p.y = pos.y;
				} else {
					p.x = pos.x;
					p.y = pos.y;
				}
			}
		}

		// Check if click mode matches (handle both string and array)
		const clickModeMatches = clickConfig.enable &&
			(typeof clickConfig.mode === 'string' ? clickConfig.mode === 'repulse' : isInArray('repulse', clickConfig.mode));

		// Click repulse
		if (clickModeMatches) {
			if (this.tmp.repulse_clicking) {
				const repulseRadius = Math.pow(repulseConfig.distance / 6, 3);
				const dx = this.mouse.click_pos_x - p.x;
				const dy = this.mouse.click_pos_y - p.y;
				const d = dx * dx + dy * dy;
				const force = -repulseRadius / d * 1;

				if (d <= repulseRadius) {
					const f = Math.atan2(dy, dx);
					p.vx = force * Math.cos(f);
					p.vy = force * Math.sin(f);

					if (this.config.particles.move.out_mode === 'bounce') {
						const pos = { x: p.x + p.vx, y: p.y + p.vy };
						if (pos.x + p.radius > (this.width / this.pxratio)) p.vx = -p.vx;
						else if (pos.x - p.radius < 0) p.vx = -p.vx;
						if (pos.y + p.radius > (this.height / this.pxratio)) p.vy = -p.vy;
						else if (pos.y - p.radius < 0) p.vy = -p.vy;
					}
				}
			} else {
				if (this.tmp.repulse_clicking === false) {
					p.vx = p.vx_i;
					p.vy = p.vy_i;
				}
			}
		}
	}

	/**
	 * Update particles (particles.js style movement)
	 */
	particlesUpdate() {
		const moveConfig = this.config.particles.move;
		const hoverConfig = this.config.interactivity.events.onhover;
		const clickConfig = this.config.interactivity.events.onclick;

		for (let i = 0; i < this.particles.length; i++) {
			const p = this.particles[i];

			// Move particle
			if (moveConfig.enable) {
				const ms = moveConfig.speed / 2;
				p.x += p.vx * ms;
				p.y += p.vy * ms;
			}

			// Handle boundaries (particles.js style)
			const canvasW = this.width / this.pxratio;
			const canvasH = this.height / this.pxratio;

			if (moveConfig.out_mode === 'bounce') {
				// Bounce mode
				if (p.x + p.radius > canvasW) p.vx = -p.vx;
				else if (p.x - p.radius < 0) p.vx = -p.vx;
				if (p.y + p.radius > canvasH) p.vy = -p.vy;
				else if (p.y - p.radius < 0) p.vy = -p.vy;
			} else {
				// Out mode - wrap around
				if (p.x - p.radius > canvasW) {
					p.x = -p.radius;
					p.y = Math.random() * canvasH;
				} else if (p.x + p.radius < 0) {
					p.x = canvasW + p.radius;
					p.y = Math.random() * canvasH;
				}
				if (p.y - p.radius > canvasH) {
					p.y = -p.radius;
					p.x = Math.random() * canvasW;
				} else if (p.y + p.radius < 0) {
					p.y = canvasH + p.radius;
					p.x = Math.random() * canvasW;
				}
			}

			// Interactivity - repulse is handled inside repulseParticle method
			// Check if mode matches (handle both string and array)
			const hoverModeMatches = hoverConfig.enable &&
				(typeof hoverConfig.mode === 'string' ? hoverConfig.mode === 'repulse' : isInArray('repulse', hoverConfig.mode));
			const clickModeMatches = clickConfig.enable &&
				(typeof clickConfig.mode === 'string' ? clickConfig.mode === 'repulse' : isInArray('repulse', clickConfig.mode));

			if (hoverModeMatches || clickModeMatches) {
				this.repulseParticle(p);
			}

			// Link particles
			if (this.config.particles.line_linked.enable) {
				for (let j = i + 1; j < this.particles.length; j++) {
					this.linkParticles(p, this.particles[j]);
				}
			}
		}
	}

	/**
	 * Draw all particles
	 */
	particlesDraw() {
		// Clear canvas
		this.ctx.clearRect(0, 0, this.width / this.pxratio, this.height / this.pxratio);

		// Update particles
		this.particlesUpdate();

		// Draw particles
		for (let i = 0; i < this.particles.length; i++) {
			this.drawParticle(this.particles[i]);
		}
	}

	/**
	 * Animation loop
	 */
	draw() {
		if (!this.isVisible) {
			this.animationId = requestAnimationFrame(() => this.draw());
			return;
		}

		this.particlesDraw();
		this.animationId = requestAnimationFrame(() => this.draw());
	}

	/**
	 * Handle mouse move
	 * Calculate position relative to canvas, even when event comes from parent section
	 */
	handleMouseMove(e) {
		// Always calculate relative to canvas, regardless of which element triggered the event
		const rect = this.canvas.getBoundingClientRect();
		let pos_x, pos_y;

		if (this.config.interactivity.detect_on === 'window') {
			pos_x = e.clientX;
			pos_y = e.clientY;
		} else {
			// Get mouse position relative to canvas bounding rect
			// This works even if the event came from a parent element
			pos_x = e.clientX - rect.left;
			pos_y = e.clientY - rect.top;

			// Clamp to canvas bounds (allow slight overflow for edge particles)
			const canvasW = this.width / this.pxratio;
			const canvasH = this.height / this.pxratio;
			// Don't clamp too strictly - allow some margin for particles near edges
			pos_x = Math.max(-50, Math.min(canvasW + 50, pos_x));
			pos_y = Math.max(-50, Math.min(canvasH + 50, pos_y));
		}

		// Store in logical coordinates (not retina-scaled)
		// Particles are stored in logical coordinates, so mouse should match
		this.mouse.pos_x = pos_x;
		this.mouse.pos_y = pos_y;
		this.status = 'mousemove';
	}

	/**
	 * Handle mouse leave
	 */
	handleMouseLeave() {
		this.mouse.pos_x = null;
		this.mouse.pos_y = null;
		this.status = 'mouseleave';
	}

	/**
	 * Handle click
	 */
	handleClick() {
		this.mouse.click_pos_x = this.mouse.pos_x;
		this.mouse.click_pos_y = this.mouse.pos_y;
		this.mouse.click_time = new Date().getTime();

		const clickConfig = this.config.interactivity.events.onclick;
		if (!clickConfig.enable) return;

		switch (clickConfig.mode) {
			case 'push':
				this.pushParticles(this.config.interactivity.modes.push.particles_nb);
				break;
			case 'repulse':
				this.tmp.repulse_clicking = true;
				this.tmp.repulse_count = 0;
				this.tmp.repulse_finish = false;
				setTimeout(() => {
					this.tmp.repulse_clicking = false;
				}, this.config.interactivity.modes.repulse.duration * 1000);
				break;
		}
	}

	/**
	 * Push particles (add new particles on click)
	 */
	pushParticles(nb) {
		this.tmp.pushing = true;
		const canvasW = this.width / this.pxratio;
		const canvasH = this.height / this.pxratio;

		for (let i = 0; i < nb; i++) {
			const pos = this.mouse.click_pos_x !== null ? {
				x: this.mouse.click_pos_x,
				y: this.mouse.click_pos_y
			} : {
				x: Math.random() * canvasW,
				y: Math.random() * canvasH
			};

			this.particles.push(this.createParticle(pos));
		}

		this.tmp.pushing = false;
	}

	/**
	 * Setup event listeners
	 * Listen on cta-section (parent) so events work even when hovering over content above canvas
	 */
	setupEventListeners() {
		// Find the parent .cta-section to listen for events on the entire section
		// This ensures we capture mouse events even when hovering over content
		const ctaSection = this.container.closest('.cta-section');
		const el = this.config.interactivity.detect_on === 'window'
			? window
			: (ctaSection || this.container);

		if (this.config.interactivity.events.onhover.enable || this.config.interactivity.events.onclick.enable) {
			const mouseMoveHandler = (e) => {
				this.handleMouseMove(e);
			};
			const mouseLeaveHandler = () => {
				this.handleMouseLeave();
			};

			el.addEventListener('mousemove', mouseMoveHandler, { passive: true });
			el.addEventListener('mouseleave', mouseLeaveHandler, { passive: true });

			// Store handlers for cleanup
			this._mouseMoveHandler = mouseMoveHandler;
			this._mouseLeaveHandler = mouseLeaveHandler;
		}

		if (this.config.interactivity.events.onclick.enable) {
			const clickHandler = () => {
				this.handleClick();
			};
			el.addEventListener('click', clickHandler, { passive: true });
			this._clickHandler = clickHandler;
		}

		// Resize handler
		if (this.config.interactivity.events.resize) {
			window.addEventListener('resize', () => {
				this.retinaInit();
				this.canvasSize();
				this.particlesCreate();
			}, { passive: true });
		}
	}

	/**
	 * Initialize the particle system
	 */
	init() {
		this.retinaInit();
		this.canvasInit();
		this.canvasSize();
		this.particlesCreate();
		this.setupEventListeners();

		// Visibility observer
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				this.isVisible = entry.isIntersecting;
			});
		}, { threshold: 0.05 });
		io.observe(this.container);

		// Start animation
		this.draw();
	}

	/**
	 * Cleanup
	 */
	destroy() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
		if (this.canvas) {
			this.canvas.remove();
		}
	}
}

/**
 * Initialize particles on a container
 * @param {HTMLElement} container - Container element
 * @param {Object} config - Configuration object
 * @returns {ParticlesSystem} Particle system instance
 */
export const initNetParticles = (container, config) => {
	if (!container) return null;
	if (container.dataset.netInitialized === 'true') return null;
	container.dataset.netInitialized = 'true';

	return new ParticlesSystem(container, config);
};

/**
 * Initialize particles on all CTA sections
 */
export const initCTANetBackgrounds = async () => {
	try {
		const config = await loadConfig();
		const backgrounds = document.querySelectorAll('.cta-section .cta-background');

		if (!backgrounds || backgrounds.length === 0) {
			return;
		}

		backgrounds.forEach((bg) => {
			try {
				initNetParticles(bg, config);
			} catch (error) {
				console.error('[Particles] Error initializing particles:', error);
			}
		});
	} catch (error) {
		console.error('[Particles] Error loading config:', error);
	}
};

// Optional global for debugging
window.initCTANetBackgrounds = initCTANetBackgrounds;
