/*! fireSlider (2.0) (C) CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
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

	// The actual plugin constructor
	function FireSlider (el, options, sel) {
		this.$el = $(el);
		this.selector = sel;
		this._name = fireSlider;
		this._defaults = defaults;
		this._attributes = this.getData(this.$el.data());
		this.options = $.extend({}, defaults, options, this._attributes);

		// Load breakpoints
		this.options.breakpoints = ($.type(this.options.breakpoints) === 'string') ? $.parseJson(this.options.breakpoints) : this.options.breakpoints;

		// Do not continue if there are fewer than 2 slides
		// if (this.slides.length < 2) return false;

		this.init();
	}

	FireSlider.prototype = {

		init: function () {
			if (this.options[fireSlider]) {
				var existing = this.options[fireSlider];
				// Unbind events
				// reload elements
				
				console.log('already a fireslider!');
				// this.resetPager(existing);
			}


			// Do not continue if element isn't visible
			if (!this.$el.is(':visible')) return false;

			// Do not continue if velocity isn't loaded
			if ($.type($.Velocity) === 'undefined') {
				console.log('%cWARNING: fireSlider requires velocity.js to run correctly.',
					'background: #E82C0C; color: white; padding: 0 12px;');
				return false;
			}

			this.slides = this.$el.children(this.options.slide);
			if (typeof this.options.pager !== 'undefined') this.setupPager();

			this.initState();

			// Load breakpoints
			this.updateBreakpoints();
			this.state.slideWidthPercent = 1 / this.state.show * 100;
			this.state.slideWidth = this.state.sliderWidth / this.state.show;

			this.multiplySlides();

			// Set the first active slide
			this.state.currentSlide = 0;
			this.$el.children(this.options.slide).eq(this.state.currentSlide).addClass(this.options.activeSlideClass);

			// Reload Slides
			this.slides = this.$el.children(this.options.slide);
			this.positionSlides();

			this.addSliderEventListeners();

			this.startTimer(this.options.direction);

			this.prev = function () {
				this.transitionSlides('prev');
			}

			this.next = function () {
				this.transitionSlides('next');
			}

			console.log(this);
		},

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

		initState: function () {
			this.state = {
				active: this.options.active,
				currentSlide: 0,
				direction: this.options.direction,
				isPaused: false,
				maxX: 0,
				minX: 0,
				sliderWidth: this.$el.outerWidth(),
				slideWidth: this.$el.outerWidth() / this.options.show,
				slideWidthPercent: 1 / this.options.show * 100,
				show: this.options.show,
				totalSlides: this.slides.length,
				windowWidth: window.innerWidth
			};
		},

		// Fills pager with elements based on total slides, adds active class to the first slide
		setupPager: function () {
			var plugin = this;

			if(plugin.options.pagerTemplate.toLowerCase() === 'clone') {
				plugin.createClonedPager();

			} else if(plugin.options.pagerTemplate !== '') {
				plugin.createCustomPager();

			} else {
				plugin.createDefaultPager();
			}

			plugin.pages = plugin.options.pager.children();

			// Add active pager class to first element
			plugin.pages.first().addClass(plugin.options.activePagerClass);

			// Add pager element click listener
			plugin.options.pager.children().click(function (e) {
				e.preventDefault();
				$(plugin).index();
				// fs.pagerTransition(plugin.getIndex(target));
			});
		},

		// Clone slides as pager elements
		createClonedPager: function () {
			var plugin = this;
			$.each(plugin.slides, function (i, slide) {
				plugin.options.pager.append($(slide).clone()).children.eq(i);
			});
		},

		// Setup custom pager elements
		createCustomPager: function () {
			var plugin = this;
			$.each(plugin.slides, function (i, slide) {
				var markup = plugin.parsePagerTemplate(slide, plugin.options.pagerTemplate, i);
				plugin.options.pager.append(markup).children().eq(i);
			});
		},

		// Setup pager with span elements
		createDefaultPager: function () {
			var plugin = this;
			$.each(plugin.slides, function (i, slide) {
				plugin.options.pager.append('<span></span>').children().eq(i);
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

		// Updates show and active based on breakpoints
		updateBreakpoints: function () {
			var plugin = this;

			// Reset show and active
			plugin.state.show = plugin.options.show;
			plugin.state.active = plugin.options.active;

			if(plugin.options.breakpoints.length > 0) {
				var index = -1;
				var max = -1;
				$.each(plugin.options.breakpoints, function (i, bp) {
					if (bp.breakpoint) {
						if (bp.breakpoint <= plugin.state.windowWith && bp.breakpoint > max) {
							index = i;
							max = bp.breakpoint;
						}
					}
				});

				if(index !== -1) {
					if(plugin.options.breakpoints[index].show) {
						plugin.state.show = plugin.options.breakpoints[index].show;
					}
					if(plugin.options.breakpoints[index].active) {
						plugin.settings.active = plugin.options.breakpoints[index].active;
					}
				}
			}
		},

		// Duplicates slides based on the multiplier, returns new array
		multiplySlides: function () {
			var plugin = this;
			var multiplier = this.calculateMultiplier()
			var difference = (plugin.state.totalSlides * multiplier) - plugin.slides.length;

			// Add elements if there is a possitive difference
			if(difference > 0) {
				for(var i = 0; i < difference; i++) {
					var clone = plugin.slides.eq(i % plugin.state.totalSlides).clone();
					if (clone.hasClass(plugin.options.activeSlideClass)) {
						clone.removeClass(plugin.options.activeSlideClass);
					}
					plugin.$el.append(clone);
				}
			}

			// Remove elements if there is a negative difference
			if(difference < 0) {
				for(var j = plugin.slides.length - 1; j >= (plugin.slides.length + difference); j--) {
					plugin.$el.children(plugin.options.slide).eq(j).remove();
				}
			}

			return difference;
		},

		// Returns the amount of times the slides should be duplicated to fit within the window width
		calculateMultiplier: function () {
			var plugin = this;
			var multiplier = 1;
			var addSlides = 0;

			plugin.state.windowWidth = window.innerWidth;

			// How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
			if(plugin.state.slideWidth * plugin.state.totalSlides < plugin.state.windowWidth) {
				addSlides = Math.ceil((plugin.state.windowWidth - (plugin.state.slideWidth * plugin.state.totalSlides)) / plugin.state.slideWidth);
			}
			addSlides += plugin.state.totalSlides * 2;

			// Create a multiply based on the number of additional slides needed
			if(addSlides > 0) {
				multiplier += Math.ceil(addSlides / plugin.state.totalSlides);
			}
			return multiplier;
		},

		// Position Slides
		positionSlides: function () {
			var plugin = this;
			var startPosition = Math.ceil(plugin.slides.length / 2) * -100 + (100 * (plugin.state.active - 1));
			var positionsFirst = [];
			var positionsSecond = [];
			plugin.state.minX = startPosition;
			plugin.state.maxX = startPosition + ((plugin.slides.length - 1) * 100);
			for(var i = Math.floor(plugin.slides.length / 2); i < plugin.slides.length; i++) {
				plugin.slides.eq(i).velocity({translateX: (startPosition + '%')}, {duration: 0, queue: plugin.options.effect});
				plugin.slides.eq(i).css({
					width: plugin.state.slideWidthPercent + '%',
					position: 'absolute'
				});
				positionsSecond.push(startPosition);
				startPosition += 100;
			}
			for(i = 0; i < Math.floor(plugin.slides.length / 2); i++) {
				plugin.slides.eq(i).velocity({translateX: (startPosition + '%')}, {duration: 0, queue: plugin.options.effect});
				plugin.slides.eq(i).css({
					width: plugin.state.slideWidthPercent + '%',
					position: 'absolute'
				});
				positionsFirst.push(startPosition);
				startPosition += 100;
			}

			plugin.positions = positionsFirst.concat(positionsSecond);
			plugin.slides.dequeue(plugin.options.effect);
		},

		// Add all necesary event listeners
		addSliderEventListeners: function () {
			var plugin = this;

			plugin.options.prev.click(function (e) {
				e.preventDefault();
				plugin.prev();
				return false;
			});

			plugin.options.next.click(function (e) {
				e.preventDefault();
				plugin.next();
				return false;
			});

			if (plugin.options.hoverPause) {
				plugin.$el.mouseover(function (e) {
					plugin.stopTimer();
					return false;
				});

				plugin.$el.mouseout(function (e) {
					plugin.startTimer(plugin.state.direction);
					return false;
				});
			} 

			if (plugin.options.disableLinks) {
				plugin.$el.click(function (e) {
					var target = (e.target) ? e.target : e.srcElement;
					if(target.tagName === "A") {
						var isActive = false;
						$.each($(this).parents(), function (i, parent) {
							if (parent.hasClass(fs.options.activeSlideClass)) {
								isActive = true;
							}
						});

						if (isActive) {
							e.preventDefault();
						}
					}
				});
			}
		},

		// Starts the timer
		startTimer: function (direction) {
			var plugin = this;
			if(plugin.options.delay !== 0 && !plugin.state.isPaused) {
				plugin.timer = setInterval(
					(function (plugin) {
						return function() {
							plugin.transitionSlides(direction);
						}
					})(plugin), plugin.options.delay);
			}
		},

		// Stops the timer
		stopTimer: function () {
			var plugin = this;
			clearInterval(plugin.timer);
		},

		transitionSlides: function (direction) {
			var plugin = this;

			//fireSlider.eventManager.trigger('fireslider-before-transition', fs);
			
			// Stop timer
			plugin.stopTimer();

			// Remove active classes
			plugin.slides.eq(plugin.state.currentSlide).removeClass(plugin.options.activeSlideClass);
			plugin.pages.eq(plugin.state.currentSlide % plugin.state.totalSlides).removeClass(plugin.options.activePagerClass);

			plugin.updateCurrentSlide(direction);

			var currentPositions = plugin.positions.slice(0);
			plugin.cyclePositions(direction);

			// Calculate New Position
			$.each(plugin.slides, function (i, slide) {
				plugin.effect.route($(slide), {
					speed: plugin.options.speed,
					effect: plugin.options.effect,
					easing: plugin.options.easing,
					currPos: currentPositions[i],
					nextPos: plugin.positions[i],
					snapping: (plugin.positions[i] === plugin.state.minX || plugin.positions[i] === plugin.state.maxX) ? true : false
				});
			});

			plugin.slides.dequeue(plugin.options.effect);

			// Add active classes
			plugin.slides.eq(plugin.state.currentSlide).addClass(plugin.options.activeSlideClass);
			plugin.pages.eq(plugin.state.currentSlide % plugin.state.totalSlides).addClass(plugin.options.activePagerClass);

			// Restart timer
			plugin.startTimer(plugin.state.direction);

			//fireSlider.eventManager.trigger('fireslider-after-transition', fs);
		},

		updateCurrentSlide: function (direction) {
			var plugin = this;
			if(direction === 'prev') {
				plugin.state.currentSlide = (plugin.state.currentSlide === 0) ? (plugin.slides.length - 1) : plugin.state.currentSlide -= 1;
			} else {
				plugin.state.currentSlide = (plugin.state.currentSlide === (plugin.slides.length - 1)) ? 0 : plugin.state.currentSlide += 1;
			}
		},

		// Move first position to last or vice versa
		cyclePositions: function (direction) {
			var plugin = this;
			if(direction === 'prev') {
				var prev = plugin.positions.shift();
				plugin.positions.push(prev);
			} else {
				var next = plugin.positions.pop();
				plugin.positions.unshift(next);
			}
		},

		// Go to the slide relative to the index of a pager elements
		pagerTransition: function (index) {

			var difference = index - (fs.settings.currentSlide % fs.settings.totalSlides);

			if(difference !== 0) {

				fireSlider.eventManager.trigger('fireslider-before-transition', fs);
				fireSlider.eventManager.trigger('fireslider-before-pager-transition', fs);

				// Stop Timer
				stopTimer();

				// Re-load slides
				reloadSlider();

				// Remove active classes
				fireSlider._utilities.removeClass(fs.slides[fs.settings.currentSlide], fs.options.activeSlideClass);
				fireSlider._utilities.removeClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], fs.options.activePagerClass);

				var currentPositions = fs.positions.slice(0);

				if(difference < 0) {
					for(var i = 0; i < Math.abs(difference); i++) {
						cyclePositions('prev');
					}
				} else {
					for(var j = 0; j < Math.abs(difference); j++) {
						cyclePositions('next');
					}
				}

				var snappingRange = 100 * Math.abs(difference - 1);
				for(var k = 0; k < fs.slides.length; k++) {
					fireSlider.effect.route(fs.slides[k], {
						speed: fs.options.speed,
						effect: fs.options.effect,
						easing: fs.options.easing,
						currPos: currentPositions[k],
						nextPos: fs.positions[k],
						snapping: ((difference < 0 && fs.positions[k] <= (fs.settings.minX + snappingRange)) || (difference > 0 && fs.positions[k] >= (fs.settings.maxX - snappingRange))) ? true : false
					});
				}

				// Perform transitions
				if(window.jQuery) {
					$(fs.slides).dequeue(fs.options.effect);
				} else {
					V.Utilities.dequeue(fs.slides, fs.options.effect);
				}

				// Set current slide
				fs.settings.currentSlide = (fs.settings.currentSlide + difference) % fs.slides.length;

				// Add new active classes
				fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], fs.options.activeSlideClass);
				fireSlider._utilities.addClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], fs.options.activePagerClass);

				// Restart timer
				startTimer(fs.settings.direction);

				fireSlider.eventManager.trigger('fireslider-after-transition', fs);
				fireSlider.eventManager.trigger('fireslider-after-pager-transition', fs);
			}
		}

	};

	FireSlider.prototype.effect  = {

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

			clone.velocity({translateX: [(options.nextPos + '%'), (options.nextPos + '%')]}, {duration: options.speed , queue: options.effect,
				begin: function() {
					clone.velocity({opacity: [0.0, 1.0], zIndex: [1, 1]}, {duration: options.speed, easing: options.easing});
				},
				complete: function() { clone.parent().remove(clone); }
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
			// if (!$.data(this, fireSlider)) {
				$.data(this, fireSlider, new FireSlider(this, options, sel));
			// }
		});
	};

})( jQuery, window, document );