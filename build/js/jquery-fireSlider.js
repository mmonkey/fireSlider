/*! fireSlider (2.0) (C) CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
;(function ($, window, document, undefined) {
	var fireSlider = "fireSlider";
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

	// The actual plugin constructor
	function FireSlider(element, options, selector, index) {
		this.element = element;
		this.selector = selector;
		this.index = index;
		this._defaults = defaults;
		this._name = fireSlider;

		var attributes = this.getDataAttributes();
		this._attributes = attributes;

		this.options = $.extend({}, defaults, options, attributes);

		if ($(this.element).is(':visible')) this.init();
	}

	FireSlider.prototype = {

		init: function() {
			// Check to see if velocity is loaded
			if(typeof $.Velocity === 'undefined') {
				console.log('%cWARNING: fireSlider requires velocity.js to run correctly.', 'background: #E82C0C; color: white; padding: 0 12px;');
				return;
			}

			// Load prev, next, and pager elements
			this.options.prev = (typeof this.options.prev !== 'undefined') ? this.getMatchingElement(this.options.prev, this.index) : undefined;
			this.options.next = (typeof this.options.next !== 'undefined') ? this.getMatchingElement(this.options.next, this.index) : undefined;
			this.options.pager = (typeof this.options.pager !== 'undefined') ? this.getMatchingElement(this.options.pager, this.index) : undefined;

			// Load slides
			this.slides = $(this.element).children(this.options.slides);
			if (this.slides.length === 0 || (!this.options.singleSlide && this.slides.length < 2)) return;

			if (typeof this.options.pager !== 'undefined') this.setupPager();

			console.log(this);
		},

		getDataAttributes: function() {
			var data = this.element.dataset;
			Object.keys(data).forEach(function (name, index) {
				var matches = ["fireslider", "fire-slider"];
				$.each(matches, function(index, match) {
					if (name.toLowerCase().indexOf(match) > -1) {
						var pattern = new RegExp(match, 'gi');
						var key = name.replace(pattern, '');
						key = key.charAt(0).toLowerCase() + key.slice(1);

						data[key] = data[name];
						delete data[name];
					}
				});
			});
			return data;
		},

		getMatchingElement: function(sel, index) {
			// If it is an id selector, return first matching element
			if(sel.split(' ').pop().indexOf('#') > -1) {
				return $(sel)[0];
			}

			// If one match is found in sibling elements, return match
			var matches = $(this.element).siblings(sel);
			if (matches.length === 1) {
				return $(this.element).nextUntil(this.selector, sel)[0];
			}

			// If one match is found in parent's sibling elements, return match
			matches = $(this.element).parent().siblings(sel);
			if (matches.length === 1) {
				return $(this.element).parent().nextUntil(this.selector, sel)[0];
			}

			// If the number of sliders and the number of matching elements match, return the same indexed item.
			matches = $(sel);
			if($(this.selector).length === matches.length && matches.length > index) {
				return matches[index];
			}

			return undefined;
		},

		// Fills pager with elements based on total slides, adds active class to the first slide
		setupPager: function() {
			this.pages = [];
			if(this.options.pagerTemplate.toLowerCase() === 'clone') {
				this.createClonedPager();

			} else if(this.options.pagerTemplate !== '') {
				this.createCustomPager();

			} else {
				this.createDefaultPager();
			}

			$(this.pages[0]).addClass(this.options.activePagerClass);
		},

		// Clone slides as pager elements
		createClonedPager: function() {
			var fs = this;
			$.each(fs.slides, function(i, slide) {
				var page = $(slide).clone();
				$(fs.options.pager).append(page);
				fs.addPagerListener(page, fs.options.slide);
				fs.pages.push(page);
			});
		},

		// Setup custom pager elements
		createCustomPager: function() {
			var fs = this;
			$.each(this.slides, function(i, slide) {
				var markup = fs.parsePagerTemplate(slide, fs.options.pagerTemplate, i);
				var page = fs.getDomElementFromString(markup);
				$(fs.options.pager).append(page);
				fs.addPagerListener(page, page.tagName);
				fs.pages.push(page);
			});
		},

		// Setup pager with span elements
		createDefaultPager: function() {
			var fs = this;
			$.each(fs.slides, function(i, slide) {
				var page = $(fs.options.pager).append('<span></span>');
				fs.addPagerListener(page, 'span');
				fs.pages.push(page);
			});
		},

		// Add click event to pager node
		addPagerListener: function(node, tag) {
			var fs = this;
			$(node).on('click', function (e) {
				e.preventDefault();

				var target = (e.target) ? e.target : e.srcElement;
				if(target.tagName.toLowerCase() === tag.toLowerCase()) {
					fs.pagerTransition(this.getIndex(target));
				}
			});
		},

		// Parse tags from pager template
		parsePagerTemplate: function(slide, template, index) {
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
		getTemplateTagRegex: function(tag) {
			return new RegExp('{{\\s*' + tag + '\\s*}}', 'g');
		},

		// Create a dom element from HTML markup
		getDomElementFromString: function(markup) {
			var d = document.createElement('div');
			d.innerHTML = markup;
			return d.firstChild;
		}
	};

	var index = 0;
	$.fn[fireSlider] = function (options) {
		var selector = this.selector;
		return this.each(function () {
			if (!$.data(this, "plugin_" + fireSlider)) {
				$.data(this, "plugin_" + fireSlider, new FireSlider(this, options, selector, index));
				index++;
			}
		});
	};

})( jQuery, window, document );