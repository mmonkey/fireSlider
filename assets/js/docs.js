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

		fireslider = slider.$el.fireSlider(options);
		slider = fireslider.data('fireSlider');
		updateJavascriptOutput();
	}
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
	var hasNav = (slider.options.prev instanceof jQuery && slider.options.next instanceof jQuery)

	var output = (hasPager || hasNav) ? "\n$('.slider').each(function () {" : "\n$('.slider')";
	output += (hasPager) ? "\n\tpager: $(this).siblings('.pager')" : "";
	output += (hasNav && hasPager) ? "," : "";
	output += (hasNav) ? "\n\tprev: $(this).siblings('.prev'),\n\tnext: $(this).siblings('.next')" : "";
	output += (hasPager || hasNav) ? "\n})" : "";
	output += (code === "") ? ".fireSlider(" : ".fireSlider.({";
	output += code;
	output += (code === "") ? ");" : "\n});";

	$('.javascript-output').find('code').text(output);
	Prism.highlightAll();
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
});

// Configure validation
$(document).foundation({
	abide: {
		live_validate: true,
		error_labels: true,
		timeout: 300
	}
});