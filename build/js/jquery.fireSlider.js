/*! fireSlider (1.5.0) (C) CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
;(function ($, window, document, undefined) {
	var fireSlider = "fireSlider";
	var defaults = {
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
		speed: 500
	};

	function FireSlider (el, options, sel) {
		this.$el = $(el);
		this.selector = sel;
		this._name = fireSlider;
		this._defaults = defaults;
		this._attributes = this.getData(this.$el.data());
		this.options = $.extend({}, defaults, options, this._attributes);

		// Load breakpoints
		this.options.breakpoints = ($.type(this.options.breakpoints) === 'string') ? $.parseJson(this.options.breakpoints) : this.options.breakpoints;

		if (this.init()) {
			this.build();
			this.run();
		}
	}

	FireSlider.prototype = {

		///// INITIALIZE /////

		init: function () {
			var slider = this;

			// Do not continue if element isn't visible
			if (!slider.$el.is(':visible')) return false;

			// Do not continue if velocity isn't loaded
			if ($.type($.Velocity) === 'undefined') {
				console.log('%cWARNING: fireSlider requires velocity.js to run correctly.',
					'background: #E82C0C; color: white; padding: 0 12px;');
				return false;
			}

			// Initialize slider
			slider.initSlides();
			slider.backup = slider.slides.clone();

			// Do not continue if there are 1 or less slides
			if (slider.slides.length < 2) return false;

			slider.initState();
			slider.initBreakpoints();

			return true;
		},

		// // Load slides onto slider
		initSlides: function () {
			var slider = this;
			slider.slides = slider.$el.children(slider.options.slide);
		},

		// Creates a state object on the slider for storing information
		initState: function () {
			var slider = this;
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
		initBreakpoints: function () {
			var slider = this;

			// Reset show and active
			slider.state.show = slider.options.show;
			slider.state.active = slider.options.active;

			if(slider.options.breakpoints.length > 0) {
				var index = -1;
				var max = -1;
				$.each(slider.options.breakpoints, function (i, item) {
					if (item.breakpoint) {
						if (item.breakpoint <= slider.state.windowWidth && item.breakpoint > max) {
							index = i;
							max = item.breakpoint;
						}
					}
				});

				if(index !== -1) {
					if(slider.options.breakpoints[index].show) {
						slider.state.show = slider.options.breakpoints[index].show;
					}
					if(slider.options.breakpoints[index].active) {
						slider.state.active = slider.options.breakpoints[index].active;
					}
				}
			}

			slider.state.slideWidthPercent = 1 / slider.state.show * 100;
			slider.state.slideWidth = slider.state.sliderWidth / slider.state.show;
		},


		///// BUILD /////

		build: function () {
			var slider = this;

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
		buildPager: function () {
			var slider = this;

			if(slider.options.pagerTemplate.toLowerCase() === 'clone') {
				slider.createClonedPager();

			} else if(slider.options.pagerTemplate !== '') {
				slider.createCustomPager();

			} else {
				slider.createDefaultPager();
			}

			slider.pages = slider.options.pager.children();

			// Add active pager class to first element
			slider.pages.first().addClass(slider.options.activePagerClass);
		},

		destroyPager: function () {
			var slider = this;
			if (slider.options.pager instanceof jQuery) slider.pages.remove();
		},

		// Append the appropriate number of slides to the slider
		buildSlider: function () {
			var slider = this;
			var multiplier = this.calculateMultiplier();
			var difference = (slider.state.totalSlides * multiplier) - slider.slides.length;

			// Add elements if there is a possitive difference
			if(difference > 0) {
				for(var i = 0; i < difference; i++) {
					var clone = slider.slides.eq(i % slider.state.totalSlides).clone();
					if (clone.hasClass(slider.options.activeSlideClass)) {
						clone.removeClass(slider.options.activeSlideClass);
					}
					slider.$el.append(clone);
				}
			}

			// Remove elements if there is a negative difference
			if(difference < 0) {
				for(var j = slider.slides.length - 1; j >= (slider.slides.length + difference); j--) {
					slider.$el.children(slider.options.slide).eq(j).remove();
				}
			}

			return difference;
		},

		// Clone slides as pager elements
		createClonedPager: function () {
			var slider = this;
			$.each(slider.slides, function (i, slide) {
				slider.options.pager.append($(slide).clone()).children.eq(i);
			});
		},

		// Setup custom pager elements
		createCustomPager: function () {
			var slider = this;
			$.each(slider.slides, function (i, slide) {
				var markup = slider.parsePagerTemplate(slide, slider.options.pagerTemplate, i);
				slider.options.pager.append(markup).children().eq(i);
			});
		},

		// Setup pager with span elements
		createDefaultPager: function () {
			var slider = this;
			$.each(slider.slides, function (i, slide) {
				slider.options.pager.append('<span></span>').children().eq(i);
			});
		},

		// Parse tags from pager template
		parsePagerTemplate: function (slide, template, index) {
			var result = template;

			var numTag = this.getTemplateTagRegex('num');
			if (result.search(numTag) !== -1) {
				result = result.replace(numTag, (index + 1).toString());
			}

			var srcTag = this.getTemplateTagRegex('src');
			if (result.search(srcTag) !== -1) {
				var img = slide.querySelectorAll('img')[0];
				var src = (typeof img !== "undefined") ? img.src : '';
				result = result.replace(numTag, src);
			}

			var descriptionTag = this.getTemplateTagRegex('description');
			if (result.search(descriptionTag) !== -1) {
				var des = ($(slide).data().firesliderPagerDescription !== "undefined") ? $(slide).data().firesliderPagerDescription : '';
				result = result.replace(descriptionTag, des);
			}

			return result;
		},

		// Create a regex string for parsing a template tag
		getTemplateTagRegex: function (tag) {
			return new RegExp('{{\\s*' + tag + '\\s*}}', 'g');
		},

		// Returns the amount of times the slides should be duplicated to fit within the window width
		calculateMultiplier: function () {
			var slider = this;
			var multiplier = 1;
			var addSlides = 0;

			slider.state.windowWidth = window.innerWidth;

			// How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
			if(slider.state.slideWidth * slider.state.totalSlides < slider.state.windowWidth) {
				addSlides = Math.ceil((slider.state.windowWidth - (slider.state.slideWidth * slider.state.totalSlides)) / slider.state.slideWidth);
			}
			addSlides += slider.state.totalSlides * 2;

			// Create a multiply based on the number of additional slides needed
			if(addSlides > 0) {
				multiplier += Math.ceil(addSlides / slider.state.totalSlides);
			}
			return multiplier;
		},

		// Calculates positions for revolution amount
		calculatePositions: function (revolutions) {
			var slider = this;
			var currentPositions = slider.positions.slice(0);
			
			for(var i = 0; i < revolutions; i++) {
				slider.cyclePositions('next');
			}

			$.each(slider.slides.length, function (i, slide) {
				$(slide).velocity({translateX: (slider.positions[i] + '%')}, {duration: 0, queue: slider.options.effect});
			});
		},

		// Position Slides
		positionSlides: function () {
			var slider = this;
			var startPosition = Math.ceil(slider.slides.length / 2) * -100 + (100 * (slider.state.active - 1));
			var positionsFirst = [];
			var positionsSecond = [];
			slider.state.minX = startPosition;
			slider.state.maxX = startPosition + ((slider.slides.length - 1) * 100);
			for(var i = Math.floor(slider.slides.length / 2); i < slider.slides.length; i++) {
				slider.slides.eq(i).velocity({translateX: (startPosition + '%')}, {duration: 0, queue: slider.options.effect});
				slider.slides.eq(i).css({
					width: slider.state.slideWidthPercent + '%',
					position: 'absolute'
				});
				positionsSecond.push(startPosition);
				startPosition += 100;
			}
			for(i = 0; i < Math.floor(slider.slides.length / 2); i++) {
				slider.slides.eq(i).velocity({translateX: (startPosition + '%')}, {duration: 0, queue: slider.options.effect});
				slider.slides.eq(i).css({
					width: slider.state.slideWidthPercent + '%',
					position: 'absolute'
				});
				positionsFirst.push(startPosition);
				startPosition += 100;
			}

			slider.positions = positionsFirst.concat(positionsSecond);
			slider.slides.dequeue(slider.options.effect);
		},


		///// RUN /////

		run: function () {
			var slider = this;

			slider.initFunctions();
			slider.bindEvents();
			slider.startTimer(slider.options.direction);
		},

		initFunctions: function() {
			var slider = this;

			slider.prev = function () {
				slider.$el.trigger('fireSlider:prev');
			};

			slider.next = function () {
				slider.$el.trigger('fireSlider:next');
			};

			slider.pause = function () {
				slider.$el.trigger('fireSlider:pause');
			};

			slider.play = function () {
				slider.$el.trigger('fireSlider:play', slider.state.direction);
			};

			slider.reverse = function () {
				slider.$el.trigger('fireSlider:reverse');
			};
			
			slider.slide = function (index) {
				slider.$el.trigger('fireSlider:slide', index);
			};

			slider.destroy = function () {
				slider.$el.trigger('fireSlider:destroy');
			};
		},

		bindEvents: function() {
			var slider = this;

			slider.$el.on('fireSlider:prev', function (e) {
				if (!e.isDefaultPrevented()) slider.transitionSlides('prev');
			});

			slider.$el.on('fireSlider:next', function (e) {
				if (!e.isDefaultPrevented()) slider.transitionSlides('next');
			});

			slider.$el.on('fireSlider:pause', function (e) {
				if (!e.isDefaultPrevented() && !slider.state.isPaused)  {
					slider.state.isPaused = true;
					slider.stopTimer();
				}
			});

			slider.$el.on('fireSlider:play', function (e, direction) {
				if (!e.isDefaultPrevented() && slider.state.isPaused) {
					slider.state.isPaused = false;
					slider.startTimer(direction);
				}
			});

			slider.$el.on('fireSlider:slide', function (e, index) {
				if (!e.isDefaultPrevented() && slider.state.currentSlide != index) slider.pagerTransition(index);
			});

			slider.$el.on('fireSlider:reverse', function (e) {
				if (!e.isDefaultPrevented()) {
					if (!slider.state.isPaused) slider.$el.trigger('fireSlider:pause');
					slider.state.direction = (slider.state.direction.toLowerCase() == 'forward') ? 'backward' : 'forward';
					slider.$el.trigger('fireSlider:play', slider.state.direction);
				}
			});

			slider.$el.on('fireSlider:refresh', function (e) {
				if (!e.isDefaultPrevented()) {
					slider.stopTimer();
					slider.refresh();
					slider.startTimer(slider.state.direction);
				}
			});

			slider.$el.on('fireSlider:destroy', function (e) {
				if (!e.isDefaultPrevented()) {
					slider.stopTimer();
					slider.unbindEvents();
					slider.destroyPager();
					slider.slides.remove();
					slider.$el.append(slider.backup);
				}
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
				slider.options.pager.children().click(function (e) {
					e.preventDefault();
					slider.$el.trigger('fireSlider:slide', $(this).index());
				});
			}

			// Pause on mouseover
			slider.$el.mouseover(function (e) {
				if (slider.options.hoverPause) slider.$el.trigger('fireSlider:pause');
				return false;
			});

			// Play on mouseout
			slider.$el.mouseout(function (e) {
				if (slider.options.hoverPause) slider.$el.trigger('fireSlider:play', slider.state.direction);
				return false;
			});

			// Prevent link clicking on non-active slides
			slider.slides.find('a').click(function (e) {
				if (slider.options.disableLinks) {
					if (!$(this).closest(slider.options.slide).hasClass(slider.options.activeSlideClass)) {
						e.preventDefault();
					}
				}
			});

			$(window).resize(function () {
				slider.$el.trigger('fireSlider:refresh');
			});
		},

		unbindEvents: function() {
			var slider = this;

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
		startTimer: function (direction) {
			var slider = this;
			if(slider.options.delay !== 0 && !slider.state.isPaused) {
				slider.timer = setInterval(
					(function (slider) {
						return function() {
							slider.transitionSlides(direction);
						};
					})(slider), slider.options.delay);
			}
		},

		// Stops the timer
		stopTimer: function () {
			var slider = this;
			clearInterval(slider.timer);
		},

		// Move one slide in the provided direction
		transitionSlides: function (direction) {
			var slider = this;

			//fireSlider.eventManager.trigger('fireslider-before-transition', fs);
			
			// Stop timer
			slider.stopTimer();

			// Remove active classes
			slider.slides.eq(slider.state.currentSlide).removeClass(slider.options.activeSlideClass);

			if (slider.pages instanceof jQuery) {
				slider.pages.eq(slider.state.currentSlide % slider.state.totalSlides).removeClass(slider.options.activePagerClass);
			}

			slider.updateCurrentSlide(direction);

			var currentPositions = slider.positions.slice(0);
			slider.cyclePositions(direction);

			// Calculate New Position
			$.each(slider.slides, function (i, slide) {
				slider.Effects.route($(slide), {
					speed: slider.options.speed,
					effect: slider.options.effect,
					easing: slider.options.easing,
					currPos: currentPositions[i],
					nextPos: slider.positions[i],
					snapping: (slider.positions[i] === slider.state.minX || slider.positions[i] === slider.state.maxX) ? true : false
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

			//fireSlider.eventManager.trigger('fireslider-after-transition', fs);
		},

		// Go to the slide relative to the index of a pager elements
		pagerTransition: function (index) {
			var slider = this;
			var difference = index - (slider.state.currentSlide % slider.state.totalSlides);

			if(difference !== 0) {

				//fireSlider.eventManager.trigger('fireslider-before-transition', fs);
				//fireSlider.eventManager.trigger('fireslider-before-pager-transition', fs);

				// Stop Timer
				slider.stopTimer();

				// Reload Slides
				slider.slides = slider.$el.children(slider.options.slide);

				// Remove active classes
				slider.slides.eq(slider.state.currentSlide).removeClass(slider.options.activeSlideClass);

				if (slider.pages instanceof jQuery) {
					slider.pages.eq(slider.state.currentSlide % slider.state.totalSlides).removeClass(slider.options.activePagerClass);
				}

				var currentPositions = slider.positions.slice(0);

				if(difference < 0) {
					for(var i = 0; i < Math.abs(difference); i++) {
						slider.cyclePositions('prev');
					}
				} else {
					for(var j = 0; j < Math.abs(difference); j++) {
						slider.cyclePositions('next');
					}
				}

				// Queue Animation
				var snappingRange = 100 * Math.abs(difference - 1);
				$.each(slider.slides, function (i, slide) {
					slider.Effects.route($(slide), {
						speed: slider.options.speed,
						effect: slider.options.effect,
						easing: slider.options.easing,
						currPos: currentPositions[i],
						nextPos: slider.positions[i],
						snapping: ((difference < 0 && slider.positions[i] <= (slider.state.minX + snappingRange)) || (difference > 0 && slider.positions[i] >= (slider.state.maxX - snappingRange))) ? true : false
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

				//fireSlider.eventManager.trigger('fireslider-after-transition', fs);
				//fireSlider.eventManager.trigger('fireslider-after-pager-transition', fs);
			}
		},

		// Update the sliders current slide state
		updateCurrentSlide: function (direction) {
			var slider = this;
			if(direction === 'prev' || direction.toLowerCase() === 'backward') {
				slider.state.currentSlide = (slider.state.currentSlide === 0) ? (slider.slides.length - 1) : slider.state.currentSlide -= 1;
			} else {
				slider.state.currentSlide = (slider.state.currentSlide === (slider.slides.length - 1)) ? 0 : slider.state.currentSlide += 1;
			}
		},

		// Move first position to last or vice versa
		cyclePositions: function (direction) {
			var slider = this;
			if(direction === 'prev' || direction.toLowerCase() === 'backward') {
				var prev = slider.positions.shift();
				slider.positions.push(prev);
			} else {
				var next = slider.positions.pop();
				slider.positions.unshift(next);
			}
		},


		///// EVENTS /////

		prevButtonClicked: function (e) {
			var slider = this;
			e.preventDefault();
			slider.$el.trigger('fireSlider:prev');
		},

		nextButtonClicked: function (e) {
			var slider = this;
			e.preventDefault();
			slider.$el.trigger('fireSlider:next');
		},


		///// HELPERS /////

		// Converts removes fireslider prefix from data stored on the slider object
		getData: function (data) {
			$.each(data, function(key, value) {
				$.each(["fireslider", "fire-slider"], function (i, match) {
					if (key.toLowerCase().indexOf(match) > -1 && key !== fireSlider) {
						var newKey = key.replace(new RegExp(match, 'gi'), '');
						newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
						data[newKey] = data[key];
						delete data[key];
					}
				});
			});
			return data;
		},

		// Refresh positions, breakpoints and slide count
		refresh: function() {
			var slider = this;

			// Update breakpoints and width states
			slider.state.windowWidth = window.innerWidth;
			slider.state.sliderWidth = slider.$el.outerWidth();

			slider.initBreakpoints();

			if (slider.slides.length !== (slider.calculateMultiplier() * slider.state.totalSlides)) {

				// Remove active class
				slider.slides.eq(slider.state.currentSlide).removeClass(slider.options.activeSlideClass);

				// Rebuild slider
				var difference = slider.buildSlider(slider.slides);
				slider.initSlides();
				slider.positionSlides(slider.slides);

				if(slider.state.currentSlide > slider.slides.length) {
					
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

			//fireSlider.eventManager.trigger('fireslider-refreshed', fs);
		}
	};

	FireSlider.prototype.Effects = {

		transitions: {
			slideInOut: 'slideInOut',
			fadeInOut: 'fadeInOut'
		},

		register: function (effectName, fn) {
			this.transitions[effectName] = effectName;
			this[effectName] = fn;
		},

		// Basic slide transition effect
		slideInOut: function (el, options) {
			var duration = (options.snapping) ? 0 : options.speed;
			el.velocity({translateX: [(options.nextPos + '%'), (options.currPos + '%')]}, {duration: duration, queue: options.effect, easing: options.easing});
		},

		// Fade in / out transition effect
		fadeInOut: function (el, options) {
			var clone = el.clone();
			el.parent().append(clone);

			el.velocity({translateX: [(options.nextPos + '%'), (options.nextPos + '%')]}, {duration: options.speed , queue: options.effect,
				begin: function() {
					clone.velocity({opacity: [0.0, 1.0], zIndex: [1, 1]}, {duration: options.speed, easing: options.easing});
				},
				complete: function() { clone.remove(); }
			});
		},

		// Routes slide to correct transition effect
		route: function (el, options) {
			var effectName = options.effect;
			if(typeof this.transitions[effectName] !== 'undefined' && typeof (this[effectName]) === 'function') {
				this[effectName](el, options);
			}
		}
	};

	$.fn[fireSlider] = function (options) {
		var sel = this.selector;
		return this.each(function () {

			if ($.data(this, fireSlider)) {
				$(this).data(fireSlider).destroy();
				$(this).removeData(fireSlider);
			}
			
			$.data(this, fireSlider, new FireSlider(this, options, sel));
		});
	};

})(jQuery, window, document);