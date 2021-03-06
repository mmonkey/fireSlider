'use strict';

(function ($, window) {
	const defaults = {
		active: 1,
		activePagerClass: 'fire-pager-active',
		activeSlideClass: 'fire-slider-active',
		breakpoints: [],
		delay: 5000,
		direction: 'forward',
		disableLinks: true,
		easing: 'swing',
		effect: 'slideInOut',
		hoverPause: false,
		pagerTemplate: '',
		show: 1,
		singleSlide: false,
		slide: 'li',
		slideOffset: 100.0,
		speed: 500,
		swipe: true
	};

	function FireSlider(el, options) {
		this.$el = $(el);
		this._attributes = this.getData(this.$el.data());
		this.options = $.extend({}, defaults, options, this._attributes);

		// Load breakpoints
		this.options.breakpoints = ($.type(this.options.breakpoints) === 'string') ? $.parseJson(this.options.breakpoints) : this.options.breakpoints;
		this.preInit();
	}

	FireSlider.prototype = {

		/**
		 * Initialize fireSlider
		 */

		preInit: function () {
			const slider = this;
			slider.initialized = slider.init();

			if (slider.initialized) {
				slider.build();
				slider.run();
			} else {
				$(window).resize(() => {
					if (!slider.initialized) {
						slider.initialized = slider.init();
						if (slider.initialized) {
							slider.build();
							slider.run();
						}
					}
				});
			}
		},

		init() {
			const slider = this;

			// Do not continue if element isn't visible
			if (!slider.$el.is(':visible')) return false;
			if (slider.options.show < 1 || slider.$el.outerWidth() < 1 || slider.$el.width() < 1) return false;

			// Do not continue if velocity isn't loaded
			if ($.type($.Velocity) === 'undefined') {
				console.log('%cWARNING: fireSlider requires velocity.js to run correctly.',
					'background: #E82C0C; color: white; padding: 0 12px;');
				return false;
			}

			// Initialize slider
			slider.initSlides();
			slider.initFunctions();
			slider.backup = slider.slides.clone();

			// Do not continue if there are 1 or less slides
			if (slider.slides.length < 2) return false;

			slider.initState();
			slider.initBreakpoints();

			return true;
		},

		// Load slides onto slider
		initSlides() {
			const slider = this;
			slider.slides = slider.$el.children(slider.options.slide);
		},

		// Initialize slider
		initFunctions() {
			const slider = this;

			slider.prev = () => {
				slider.$el.trigger('fireSlider:prev');
			};

			slider.next = () => {
				slider.$el.trigger('fireSlider:next');
			};

			slider.pause = () => {
				slider.$el.trigger('fireSlider:pause');
			};

			slider.play = () => {
				slider.$el.trigger('fireSlider:play', slider.state.direction);
			};

			slider.reverse = () => {
				slider.$el.trigger('fireSlider:reverse');
			};

			slider.slide = index => {
				slider.$el.trigger('fireSlider:slide', index);
			};

			slider.destroy = () => {
				slider.$el.trigger('fireSlider:destroy');
			};
		},

		// Creates a state object on the slider for storing information
		initState() {
			const slider = this;

			slider.state = {
				active: slider.options.active,
				currentSlide: 0,
				direction: slider.options.direction,
				isPaused: false,
				maxX: 0,
				minX: 0,
				sliderWidth: slider.$el.outerWidth(),
				slideWidth: slider.$el.outerWidth() / slider.options.show,
				slideWidthPercent: 1 / slider.options.show * 100,
				show: slider.options.show,
				totalSlides: slider.slides.length,
				windowWidth: window.innerWidth
			};
		},

		// Initialize slider's breakpoints
		initBreakpoints() {
			const slider = this;

			// Reset show and active
			slider.state.show = slider.options.show;
			slider.state.active = slider.options.active;

			if (slider.options.breakpoints.length > 0) {
				let index = -1;
				let max = -1;
				$.each(slider.options.breakpoints, (i, item) => {
					if (item.breakpoint) {
						if (item.breakpoint <= slider.state.windowWidth && item.breakpoint > max) {
							index = i;
							max = item.breakpoint;
						}
					}
				});

				if (index !== -1) {
					if (slider.options.breakpoints[index].show) {
						slider.state.show = slider.options.breakpoints[index].show;
					}
					if (slider.options.breakpoints[index].active) {
						slider.state.active = slider.options.breakpoints[index].active;
					}
				}
			}

			slider.state.slideWidthPercent = 1 / slider.state.show * 100;
			slider.state.slideWidth = slider.state.sliderWidth / slider.state.show;
		},

		/**
		 * Build fireSlider
		 */

		build() {
			const slider = this;

			if (slider.options.pager instanceof jQuery) slider.buildPager();

			slider.buildSlider();

			// Set the first active slide
			slider.state.currentSlide = 0;
			slider.slides.eq(slider.state.currentSlide).addClass(slider.options.activeSlideClass);

			// Reload Slides
			slider.slides = slider.$el.children(slider.options.slide);
			slider.positionSlides();
		},

		// Create pager
		buildPager() {
			const slider = this;

			if (slider.options.pagerTemplate.toLowerCase() === 'clone') {
				slider.createClonedPager();

			} else if (slider.options.pagerTemplate !== '') {
				slider.createCustomPager();

			} else {
				slider.createDefaultPager();
			}

			slider.pages = slider.options.pager.children();

			// Add active pager class to first element
			slider.pages.first().addClass(slider.options.activePagerClass);
		},

		destroyPager() {
			const slider = this;
			if (slider.options.pager instanceof jQuery) slider.pages.remove();
		},

		// Append the appropriate number of slides to the slider
		buildSlider() {
			const slider = this;
			const difference = (slider.state.totalSlides * slider.calculateMultiplier()) - slider.slides.length;

			// Add elements if there is a positive difference
			if (difference > 0) {
				for (let i = 0; i < difference; i++) {
					const clone = slider.slides.eq(i % slider.state.totalSlides).clone();
					if (clone.hasClass(slider.options.activeSlideClass)) {
						clone.removeClass(slider.options.activeSlideClass);
					}
					slider.$el.append(clone);
				}
			}

			// Remove elements if there is a negative difference
			if (difference < 0) {
				for (let j = slider.slides.length - 1; j >= (slider.slides.length + difference); j--) {
					slider.$el.children(slider.options.slide).eq(j).remove();
				}
			}

			return difference;
		},

		// Clone slides as pager elements
		createClonedPager() {
			const slider = this;
			$.each(slider.slides, (i, slide) => {
				slider.options.pager.append($(slide).clone()).children.eq(i);
			});
		},

		// Setup custom pager elements
		createCustomPager() {
			const slider = this;
			$.each(slider.slides, (i, slide) => {
				const markup = slider.parsePagerTemplate(slide, slider.options.pagerTemplate, i);
				slider.options.pager.append(markup).children().eq(i);
			});
		},

		// Setup pager with span elements
		createDefaultPager() {
			const slider = this;
			$.each(slider.slides, i => {
				slider.options.pager.append('<span></span>').children().eq(i);
			});
		},

		// Parse tags from pager template
		parsePagerTemplate(slide, template, index) {
			const slider = this;

			let result = template;

			const numTag = slider.getTemplateTagRegex('num');
			if (result.search(numTag) !== -1) {
				result = result.replace(numTag, (index + 1).toString());
			}

			const srcTag = slider.getTemplateTagRegex('src');
			if (result.search(srcTag) !== -1) {
				const img = slide.querySelectorAll('img')[0];
				const src = (typeof img !== 'undefined') ? img.src : '';
				result = result.replace(srcTag, src);
			}

			const descriptionTag = slider.getTemplateTagRegex('description');
			if (result.search(descriptionTag) !== -1) {
				const des = ($(slide).data().firesliderPagerDescription !== 'undefined') ? $(slide).data().firesliderPagerDescription : '';
				result = result.replace(descriptionTag, des);
			}

			return result;
		},

		// Create a regex string for parsing a template tag
		getTemplateTagRegex(tag) {
			return new RegExp('{{\\s*' + tag + '\\s*}}', 'g');
		},

		// Returns the amount of times the slides should be duplicated to fit within the window width
		calculateMultiplier() {
			const slider = this;
			let multiplier = 1;
			let addSlides = 0;
			let maxSlides = 60;

			slider.state.windowWidth = window.innerWidth;

			// How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
			if (slider.state.slideWidth > 0 && slider.state.slideWidth * slider.state.totalSlides < slider.state.windowWidth) {
				addSlides = Math.ceil((slider.state.windowWidth - (slider.state.slideWidth * slider.state.totalSlides)) / slider.state.slideWidth);
			}
			addSlides += slider.state.totalSlides * 2;
			addSlides = (addSlides + slider.state.totalSlides > maxSlides) ? maxSlides - slider.state.totalSlides : addSlides;

			// Create a multiply based on the number of additional slides needed
			if (addSlides > 0) {
				multiplier += Math.ceil(addSlides / slider.state.totalSlides);
			}
			return multiplier;
		},

		// Calculates positions for revolution amount
		calculatePositions(revolutions) {
			const slider = this;

			for (let i = 0; i < revolutions; i++) {
				slider.cyclePositions('next');
			}

			if (slider.state.direction === 'forward' || slider.state.direction === 'backward') {
				$.each(slider.slides, (i, slide) => {
					$(slide).velocity({translateX: (slider.positions[i] + '%')}, {duration: 0, queue: slider.options.effect});
				});
			}

			if (slider.state.direction === 'up' || slider.state.direction === 'down') {
				$.each(slider.slides, (i, slide) => {
					$(slide).velocity({translateY: (slider.positions[i] + '%')}, {duration: 0, queue: slider.options.effect});
				});
			}
		},

		// Position Slides
		positionSlides() {
			const slider = this;
			const positionsFirst = [];
			const positionsSecond = [];
			let startPosition = Math.ceil(slider.slides.length / 2) * (slider.options.slideOffset * -1) + (slider.options.slideOffset * (slider.state.active - 1));

			slider.state.minX = startPosition;
			slider.state.maxX = startPosition + ((slider.slides.length - 1) * slider.options.slideOffset);
			for (let i = Math.floor(slider.slides.length / 2); i < slider.slides.length; i++) {

				if (slider.state.direction === 'forward' || slider.state.direction === 'backward') {
					slider.slides.eq(i).velocity({translateX: (startPosition + '%')}, {duration: 0, queue: slider.options.effect});
				}
				if (slider.state.direction === 'up' || slider.state.direction === 'down') {
					slider.slides.eq(i).velocity({translateY: (startPosition + '%')}, {duration: 0, queue: slider.options.effect});
				}

				slider.slides.eq(i).css({
					width: slider.state.slideWidthPercent + '%',
					position: 'absolute'
				});
				positionsSecond.push(startPosition);
				startPosition += slider.options.slideOffset;
			}
			for (let i = 0; i < Math.floor(slider.slides.length / 2); i++) {

				if (slider.state.direction === 'forward' || slider.state.direction === 'backward') {
					slider.slides.eq(i).velocity({translateX: (startPosition + '%')}, {duration: 0, queue: slider.options.effect});
				}
				if (slider.state.direction === 'up' || slider.state.direction === 'down') {
					slider.slides.eq(i).velocity({translateY: (startPosition + '%')}, {duration: 0, queue: slider.options.effect});
				}

				slider.slides.eq(i).css({
					width: slider.state.slideWidthPercent + '%',
					position: 'absolute'
				});
				positionsFirst.push(startPosition);
				startPosition += slider.options.slideOffset;
			}

			slider.positions = positionsFirst.concat(positionsSecond);
			slider.slides.dequeue(slider.options.effect);
		},

		/**
		 * Run fireSlider
		 */

		run() {
			const slider = this;

			slider.bindEvents();
			slider.startTimer(slider.options.direction);
		},

		bindEvents() {
			const slider = this;

			slider.$el.on('fireSlider:prev', () => {
				slider.transitionSlides('prev');
			});

			slider.$el.on('fireSlider:next', () => {
				slider.transitionSlides('next');
			});

			slider.$el.on('fireSlider:pause', () => {
				if (!slider.state.isPaused) {
					slider.state.isPaused = true;
					slider.stopTimer();
				}
			});

			slider.$el.on('fireSlider:play', (e, direction) => {
				if (slider.state.isPaused) {
					slider.state.isPaused = false;
					slider.startTimer(direction);
				}
			});

			slider.$el.on('fireSlider:slide', (e, index) => {
				if (slider.state.currentSlide !== index) slider.pagerTransition(index);
			});

			slider.$el.on('fireSlider:reverse', () => {
				if (!slider.state.isPaused) slider.$el.trigger('fireSlider:pause');
				if (slider.state.direction === 'forward' || slider.state.direction === 'backward') {
					slider.state.direction = (slider.state.direction.toLowerCase() === 'forward') ? 'backward' : 'forward';
				}
				if (slider.state.direction === 'up' || slider.state.direction === 'down') {
					slider.state.direction = (slider.state.direction.toLowerCase() === 'up') ? 'down' : 'up';
				}
				slider.$el.trigger('fireSlider:play', slider.state.direction);
			});

			slider.$el.on('fireSlider:refresh', () => {
				slider.stopTimer();
				slider.refresh();
				slider.startTimer(slider.state.direction);
			});

			slider.$el.on('fireSlider:destroy', () => {
				slider.stopTimer();
				slider.unbindEvents();
				slider.destroyPager();
				slider.slides.remove();
				slider.$el.append(slider.backup);
			});

			// Prev button
			if (slider.options.prev instanceof jQuery) {
				slider.options.prev.bind('click', $.proxy(slider.prevButtonClicked, slider));
			}

			// Next button
			if (slider.options.next instanceof jQuery) {
				slider.options.next.bind('click', $.proxy(slider.nextButtonClicked, slider));
			}

			// Pager buttons
			if (slider.options.pager instanceof jQuery) {
				slider.options.pager.children().click(e => {
					e.preventDefault();
					slider.$el.trigger('fireSlider:button:pager', $(e.target).index());
					slider.$el.trigger('fireSlider:slide', $(e.target).index());
				});
			}

			// Pause on mouseover
			slider.$el.mouseover(() => {
				if (slider.options.hoverPause) slider.$el.trigger('fireSlider:pause');
				return false;
			});

			// Play on mouseout
			slider.$el.mouseout(() => {
				if (slider.options.hoverPause) slider.$el.trigger('fireSlider:play', slider.state.direction);
				return false;
			});

			// Prevent link clicking on non-active slides
			slider.slides.find('a').click(e => {
				if (slider.options.disableLinks) {
					if (!$(e.target).closest(slider.options.slide).hasClass(slider.options.activeSlideClass)) {
						e.preventDefault();
					}
				}
			});

			$(window).resize(() => {
				slider.$el.trigger('fireSlider:refresh');
			});

			//Swipe Events
			// Do not allow swiping functions if Hammer isn't loaded
			if (typeof Hammer !== 'undefined' && slider.options.swipe === true) {
				const hammertime = new Hammer(slider.$el[0]);

				hammertime.on('swipeleft', () => {
					slider.$el.trigger('fireSlider:next');
					slider.$el.trigger('fireSlider:play', slider.state.direction);
				});

				hammertime.on('swiperight', () => {
					slider.$el.trigger('fireSlider:prev');
					slider.$el.trigger('fireSlider:play', slider.state.direction);
				});
			}
		},

		unbindEvents() {
			const slider = this;

			slider.$el.off('fireSlider:prev');
			slider.$el.off('fireSlider:next');
			slider.$el.off('fireSlider:pause');
			slider.$el.off('fireSlider:play');
			slider.$el.off('fireSlider:slide');
			slider.$el.off('fireSlider:reverse');
			slider.$el.off('fireSlider:refresh');

			if (slider.options.prev instanceof jQuery) {
				slider.options.prev.unbind('click', slider.prevButtonClicked);
			}

			if (slider.options.next instanceof jQuery) {
				slider.options.next.unbind('click', slider.nextButtonClicked);
			}
		},

		// Starts the timer
		startTimer(direction) {
			const slider = this;

			if (slider.options.delay !== 0 && !slider.state.isPaused) {
				slider.timer = setInterval(
					(slider => {
						return () => {
							slider.transitionSlides(direction);
						};
					})(slider), slider.options.delay);
			}
		},

		// Stops the timer
		stopTimer() {
			const slider = this;
			clearInterval(slider.timer);
		},

		// Move one slide in the provided direction
		transitionSlides(direction) {
			const slider = this;

			// Trigger before transition event
			slider.$el.trigger('fireSlider:transition:before');

			// Stop timer
			slider.stopTimer();

			// Remove active classes
			slider.slides.eq(slider.state.currentSlide).removeClass(slider.options.activeSlideClass);

			if (slider.pages instanceof jQuery) {
				slider.pages.eq(slider.state.currentSlide % slider.state.totalSlides).removeClass(slider.options.activePagerClass);
			}

			slider.updateCurrentSlide(direction);

			const currentPositions = slider.positions.slice(0);
			slider.cyclePositions(direction);

			// Calculate New Position
			$.each(slider.slides, (i, slide) => {
				slider.Effects.route($(slide), {
					speed: slider.options.speed,
					effect: slider.options.effect,
					easing: slider.options.easing,
					currPos: currentPositions[i],
					nextPos: slider.positions[i],
					snapping: slider.positions[i] === slider.state.minX || slider.positions[i] === slider.state.maxX,
					direction: slider.state.direction
				});
			});

			// Animate Slides
			slider.slides.dequeue(slider.options.effect);

			// Add active classes
			slider.slides.eq(slider.state.currentSlide).addClass(slider.options.activeSlideClass);

			if (slider.pages instanceof jQuery) {
				slider.pages.eq(slider.state.currentSlide % slider.state.totalSlides).addClass(slider.options.activePagerClass);
			}

			// Restart timer
			slider.startTimer(slider.state.direction);

			// Trigger after transition event
			slider.$el.trigger('fireSlider:transition:after');
		},

		// Go to the slide relative to the index of a pager elements
		pagerTransition(index) {
			const slider = this;
			const difference = index - (slider.state.currentSlide % slider.state.totalSlides);

			if (difference !== 0) {

				// Trigger before transition event
				slider.$el.trigger('fireSlider:transition:before');

				// Stop Timer
				slider.stopTimer();

				// Reload Slides
				slider.slides = slider.$el.children(slider.options.slide);

				// Remove active classes
				slider.slides.eq(slider.state.currentSlide).removeClass(slider.options.activeSlideClass);

				if (slider.pages instanceof jQuery) {
					slider.pages.eq(slider.state.currentSlide % slider.state.totalSlides).removeClass(slider.options.activePagerClass);
				}

				const currentPositions = slider.positions.slice(0);

				if (difference < 0) {
					for (let i = 0; i < Math.abs(difference); i++) {
						slider.cyclePositions('prev');
					}
				} else {
					for (let i = 0; i < Math.abs(difference); i++) {
						slider.cyclePositions('next');
					}
				}

				// Queue Animation
				const snappingRange = 100 * Math.abs(difference - 1);
				$.each(slider.slides, (i, slide) => {
					slider.Effects.route($(slide), {
						speed: slider.options.speed,
						effect: slider.options.effect,
						easing: slider.options.easing,
						currPos: currentPositions[i],
						nextPos: slider.positions[i],
						snapping: (difference < 0 && slider.positions[i] <= (slider.state.minX + snappingRange)) || (difference > 0 && slider.positions[i] >= (slider.state.maxX - snappingRange)),
						direction: slider.state.direction
					});
				});

				// Animate Slides
				slider.slides.dequeue(slider.options.effect);

				// Set current slide
				slider.state.currentSlide = (slider.state.currentSlide + difference) % slider.slides.length;

				// Add active classes
				slider.slides.eq(slider.state.currentSlide).addClass(slider.options.activeSlideClass);

				if (slider.pages instanceof jQuery) {
					slider.pages.eq(slider.state.currentSlide % slider.state.totalSlides).addClass(slider.options.activePagerClass);
				}

				// Restart timer
				slider.startTimer(slider.state.direction);

				// Trigger after transition event
				slider.$el.trigger('fireSlider:transition:after');
			}
		},

		// Update the sliders current slide state
		updateCurrentSlide(direction) {
			const slider = this;

			if (direction === 'prev' || direction.toLowerCase() === 'backward' || direction.toLowerCase() === 'down') {
				slider.state.currentSlide = (slider.state.currentSlide === 0) ? (slider.slides.length - 1) : slider.state.currentSlide -= 1;
			} else {
				slider.state.currentSlide = (slider.state.currentSlide === (slider.slides.length - 1)) ? 0 : slider.state.currentSlide += 1;
			}
		},

		// Move first position to last or vice versa
		cyclePositions(direction) {
			const slider = this;

			if (direction === 'prev' || direction.toLowerCase() === 'backward' || direction.toLowerCase() === 'down') {
				const prev = slider.positions.shift();
				slider.positions.push(prev);
			} else {
				const next = slider.positions.pop();
				slider.positions.unshift(next);
			}
		},

		/**
		 * fireSlider Events
		 */

		prevButtonClicked(e) {
			const slider = this;
			e.preventDefault();

			// Trigger button event
			slider.$el.trigger('fireSlider:button:prev');
			slider.$el.trigger('fireSlider:prev');
		},

		nextButtonClicked(e) {
			const slider = this;
			e.preventDefault();

			// Trigger button event
			slider.$el.trigger('fireSlider:button:next');
			slider.$el.trigger('fireSlider:next');
		},

		/**
		 * fireSlider utilities
		 */

		// Converts removes fireslider prefix from data stored on the slider object
		getData(data) {
			$.each(data, key => {
				$.each(['fireslider', 'fire-slider'], (i, match) => {
					if (key.toLowerCase().indexOf(match) > -1 && key !== fireSlider) {
						let newKey = key.replace(new RegExp(match, 'gi'), '');
						newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
						data[newKey] = data[key];
						delete data[key];
					}
				});
			});
			return data;
		},

		// Refresh positions, breakpoints and slide count
		refresh() {
			const slider = this;

			// Update breakpoints and width states
			slider.state.windowWidth = window.innerWidth;
			slider.state.sliderWidth = slider.$el.outerWidth();

			// Do not continue if element isn't visible
			if (!slider.$el.is(':visible')) return false;
			if (slider.options.show < 1 || slider.$el.outerWidth() < 1 || slider.$el.width < 1) return false;

			slider.initBreakpoints();

			if (slider.slides.length !== (slider.calculateMultiplier() * slider.state.totalSlides)) {

				// Remove active class
				slider.slides.eq(slider.state.currentSlide).removeClass(slider.options.activeSlideClass);

				// Rebuild slider
				const difference = slider.buildSlider(slider.slides);
				slider.initSlides();
				slider.positionSlides(slider.slides);

				if (slider.state.currentSlide > slider.slides.length) {

					// Re-position slides
					slider.state.currentSlide = (slider.state.currentSlide % slider.slides.length);
					slider.calculatePositions(Math.abs(difference));
					slider.slides.dequeue(slider.options.effect);

				}

				// Re-add active class
				slider.slides.eq(slider.state.currentSlide).addClass(slider.options.activeSlideClass);

			} else {

				// Re-position slides
				slider.positionSlides();
				slider.calculatePositions(slider.state.currentSlide);
				slider.slides.dequeue(slider.options.effect);
			}
		}
	};

	FireSlider.prototype.Effects = {

		transitions: {
			slideInOut: 'slideInOut',
			fadeInOut: 'fadeInOut'
		},

		register(effectName, fn) {
			this.transitions[effectName] = effectName;
			this[effectName] = fn;
		},

		// Basic slide transition effect
		slideInOut(el, options) {
			const duration = (options.snapping) ? 0 : options.speed;

			if (options.direction === 'forward' || options.direction === 'backward') {
				el.velocity({translateX: [(options.nextPos + '%'), (options.currPos + '%')]}, {duration: duration, queue: options.effect, easing: options.easing});
			}

			if (options.direction === 'up' || options.direction === 'down') {
				el.velocity({translateY: [(options.nextPos + '%'), (options.currPos + '%')]}, {duration: duration, queue: options.effect, easing: options.easing});
			}
		},

		// Fade in / out transition effect
		fadeInOut(el, options) {
			const clone = el.clone();
			el.parent().append(clone);

			el.velocity({translateX: [(options.nextPos + '%'), (options.nextPos + '%')]}, {
				duration: options.speed, queue: options.effect,
				begin() {
					clone.velocity({opacity: [0.0, 1.0], zIndex: [1, 1]}, {duration: options.speed, easing: options.easing});
				},
				complete() {
					clone.remove();
				}
			});
		},

		// Routes slide to correct transition effect
		route(el, options) {
			const effectName = options.effect;

			if (typeof this.transitions[effectName] !== 'undefined' && typeof (this[effectName]) === 'function') {
				this[effectName](el, options);
			}
		}
	};

	$.fn.fireSlider = function (options) {
		return this.each(function () {
			if ($.data(this, 'fireSlider')) {
				$(this).data('fireSlider').destroy();
				$(this).removeData('fireSlider');
			}
			$.data(this, 'fireSlider', new FireSlider(this, options));
		});
	};

	window.fireSlider = FireSlider;

})(jQuery, window);