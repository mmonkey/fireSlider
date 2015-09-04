var fireslider = $('.slider').fireSlider({
	active: 2,
	show: 3
});

$(document).ready(function () {

	var slider = fireslider.data('fireSlider');
	var form = $('form#builder');


	form.find('a#update-slider').click(function (e) {
		e.preventDefault();

		var show = parseInt(form.find('[name="show"]').val());
		var active = parseInt(form.find('[name="active"]').val());
		var options = {};

		options.show = (show > 0) ? show : slider.options.show;
		options.active = (active > 0 && active <= show) ? active : slider.options.active;


		slider.refresh();
	});

});