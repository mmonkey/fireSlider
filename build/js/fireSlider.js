/*!
 * fireSlider (0.2.2) (C) 2014 CJ O'Hara and Tyler Fowle.
 * MIT @license: en.wikipedia.org/wiki/MIT_License
 **/
var Velocity = require('velocity-animate');

(function () {

	// Set up Velocity
	var V;
	if(window.jQuery) { V = $.Velocity; } else { V = Velocity; }

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

	// Shim for element.dataset
	function getData(node){
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
	}

	// Returns true if element matches selector
	function matchesSel(elm, sel){
		var matches = (elm.document || elm.ownerDocument).querySelectorAll(sel);
		var i = 0;
		while (matches[i] && matches[i] !== elm) { i++; }
	  return matches[i] ? true : false;
	}

	// Get direct children of element matching a selector
	function getDirectChildren(elm, sel){
		var ret = [];
		var children = elm.childNodes;
		for (var i =0; i < children.length; ++i){
			if(matchesSel(children[i], sel)) {
				ret.push(children[i]);
			}
		}
		return ret;
	}

	// Extend defaults into opts, returns options
	function extend(opts, defaults) {
		var options = opts || {};
		for (var opt in defaults) {
			if (defaults.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
				options[opt] = defaults[opt];
			}
		}
		return options;
	}

	// Returns boolean from string
	function getBoolean(string) {
		return (string.toLowerCase() === 'true') ? true : false;
	}

	FireSlider = function(selector, options, breakpoints) {
		var timer = {};
		var positions = [];
		var isTransitioning = false;
		var slider = document.querySelectorAll(selector)[0];

		var slideData = (typeof slider !== 'undefined') ? getData(slider) : {};
		var defaults = {
			slide: (typeof slideData.sliderSlide !== "undefined") ? slideData.sliderSlide : 'li',
			show: (typeof slideData.sliderShow !== "undefined") ? parseInt(slideData.sliderShow) : 1,
			active: (typeof slideData.sliderActive !== "undefined") ? parseInt(slideData.sliderActive) : 1,
			speed: (typeof slideData.sliderSpeed !== "undefined") ? parseInt(slideData.sliderSpeed) : 500,
			delay: (typeof slideData.sliderDelay !== "undefined") ? parseInt(slideData.sliderDelay) : 5000,
			effect: (typeof slideData.sliderEffect !== "undefined") ? slideData.sliderEffect : 'slideInOut',
			hoverPause: (typeof slideData.sliderHoverPause !== "undefined") ?  getBoolean(slideData.sliderHoverPause) : false,
			disableLinks: (typeof slideData.sliderDisableLinks !== "undefined") ?  getBoolean(slideData.sliderDisableLinks) : true,
			thumbnails: (typeof slideData.sliderThumbnails !== "undefined") ?  getBoolean(slideData.sliderThumbnails) : false,
		};

		// Merge dataset with options
		options = extend(options, defaults);

		var slides = (typeof slider !== 'undefined') ? getDirectChildren(slider, options.slide) : [];
		var settings = {};
		if(typeof slider !== 'undefined') {
			settings = {
				show: options.show,
				active: options.active,
				pagerElems: [],
				totalSlides: slides.length,
				windowWidth: window.innerWidth,
				sliderWidth: slider.offsetWidth,
				slideWidth: slider.offsetWidth / options.show,
				slideWidthPercent: 1 / options.show * 100,
				currentSlide: 0,
				minX: 0,
				maxX: 0
			};
		}

		if(typeof options.prev !== "undefined" || typeof slideData.sliderPrev !== "undefined") {
			settings.prev = (typeof options.prev !== "undefined") ? document.querySelectorAll(options.prev)[0] : document.querySelectorAll(slideData.sliderPrev)[0];
		}
		if(typeof options.next !== "undefined" || typeof slideData.sliderNext !== "undefined") {
			settings.next = (typeof options.next !== "undefined") ? document.querySelectorAll(options.next)[0] : document.querySelectorAll(slideData.sliderNext)[0];
		}
		if(typeof options.pager !== "undefined" || typeof slideData.sliderPager !== "undefined") {
			settings.pager = (typeof options.pager !== "undefined") ? document.querySelectorAll(options.pager)[0] : document.querySelectorAll(slideData.sliderPager)[0];
		}

		function reloadSlider() {
			slides = getDirectChildren(slider, options.slide);
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
			var neededWidth = settings.windowWidth + (settings.slideWidth * 3);
			var totalSlideWidth = settings.slideWidth * settings.totalSlides;

			if(totalSlideWidth < neededWidth) {
				addSlides = Math.ceil((neededWidth - totalSlideWidth) / settings.slideWidth);
			}

			// Create a multiply based on the number of additional slides needed
			if(addSlides > 0) {
				multiplier += Math.ceil(addSlides / settings.totalSlides);
			}
			return multiplier;
		}

		// Position Slides
		function positionSlides(array) {
			var startPosition = Math.ceil(array.length / 2) * -100 + (100 * (settings.active - 1));
			var positionsFirst = [];
			var positionsSecond = [];
			settings.minX = startPosition;
			settings.maxX = startPosition + ((array.length - 1) * 100);
			for(var i = Math.floor(array.length / 2); i < array.length; i++) {
				V(array[i], {translateX: (startPosition + '%')}, {duration: 0, queue: options.effect});
				array[i].style.width = settings.slideWidthPercent + '%';
				array[i].style.position = 'absolute';
				positionsSecond.push(startPosition);
				startPosition += 100;
			}
			for(i = 0; i < Math.floor(array.length / 2); i++) {
				V(array[i], {translateX: (startPosition + '%')}, {duration: 0, queue: options.effect});
				array[i].style.width = settings.slideWidthPercent + '%';
				array[i].style.position = 'absolute';
				positionsFirst.push(startPosition);
				startPosition += 100;
			}

			positions = positionsFirst.concat(positionsSecond);
			if(window.jQuery) {
				$(array).dequeue(options.effect);
			} else {
				V.Utilities.dequeue(array, options.effect);
			}
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

				V(slides[i], {translateX: (newPosition + '%')}, {duration: 0, queue: options.effect});
				positions.push(newPosition);
			}
		}

 		// Custom events will bind to these htmlEvents in ie < 9
		var htmlEvents = {
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
		};

		// Create and trigger an event
		function trigger(el, eventName){
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
			}else if(el.fireEvent && htmlEvents['on'+eventName]){// IE < 9
				el.fireEvent('on'+event.eventType,event); // can trigger only real event (e.g. 'click')
			}else if(el[eventName]){
				el[eventName]();
			}else if(el['on'+eventName]){
				el['on'+eventName]();
			}
		}

		// Event listener for built-in and custom events
		function listen(el, type, handler){
			if(el.listenListener){
				el.listenListener(type,handler,false);
			}else if(el.attachEvent && htmlEvents['on'+type]){// IE < 9
				el.attachEvent('on'+type,handler);
			}else{
				el['on'+type]=handler;
			}
		}

		// Remove event listener for built-in and custom events
		function removeEvent(el, type, handler){
			if(el.removeventListener){
				el.removeEventListener(type,handler,false);
			}else if(el.detachEvent && htmlEvents['on'+type]){// IE < 9
				el.detachEvent('on'+type,handler);
			}else{
				el['on'+type]=null;
			}
		}

		// Add click event to pager node
		function addPagerListener(node) {
			listen(node, 'click', function(e) {
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;

				var target = this;
				var tag = (options.thumbnails) ? options.slide : "span";

				if(target.tagName.toLowerCase() === tag.toLowerCase()) {
					pagerTransition(getIndex(target));
				}
			});
		}

		// Fills pager with elements based on total slides, adds active class to the first slide
		function setupPager() {
			if(typeof settings.pager !== "undefined") {
				for(var i = 0; i < settings.totalSlides; i++) {
					if(options.thumbnails) {
						var thumb = slides[i].cloneNode(true);
						settings.pager.appendChild(thumb);
						addPagerListener(thumb);
					} else {
						var span = document.createElement('span');
						settings.pager.appendChild(span);
						addPagerListener(span);
					}
				}
				settings.pagerElems = (options.thumbnails) ? getDirectChildren(settings.pager, options.slide) : getDirectChildren(settings.pager, 'span');
				addClass(settings.pagerElems[0], 'fire-pager-active');
			}
		}

		function setupThumbnails() {
			if(settings.thumbnails) {
				var div = document.createElement('DIV');
				div.id = "fire-slider-thumbnails";
				for(var i = 0; i < settings.totalSlides; i++) {
					var thumb = slides[i].clone();
					div.appendChild(thumb);
				}
			}
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
			if(options.delay !== 0) {
				timer = setInterval(next, options.delay);
			}
		}

		// Stops the timer
		function pause() {
			if(options.delay !== 0) {
				clearInterval(timer);
			}
		}

		// Set up the inital state of fireSlider
		this.init = function() {
			if(typeof slider !== 'undefined') {
				initialize();
			}
		};

		function initialize() {
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

			trigger(slider, 'fire-slider-init');
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
					if(window.jQuery) {
						$(slides).dequeue(options.effect);
					} else {
						V.Utilities.dequeue(slides, options.effect);
					}
				}

				// Re-add active class
				addClass(slides[settings.currentSlide], 'fire-slider-active');

			} else {
				positionSlides(slides);
				calculatePositions(slider, settings.currentSlide);
				if(window.jQuery) {
					$(slides).dequeue(options.effect);
				} else {
					V.Utilities.dequeue(slides, options.effect);
				}
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
			
			V(element, {translateX: (opts.oldPosition + '%')}, {duration: 0, queue: options.effect});

			if(opts.snapping) {
				V(element, {translateX: (opts.newPosition + '%')}, {duration: 0, queue: options.effect});
			} else {
				V(element, {translateX: (opts.newPosition + '%')}, {duration: options.speed, queue: options.effect});
			}
		}

		// Fade in / out transition effect
		function fadeInOut(element, opts) {
			var offset = 0;
			if(opts.multiplier) {
				offset = opts.multiplier * 100;
			}

			if(!opts.delay) {
				V(element, {translateX: (opts.newPosition + '%'), opacity: 1.0, zIndex: 0}, {duration: 0, queue: options.effect});
			} else {
				V(element, {translateX: (opts.oldPosition + '%'), opacity: 1.0, zIndex: 1}, {duration: 0, queue: options.effect});
				V(element, {opacity: 0.0}, {duration: options.speed, queue: options.effect});
				V(element, {translateX: (opts.newPosition + '%'), opacity: 1.0, zIndex: 0}, {duration: 0, queue: options.effect, delay: options.speed});
			}
		}

		// Routes slide to correct transition
		function transitionManager(element, opts) {
			// Single slide transitions with default: fadeInOut
			if(settings.show === 1) {
				switch(options.effect) {
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
				switch(options.effect) {
					case 'slideInOut':
						slideInOut(element, opts);
						break;
					default:
						slideInOut(element, opts);
						break;
				}
			}
		}

		// Go to previous slide
		function prev() {
			// Stop timer
			pause();

			// Remove active classes
			removeClass(slides[settings.currentSlide], 'fire-slider-active');
			if(typeof settings.pager !== "undefined") {
				removeClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');
			}

			var delayIndex = settings.currentSlide;

			settings.currentSlide -= 1;
			if(settings.currentSlide < 0) {
				settings.currentSlide = (slides.length - 1);
			}

			// Calculate New Position
			for(var i = 0; i < slides.length; i++) {
				var oldPosition = positions.shift();
				var newPosition = oldPosition + 100;
				var snapping = false;
				var delay = false;
				if(newPosition < settings.minX) {
					newPosition = settings.maxX;
					snapping = true;
				}
				if(newPosition > settings.maxX) {
					newPosition = settings.minX;
					snapping = true;
				}
				if(i === delayIndex) {
					delay = true;
				}
				transitionManager(slides[i], {oldPosition: oldPosition, newPosition: newPosition, snapping: snapping, delay: delay});
				positions.push(newPosition);
			}

			if(window.jQuery) {
				$(slides).dequeue(options.effect);
			} else {
				V.Utilities.dequeue(slides, options.effect);
			}

			// Add active classes
			addClass(slides[settings.currentSlide], 'fire-slider-active');
			if(typeof settings.pager !== "undefined") {
				addClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');
			}

			// Trigger event fire-slider-prev
			trigger(slider, 'fire-slider-prev');

			// Restart timer
			play();
		}

		// Go to next slide
		function next() {
			// Stop timer
			pause();

			// Remove active classes
			removeClass(slides[settings.currentSlide], 'fire-slider-active');
			if(typeof settings.pager !== "undefined") {
				removeClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');
			}
			
			var delayIndex = settings.currentSlide;

			settings.currentSlide += 1;
			if(settings.currentSlide > (slides.length - 1)) {
				settings.currentSlide = 0;
			}

			// Calculate next position
			for(var i = 0; i < slides.length; i++) {
				var oldPosition = positions.shift();
				var newPosition = oldPosition - 100;
				var snapping = false;
				var delay = false;
				if(newPosition < settings.minX) {
					newPosition = settings.maxX;
					snapping = true;
				}
				if(newPosition > settings.maxX) {
					newPosition = settings.minX;
					snapping = true;
				}
				if(i === delayIndex) {
					delay = true;
				}
				transitionManager(slides[i], {oldPosition: oldPosition, newPosition: newPosition, snapping: snapping, delay: delay});
				positions.push(newPosition);
			}

			if(window.jQuery) {
				$(slides).dequeue(options.effect);
			} else {
				V.Utilities.dequeue(slides, options.effect);
			}

			// Add active classes
			addClass(slides[settings.currentSlide], 'fire-slider-active');
			if(typeof settings.pager !== "undefined") {
				addClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');
			}

			// Trigger event fire-slider-prev
			trigger(slider, 'fire-slider-prev');

			// Restart timer
			play();
		}

		// Go to the slide relative to the index of a pager elements
		function pagerTransition(index) {
			var currentPosition = settings.currentSlide % settings.totalSlides;
			var difference = index - currentPosition;

			if(difference !== 0) {

				// Stop Timer
				pause();

				// Re-load slides
				reloadSlider();

				var delayIndex = settings.currentSlide;

				// Remove active classes
				removeClass(slides[settings.currentSlide], 'fire-slider-active');
				removeClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

				// Using the difference, determine where the slides' next position will be and send to transition manager
				if(difference < 0) {
					
					// Previous Direction
					for(var i = 0; i < slides.length; i++) {
						var oldPositionPrev = positions.shift();
						var newPositionPrev = oldPositionPrev;
						var snappingPrev = false;
						var delay = false;

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

						if(i === delayIndex) {
							delay = true;
						}
						transitionManager(slides[i], {oldPosition: oldPositionPrev, newPosition: newPositionPrev, snapping: snappingPrev, delay: delay});
						positions.push(newPositionPrev);
					}

				} else {
					
					// Next Direction
					for(var k = 0; k < slides.length; k++) {
						var oldPositionNext = positions.shift();
						var newPositionNext = oldPositionNext;
						var snappingNext = false;
						var delay2 = false;

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
						if(k === delayIndex) {
							delay2 = true;
						}
						transitionManager(slides[k], {oldPosition: oldPositionNext, newPosition: newPositionNext, snapping: snappingNext, delay: delay2});
						positions.push(newPositionNext);
					}
				}

				// Perform transitions
				if(window.jQuery) {
					$(slides).dequeue(options.effect);
				} else {
					V.Utilities.dequeue(slides, options.effect);
				}

				// Set current slide
				settings.currentSlide = (settings.currentSlide + difference) % slides.length;

				// Add new active classes
				addClass(slides[settings.currentSlide], 'fire-slider-active');
				addClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

				// Restart timer
				play();
			}
		}

		// Click events
		if(typeof settings.next !== "undefined") {
			listen(settings.next, 'click', function(e) {
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
				next();
			});
		}
		if(typeof settings.prev !== "undefined") {
			listen(settings.prev, 'click', function(e) {
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
				prev();
			});
		}

		// Pause on hover events
		if(options.hoverPause) {
			listen(slider, 'mouseover', function(e) {
				pause();
			});
		}

		if(options.hoverPause) {
			listen(slider, 'mouseout', function(e) {
				play();
			});
		}

		// Disable link interaction if slide is not active slide
		if(options.disableLinks && typeof slider !== 'undefined') {
			listen(slider, 'click', function(e) {
				var target = (e.target) ? e.target : e.srcElement;
				if(target.tagName === "A") {
					if(!hasClass(target.parentNode, 'fire-slider-active')) {
						if (e.preventDefault) e.preventDefault();
						else e.returnValue = false;
					}
				}
			});
		}

		// Window resize event
		listen(window, 'resize', function() {
			refresh();
		});

		// Example listeners
		listen(document, 'fire-slider-init', function(e) {
			// Do stuff when initialized
		});

		listen(document, 'fire-slider-next', function(e) {
			// Do stuff when next
		});

	};

	window.FireSlider = FireSlider;

})();