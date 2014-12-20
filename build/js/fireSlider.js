(function () {

	fireSlider = function(selector, options, breakpoints) {
		var defaults = {
			slide: 'li',
			show: 1,
			active: 1,
			prev: '#prev',
			next: '#next',
			pager: '#pager',
			speed: 500,
			delay: 5000,
			effect: 'slideInOut',
			hoverPause: false,
			disableLinks: true
		};

		// Merge defaults with options
		options = options || {};
		for (var opt in defaults) {
			if (defaults.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
				options[opt] = defaults[opt];
			}
		}

		var slider = document.querySelectorAll(selector)[0];
		var slides = slider.querySelectorAll(':scope > ' + options.slide);
		var timer = {};
		var positions = [];
		var isTransitioning = false;
		var settings = {
			show: options.show,
			active: options.active,
			prev: document.querySelectorAll(options.prev)[0],
			next: document.querySelectorAll(options.next)[0],
			pager: document.querySelectorAll(options.pager)[0],
			pagerSpans: [],
			totalSlides: slides.length,
			windowWidth: window.innerWidth,
			sliderWidth: slider.offsetWidth,
			slideWidth: slider.offsetWidth / options.show,
			slideWidthPercent: 1 / options.show * 100,
			currentSlide: 0,
			minX: 0,
			maxX: 0
		};

		// Add class to node's classList
		function addClass(node, newClass) {
			if (node.classList) {
					node.classList.add(newClass);
			} else {
					node.className += ' ' + newClass;
			}
		}

		// Remove class from node's classList
		function removeClass(node, rmClass) {
			if (node.classList) {
					node.classList.remove(rmClass);
			} else {
				node.className = node.className.replace(new RegExp('(^|\\b)' + rmClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			}
		}

		// Returns true if node has className
		function hasClass(node, className) {
			var result = false;
			if (node.classList) {
				if(node.classList.contains(className)) {
					result = true;
				}
			}
			return result;
		}

		function reloadSlider() {
			slides = slider.querySelectorAll(':scope > ' + options.slide);
		}

		// Duplicates slides based on the multiplier, returns new array
		function multiplySlides(array, multiplier) {
			var difference = (settings.totalSlides * multiplier) - array.length;

			// Add elements if there is a possitive difference
			if(difference > 0) {
				for(var i = 0; i < difference; i++) {
					var temp = array[i % settings.totalSlides].cloneNode(true);
					if(hasClass(temp, 'fire-slider-active')) {
						removeClass(temp, 'fire-slider-active');
					}
					slider.appendChild(temp);
				}
			}

			// Remove elements if there is a negative difference
			if(difference < 0) {
				for(var j = array.length - 1; j >= (array.length + difference); j--) {
					slider.removeChild(slides[j]);
				}
			}

			return difference;
		}

		// Updates show and active based on breakpoints set in options
		function updateBreakpoints() {
			// Reset show and active
			settings.show = options.show;
			settings.active = options.active;

			if(typeof breakpoints !== 'undefined') {
				var index = -1;
				var min = -1;
				for(var i = 0; i < breakpoints.length; i++) {
					if(breakpoints[i].breakpoint) {
						if(breakpoints[i].breakpoint >= settings.windowWidth && (breakpoints[i].breakpoint < min || min === -1)) {
							index = i;
							min = breakpoints[i].breakpoint;
						}
					}
				}

				if(index !== -1) {
					if(breakpoints[index].show) {
						settings.show = breakpoints[index].show;
					}
					if(breakpoints[index].active) {
						settings.active = breakpoints[index].active;
					}
				}
			}
		}

		// Returns the amount of times the slides should be duplicated to fit within the window width
		function calculateMultiplier () {
			var multiplier = 1;
			var addSlides = 0;

			settings.windowWidth = window.innerWidth;

			// How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
			if(settings.slideWidth * settings.totalSlides < settings.windowWidth) {
				addSlides = Math.ceil((settings.windowWidth - (settings.slideWidth * settings.totalSlides)) / settings.slideWidth);
			}
			addSlides += settings.totalSlides * 2;

			// Create a multiply based on the number of additional slides needed
			if(addSlides > 0) {
				multiplier += Math.ceil(addSlides / settings.totalSlides);
			}
			return multiplier;
		}

		// Position Slides
		function positionSlides(array) {
			var startPostion = Math.ceil(array.length / 2) * -100 + (100 * (settings.active - 1));
			var positionsFirst = [];
			var positionsSecond = [];
			settings.minX = startPostion;
			settings.maxX = startPostion + ((array.length - 1) * 100);
			for(var i = Math.floor(array.length / 2); i < array.length; i++) {
				Velocity(array[i], {translateX: (startPostion + '%')}, {duration: 0, queue: options.effect});
				array[i].style.width = settings.slideWidthPercent + '%';
				array[i].style.position = 'absolute';
				positionsSecond.push(startPostion);
				startPostion += 100;
			}
			for(i = 0; i < Math.floor(array.length / 2); i++) {
				Velocity(array[i], {translateX: (startPostion + '%')}, {duration: 0, queue: options.effect});
				array[i].style.width = settings.slideWidthPercent + '%';
				array[i].style.position = 'absolute';
				positionsFirst.push(startPostion);
				startPostion += 100;
			}

			positions = positionsFirst.concat(positionsSecond);
			Velocity.Utilities.dequeue(array, options.effect);
		}

		// Calculates positions for revolution amount
		function calculatePositions(array, revolutions) {
			for(var i = 0; i < slides.length; i++) {
				var oldPosition = positions.shift();
				var newPosition = oldPosition;

				for(var j = 0; j < revolutions; j++) {
					newPosition = newPosition - 100;
					if(newPosition < settings.minX) {
						newPosition = settings.maxX;
					}
					if(newPosition > settings.maxX) {
						newPosition = settings.minX;
					}
				}

				Velocity(slides[i], {translateX: (newPosition + '%')}, {duration: 0, queue: options.effect});
				positions.push(newPosition);
			}
		}

		// Create and trigger an event
		function triggerEvent(element, eventName) {
			var e = {};
			if(document.createEvent) {
				e = document.createEvent('HTMLEvents');
				e.initEvent(eventName, true, false);
			} else {
				e = document.createEventObject();
				e.eventType = eventName;
			}
			e.eventName = eventName;
			
			if(document.createEvent) {
				element.dispatchEvent(e);
			} else {
				element.fireEvent('on' + e.eventType, e);
			}
		}

		// Fills pager with empty spans based on total slides, adds active class to the first slide
		function setupPager() {
			for(var i = 0; i < settings.totalSlides; i++) {
				var span = document.createElement('span');
				settings.pager.appendChild(span);
			}
			settings.pagerSpans = settings.pager.querySelectorAll(':scope > span');
			addClass(settings.pagerSpans[0], 'fire-pager-active');
		}

		// Gets the index of a DOM element relative to it's parent element
		function getIndex(node) {
			var result = -1;
			var childs = node.parentNode.childNodes;
			for(var i = 0; i < childs.length; i++) {
				if(node === childs[i]) {
					result = i;
				}
			}
			return result;
		}

		// Starts the timer
		function play() {
			timer = setInterval(next, options.delay);
		}

		// Stops the timer
		function pause() {
			clearInterval(timer);
		}

		// Set up the inital state of fireSlider
		function init() {

			setupPager();

			// Check Breakpoints
			updateBreakpoints();
			settings.slideWidthPercent = 1 / settings.show * 100;
			settings.slideWidth = settings.sliderWidth / settings.show;

			// Caluculate the multiplyer
			var multiplier = calculateMultiplier();
			multiplySlides(slides, multiplier);

			// Set the first active slide
			settings.currentSlide = 0;
			addClass(slides[settings.currentSlide], 'fire-slider-active');

			// position the elements of the array
			reloadSlider();
			positionSlides(slides);

			triggerEvent(slider, 'fire-slider-init');
			play();
		}

		// Refresh positions, breakpoints and slide count
		function refresh() {
			// Pause transitions
			pause();

			// Update breakpoints and width settings
			settings.windowWidth = window.innerWidth;
			settings.sliderWidth = slider.offsetWidth;

			updateBreakpoints();
			settings.slideWidthPercent = 1 / settings.show * 100;
			settings.slideWidth = settings.sliderWidth / settings.show;

			var multiplier = calculateMultiplier();

			if(slides.length !== (multiplier * settings.totalSlides)) {

				// Remove active class
				removeClass(slides[settings.currentSlide], 'fire-slider-active');

				// Multipy slides and calculate difference
				var difference = multiplySlides(slides, multiplier);

				// Fetch new slider
				reloadSlider();

				// Position slides
				positionSlides(slides);

				if(settings.currentSlide > slides.length) {

					// Calculate current slide
					settings.currentSlide = (settings.currentSlide % slides.length);

					// Get new positions
					calculatePositions(slider, Math.abs(difference));
					Velocity.Utilities.dequeue(slides, options.effect);
				}

				// Re-add active class
				addClass(slides[settings.currentSlide], 'fire-slider-active');

			} else {
				positionSlides(slides);
				calculatePositions(slider, settings.currentSlide);
				Velocity.Utilities.dequeue(slides, options.effect);
			}

			// Play Transitions
			play();
		}

		// Basic slide transition effect
		function slideInOut(element, opts) {
			var offset = 0;
			if(opts.multiplier) {
				offset = opts.multiplier * 100;
			}
			
			Velocity(element, {translateX: (opts.oldPosition + '%')}, {duration: 0, queue: options.effect});

			if(opts.snapping) {
				Velocity(element, {translateX: (opts.newPosition + '%')}, {duration: 0, queue: options.effect});
			} else {
				Velocity(element, {translateX: (opts.newPosition + '%')}, {duration: options.speed, queue: options.effect});
			}
		}

		// Routes slide to correct transition
		function transitionManager(element, opts) {
			switch(options.effect) {
				case 'slideInOut':
					slideInOut(element, opts);
					break;
				default:
					slideInOut(element, opts);
					break;
			}
		}

		// Go to previous slide
		function prev() {
			// Stop timer
			pause();

			// Remove active classes
			removeClass(slides[settings.currentSlide], 'fire-slider-active');
			removeClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			settings.currentSlide -= 1;
			if(settings.currentSlide < 0) {
				settings.currentSlide = (slides.length - 1);
			}

			// Calculate New Position
			for(var i = 0; i < slides.length; i++) {
				var oldPosition = positions.shift();
				var newPosition = oldPosition + 100;
				var snapping = false;
				if(newPosition < settings.minX) {
					newPosition = settings.maxX;
					snapping = true;
				}
				if(newPosition > settings.maxX) {
					newPosition = settings.minX;
					snapping = true;
				}
				transitionManager(slides[i], {oldPosition: oldPosition, newPosition: newPosition, snapping: snapping});
				positions.push(newPosition);
			}

			Velocity.Utilities.dequeue(slides, options.effect);

			// Add active classes
			addClass(slides[settings.currentSlide], 'fire-slider-active');
			addClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			// Trigger event fire-slider-prev
			triggerEvent(slider, 'fire-slider-prev');

			// Restart timer
			play();
		}

		// Go to next slide
		function next() {
			// Stop timer
			pause();

			// Remove active classes
			removeClass(slides[settings.currentSlide], 'fire-slider-active');
			removeClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			settings.currentSlide += 1;
			if(settings.currentSlide > (slides.length - 1)) {
				settings.currentSlide = 0;
			}

			// Calculate next position
			for(var i = 0; i < slides.length; i++) {
				var oldPosition = positions.shift();
				var newPosition = oldPosition - 100;
				var snapping = false;
				if(newPosition < settings.minX) {
					newPosition = settings.maxX;
					snapping = true;
				}
				if(newPosition > settings.maxX) {
					newPosition = settings.minX;
					snapping = true;
				}
				transitionManager(slides[i], {oldPosition: oldPosition, newPosition: newPosition, snapping: snapping});
				positions.push(newPosition);
			}

			Velocity.Utilities.dequeue(slides, options.effect);

			// Add active classes
			addClass(slides[settings.currentSlide], 'fire-slider-active');
			addClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			// Trigger event fire-slider-prev
			triggerEvent(slider, 'fire-slider-prev');

			// Restart timer
			play();
		}

		// Go to the slide relative to the index of a pager span
		function pagerTransition(index) {
			var currentPosition = settings.currentSlide % settings.totalSlides;
			var difference = index - currentPosition;

			if(difference !== 0) {

				// Stop Timer
				pause();

				// Re-load slides
				reloadSlider();

				// Remove active classes
				removeClass(slides[settings.currentSlide], 'fire-slider-active');
				removeClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

				// Using the difference, determine where the slides' next position will be and send to transition manager
				if(difference < 0) {
					
					// Previous Direction
					for(var i = 0; i < slides.length; i++) {
						var oldPositionPrev = positions.shift();
						var newPositionPrev = oldPositionPrev;
						var snappingPrev = false;

						for(var j = 0; j < Math.abs(difference); j++) {
							newPositionPrev = newPositionPrev + 100;
							if(newPositionPrev < settings.minX) {
								newPositionPrev = settings.maxX;
								snappingPrev = true;
							}
							if(newPositionPrev > settings.maxX) {
								newPositionPrev = settings.minX;
								snappingPrev = true;
							}
						}
						transitionManager(slides[i], {oldPosition: oldPositionPrev, newPosition: newPositionPrev, snapping: snappingPrev});
						positions.push(newPositionPrev);
					}

				} else {
					
					// Next Direction
					for(var k = 0; k < slides.length; k++) {
						var oldPositionNext = positions.shift();
						var newPositionNext = oldPositionNext;
						var snappingNext = false;

						for(var l = 0; l < Math.abs(difference); l++) {
							newPositionNext = newPositionNext - 100;
							if(newPositionNext < settings.minX) {
								newPositionNext = settings.maxX;
								snappingNext = true;
							}
							if(newPositionNext > settings.maxX) {
								newPositionNext = settings.minX;
								snappingNext = true;
							}
						}
						transitionManager(slides[k], {oldPosition: oldPositionNext, newPosition: newPositionNext, snapping: snappingNext});
						positions.push(newPositionNext);
					}
				}

				// Perform transitions
				Velocity.Utilities.dequeue(slides, options.effect);

				// Set current slide
				settings.currentSlide = (settings.currentSlide + difference) % slides.length;

				// Add new active classes
				addClass(slides[settings.currentSlide], 'fire-slider-active');
				addClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

				// Restart timer
				play();
			}
		}

		init();

		// Click events
		settings.next.addEventListener('click', function(e) {
			e.preventDefault();
			next();
		});
		settings.prev.addEventListener('click', function(e) {
			e.preventDefault();
			prev();
		});
		settings.pager.addEventListener('click', function(e) {
			e.preventDefault();
			if(e.target.tagName === "SPAN") {
				pagerTransition(getIndex(e.target));
			}
		});

		// Pause on hover events
		slider.addEventListener('mouseover', function(e) {
			if(options.hoverPause) {
				pause();
			}
		});
		slider.addEventListener('mouseout', function(e) {
			if(options.hoverPause) {
				play();
			}
		});

		// Disable link interaction if slide is not active slide
		if(options.disableLinks) {
			slider.addEventListener('click', function(e) {
				if(e.target.tagName === "A") {
					if(!hasClass(e.target.parentNode, 'fire-slider-active')) {
						e.preventDefault();
					}
				}
			});
		}

		// Window resize event
		window.addEventListener('resize', function() {
			refresh();
		});

	};

}());

// Example listeners
document.addEventListener('fire-slider-init', function(e) {
	// Do stuff when initialized
});

document.addEventListener('fire-slider-next', function(e) {
	// Do stuff when next
});