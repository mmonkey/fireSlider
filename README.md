fireSlider.js
=============
fireSlider.js is a responsive slider and carousel plugin. It is content-agnostic, meaning it can create a slider from any type of HTML you want. Transitions are incredibly smooth, built with [Velocity.js](https://github.com/julianshapiro/velocity) animation library.

fireSlider.js supports breakpoints out-of-the-box. You can set up completely different options based on the width of the browser window.

Getting Started
---------------

**Use by itself:**

fireSlider doesn't depend on any outside plugins, just plug-in and go.

    <script src="path/to/fireSlider.min.js"></script>


**Use with jQuery**

You can take advantage of jQuery, if you choose to do so.

    <script src="path/to/jQuery.min.js"></script>
    <script src="path/to/fireSlider.min.js"></script>


Examples
--------

Coming very soon!

Setup
-------------

**Create the slider / carousel:**

    <ul class="slider">
    	<li><img src="path/to/image1.jpg"></li>
    	<li><img src="path/to/image2.jpg"></li>
    	<li><img src="path/to/image3.jpg"></li>
    </ul>

This is just an example, your slider can be any HTML with child elements inside. In general, an unordered list is a semantic option.

**Add controls:**

    <ul class="slider">
        <li><img src="path/to/image1.jpg"></li>
        <li><img src="path/to/image2.jpg"></li>
        <li><img src="path/to/image3.jpg"></li>
    </ul>
    
    <a id="prev" href=""></a>
    <a id="next" href=""></a>
    
    <div id="pager"></div>

fireSlider supports previous and next slide controls as well as a pager. These controls are not required.

Configure
---------

**JavaScript**

    FireSlider.slider(".slider", {
    	show: 5,
    	active: 3,
    	prev: "#prev",
    	next: "#next",
    	pager: "#pager",
    	effect: "slideInOut",
    	speed: 500,
    	delay: 4500,
    }, [
    	{breakpoint: 840, show: 3, active: 2},
    	{breakpoint: 460, show: 1, active: 1}
    ]);

fireSlider only has one required option, and that is the selector of your slider. If you just want to use the default options:

    FireSlider.slider(".slider");

See all of fireSlider's default options with descriptions down below.

**jQuery**

    $(".slider").fireSlider({
    	prev: "#prev",
    	next: "#next",
    	pager: "#pager"
    });

To use just the default options with jQuery:

    $(".slider").fireSlider();

You may also want to leverage other jQuery functions:

    $(".slider").fireSlider().addClass("myClass");

**Arguments**

JavaScript:

    FireSlider.slider(selector, options, breakpoints);

jQuery:

    $(selector).fireSlider(options, breakpoints);

Argument | Description | Type
------------- | ------------- | -------------
selector | A selector to the slider element | String
options | Configureable options to customize the slider | Object
breakpoints | A sub-set of options to update at certain browser widths | Array

Options
-------

Option | Description | Type | Default 
------------- | ------------- | ------------- | -------------
slide | A selector for the slide elements. | string | "li"
show | The amount of slides to show in the slider at once. | int | 1
active | The position of the active slide. | int | 1
speed | The speed of the transition (milliseconds). | int | 500
delay | The amount of time in between transitions (milliseconds). | int | 5000
direction | The direction of the slide transitions. | string | "forward"
effect | The transition effect to use. | string | "slideInOut", "fadeInOut"
hoverPause | Pause transitions when mouse hovers? | boolean | false
disableLinks | Disable links on the non-active slides? | boolean | true
prev | The selector of the previous-slide button. | string | N/A
next | The selector of the next-slide button. | string | N/A
pager | The selector of the pager element. | string | N/A
thumbnails | Duplicate slides for the pager elements? | boolean | false

All of fireSlider's options may also be setup with data-attributes on the slider element:

    <ul class="slider" data-slider-speed="300" data-slider-pager="#pager">
        <li><img src="path/to/image1.jpg"></li>
        <li><img src="path/to/image2.jpg"></li>
        <li><img src="path/to/image3.jpg"></li>
    </ul>

All data-attributes are named the same as the options, except prepended by `data-slider-`. Two word options, like hoverPause, are instead `data-slider-hover-pause`.

Breakpoints
-----------

Breakpoint options are similar to the main options, but limited to:

Option | Description | Type | Default 
------------- | ------------- | ------------- | -------------
breakpoint | Max pixel-width of the breakpoint range. | int | N/A
show | The amount of slides to show in the slider at once. | int | 1
active | The position of the active slide. | int | 1

Setting up breakpoint options is a breeze:

	var breakpoints = [
    	{breakpoint: 1200, show: 5, active: 3},
       	{breakpoint: 840, show: 3, active: 2},
       	{breakpoint: 460, show: 1, active: 1}
    ];

    FireSlider.slider(".slider", { effect: "fadeInOut" }, breakpoints);

There is no limit to the number of breakpoints you set!

Events
------
fireSlider will trigger custom events that can be hooked into:

Event | Description
------------- | -------------
"fire-slider-init" | Triggered right after the slider is initialized.
"fire-slider-before-transition" | Triggered right before a slide has transitioned.
"fire-slider-after-transition" | Triggered right after a slide has transitioned.
"fire-slider-reloaded" | Triggered whenever the slider gets reloaded like on window resize.

You can listen for events like this:

    var slider = FireSlider.slider(".my_slider");
    
    slider.addEventListener("fire-slider-init", function() {
    	console.log("My slider is ready!");
    });

Download
--------
Get the latest version of fireSlider [here.](releases/latest)

Contribute
----------
**Build** - (Requires [npm](http://nodejs.org/) and [gulp](http://gulpjs.com/))

Install the project dependencies:

    $ npm update

Start gulp:

    $ gulp

**Issues**

You can submit issues [here.](issues)


----------
[MIT License.](LICENSE.md) © CJ O'Hara and Tyler Fowle.