/* fireSlider (1.0.0). (C) 2014 CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
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

		// Returns the last index of the array that contains the class
		function getClassIndex(array, className) {
			var index = -1;
			for(var i = 0; i < array.length; i++) {
				if( (" " + array[i].className + " " ).indexOf( " " + className + " " ) > -1 ) {
					index = i;
				}
			}
			return index;
		}

		// Returns a new array from a DOM list
		function listToArray(list) {
			var result = [];
			for(var i = 0; i < list.length; i++) {
				var temp = list[i].cloneNode(true);
				result.push(temp);
			}
			return result;
		}

		// Cycles n elemnts from the end of the array to the beginning of the array
		function shiftArray(array, amount) {
			for(var i = 0; i < amount; i++) {
				array.unshift(array.pop(array.length));
			}
		}

		// Cycles n elemnts from the beginning of the array to the end of the array
		function unshiftArray(array, amount) {
			for(i = 0; i < amount; i++) {
				array.push(array.shift());
			}
		}

		function reloadSlider() {
			slides = slider.querySelectorAll(':scope > ' + options.slide);
		}

		// Duplicates slides based on the multiplier, returns new array
		function multiplySlides(array, multiplier) {
			var additional = (settings.totalSlides * multiplier) - array.length;
			for(var i = 0; i < additional; i++) {
				var temp = array[i % settings.totalSlides].cloneNode(true);
				if(hasClass(temp, 'fire-slider-active')) {
					removeClass(temp, 'fire-slider-active');
				}
				slider.appendChild(temp);
			}
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
			addSlides += 2;

			// Create a multiply based on the number of additional slides needed
			if(addSlides > 0) {
				multiplier += Math.ceil(addSlides / settings.totalSlides);
			}
			return multiplier;
		}

		// Position Slides
		function positionSlides(array) {
			var startPostion = Math.ceil(array.length / 2) * -100 + (100 * (settings.active - 1));
			settings.minX = startPostion;
			settings.maxX = startPostion + ((array.length - 1) * 100);
			for(var i = Math.floor(array.length / 2); i < array.length; i++) {
				Velocity(array[i], {translateX: (startPostion + '%')}, {duration: 0, queue: options.effect});
				array[i].style.width = settings.slideWidthPercent + '%';
				array[i].style.position = 'absolute';
				startPostion += 100;
			}
			for(i = 0; i < Math.ceil(array.length / 2); i++) {
				Velocity(array[i], {translateX: (startPostion + '%')}, {duration: 0, queue: options.effect});
				array[i].style.width = settings.slideWidthPercent + '%';
				array[i].style.position = 'absolute';
				startPostion += 100;
			}

			Velocity.Utilities.dequeue(array, options.effect);
		}

		// Update slides postion based on current slide postion
		/*function shiftSlides(array) {
			for(var i = 0; i < (settings.currentSlide); i++) {
				for(var j = 0; j < array.length; j++) {
					if(Math.floor(parseFloat(array[j].style.left) * 10000) === Math.floor(parseFloat(settings.minX) * 10000)) {
						array[j].style.left = parseFloat(settings.maxX) + '%';
					} else {
						array[j].style.left = (parseFloat(array[j].style.left) - settings.slideWidthPercent) + '%';
					}
				}
			}
		}*/

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

		function getTransformValue(string) {
			return string.match(/(-?[0-9\.]+)/g);
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
			//play();
		}

		// Refresh positions, breakpoints and slide count
		function refresh() {
			// Update breakpoints and width settings
			settings.windowWidth = window.innerWidth;
			settings.sliderWidth = slider.offsetWidth;

			updateBreakpoints();
			settings.slideWidthPercent = 1 / settings.show * 100;
			settings.slideWidth = settings.sliderWidth / settings.show;

			var multiplier = calculateMultiplier();

			if(slides.length !== (multiplier * settings.totalSlides)) {
				var temp = listToArray(slides);

				// Unshift Temp[]
				//unshiftArray(temp, Math.floor(temp.length / 2));

				// Find index of active element, store the index and remove class
				//var index = getClassIndex(temp, "fire-slider-active");
				//removeClass(temp[index], 'fire-slider-active');

				// Multiply slides with new multiplier
				temp = multiplySlides(temp, multiplier);
				//addClass(newArr[index], 'fire-slider-active');

				// Shift newArr[]
				//var reshift = Math.floor(newArr.length / 2);
				//shiftArray(newArr, reshift);

				// Re-add active class and update active
				//settings.currentSlide = index;

				// Empty slider
				slider.innerHTML = '';

				// Re-position Elements
				positionSlides(temp);
				//shiftSlides(newArr);

				// Save new slides array
				slides = temp.slice();

				// Add new elements to slider
				var totalToAppend = temp.length;
				for(i = 0; i < totalToAppend; i++) {
					slider.appendChild(temp.shift());
				}

			} else {
				//positionSlides(slides);
				//shiftSlides(slides);
			}
		}

		function resetZIndex(element) {
			element.style.zIndex = '';
		}

		// Basic slide transition effect
		function slideInOut(element, opts) {
			var offset = 0;
			if(opts.multiplier) {
				offset = opts.multiplier * 100;
			}
			Velocity(element, {translateX: (opts.oldPosition + '%')}, {duration: 0, queue: options.effect});
			Velocity(element, {translateX: (opts.newPosition + '%')}, {duration: options.speed, queue: options.effect,
				begin: function() {
					if(opts.zIndex === -1) {
						element.style.zIndex = -1;
					}
				},
				complete: function() {
					element.style.zIndex = '';
				}
			});
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
			//pause();

			// Remove active classes
			removeClass(slides[settings.currentSlide], 'fire-slider-active');
			removeClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			settings.currentSlide -= 1;
			if(settings.currentSlide < 0) {
				settings.currentSlide = (slides.length - 1);
			}

			// Set Positions
			if(positions.length) {
				for(var i = 0; i < slides.length; i++) {
					slides[i].style.transform = 'translateX('+positions.shift()+'%)';
				}
			}

			// Calculate New Position
			for(var i = 0; i < slides.length; i++) {
				var oldPosition = parseInt(getTransformValue(slides[i].style.transform));
				var newPosition = oldPosition + 100;
				var zIndex = 0;
				if(newPosition < settings.minX) {
					newPosition = settings.maxX;
					zIndex = -1;
				}
				if(newPosition > settings.maxX) {
					newPosition = settings.minX;
					zIndex = -1;
				}
				transitionManager(slides[i], {oldPosition: oldPosition, newPosition: newPosition, zIndex: zIndex});
				positions.push(newPosition);
			}

			Velocity.Utilities.dequeue(slides, options.effect);

			// Add active classes
			addClass(slides[settings.currentSlide], 'fire-slider-active');
			addClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			// Trigger event fire-slider-prev
			triggerEvent(slider, 'fire-slider-prev');

			// Restart timer
			//play();
		}

		// Go to next slide
		function next() {
			// Stop timer
			//pause();

			// Remove active classes
			removeClass(slides[settings.currentSlide], 'fire-slider-active');
			removeClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			settings.currentSlide += 1;
			if(settings.currentSlide > (slides.length - 1)) {
				settings.currentSlide = 0;
			}

			// Set Positions
			if(positions.length) {
				for(var i = 0; i < slides.length; i++) {
					slides[i].style.transform = 'translateX('+positions.shift()+'%)';
				}
			}

			// Calculate next position
			for(var i = 0; i < slides.length; i++) {
				var oldPosition = parseInt(getTransformValue(slides[i].style.transform));
				var newPosition = oldPosition - 100;
				var zIndex = 0;
				if(newPosition < settings.minX) {
					newPosition = settings.maxX;
					zIndex = -1;
				}
				if(newPosition > settings.maxX) {
					newPosition = settings.minX;
					zIndex = -1;
				}
				transitionManager(slides[i], {oldPosition: oldPosition, newPosition: newPosition, zIndex: zIndex});
				positions.push(newPosition);
			}

			Velocity.Utilities.dequeue(slides, options.effect);

			// Add active classes
			addClass(slides[settings.currentSlide], 'fire-slider-active');
			addClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			// Trigger event fire-slider-prev
			triggerEvent(slider, 'fire-slider-prev');

			// Restart timer
			//play();
		}

		// Go to the slide relative to the index of a pager span
		function pagerTransition(index) {
			var currentPosition = settings.currentSlide % settings.totalSlides;
			var difference = index - currentPosition;

			if(difference !== 0) {

				// Stop Timer
				pause();

				// get current slides
				var items = slider.querySelectorAll(':scope > ' + options.slide);
				
				// Create an array of current positions
				var positions = [];
				for(var i = 0; i < items.length; i++) {
					positions.push(items[i].style.left);
				}

				// Remove active classes
				var activeSlide = getClassIndex(items, 'fire-slider-active');
				removeClass(items[activeSlide], 'fire-slider-active');
				removeClass(settings.pagerSpans[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

				// Using the difference, determine where the slides' next position will be and send to transition manager
				if(difference > 0) {
					for(i = difference; i < items.length; i++) {
						transitionManager(items[i], parseFloat(positions.shift()), {direction: 'next', multiplier: Math.abs(difference)});
					}
					for(i = 0; i < difference; i++) {
						transitionManager(items[i], parseFloat(positions.shift()), {direction: 'next', multiplier: Math.abs(difference)});
					}
				} else {
					for(i = (items.length + difference); i < items.length; i++) {
						transitionManager(items[i], parseFloat(positions.shift()), {direction: 'prev', multiplier: Math.abs(difference)});
					}
					for(i = 0; i < (items.length + difference); i++) {
						transitionManager(items[i], parseFloat(positions.shift()), {direction: 'prev', multiplier: Math.abs(difference)});
					}
				}

				// Perform transitions
				Velocity.Utilities.dequeue(items, options.effect);

				// Set current slide
				settings.currentSlide = (settings.currentSlide + difference) % items.length;

				// Add new active classes
				addClass(items[(settings.currentSlide + Math.floor(items.length / 2)) % items.length], 'fire-slider-active');
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