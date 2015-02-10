/*!
 * fireSlider (1.1.1) (C) 2014 CJ O'Hara and Tyler Fowle.
 * MIT @license: en.wikipedia.org/wiki/MIT_License
 **/
var Velocity = require('velocity-animate');

(function (FireSlider, undefined) {

	// Set up Velocity
	var V = (window.jQuery) ? $.Velocity : Velocity;

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

	FireSlider.slider = function(selector, options, breakpoints) {
		var timer = {};
		var positions = [];
		var isPaused = false;
		var slider = document.querySelectorAll(selector)[0];

		var slideData = (typeof slider !== 'undefined') ? getData(slider) : {};
		var defaults = {
			slide: (typeof slideData.sliderSlide !== "undefined") ? slideData.sliderSlide : 'li',
			show: (typeof slideData.sliderShow !== "undefined") ? parseInt(slideData.sliderShow) : 1,
			active: (typeof slideData.sliderActive !== "undefined") ? parseInt(slideData.sliderActive) : 1,
			speed: (typeof slideData.sliderSpeed !== "undefined") ? parseInt(slideData.sliderSpeed) : 500,
			delay: (typeof slideData.sliderDelay !== "undefined") ? parseInt(slideData.sliderDelay) : 5000,
			effect: (typeof slideData.sliderEffect !== "undefined") ? slideData.sliderEffect : 'slideInOut',
			easing: (typeof slideData.sliderEasing !== "undefined") ? slideData.sliderEasing : 'swing',
			hoverPause: (typeof slideData.sliderHoverPause !== "undefined") ?  getBoolean(slideData.sliderHoverPause) : false,
			disableLinks: (typeof slideData.sliderDisableLinks !== "undefined") ?  getBoolean(slideData.sliderDisableLinks) : true,
			direction: (typeof slideData.sliderDirection !== "undefined") ?  getBoolean(slideData.sliderDirection) : 'forward',
			pagerTemplate: (typeof slideData.sliderPagerTemplate !== "undefined") ? slideData.sliderPagerTemplate : ''
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
				direction: options.direction,
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
			var currentPositions = positions.slice(0);
			
			for(var i = 0; i < revolutions; i++) {
				cyclePositions(direction);
			}

			for(var j = 0; j < slides.length; j++) {
				V(slides[i], {translateX: (positions[i] + '%')}, {duration: 0, queue: options.effect});
			}
		}

		// Add click event to pager node
		function addPagerListener(node, tag) {
			listen(node, 'click', function(e) {
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;

				var target = this;

				if(target.tagName.toLowerCase() === tag.toLowerCase()) {
					pagerTransition(getIndex(target));
				}
			});
		}

		// Clone slides as pager elements
		function createClonedPager() {
			for(var i = 0; i < settings.totalSlides; i++) {
				var clone = slides[i].cloneNode(true);
				settings.pager.appendChild(clone);
				addPagerListener(clone, options.slide);
				settings.pagerElems.push(clone);
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

		// Parse tags from pager template
		function parsePagerTemplate(slide, template, index) {
			var result = template;

			if (result.indexOf('{{num}}') !== -1) {
				result = result.replace(/{{num}}/g, (index + 1).toString());
			}

			if (result.indexOf('{{src}}') !== -1) {
				var img = slide.querySelectorAll('img')[0];
				var src = (typeof img !== "undefined") ? img.src : '';
				result = result.replace(/{{src}}/g, src);
			}

			if (result.indexOf('{{description}}') !== -1) {
				var des = (typeof getData(slide).sliderPagerDescription !== "undefined") ? getData(slide).sliderPagerDescription : '';
				result = result.replace(/{{description}}/g, des);
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
			for(var i = 0; i < settings.totalSlides; i++) {
				var template = options.pagerTemplate;
				var markup = parsePagerTemplate(slides[i], template, i);
				var parser = new DOMParser();
				var elm = getDomElementFromString(markup);
				settings.pager.appendChild(elm);
				addPagerListener(elm, elm.tagName);
				settings.pagerElems.push(elm);
			}
		}

		// Setup pager with span elements
		function createDefaultPager() {
			for(var i = 0; i < settings.totalSlides; i++) {
				var span = document.createElement('span');
				settings.pager.appendChild(span);
				addPagerListener(span, 'span');
				settings.pagerElems.push(span);
			}
		}

		// Fills pager with elements based on total slides, adds active class to the first slide
		function setupPager() {

			if(options.pagerTemplate.toLowerCase() === 'clone') {
				createClonedPager();
			} else if(options.pagerTemplate !== '') {
				createCustomPager();
			} else {
				createDefaultPager();
			}

			addClass(settings.pagerElems[0], 'fire-pager-active');
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

		function prevSlide() {
			transitionSlides('prev');
		}

		function nextSlide() {
			transitionSlides('next');
		}

		// Starts the timer
		function startTimer(direction) {
			if(options.delay !== 0 && !isPaused) {
				timer = (direction === 'backward') ? setInterval(prevSlide, options.delay) : setInterval(nextSlide, options.delay);

			}
		}

		// Stops the timer
		function stopTimer() {
			clearInterval(timer);
		}

		// Refresh positions, breakpoints and slide count
		function refresh() {
			// Pause transitions
			stopTimer();

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

			// Trigger event fire-slider-refreshed
			trigger(document.querySelectorAll(selector), 'fire-slider-refreshed');

			// Play Transitions
			startTimer(settings.direction);
		}

		// Basic slide transition effect
		function slideInOut(element, opts) {
			var duration = (opts.snapping) ? 0 : options.speed;
			V(element, {translateX: [(opts.nextPos + '%'), (opts.currPos + '%')]}, {duration: duration, queue: options.effect, easing: options.easing});
		}

		// Fade in / out transition effect
		function fadeInOut(element, opts) {
			var elemClone = element.cloneNode(true);
			element.parentNode.appendChild(elemClone);

			V(element, {translateX: [(opts.nextPos + '%'), (opts.nextPos + '%')]}, {duration: options.speed , queue: options.effect,
				begin: function() {
					V(elemClone, {opacity: [0.0, 1.0], zIndex: [1, 1]}, {duration: options.speed, easing: options.easing});
				},
				complete: function() { elemClone.parentNode.removeChild(elemClone); }
			});
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

		function cyclePositions(direction) {
			if(direction === 'prev') {
				var prev = positions.shift();
				positions.push(prev);
			} else {
				var next = positions.pop();
				positions.unshift(next);
			}
		}

		function updateCurrentSlide(direction) {
			if(direction === 'prev') {
				settings.currentSlide = (settings.currentSlide === 0) ? (slides.length - 1) : settings.currentSlide -= 1;
			} else {
				settings.currentSlide = (settings.currentSlide === (slides.length - 1)) ? 0 : settings.currentSlide += 1;
			}
		}

		// Go to previous slide
		function transitionSlides(direction) {
			
			// Stop timer
			stopTimer();

			// Remove active classes
			removeClass(slides[settings.currentSlide], 'fire-slider-active');
			if(typeof settings.pager !== "undefined") removeClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

			updateCurrentSlide(direction);

			var currentPositions = positions.slice(0);
			cyclePositions(direction);

			// Calculate New Position
			for(var i = 0; i < slides.length; i++) {
				transitionManager(slides[i], {
					currPos: currentPositions[i],
					nextPos: positions[i],
					snapping: (positions[i] === settings.minX || positions[i] === settings.maxX) ? true : false
				});
			}

			// Trigger event fire-slider-before-transition
			trigger(document.querySelectorAll(selector), 'fire-slider-before-transition');

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

			// Trigger event fire-slider-after-transition
			trigger(document.querySelectorAll(selector), 'fire-slider-after-transition');

			// Restart timer
			startTimer(settings.direction);
		}

		// Go to the slide relative to the index of a pager elements
		function pagerTransition(index) {

			var difference = index - (settings.currentSlide % settings.totalSlides);

			if(difference !== 0) {

				// Stop Timer
				stopTimer();

				// Re-load slides
				reloadSlider();

				var delayIndex = settings.currentSlide;

				// Remove active classes
				removeClass(slides[settings.currentSlide], 'fire-slider-active');
				removeClass(settings.pagerElems[settings.currentSlide % settings.totalSlides], 'fire-pager-active');

				var currentPositions = positions.slice(0);

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
				for(var k = 0; k < slides.length; k++) {
					transitionManager(slides[k], {
						currPos: currentPositions[k],
						nextPos: positions[k],
						snapping: (positions[k] <= (settings.minX + snappingRange) || positions[k] >= (settings.maxX - snappingRange)) ? true : false
					});
				}

				// Trigger event fire-slider-before-transition
				trigger(document.querySelectorAll(selector), 'fire-slider-before-transition');

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

				// Trigger event fire-slider-after-transition
				trigger(document.querySelectorAll(selector), 'fire-slider-after-transition');

				// Restart timer
				startTimer(settings.direction);
			}
		}

		// Add all necesary event listeners
		function addSliderEventListeners() {

			if(typeof settings.prev !== "undefined") {
				listen(settings.prev, 'click', function(e) {
					if (e.preventDefault) e.preventDefault();
					else e.returnValue = false;
					prevSlide();
					return false;
				});
			}

			if(typeof settings.next !== "undefined") {
				listen(settings.next, 'click', function(e) {
					if (e.preventDefault) e.preventDefault();
					else e.returnValue = false;
					nextSlide();
					return false;
				});
			}

			if(options.hoverPause) {
				listen(slider, 'mouseover', function(e) {
					stopTimer();
					return false;
				});
			}

			if(options.hoverPause) {
				listen(slider, 'mouseout', function(e) {
					startTimer(settings.direction);
					return false;
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
					return false;
				});
			}

			listen(window, 'resize', function() {
				refresh();
				return false;
			});
		}

		// Set up the inital state of FireSlider.slider
		function init() {
			if(typeof slider !== 'undefined') {

				if(typeof settings.pager !== 'undefined') setupPager();

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

				addSliderEventListeners();

				trigger(document.querySelectorAll(selector), 'fire-slider-init');
				startTimer(settings.direction);
			}
		}

		this.next = function() {
			prevSlide();
		};

		this.prev = function() {
			nextSlide();
		};

		this.pause = function() {
			isPaused = true;
			stopTimer();
		};

		this.play = function() {
			isPaused = false;
			stopTimer();
			settings.direction = 'forward';
			startTimer(settings.direction);
		};

		this.reverse = function() {
			isPaused = false;
			stopTimer();
			settings.direction = 'backward';
			startTimer(settings.direction);
		};

		init();

		var sliderObject = {
			selector: selector,
			settings: settings,
			options: options,
			slides: slides,
			data: slideData,
			isPaused: isPaused
		};
		sliderObject = extend(sliderObject, this);
		sliderObject = extend(sliderObject, document.querySelectorAll(selector)) || {};

		return sliderObject;
	};

})(window.FireSlider = window.FireSlider || {});

// If jQuery return new FireSlider object with options, wrapped as a jQuery object (for chaining)
if(window.jQuery) {
	(function (window) {
		$.fn.fireSlider = function(options, breakpoints) {
			var slider = new FireSlider.slider(this.selector, options, breakpoints);
			return $(slider);
		};
	})(window.jQuery);
}