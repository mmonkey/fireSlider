/*!
 * fireSlider (1.2.0) (C) 2014 CJ O'Hara and Tyler Fowle.
 * MIT @license: en.wikipedia.org/wiki/MIT_License
 **/
var Velocity = require('velocity-animate');
var V = (window.jQuery) ? $.Velocity : Velocity;

(function (FireSlider, window, undefined) {

	var fireSlider = {
		breakpoints: {},
		nextSlide: {},
		options: {},
		pause: {},
		play: {},
		prevSlide: {},
		reverse: {},
		selector: null,
		sliders: [],

		slider: function(sel, opts, breakpoints) {

			var elements = document.querySelectorAll(sel);
			if(elements.length === 0) return;

			this.selector = sel;
			this.options = opts;
			this.breakpoints = breakpoints;
			this.length = elements.length;
			this.sliders = [];

			// Initialize each slider independently that match the selector
			for(var i = 0; i < elements.length; i++) {
				var slider = fireSlider.init(elements[i], this.options, this.breakpoints);

				elements[i].nextSlide = slider.next;
				elements[i].pause = slider.pause;
				elements[i].play = slider.play;
				elements[i].prevSlide = slider.prev;
				elements[i].reverse = slider.reverse;

				this.sliders.push(slider);
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

			return fireSlider._utilities.extend(this, elements);
		},

		init: function(elem, opts, breakpoints) {

			// fs object holds all of the slider's information
			var fs = {
				breakpoints: {},
				data: {},
				isPaused: false,
				next: {},
				options: {},
				pause: {},
				play: {},
				positions: [],
				prev: {},
				reverse: {},
				settings: {},
				slider: null,
				slides: [],
				timer: {},
			};

			// Load element
			fs.slider = elem;

			// Load breakpoints
			fs.breakpoints = breakpoints || {};

			// Setup default option values
			var defaults = {
				active: 1,
				delay: 5000,
				direction: 'forward',
				disableLinks: true,
				easing: 'swing',
				effect: 'slideInOut',
				hoverPause: false,
				pagerTemplate: '',
				show: 1,
				slide: 'li',
				speed: 500
			};

			// Get data from slider element
			var data = fireSlider._utilities.getData(elem);

			// Convert data to option values
			fs.data = {
				active: (data.firesliderActive) ? parseInt(data.firesliderActive) : undefined,
				delay: (data.firesliderDelay) ? parseInt(data.firesliderDelay) : undefined,
				direction: data.firesliderDirection,
				disableLinks: data.firesliderDisableLinks,
				easing: data.firesliderEasing,
				effect: data.firesliderEffect,
				hoverPause: data.firesliderHoverPause,
				next: data.firesliderNext,
				pager: data.firesliderPager,
				pagerTemplate: data.firesliderPagerTemplate,
				prev: data.firesliderPrev,
				show: (data.firesliderShow) ? parseInt(data.firesliderShow) : undefined,
				slide: data.firesliderSlide,
				speed: (data.firesliderSpeed) ? parseInt(data.firesliderSpeed) : undefined
			};

			// Remove undefined data properties
			fireSlider._utilities.removeUndefined(fs.data);

			// Merge data attributes with opts values
			var options = fireSlider._utilities.extend(fs.data, opts);

			// Merge opts values with default values
			fs.options = fireSlider._utilities.extend(options, defaults);

			// Load slides
			fs.slides = fireSlider._utilities.getDirectChildren(fs.slider, fs.options.slide);
			if(fs.slides.length === 0) return;

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
			if(typeof fs.options.prev !== "undefined" || typeof fs.data.firesliderPrev !== "undefined") {
				fs.settings.prev = (typeof fs.options.prev !== "undefined") ? document.querySelectorAll(fs.options.prev)[0] : document.querySelectorAll(fs.data.firesliderPrev)[0];
			}
			if(typeof fs.options.next !== "undefined" || typeof fs.data.firesliderNext !== "undefined") {
				fs.settings.next = (typeof fs.options.next !== "undefined") ? document.querySelectorAll(fs.options.next)[0] : document.querySelectorAll(fs.data.firesliderNext)[0];
			}
			if(typeof fs.options.pager !== "undefined" || typeof fs.data.firesliderPager !== "undefined") {
				fs.settings.pager = (typeof fs.options.pager !== "undefined") ? document.querySelectorAll(fs.options.pager)[0] : document.querySelectorAll(fs.data.firesliderPager)[0];
			}

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
						if(fireSlider._utilities.hasClass(temp, 'fire-slider-active')) {
							fireSlider._utilities.removeClass(temp, 'fire-slider-active');
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
					var min = -1;
					for(var i = 0; i < fs.breakpoints.length; i++) {
						if(fs.breakpoints[i].breakpoint) {
							if(fs.breakpoints[i].breakpoint >= fs.settings.windowWidth && (fs.breakpoints[i].breakpoint < min || min === -1)) {
								index = i;
								min = fs.breakpoints[i].breakpoint;
							}
						}
					}

					if(index !== -1) {
						if(fs.breakpoints[index].show) {
							fs.settings.show = fs.breakpoints[index].show;
						}
						if(fs.breakpoints[index].active) {
							fs.settings.active = breakpoints[index].active;
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

					var target = this;

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

			// Create node from markup
			function createNodeFromMarkup(markup) {
				var node = document.createDocumentFragment();
				var tmp = document.createElement('body'), child;
				tmp.innerHTML = markup;
				while (child === tmp.firstChild) {
					node.appendChild(child);
				}
				return node;
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
					var parser = new DOMParser();
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

				fireSlider._utilities.addClass(fs.settings.pagerElems[0], 'fire-pager-active');
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
				// Pause transitions
				stopTimer();

				// Update breakpoints and width settings
				fs.settings.windowWidth = window.innerWidth;
				fs.settings.sliderWidth = fs.slider.offsetWidth;

				updateBreakpoints();
				fs.settings.slideWidthPercent = 1 / fs.settings.show * 100;
				fs.settings.slideWidth = fs.settings.sliderWidth / fs.settings.show;

				var multiplier = calculateMultiplier();

				if(fs.slides.length !== (multiplier * fs.settings.totalSlides)) {

					// Remove active class
					fireSlider._utilities.removeClass(fs.slides[fs.settings.currentSlide], 'fire-slider-active');

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
					fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], 'fire-slider-active');

				} else {
					
					positionSlides(fs.slides);
					
					calculatePositions(fs.slider, fs.settings.currentSlide);

					if(window.jQuery) {
						$(fs.slides).dequeue(fs.options.effect);
					} else {
						V.Utilities.dequeue(fs.slides, fs.options.effect);
					}
				}

				// Trigger event fire-slider-refreshed
				fireSlider._utilities.trigger(document.querySelectorAll(fs.selector), 'fire-slider-refreshed');

				// Play Transitions
				startTimer(fs.settings.direction);
			}

			// Basic slide transition effect
			function slideInOut(element, opts) {
				var duration = (opts.snapping) ? 0 : fs.options.speed;
				V(element, {translateX: [(opts.nextPos + '%'), (opts.currPos + '%')]}, {duration: duration, queue: fs.options.effect, easing: fs.options.easing});
			}

			// Fade in / out transition effect
			function fadeInOut(element, opts) {
				var elemClone = element.cloneNode(true);
				element.parentNode.appendChild(elemClone);

				V(element, {translateX: [(opts.nextPos + '%'), (opts.nextPos + '%')]}, {duration: fs.options.speed , queue: fs.options.effect,
					begin: function() {
						V(elemClone, {opacity: [0.0, 1.0], zIndex: [1, 1]}, {duration: fs.options.speed, easing: fs.options.easing});
					},
					complete: function() { elemClone.parentNode.removeChild(elemClone); }
				});
			}

			// Routes slide to correct transition
			function transitionManager(element, opts) {
				// Single slide transitions with default: fadeInOut
				if(fs.settings.show === 1) {
					switch(fs.options.effect) {
						case 'slideInOut':
							slideInOut(element, opts);
							break;
						case 'fadeInOut':
							fadeInOut(element, opts);
							break;
						default:
							fadeInOut(element, opts);
							break;
					}
				// Multiple slide transitions with default: slideInOut
				} else {
					switch(fs.options.effect) {
						case 'slideInOut':
							slideInOut(element, opts);
							break;
						default:
							slideInOut(element, opts);
							break;
					}
				}
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
				
				// Stop timer
				stopTimer();

				// Remove active classes
				fireSlider._utilities.removeClass(fs.slides[fs.settings.currentSlide], 'fire-slider-active');
				if(typeof fs.settings.pager !== "undefined") fireSlider._utilities.removeClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], 'fire-pager-active');

				updateCurrentSlide(direction);

				var currentPositions = fs.positions.slice(0);
				cyclePositions(direction);

				// Calculate New Position
				for(var i = 0; i < fs.slides.length; i++) {
					transitionManager(fs.slides[i], {
						currPos: currentPositions[i],
						nextPos: fs.positions[i],
						snapping: (fs.positions[i] === fs.settings.minX || fs.positions[i] === fs.settings.maxX) ? true : false
					});
				}

				// Trigger event fire-slider-before-transition
				fireSlider._utilities.trigger(document.querySelectorAll(fs.selector), 'fire-slider-before-transition');

				if(window.jQuery) {
					$(fs.slides).dequeue(fs.options.effect);
				} else {
					V.Utilities.dequeue(fs.slides, fs.options.effect);
				}

				// Add active classes
				fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], 'fire-slider-active');
				if(typeof fs.settings.pager !== "undefined") {
					fireSlider._utilities.addClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], 'fire-pager-active');
				}

				// Trigger event fire-slider-after-transition
				fireSlider._utilities.trigger(document.querySelectorAll(fs.selector), 'fire-slider-after-transition');

				// Restart timer
				startTimer(fs.settings.direction);
			}

			// Go to the slide relative to the index of a pager elements
			function pagerTransition(index) {

				var difference = index - (fs.settings.currentSlide % fs.settings.totalSlides);

				if(difference !== 0) {

					// Stop Timer
					stopTimer();

					// Re-load slides
					reloadSlider();

					var delayIndex = fs.settings.currentSlide;

					// Remove active classes
					fireSlider._utilities.removeClass(fs.slides[fs.settings.currentSlide], 'fire-slider-active');
					fireSlider._utilities.removeClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], 'fire-pager-active');

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

					var snappingRange = 100 * Math.abs(difference);
					for(var k = 0; k < fs.slides.length; k++) {
						transitionManager(fs.slides[k], {
							currPos: currentPositions[k],
							nextPos: fs.positions[k],
							snapping: (fs.positions[k] <= (fs.settings.minX + snappingRange) || fs.positions[k] >= (fs.settings.maxX - snappingRange)) ? true : false
						});
					}

					// Trigger event fire-slider-before-transition
					fireSlider._utilities.trigger(document.querySelectorAll(fs.selector), 'fire-slider-before-transition');

					// Perform transitions
					if(window.jQuery) {
						$(fs.slides).dequeue(fs.options.effect);
					} else {
						V.Utilities.dequeue(fs.slides, fs.options.effect);
					}

					// Set current slide
					fs.settings.currentSlide = (fs.settings.currentSlide + difference) % fs.slides.length;

					// Add new active classes
					fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], 'fire-slider-active');
					fireSlider._utilities.addClass(fs.settings.pagerElems[fs.settings.currentSlide % fs.settings.totalSlides], 'fire-pager-active');

					// Trigger event fire-slider-after-transition
					fireSlider._utilities.trigger(document.querySelectorAll(fs.selector), 'fire-slider-after-transition');

					// Restart timer
					startTimer(fs.settings.direction);
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
				if(fs.options.disableLinks && typeof fs.slider !== 'undefined') {
					fireSlider._utilities.listen(fs.slider, 'click', function(e) {
						var target = (e.target) ? e.target : e.srcElement;
						if(target.tagName === "A") {
							if(!fireSlider._utilities.hasClass(target.parentNode, 'fire-slider-active')) {
								if (e.preventDefault) e.preventDefault();
								else e.returnValue = false;
							}
						}
						return false;
					});
				}

				fireSlider._utilities.listen(window, 'resize', function() {
					refresh();
					return false;
				});
			}

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
				fireSlider._utilities.addClass(fs.slides[fs.settings.currentSlide], 'fire-slider-active');

				// position the elements of the array
				reloadSlider();
				positionSlides(fs.slides);

				addSliderEventListeners();

				fireSlider._utilities.trigger(document.querySelectorAll(fs.selector), 'fire-slider-init');
				startTimer(fs.settings.direction);
			}

			setup();

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

			return fs;
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
			var result = false;
			if (node.classList) {
				if(node.classList.contains(className)) {
					result = true;
				}
			}
			return result;
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
						var key = attributes[i].name.replace('data-', '');
						var value = node.getAttribute(attributes[i].name);
						simulatedDataset[key] = value;
					}
				}
				return simulatedDataset;
			}
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

		// Extend defaults into opts, returns options
		extend: function(opts, def) {
			var options = opts || {};
			var defaults = def || {};
			for (var opt in defaults) {
				if (defaults.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
					options[opt] = defaults[opt];
				}
			}
			return options;
		},

		removeUndefined: function(object) {
			for(var key in object) {
				if(typeof object[key] === "undefined") delete object[key];
			}
		},

		// Returns boolean from string
		getBoolean: function(string) {
			return (string.toLowerCase() === 'true') ? true : false;
		},

		// Custom events will bind to these htmlEvents in ie < 9
		htmlEvents: {
			onload:1,
			onunload:1,
			onblur:1,
			onchange:1,
			onfocus:1,
			onreset:1,
			onselect:1,
			onsubmit:1,
			onabort:1,
			onkeydown:1,
			onkeypress:1,
			onkeyup:1,
			onclick:1,
			ondblclick:1,
			onmousedown:1,
			onmousemove:1,
			onmouseout:1,
			onmouseover:1,
			onmouseup:1
		},

		// Create and trigger an event
		trigger: function(el, eventName){
			var event;
			if(document.createEvent){
				event = document.createEvent('HTMLEvents');
				event.initEvent(eventName,true,true);
			}else if(document.createEventObject){// IE < 9
				event = document.createEventObject();
				event.eventType = eventName;
			}
			event.eventName = eventName;
			if(el.dispatchEvent){
				el.dispatchEvent(event);
			}else if(el.fireEvent && fireSlider._utilities.htmlEvents['on'+eventName]){// IE < 9
				el.fireEvent('on'+event.eventType,event); // can trigger only real event (e.g. 'click')
			}else if(el[eventName]){
				el[eventName]();
			}else if(el['on'+eventName]){
				el['on'+eventName]();
			}
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

		// Remove event listener for built-in and custom events
		removeEvent: function(el, type, handler){
			if(el.removeventListener){
				el.removeEventListener(type,handler,false);
			}else if(el.detachEvent && fireSlider._utilities.htmlEvents['on'+type]){// IE < 9
				el.detachEvent('on'+type,handler);
			}else{
				el['on'+type]=null;
			}
		}
	};

	window.FireSlider = fireSlider;

})((window.FireSlider = window.FireSlider || {}), window);

// If jQuery is available, create fireSlider() function
if(window.jQuery) {
	(function (window) {
		$.fn.fireSlider = function(opts, breakpoints) {

			// Call FireSlider.slider() with selector and arguments
			var sliders = new FireSlider.slider(this.selector, opts, breakpoints);

			// Create jQuery object from sliders
			var result = $(sliders);

			// Add functions to jQuery object
			result.nextSlide = sliders.nextSlide;
			result.pause = sliders.pause;
			result.play = sliders.play;
			result.prevSlide = sliders.prevSlide;
			result.reverse = sliders.reverse;

			// Return jQuery object
			return result;
		};
	})(window.jQuery);
}