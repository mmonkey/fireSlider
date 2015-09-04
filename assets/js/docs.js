var fireslider = $('.slider').fireSlider();
var slider = fireslider.data('fireSlider');
var form = $('form#builder');

function updateSlider() {
	if (form.find('[data-invalid]').length === 0) {
		var options = {};
		
		$.each(slider.options, function (key, value) {
			options[key] = form.find('[name="' + key + '"]').val();
		});

		slider.$el.fireSlider(options);
	}
}

// Build slider
var delay = 0;
slider.backup.each(function (index) {
	var slide = $(this);
	setTimeout(function () {
		var time = $.now();
		slide.css({
			background: "url(https://unsplash.it/600/400/?random&time=" + time + ") center center",
			backgroundSize: "cover"
		});
		if (index + 1 === slider.state.totalSlides) {
			updateSlider();
		}
	}, delay);
	delay += 100;
});

form.find('a#update-slider').click(function (e) {
	e.preventDefault();
	updateSlider();
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