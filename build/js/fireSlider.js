/*! fireSlider (1.4.0) (C) 2014 CJ O'Hara and Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
var V = (window.jQuery) ? $.Velocity : Velocity;

(function (FireSlider, window, undefined) {

	var fireSlider = {
		length: 0,
		selector: '',
		sliders: [],
		events: {},

		slider: function(sel, opts, breakpoints) {

			var elements = document.querySelectorAll(sel);
			if(elements.length === 0) return;

			this.length += elements.length;
			this.selector = (this.selector === '' || this.selector === 'undefined') ? sel : this.selector + ', ' + sel;
			this.sliders = this.sliders || [];

			// Initialize each slider independently that match the selector
			for(var i = 0; i < elements.length; i++) {
					var slider = fireSlider.init(elements[i], opts, breakpoints);

					if(slider !== null) {
						elements[i].nextSlide = slider.next;
						elements[i].pause = slider.pause;
						elements[i].play = slider.play;
						elements[i].prevSlide = slider.prev;
						elements[i].reverse = slider.reverse;
						elements[i].resize = slider.resize;

						this.sliders.push(slider);
					}
			}

			this.nextSlide = function() {
				for(var i = 0; i < elements.length; i++) {
					elements[i].nextSlide();
				}
			};

			this.pause = function() {
				for(var i = 0; i < elements.length; i++) {
					elements[i].pause();
				}
			};

			this.play = function() {
				for(var i = 0; i < elements.length; i++) {
					elements[i].play();
				}
			};

			this.prevSlide = function() {
				for(var i = 0; i < elements.length; i++) {
					elements[i].prevSlide();
				}
			};

			this.reverse = function() {
				for(var i = 0; i < elements.length; i++) {
					elements[i].reverse();
				}
			};

			this.resize = function() {
				for(var i = 0; i < this.sliders.length; i++) {
					this.sliders[i].resize();
				}
			};

			return fireSlider._utilities.extend(this, elements);
		},

		init: function(elem, opts, breakpoints) {

			// Log error if velocity is not found.
			if(typeof V === 'undefined') {
				console.log('%cWARNING: fireSlider requires velocity.js to run correctly.', 'background: #E82C0C; color: white; padding: 0 12px;');
				return null;
			}

			console.log(breakpoints);

			// If slider element is hidden (display none), do not contiune.
			if(elem.clientWidth === 0 && elem.clientHeight === 0 && elem.clientTop === 0 && elem.clientLeft === 0) return null;

			// fs object holds all of the slider's information
			var fs = {
				breakpoints: {},
				data: {},
				index: 0,
				isPaused: false,
				next: {},
				options: {},
				pause: {},
				play: {},
				positions: [],
				prev: {},
				resize: {},
				reverse: {},
				settings: {},
				slider: null,
				slides: [],
				timer: {},
				windowTimer: {},
			};

			// Set slider number
			fs.index = (typeof this.sliders.length !== 'undefined') ? this.sliders.length : 0;

			// Load element
			fs.slider = elem;

			// Setup default option values
			var defaults = {
				active: 1,
				activePagerClass: 'fire-pager-active',
				activeSlideClass: 'fire-slider-active',
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

			// Get data from slider element
			var data = fireSlider._utilities.getData(elem);

			// Convert data to option values
			fs.data = {
				active: (data.firesliderActive) ? parseInt(data.firesliderActive) : undefined,
				activePagerClass: data.firesliderActivePagerClass,
				activeSlideClass: data.firesliderActiveSlideClass,
				delay: (data.firesliderDelay) ? parseInt(data.firesliderDelay) : undefined,
				direction: data.firesliderDirection,
				disableLinks: (data.firesliderDisableLinks) ? fireSlider._utilities.getBoolean(data.firesliderDisableLinks) : undefined,
				easing: (data.firesliderEasing) ? fireSlider._utilities.parseJson(data.firesliderEasing) : undefined,
				effect: data.firesliderEffect,
				hoverPause: (data.firesliderHoverPause) ? fireSlider._utilities.getBoolean(data.firesliderHoverPause) : undefined,
				next: data.firesliderNext,
				pager: data.firesliderPager,
				pagerTemplate: data.firesliderPagerTemplate,
				prev: data.firesliderPrev,
				show: (data.firesliderShow) ? parseInt(data.firesliderShow) : undefined,
				singleSlide: (data.firesliderSingleSlide) ? fireSlider._utilities.getBoolean(data.firesliderSingleSlide) : undefined,
				slide: data.firesliderSlide,
				speed: (data.firesliderSpeed) ? parseInt(data.firesliderSpeed) : undefined
			};

			bps = (breakpoints) ? breakpoints : [];
			fs.breakpoints = (data.firesliderBreakpoints) ? fireSlider._utilities.parseJson(data.firesliderBreakpoints) : bps;

			// Remove undefined data properties
			fireSlider._utilities.removeUndefined(fs.data);

			// Merge data attributes with opts values
			var options = fireSlider._utilities.extend(fs.data, opts);

			// Merge opts values with default values
			fs.options = fireSlider._utilities.extend(options, defaults);

			// Load slides
			fs.slides = fireSlider._utilities.getDirectChildren(fs.slider, fs.options.slide);

			// If there are no slides, do not continue
			if(fs.slides.length === 0) return null;

			// Load settings
			fs.settings = {
				active: fs.options.active,
				currentSlide: 0,
				direction: fs.options.direction,
				maxX: 0,
				minX: 0,
				pagerElems: [],
				sliderWidth: fs.slider.offsetWidth,
				slideWidth: fs.slider.offsetWidth / fs.options.show,
				slideWidthPercent: 1 / fs.options.show * 100,
				show: fs.options.show,
				totalSlides: fs.slides.length,
				windowWidth: window.innerWidth
			};

			// Load prev, next, and pager elements
			fs.settings.prev = (typeof fs.options.prev !== 'undefined') ? fireSlider._utilities.smartElementSearch(fs.options.prev, fs.slider, fs.index, fs.options.singleSlide) : undefined;
			fs.settings.next = (typeof fs.options.next !== 'undefined') ? fireSlider._utilities.smartElementSearch(fs.options.next, fs.slider, fs.index, fs.options.singleSlide) : undefined;
			fs.settings.pager = (typeof fs.options.pager !== 'undefined') ? fireSlider._utilities.smartElementSearch(fs.options.pager, fs.slider, fs.index, fs.options.singleSlide) : undefined;

			function reloadSlider() {
				fs.slides = fireSlider._utilities.getDirectChildren(fs.slider, fs.options.slide);
			}

			// Duplicates slides based on the multiplier, returns new array
			function multiplySlides(array, multiplier) {
				var difference = (fs.settings.totalSlides * multiplier) - array.length;

				// Add elements if there is a possitive difference
				if(difference > 0) {
					for(var i = 0; i < difference; i++) {
						var temp = array[i % fs.settings.totalSlides].cloneNode(true);
						if(fireSlider._utilities.hasClass(temp, fs.options.activeSlideClass)) {
							fireSlider._utilities.removeClass(temp, fs.options.activeSlideClass);
						}
						fs.slider.appendChild(temp);
					}
				}

				// Remove elements if there is a negative difference
				if(difference < 0) {
					for(var j = array.length - 1; j >= (array.length + difference); j--) {
						fs.slider.removeChild(fs.slides[j]);
					}
				}

				return difference;
			}

			// Updates show and active based on breakpoints set in options
			function updateBreakpoints() {
				// Reset show and active
				fs.settings.show = fs.options.show;
				fs.settings.active = fs.options.active;

				if(fs.breakpoints.length > 0) {
					var index = -1;
					var max = -1;
					for(var i = 0; i < fs.breakpoints.length; i++) {
						if(fs.breakpoints[i].breakpoint) {
							if(fs.breakpoints[i].breakpoint <= fs.settings.windowWidth && (fs.breakpoints[i].breakpoint > max)) {
								index = i;
								max = fs.breakpoints[i].breakpoint;
							}
						}
					}

					if(index !== -1) {
						if(fs.breakpoints[index].show) {
							fs.settings.show = fs.breakpoints[index].show;
						}
						if(fs.breakpoints[index].active) {
							fs.settings.active = fs.breakpoints[index].active;
						}
					}
				}
			}

			// Returns the amount of times the slides should be duplicated to fit within the window width
			function calculateMultiplier () {
				var multiplier = 1;
				var addSlides = 0;

				fs.settings.windowWidth = window.innerWidth;

				// How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
				if(fs.settings.slideWidth * fs.settings.totalSlides < fs.settings.windowWidth) {
					addSlides = Math.ceil((fs.settings.windowWidth - (fs.settings.slideWidth * fs.settings.totalSlides)) / fs.settings.slideWidth);
				}
				addSlides += fs.settings.totalSlides * 2;

				// Create a multiply based on the number of additional slides needed
				if(addSlides > 0) {
					multiplier += Math.ceil(addSlides / fs.settings.totalSlides);
				}
				return multiplier;
			}

			// Position Slides
			function positionSlides(array) {
				var startPosition = Math.ceil(array.length / 2) * -100 + (100 * (fs.settings.active - 1));
				var positionsFirst = [];
				var positionsSecond = [];
				fs.settings.minX = startPosition;
				fs.settings.maxX = startPosition + ((array.length - 1) * 100);
				for(var i = Math.floor(array.length / 2); i < array.length; i++) {
					V(array[i], {translateX: (startPosition + '%')}, {duration: 0, queue: fs.options.effect});
					array[i].style.width = fs.settings.slideWidthPercent + '%';
					array[i].style.position = 'absolute';
					positionsSecond.push(startPosition);
					startPosition += 100;
				}
				for(i = 0; i < Math.floor(array.length / 2); i++) {
					V(array[i], {translateX: (startPosition + '%')}, {duration: 0, queue: fs.options.effect});
					array[i].style.width = fs.settings.slideWidthPercent + '%';
					array[i].style.position = 'absolute';
					positionsFirst.push(startPosition);
					startPosition += 100;
				}

				fs.positions = positionsFirst.concat(positionsSecond);
				if(window.jQuery) {
					$(array).dequeue(fs.options.effect);
				} else {
					V.Utilities.dequeue(array, fs.options.effect);
				}
			}

			// Move first position to last or vice versa
			function cyclePositions(direction) {
				if(direction === 'prev') {
					var prev = fs.positions.shift();
					fs.positions.push(prev);
				} else {
					var next = fs.positions.pop();
					fs.positions.unshift(next);
				}
			}

			// Calculates positions for revolution amount
			function calculatePositions(array, revolutions) {
				var currentPositions = fs.positions.slice(0);
				
				for(var i = 0; i < revolutions; i++) {
					cyclePositions('next');
				}

				for(var j = 0; j < fs.slides.length; j++) {
					V(fs.slides[i], {translateX: (fs.positions[i] + '%')}, {duration: 0, queue: fs.options.effect});
				}
			}

			// Add click event to pager node
			function addPagerListener(node, tag) {
				fireSlider._utilities.listen(node, 'click', function(e) {
					if (e.preventDefault) e.preventDefault();
					else e.returnValue = false;

					var target = (e.target) ? e.target : e.srcElement;
					if(target.tagName.toLowerCase() === tag.toLowerCase()) {
						pagerTransition(fireSlider._utilities.getIndex(target));
					}
				});
			}

			// Clone slides as pager elements
			function createClonedPager() {
				for(var i = 0; i < fs.settings.totalSlides; i++) {
					var clone = fs.slides[i].cloneNode(true);
					fs.settings.pager.appendChild(clone);
					addPagerListener(clone, fs.options.slide);
					fs.settings.pagerElems.push(clone);
				}
			}

			// Create a regex string for parsing a template tag
			function getTemplateTagRegex(tag) {
				return new RegExp('{{\\s*' + tag + '\\s*}}', 'g');
			}

			// Parse tags from pager template
			function parsePagerTemplate(slide, template, index) {
				var result = template;

				var numTag = getTemplateTagRegex('num');
				if (result.search(numTag) !== -1) {
					result = result.replace(numTag, (index + 1).toString());
				}

				var srcTag = getTemplateTagRegex('src');
				if (result.search(srcTag) !== -1) {
					var img = slide.querySelectorAll('img')[0];
					var src = (typeof img !== "undefined") ? img.src : '';
					result = result.replace(numTag, src);
				}

				var descriptionTag = getTemplateTagRegex('description');
				if (result.search(descriptionTag) !== -1) {
					var des = (typeof fireSlider._utilities.getData(slide).firesliderPagerDescription !== "undefined") ? fireSlider._utilities.getData(slide).firesliderPagerDescription : '';
					result = result.replace(descriptionTag, des);
				}

				return result;
			}

			// Create a dom element from HTML markup
			function getDomElementFromString(markup) {
				var d = document.createElement('div');
				d.innerHTML = markup;
				return d.firstChild;
			}

			// Setup custom pager elements
			function createCustomPager() {
				for(var i = 0; i < fs.settings.totalSlides; i++) {
					var template = fs.options.pagerTemplate;
					var markup = parsePagerTemplate(fs.slides[i], template, i);
					var elm = getDomElementFromString(markup);
					fs.settings.pager.appendChild(elm);
					addPagerListener(elm, elm.tagName);
					fs.settings.pagerElems.push(elm);
				}
			}

			// Setup pager with span elements
			function createDefaultPager() {
				for(var i = 0; i < fs.settings.totalSlides; i++) {
					var span = document.createElement('span');
					fs.settings.pager.appendChild(span);
					addPagerListener(span, 'span');
					fs.settings.pagerElems.push(span);
				}
			}

			// Fills pager with elements based on total slides, adds active class to the first slide
			function setupPager() {

				if(fs.options.pagerTemplate.toLowerCase() === 'clone') {
					createClonedPager();
				} else if(fs.options.pagerTemplate !== '') {
					createCustomPager();
				} else {
					createDefaultPager();
				}

				fireSlider._utilities.addClass(fs.settings.pagerElems[0], fs.options.activePagerClass);
			}

			function prevSlide() {
				transitionSlides('prev');
			}

			function nextSlide() {
				transitionSlides('next');
			}

			// Starts the timer
			function startTimer(direction) {
				if(fs.options.delay !== 0 && !fs.isPaused) {
					fs.timer = (direction === 'backward') ? setInterval(prevSlide, fs.options.delay) : setInterval(nextSlide, fs.options.delay);

				}
			}

			// Stops the timer
			function stopTimer() {
				clearInterval(fs.timer);
			}

			// Refresh positions, breakpoints and slide count
			function refresh() {
				// Update breakpoints and width settings
				fs.settings.windowWidth = window.innerWidth;
				fs.settings.sliderWidth = fs.slider.offsetWidth;

				updateBreakpoints();
				fs.settings.slideWidthPercent = 1 / fs.settings.show * 100;
				fs.settings.slideWidth = fs.settings.sliderWidth / fs.settings.show;

				var multiplier = calculateMultiplier();

				if(fs.slides.length !== (multiplier * fs.settings.totalSlides)) {

					// Remove active class
					fireSlider._utilities.removeClass(fs.slides[fs.settings.currentSlide], fs.options.activeSlideClass);

					// Multipy slides and calculate difference
					var difference = multiplySlides(fs.slides, multiplier);

					// Fetch new slider
					reloadSlider();

					// Position slides
					positionSlides(fs.slides);

					if(fs.settings.currentSlide > fs.slides.length) {

						// Calculate current slide
						fs.settings.currentSlide = (fs.settings.currentSlide % fs.slides.length);

						// Get new positions
						calculatePositions(fs.slider, Math.abs(difference));

						if(window.jQuery) {
							$(fs.slides).dequeue(fs.options.effect);
						} else {
							V.Utilities.dequeue(fs.slides, fs.options.effect);
						}
					}

					// Re-add active class
					fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], fs.options.activeSlideClass);

				} else {
					
					positionSlides(fs.slides);
					
					calculatePositions(fs.slider, fs.settings.currentSlide);

					if(window.jQuery) {
						$(fs.slides).dequeue(fs.options.effect);
					} else {
						V.Utilities.dequeue(fs.slides, fs.options.effect);
					}
				}

				fireSlider.eventManager.trigger('fireslider-refreshed', fs);
			}

			function updateCurrentSlide(direction) {
				if(direction === 'prev') {
					fs.settings.currentSlide = (fs.settings.currentSlide === 0) ? (fs.slides.length - 1) : fs.settings.currentSlide -= 1;
				} else {
					fs.settings.currentSlide = (fs.settings.currentSlide === (fs.slides.length - 1)) ? 0 : fs.settings.currentSlide += 1;
				}
			}

			// Go to previous slide
			function transitionSlides(direction) {

				fireSlider.eventManager.trigger('fireslider-before-transition', fs);
				
				// Stop timer
				stopTimer();

				// Remove active classes
				fireSlider._utilities.removeClass(fs.slides[fs.settings.currentSlide], fs.options.activeSlideClass);
				if(typeof fs.settings.pager !== "undefined") fireSlider._utilities.removeClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], fs.options.activePagerClass);

				updateCurrentSlide(direction);

				var currentPositions = fs.positions.slice(0);
				cyclePositions(direction);

				// Calculate New Position
				for(var i = 0; i < fs.slides.length; i++) {
					fireSlider.effect.route(fs.slides[i], {
						speed: fs.options.speed,
						effect: fs.options.effect,
						easing: fs.options.easing,
						currPos: currentPositions[i],
						nextPos: fs.positions[i],
						snapping: (fs.positions[i] === fs.settings.minX || fs.positions[i] === fs.settings.maxX) ? true : false
					});
				}

				if(window.jQuery) {
					$(fs.slides).dequeue(fs.options.effect);
				} else {
					V.Utilities.dequeue(fs.slides, fs.options.effect);
				}

				// Add active classes
				fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], fs.options.activeSlideClass);
				if(typeof fs.settings.pager !== "undefined") {
					fireSlider._utilities.addClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], fs.options.activePagerClass);
				}

				// Restart timer
				startTimer(fs.settings.direction);

				fireSlider.eventManager.trigger('fireslider-after-transition', fs);
			}

			// Go to the slide relative to the index of a pager elements
			function pagerTransition(index) {

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

			// Add all necesary event listeners
			function addSliderEventListeners() {

				if(typeof fs.settings.prev !== "undefined") {
					fireSlider._utilities.listen(fs.settings.prev, 'click', function(e) {
						if (e.preventDefault) e.preventDefault();
						else e.returnValue = false;
						prevSlide();
						return false;
					});
				}

				if(typeof fs.settings.next !== "undefined") {
					fireSlider._utilities.listen(fs.settings.next, 'click', function(e) {
						if (e.preventDefault) e.preventDefault();
						else e.returnValue = false;
						nextSlide();
						return false;
					});
				}

				if(fs.options.hoverPause) {
					fireSlider._utilities.listen(fs.slider, 'mouseover', function(e) {
						stopTimer();
						return false;
					});
				}

				if(fs.options.hoverPause) {
					fireSlider._utilities.listen(fs.slider, 'mouseout', function(e) {
						startTimer(fs.settings.direction);
						return false;
					});
				}

				// Disable link interaction if slide is not active slide
				if(fs.options.disableLinks) {
					fireSlider._utilities.listen(fs.slider, 'click', function(e) {
						var target = (e.target) ? e.target : e.srcElement;
						if(target.tagName === "A") {
							var parents = fireSlider._utilities.getParents(target);
							var isActive = false;
							for(var i = 0; i < parents.length; i++) {
								if(fireSlider._utilities.hasClass(parents[i], fs.options.activeSlideClass)) {
									isActive = true;
								}
							}
							if(!isActive) {
								if (e.preventDefault) e.preventDefault();
								else e.returnValue = false;
							}
						}
					});
				}
			}

			fs.next = function() {
				prevSlide();
			};

			fs.prev = function() {
				nextSlide();
			};

			fs.pause = function() {
				fs.isPaused = true;
				stopTimer();
			};

			fs.play = function() {
				fs.isPaused = false;
				stopTimer();
				fs.settings.direction = 'forward';
				startTimer(fs.settings.direction);
			};

			fs.reverse = function() {
				fs.isPaused = false;
				stopTimer();
				fs.settings.direction = 'backward';
				startTimer(fs.settings.direction);
			};

			fs.resize = function() {
				if(fs.breakpoints.length) {
					stopTimer();
					refresh();
					startTimer(fs.settings.direction);
				}
			};

			// Set up the inital state of the slider
			function setup() {

				if(typeof fs.settings.pager !== 'undefined') {
					setupPager();
				}

				// Check Breakpoints
				updateBreakpoints();
				fs.settings.slideWidthPercent = 1 / fs.settings.show * 100;
				fs.settings.slideWidth = fs.settings.sliderWidth / fs.settings.show;

				// Caluculate the multiplyer
				var multiplier = calculateMultiplier();
				multiplySlides(fs.slides, multiplier);

				// Set the first active slide
				fs.settings.currentSlide = 0;
				fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], fs.options.activeSlideClass);

				// position the elements of the array
				reloadSlider();
				positionSlides(fs.slides);

				addSliderEventListeners();

				startTimer(fs.settings.direction);

				fireSlider.eventManager.trigger('fireslider-init', fs);
			}

			if(fs.options.singleSlide || fs.slides.length !== 1) setup();

			return fs;
		}
	};

	fireSlider.effect = {

		transitions: {
			slideInOut: 'slideInOut',
			fadeInOut: 'fadeInOut'
		},

		register: function(effectName, fn) {
			fireSlider.effect.transitions[effectName] = effectName;
			fireSlider.effect[effectName] = fn;
		},

		// Basic slide transition effect
		slideInOut: function(element, opts) {
			var duration = (opts.snapping) ? 0 : opts.speed;
			V(element, {translateX: [(opts.nextPos + '%'), (opts.currPos + '%')]}, {duration: duration, queue: opts.effect, easing: opts.easing});
		},

		// Fade in / out transition effect
		fadeInOut: function(element, opts) {
			var elemClone = element.cloneNode(true);
			element.parentNode.appendChild(elemClone);

			V(element, {translateX: [(opts.nextPos + '%'), (opts.nextPos + '%')]}, {duration: opts.speed , queue: opts.effect,
				begin: function() {
					V(elemClone, {opacity: [0.0, 1.0], zIndex: [1, 1]}, {duration: opts.speed, easing: opts.easing});
				},
				complete: function() { elemClone.parentNode.removeChild(elemClone); }
			});
		},

		// Routes slide to correct transition effect
		route: function(element, opts) {
			var effectName = opts.effect;
			if(typeof fireSlider.effect.transitions[effectName] !== 'undefined' && typeof (fireSlider.effect[effectName]) === 'function') {
				fireSlider.effect[effectName](element, opts);
			}
		}
	};

	fireSlider.eventManager = {
		register: function(eventName) {
			var e = {
				name: eventName,
				callbacks: [],
				registerCallback: function(callback) {
					this.callbacks.push(callback);
				}
			};
			fireSlider.events[eventName] = e;
		},
		trigger: function(eventName, args) {
			for(var i = 0; i < fireSlider.events[eventName].callbacks.length; i++) {
				fireSlider.events[eventName].callbacks[i](args);
			}
		},
		listen: function(eventName, callback) {
			fireSlider.events[eventName].registerCallback(callback);
		}
	};

	fireSlider._utilities = {

		// Add class to node's classList
		addClass: function(node, newClass) {
			if (node.classList) {
					node.classList.add(newClass);
			} else {
					node.className += ' ' + newClass;
			}
		},

		// Remove class from node's classList
		removeClass: function(node, rmClass) {
			if (node.classList) {
					node.classList.remove(rmClass);
			} else {
				node.className = node.className.replace(new RegExp('(^|\\b)' + rmClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			}
		},

		// Returns true if node has className
		hasClass: function(node, className) {
			return (node.classList) ? node.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(node.className);
		},

		// Format data-attribute key
		formatDataKey: function(key) {
			var temp = [];
			key = key.replace('data-', '');
			key = key.split('-');
			temp[0] = key[0];
			for(var i = 1; i < key.length; i++) {
				temp.push(key[i].charAt(0).toUpperCase() + key[i].substr(1).toLowerCase());
			}
			return temp.join('');
		},

		// Shim for element.dataset
		getData: function(node){
			if(node.dataset) {
				return node.dataset;
			} else {
				var attributes = node.attributes;
				var simulatedDataset = {};
				for (var i = attributes.length; i--; ){
					if (/^data-.*/.test(attributes[i].name)) {
						var key = fireSlider._utilities.formatDataKey(attributes[i].name);
						var value = node.getAttribute(attributes[i].name);
						simulatedDataset[key] = value;
					}
				}
				return simulatedDataset;
			}
		},

		// Returns the CSS attribute value of a DOM element
		getCssValue: function(elm, attribute) {
			return elm.currentStyle ? elm.currentStyle[attribute] : getComputedStyle(elm, null)[attribute];
		},

		// Returns true if element matches selector
		matchesSel: function(elm, sel){
			var matches = (elm.document || elm.ownerDocument).querySelectorAll(sel);
			var i = 0;
			while (matches[i] && matches[i] !== elm) { i++; }
			return matches[i] ? true : false;
		},

		// Get direct children of element matching a selector
		getDirectChildren: function(elm, sel){
			var ret = [];
			var children = elm.childNodes;
			for (var i =0; i < children.length; ++i){
				if(fireSlider._utilities.matchesSel(children[i], sel)) {
					ret.push(children[i]);
				}
			}
			return ret;
		},

		getParents: function(elm) {
			var results = [];
			while(elm.parentNode) {
				results.push(elm.parentNode);
				elm = elm.parentNode;
			}
			return results;
		},

		// Gets the index of a DOM element relative to it's parent element
		getIndex: function(node) {
			var result = -1;
			var childs = node.parentNode.childNodes;
			for(var i = 0; i < childs.length; i++) {
				if(node === childs[i]) {
					result = i;
				}
			}
			return result;
		},

		// Extend defaults into opts, returns options - comment below prevents warning about hasOwnProperty in gulp
		/* jshint -W001 */
		extend: function(opts, def) {
			var options = opts || {};
			var defaults = def || {};
			for (var opt in defaults) {
				defaults.hasOwnProperty = defaults.hasOwnProperty || Object.prototype.hasOwnProperty;
				if (defaults.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
					options[opt] = defaults[opt];
				}
			}
			return options;
		},

		// Removes properties from object that are 'undefined'
		removeUndefined: function(object) {
			for(var key in object) {
				if(typeof object[key] === "undefined") delete object[key];
			}
		},

		// Returns boolean from string
		getBoolean: function(string) {
			return (string.toLowerCase() === 'true');
		},

		// Returns the best matching element relative to the relativeElement or slide number
		smartElementSearch: function(sel, relativeElem, index, singleSlide) {
			// If selector ends with an id attribute, return matching element
			var parts = sel.split(' ');
			var last = parts.pop();
			if(last.indexOf('#') > -1) {
				return document.querySelectorAll(sel)[0];
			}

			// If selector is found in sibling elements, return matching sibling
			var siblingMatches = fireSlider._utilities.getDirectChildren(relativeElem.parentNode, sel);
			if(typeof siblingMatches !== 'undefined') {
				if(siblingMatches.length === 1) {
					return siblingMatches[0];
				}
			}

			var parentSiblingMatches = (relativeElem.parentNode.parentNode) ? fireSlider._utilities.getDirectChildren(relativeElem.parentNode.parentNode, sel) : [];
			if(parentSiblingMatches.length === 1) {
				return parentSiblingMatches[0];
			}

			// If the number of sliders and the number of matching elements match, return the same indexed item.
			var sliders = document.querySelectorAll(fireSlider.selector);
			var items = document.querySelectorAll(sel);
			if(sliders.length === items.length && items.length > index) {
				return items[index];
			}

			// If a matching element is paired with the slider, return the matching element
			var allMatches = document.querySelectorAll([fireSlider.selector, sel]);
			if(document.querySelectorAll(fireSlider.selector).length && document.querySelectorAll(sel).length) {
				var sliderFirst = (fireSlider._utilities.matchesSel(allMatches[0], fireSlider.selector));
				var found = -1;
				for(var i = 0; i < allMatches.length; i++) {
					if (fireSlider._utilities.matchesSel(allMatches[i], fireSlider.selector)) {
						found = (fireSlider._utilities.isSlider(allMatches[i], singleSlide)) ? found + 1 : found;
					}
					if (sliderFirst) {
						if(found == index && allMatches.length >= (i + 1)) {
							return (fireSlider._utilities.matchesSel(allMatches[(i + 1)], sel)) ? allMatches[(i + 1)] : undefined;
						}
					} else {
						if(found == index && (i - 1) >= 0) {
							return (fireSlider._utilities.matchesSel(allMatches[(i - 1)], sel)) ? allMatches[(i - 1)] : undefined;
						}
					}
				}
			}

			return undefined;
		},

		isSlider: function(elm, singleSlide) {
			if(elm.clientWidth === 0 && elm.clientHeight === 0 && elm.clientTop === 0 && elm.clientLeft === 0) return false;
			if(singleSlide) {
				if(elm.childNodes < 1) return false;
			} else {
				if(elm.childNodes <= 1) return false;
			}
			return true;
		},

		// Custom events will bind to these htmlEvents in ie < 9
		htmlEvents: {
			onload: 1, onunload: 1, onblur: 1, onchange: 1, onfocus: 1, onreset: 1, onselect: 1,
			onsubmit: 1, onabort: 1, onkeydown: 1, onkeypress: 1, onkeyup: 1, onclick: 1, ondblclick: 1,
			onmousedown: 1, onmousemove: 1, onmouseout: 1, onmouseover: 1, onmouseup: 1
		},

		// Event listener for built-in and custom events
		listen: function(el, type, handler){
			if(el.listenListener){
				el.listenListener(type,handler,false);
			}else if(el.attachEvent && fireSlider._utilities.htmlEvents['on'+type]){// IE < 9
				el.attachEvent('on'+type,handler);
			}else{
				el['on'+type]=handler;
			}
		},

		parseJson: function(string) {
			var result;
			try {
				result = JSON.parse(string);
			}
			catch (e) {
				result = string;
			}
			return result;
		}
	};

	// Register fireSlider events
	fireSlider.eventManager.register('fireslider-init');
	fireSlider.eventManager.register('fireslider-before-transition');
	fireSlider.eventManager.register('fireslider-before-pager-transition');
	fireSlider.eventManager.register('fireslider-after-transition');
	fireSlider.eventManager.register('fireslider-after-pager-transition');
	fireSlider.eventManager.register('fireslider-refreshed');

	window.FireSlider = fireSlider;

})((window.FireSlider = window.FireSlider || {}), window);

// If jQuery is available, create fireSlider() function
if(window.jQuery) {
	(function (window) {
		$.fn.fireSlider = function(opts, breakpoints) {

			// Call FireSlider.slider() with selector and arguments
			var sliders = FireSlider.slider(this.selector, opts, breakpoints);

			// Create jQuery object from sliders
			var result = $(sliders);

			// Add functions to jQuery object
			if(typeof sliders === 'object') {
				result.nextSlide = sliders.nextSlide;
				result.pause = sliders.pause;
				result.play = sliders.play;
				result.prevSlide = sliders.prevSlide;
				result.reverse = sliders.reverse;
				result.resize = sliders.resize;
			}

			// Return jQuery object
			return result;
		};
	})(window.jQuery);
}

// listen for window resize event.
FireSlider._utilities.listen(window, 'resize', function() {
	FireSlider.resize();
});