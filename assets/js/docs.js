var fireslider = $('ul.slider').fireSlider();
var slider = fireslider.data('fireSlider');
var form = $('form#builder');
fetchImages();

function updateSlider () {
	if (form.find('[data-invalid]').length === 0) {
		var options = {};
		
		$.each(slider.options, function (key, value) {
			options[key] = form.find('[name="' + key + '"]').val();
		});

		options.disableLinks = $('input#disableLinks').is(':checked');
		options.hoverPause = $('input#hoverPause').is(':checked');

		if ($('input#showPager').is(':checked')) {
			slider.$el.data({
				pager: slider.$el.siblings('.pager')
			});
			slider.$el.siblings('.pager').fadeIn();
		} else {
			slider.$el.removeData('pager');
			slider.$el.siblings('.pager').fadeOut();
		}

		if ($('input#showNav').is(':checked')) {
			slider.$el.data({
				prev: slider.$el.siblings('.prev'),
				next: slider.$el.siblings('.next')
			});
			slider.$el.siblings('.prev').fadeIn();
			slider.$el.siblings('.next').fadeIn();
		} else {
			slider.$el.removeData('prev');
			slider.$el.removeData('next');
			slider.$el.siblings('.prev').fadeOut();
			slider.$el.siblings('.next').fadeOut();
		}

		fireslider = slider.$el.fireSlider(options);
		slider = fireslider.data('fireSlider');
		updateOutput();
	}
}

function updateOutput () {
	updateJavascriptOutput();
	updateHtmlOutput();
	updateCssOutput();
	Prism.highlightAll();
}

function updateJavascriptOutput () {
	var code = "";
	$.each(slider._defaults, function (key, value) {
		if (slider._defaults[key] != slider.options[key]) {
			code += (code === "") ? "" : ",";
			code += "\n\t" + key + ": " + formatCodeValue(key, slider.options[key]);
		}
	});

	var hasPager = (slider.options.pager instanceof jQuery);
	var hasNav = (slider.options.prev instanceof jQuery && slider.options.next instanceof jQuery);

	var output = (hasPager || hasNav) ? "\n$('.slider').each(function () {" : "\n$('.slider')";
	output += (hasPager || hasNav) ? "\n\t$(this).data({" : "";
	output += (hasPager) ? "\n\t\tpager: $(this).siblings('.pager')" : "";
	output += (hasNav && hasPager) ? "," : "";
	output += (hasNav) ? "\n\t\tprev: $(this).siblings('.prev'),\n\t\tnext: $(this).siblings('.next')" : "";
	output += (hasPager || hasNav) ? "\n\t});\n})" : "";
	output += (code === "") ? ".fireSlider(" : ".fireSlider({";
	output += code;
	output += (code === "") ? ");" : "\n});";

	$('.javascript-output').find('code').text(output);
}

function updateHtmlOutput () {
	var markup = '<ul class="slider">';
	for (var i = 0; i < slider.state.totalSlides; i++) {
		markup += '\n\t<li>' + (i + 1) + '</li>';
	}
	markup += '\n</ul>';
	markup += (slider.options.prev instanceof jQuery) ? '\n<a class="prev">&laquo;</a>' : '';
	markup += (slider.options.next instanceof jQuery) ? '\n<a class="next">&raquo;</a>' : '';
	markup += (slider.options.pager instanceof jQuery) ? '\n<div class="pager"></div>' : '';

	$('.html-output').find('code').text(markup);
}

function updateCssOutput () {
	var css = 'ul.slider {\n\tdisplay: block;\n\theight: 300px;\n\tlist-style: none;\n\tmargin: 0;\n\tposition: relative;\n\twidth: 100%;';
	css += ($('input#wrapSlides').is(':checked')) ? '\n\toverflow: hidden;' : '';
	css += '\n}';
	css += '\nul.slider > li {\n\tdisplay: block;\n\theight: 100%;\n}';

	var pager = '\n.pager {\n\tpadding-top: 0.5em;\n\ttext-align: center;\n}';
	pager += '\n.pager > span {\n\tbackground: #ddd;\n\tborder-radius: 50%;\n\tcursor: pointer;\n\tdisplay: inline-block;\n\theight: 0.75em;\n\tmargin: 0 0.25em;\n\twidth: 0.75em;\n}';
	pager += '\n.pager > span:hover, .pager > span.fire-pager-active {\n\tbackground: #2ba6cb;\n}';

	var nav = '\n.prev, .next {\n\tcolor: #fff;\n\tdisplay: block;\n\tfont-size: 5em;\n\theight: 0.75em;\n\tline-height: 0.5em;\n\tmargin-top: -0.5em;\n\tposition: absolute;\n\ttext-align: center;\n\ttext-shadow: 3px 3px 6px #000;\n\ttop: 50%;\n\twidth: 0.75em;\n}';
	nav += '\n.prev:hover, .next:hover {\n\tcolor: #ddd;\n}';
	nav += '\n.prev {\n\tleft: 0;\n}';
	nav += '\n.next {\n\tright: 0;\n}';

	css += (slider.options.prev instanceof jQuery && slider.options.next instanceof jQuery) ? nav : '';
	css += (slider.options.pager instanceof jQuery) ? pager : '';

	$('.css-output').find('code').text(css);
}

function formatCodeValue (key, value) {
	switch (key) {
		case "show":
		case "active":
		case "speed":
		case "delay":
			return value;
		default:
			return '"' + value + '"';
	}
}

function fetchImages () {
	var delay = 0;
	slider.backup.each(function (index) {
		var slide = $(this);
		setTimeout(function () {
			slide.css({
				background: "url(https://unsplash.it/600/400/?random&time=" + $.now() + ") center center",
				backgroundSize: "cover"
			});
			if (index + 1 === slider.state.totalSlides) {
				updateSlider();
			}
		}, delay);
		delay += 100;
	});
}

form.find('a#updateSlider').click(function (e) {
	e.preventDefault();
	updateSlider();
});

form.find('a#fetchImages').click(function (e) {
	e.preventDefault();
	fetchImages();
});

// Prefill boxes
$(document).ready(function () {
	$.each(slider.options, function (key, value) {
		form.find('[name="' + key + '"]').val(value);
	});

	$('input#disableLinks').prop('checked', slider.options.disableLinks);
	$('input#hoverPause').prop('checked', slider.options.hoverPause);
});

// Configure validation
$(document).foundation({
	abide: {
		live_validate: true,
		error_labels: true,
		timeout: 300
	}
});