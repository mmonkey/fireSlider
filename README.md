jquery.fireSlider.js
=============
fireSlider is a responsive slider and carousel plugin. It is content-agnostic, meaning it can create a slider from any type of HTML you want. Transitions are incredibly smooth, built with [Velocity.js](https://github.com/julianshapiro/velocity) animation library.

fireSlider supports breakpoints out-of-the-box. You can set up completely different options based on the width of the browser window.

Download
--------
Get the latest version of fireSlider [here.](https://github.com/mmonkey/fireSlider/releases/latest)

Getting Started
---------------
fireSlider has one dependency, Velocity.js, and it comes in two versions:

**Includes Velocity.js:**  
```html
<script src="path/to/jquery.fireSlider.velocity.js"></script>
```

**Does not include Velocity.js:**  
```html
<script src="path/to/velocity.min.js"></script>
<script src="path/to/jquery.fireSlider.min.js"></script>
```
Using this version of fireSlider will require you to include velocity also. This is good if you are already using Velocity.js elsewhere.

**Add [Hammer.js](http://hammerjs.github.io/) for mobile swipe compatibility**  
```html
<script src='path/to/hammer.min.js'></script>
```

Browser Support
---------------
fireSlider works out-of-the-box with most all web browsers:

| Chrome* | Firefox* | Opera* | Safari* | IE9+ | Mobile Safari* | Chrome Android |
| ------- | -------- | ------ | ------- | ---- | -------------- | -------------- |
| ✓ | ✓ | ✓| ✓ | ✓ | ✓ | ✓ |

* Only the latest version tested.

If you find a troublesome browser, please [open an issue](https://github.com/mmonkey/fireSlider/issues). Please note the browser, version and operating system.

Examples
--------

Coming very soon!

Setup
-------------

**Create the slider / carousel:**

```html
<ul class="slider">
	<li><img src="path/to/image1.jpg"></li>
	<li><img src="path/to/image2.jpg"></li>
	<li><img src="path/to/image3.jpg"></li>
</ul>
```

This is just an example, your slider can be any HTML with child elements inside. In general, an unordered list is a semantic option.

**Add controls:**

```html
<ul id="slider">
	<li><img src="path/to/image1.jpg"></li>
	<li><img src="path/to/image2.jpg"></li>
	<li><img src="path/to/image3.jpg"></li>
</ul>

<a id="prev" href=""></a>
<a id="next" href=""></a>

<div id="pager"></div>
```

fireSlider supports previous and next slide controls as well as a pager. These controls are not required.


Configure
---------

**Defaults only**

```javascript
$('#slider').fireSlider();
```

**Simple - One slider**  
Pass in jQuery objects for prev, next and pager elements.

```javascript
$("#slider").fireSlider({
	prev: $('#prev'),
	next: $('#next'),
	pager: $('#pager')
});
```

**Advanced - Multiple sliders with the same selectors**  
To use more advanced selectors, add them with data attributes. The example below allows selectors based on `$(this)` slider.

```javascript
$('.js-slider > ul').each(function () {
	$(this).data({
		'pager': $(this).parent().nextUntil('.js-slider', '.pager'),
		'prev': $(this).parent().nextUntil('.js-slider', '.prev'),
		'next': $(this).parent().nextUntil('.js-slider', '.next')
	});
}).fireSlider();
```

**Passing other options**  
This is an example of how to pass options to fireSlider, all options available are documented below.

```javascript
$('#slider').fireSlider({
	delay: 4000,
	slide: 'li',
	speed: 700
});
```


Style
-------

Add these classes to your slider element:

```css
.slider {
	position: relative;
	width: DESIRED WIDTH;
	height: DESIRED HEIGHT;
}
```

Add this to make it a slider instead of a carousel:

```css
.slider {
	position: relative;
	width: DESIRED WIDTH;
	height: DESIRED HEIGHT;
	overflow: hidden;
}
```

Options
-------

Option | Description | Type | Default | Availiable Options
------------- | ------------- | ------------- | ------------- | -------------
active | The position of the active slide. | int | 1 | n/a
activePagerClass | The class to be added to the current active pager element. | string | "fire-pager-active" | n/a
activeSlideClass | The class to be added to the current active slide. | string | "fire-slider-active" | n/a
breakpoints | See description below | array | n/a | n/a
delay | The amount of time in between transitions (milliseconds). | int | 5000 | n/a
direction | The direction of the slide transitions. | string | "forward" | "forward", "backward", "up", "down"
disableLinks | Disable links on the non-active slides? | boolean | true | true, false
effect | The transition effect to use. | string | "slideInOut" | "slideInOut", "fadeInOut"
easing | The easing effect for the transition. | string or array | "swing" | see [Velocity.js](https://github.com/julianshapiro/velocity)
hoverPause | Pause transitions when mouse hovers? | boolean | false | true, false
next | The selector of the next-slide button. | jQuery | n/a | n/a
pager | The selector of the pager element. | jQuery | n/a | n/a
pagerTemplate | Template for pager elements | HTML String | "`<span><\span>`" | n/a
prev | The selector of the previous-slide button. | jQuery | n/a
slide | A selector for the slide elements. | string | "li" | n/a
show | The amount of slides to show in the slider at once. | int | 1 | n/a
speed | The speed of the transition (milliseconds). | int | 500 | n/a
swipe | Determines if slider will have left/right mobile-touch swipe compatibility | boolean | true | true, false

Each option may also be setup with data-attributes on the slider element:

```html
<ul class="slider" data-fireslider-speed="300">
	<li><img src="path/to/image1.jpg"></li>
	<li><img src="path/to/image2.jpg"></li>
	<li><img src="path/to/image3.jpg"></li>
</ul>
```

However, for prev, next and pager options, using jQuery's `$.data()` works best for attribute options.

All data-attributes are named the same as the options, except prepended by `data-fireslider-`. Two word options, like hoverPause, are instead `data-fireslider-hover-pause`.

Breakpoints
-----------

Breakpoints allow you to set different settings on a slider based on the browser's width. Breakpoints are mobile-first, so the breakpoint attribute can be viewed as "greater than or equal to".

Option | Description | Type | Default 
------------- | ------------- | ------------- | -------------
active | The position of the active slide. | int | 1
breakpoint | Minimum pixel-width of the breakpoint range. | int | N/A
show | The amount of slides to show in the slider at once. | int | 1

Setting up breakpoint options is a breeze:

```javascript
var bps = [
	{breakpoint: 1, show: 1, active: 1},
	{breakpoint: 840, show: 3, active: 2},
	{breakpoint: 1200, show: 5, active: 3}
];

$('#slider').fireSlider({breakpoints: bps});
```

```html
<ul class="slider" data-fireslider-breakpoints='[{"breakpoint": 1, "show": 1, "active": 1},{"breakpoint": 580, "show": 2, "active": 1},{"breakpoint": 720, "show": 3, "active": 2},{"breakpoint": 860, "show": 5, "active": 2}]'>
	<li><img src="path/to/image1.jpg"></li>
	<li><img src="path/to/image2.jpg"></li>
	<li><img src="path/to/image3.jpg"></li>
</ul>
```

There is no limit to the number of breakpoints you can set!

Pager Template
-------

By default, a pager is filled with empty spans, however you can customize the pager elments with custom markup. Here is how to fill the pager with anchor links:

```javascript
$('#slider').fireslider({
	pager: "#pager",
	pagerTemplate: '<a href="#" class="pager-dot"></a>'
});
```

Optionally, you can clone your entire original slide, creating a "thumbnail" by setting `pagerTemplate: "clone"`:

```javascript
$('#slider').fireslider({
	pager: "#pager",
	pagerTemplate: "clone"
});
```

**Tags**

You can also further customize the output using tags:

```javascript
$('#slider').fireslider({
	pager: "#pager",
	pagerTemplate: '<a href="#" class="pager-dot-{{num}}">{{description}}</a>'
});
```

Tag | Description
------------- | -------------
{{description}} | See below.
{{num}} | The slide's position.
{{src}} | The first image's src from the slide.

**{{description}} Tag**

You may add an additional data-attribute to your slide element:

```html
<ul class="slider">
	<li><img src="path/to/image1.jpg" data-fireslider-pager-description="Image One"></li>
	<li><img src="path/to/image2.jpg" data-fireslider-pager-description="Image Two"></li>
	<li><img src="path/to/image3.jpg" data-fireslider-pager-description="Image Three"></li>
</ul>
```

The pager will output the value of `data-fireslider-pager-description` in place of the `{{description}}` tag.

Custom Transition Effects
--------
You can add your own transition effects to fireSlider. Transition effects are written using velocity.js.

**Create a new transition effect:**
```javascript
var slideInOut = function (el, options) {
	var duration = (options.snapping) ? 0 : options.speed;
	el.velocity({translateX: [(options.nextPos + '%'), (options.currPos + '%')]}, {duration: duration, queue: options.effect, easing: options.easing});
};
```

**Register new transition effect:**  

```javascript
fireSlider.prototype.Effects.register('slideInOut', slideInOut);
```
To register the new tranistion effect, we pass fireSlider's register function the transition's name, and function.

**Now you can call the transition effect like normal:**
```html
<ul class="slider" data-fireslider-speed="300" data-fireslider-effect="slideInOut">
	<li><img src="path/to/image1.jpg"></li>
	<li><img src="path/to/image2.jpg"></li>
	<li><img src="path/to/image3.jpg"></li>
</ul>
```
You can also pass this as an option in the javascript function call to fireSlider.

**Arguments passed to transition effects:**  

```javascript
var transitionName = function(element, options) { ... }
```
The `element` is an individual slide, the options object contains:

Option | Description | Type
------------- | ------------- | -------------
currPos | The slides position before transitioning (This is a translateX position). | int
easing | The desired easing to be used (see Velocity.js easing). | String, Array
effect | The name of the effect (we pass this to Velocity for queueing). | String
nextPos | The slides position after transitioning (This is a translateX position). | int
snapping | This will be true if the slide is tranistion from the end of the slider. | boolean
speed | The desired speed of the transition (Velocity refers to this as 'duration'). | int
direction | The current direction of the slider | string (see options above)
swipe | Determines if slider will have left/right swipe compatibility | boolean

It is best to set `duration: 0` if snapping is true, this will prevent slides to "jump" from one end to the other.

Events
------
fireSlider will trigger custom events that can be hooked into:

Event | Description
------------- | -------------
"fireSlider:destroy" | Triggered when a slider is destroyed.
"fireSlider:next" | Triggered when the slide transitions to the next slide after the "next" element is clicked.
"fireSlider:pause" | Triggered when the slider is paused.
"fireSlider:play" | Triggered when the slider is un-paused.
"fireSlider:prev" | Triggered when the slide transitions to the prev slide after the "prev" element is clicked.
"fireSlider:refresh" | Triggered when the slider is resized.
"fireSlider:reverse" | Triggered when the slider's direction is reversed.
"fireSlider:slide" | Triggered when the slide function is called.

You can listen for events like this:

```javascript
var slider = $('#slider').fireSlider();

slider.on("fireSlider:next", function (e) {
	// your code here.
});
```

**Event Data**

The data available in an event listener:

Property | Description
------------- | -------------
$el | The jQuery slider element
_attributes | The data-attributs set for the slider.
_defaults | Default attributes for the slider.
_name | "fireSlider"
backup | Contains the origin jQuery slides
breakpoints | Array of breakpoints set for the slider.
destroy | Function to destroy the slider, this leaves your original markup intact. To completely remove the slider, use jQuery's `$.remove()`.
next | Function that goes to the next slide.
options | The combined options set on the slider (data-attributes, default options, and javascript options).
pages | jQuery array of pager pages
pause | Function that pauses the slider.
play | Function that plays the slider.
positions | Array of integers (translateX position of each slide).
prev | Function that goes to the previous slide.
reverse | Function that plays the slider in reverse.
selector | The selector used to define the slider.
slide | Function to transition to a slide, takes an index.
slides | Array of slide DOM element objects that are contained in the slider.
state | Various attributes that hold the state of the slider (simular to options, but these are not persistent).
timer | Holds reference to the timer.

This data can be recieved in the event:

```javascript
slider.on("fireSlider:next", function(e) {
	var fireslider = $(this).data("fireSlider");
	fireslider.reverse();
});
```

Contribute
----------
**Build** - (Requires [npm](http://nodejs.org/) and [gulp](http://gulpjs.com/))

Install the project dependencies:

```
$ npm install / update
```

Start gulp:

```
$ gulp
```

**Issues**

You can submit issues [here.](https://github.com/mmonkey/fireSlider/issues)


----------
[MIT License.](LICENSE.md) © CJ O'Hara.