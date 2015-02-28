fireSlider.js
=============
fireSlider.js is a responsive slider and carousel plugin. It is content-agnostic, meaning it can create a slider from any type of HTML you want. Transitions are incredibly smooth, built with [Velocity.js](https://github.com/julianshapiro/velocity) animation library.

fireSlider.js supports breakpoints out-of-the-box. You can set up completely different options based on the width of the browser window.

Download
--------
Get the latest version of fireSlider [here.](https://github.com/mmonkey/fireSlider/releases/latest)

Getting Started
---------------
fireSlider has one dependency, Velocity.js, and it comes in two versions:

**Includes Velocity.js:**
```html
<script src="path/to/fireSlider.velocity.js"></script>
```

**Does not include Velocity.js:**
```html
<script src="path/to/velocity.min.js"></script>
<script src="path/to/fireSlider.min.js"></script>
```
Using this version of fireSlider will require you to include velocity also. This is good if you are already using Velocity.js elsewhere.

**Use with jQuery**

You can take advantage of jQuery, if you choose to do so.

```html
<script src="path/to/jQuery.min.js"></script>
<script src="path/to/fireSlider.min.js"></script>
```

Browser Support
---------------
fireSlider works out-of-the-box with most all web browsers:

| Chrome* | Firefox* | Opera* | Safari* | IE9+ | Mobile Safari* | Chrome Android |
| ------- | -------- | ------ | ------- | ---- | -------------- | -------------- |
| ✓ | ✓ | ✓| ✓ | ✓ | ✓ | Untested |

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
<ul class="slider">
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

**JavaScript**

```javascript
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
```

fireSlider only has one required option, and that is the selector of your slider. If you just want to use the default options:

```javascript
FireSlider.slider(".slider");
```

See all of fireSlider's default options with descriptions down below.

**jQuery**

```javascript
$(".slider").fireSlider({
	prev: "#prev",
	next: "#next",
	pager: "#pager"
});
```

To use just the default options with jQuery:

```javascript
$(".slider").fireSlider();
```

You may also want to leverage other jQuery functions:

```javascript
$(".slider").fireSlider().addClass("myClass");
```

**Arguments**

JavaScript:

```javascript
FireSlider.slider(selector, options, breakpoints);
```

jQuery:

```javascript
$(selector).fireSlider(options, breakpoints);
```

Argument | Description | Type
------------- | ------------- | -------------
selector | A selector to the slider element | String
options | Configureable options to customize the slider | Object
breakpoints | A sub-set of options to update at certain browser widths | Array

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

Option | Description | Type | Default 
------------- | ------------- | ------------- | -------------
slide | A selector for the slide elements. | string | "li"
show | The amount of slides to show in the slider at once. | int | 1
active | The position of the active slide. | int | 1
speed | The speed of the transition (milliseconds). | int | 500
delay | The amount of time in between transitions (milliseconds). | int | 5000
direction | The direction of the slide transitions. | string | "forward"
activeSlideClass | The class to be added to the current active slide. | string | "fire-slider-active"
activePagerClass | The class to be added to the current active pager element. | string | "fire-pager-active"
effect | The transition effect to use. | string | "slideInOut", "fadeInOut"
easing | The easing effect for the transition. | string or array | "swing"
hoverPause | Pause transitions when mouse hovers? | boolean | false
disableLinks | Disable links on the non-active slides? | boolean | true
prev | The selector of the previous-slide button. | string | N/A
next | The selector of the next-slide button. | string | N/A
pager | The selector of the pager element. | string | N/A
pagerTemplate | Template for pager elements | HTML String | "`<span><\span>`"

All of fireSlider's options may also be setup with data-attributes on the slider element:

```html
<ul class="slider" data-fireslider-speed="300" data-fireslider-pager="#pager">
	<li><img src="path/to/image1.jpg"></li>
	<li><img src="path/to/image2.jpg"></li>
	<li><img src="path/to/image3.jpg"></li>
</ul>
```

All data-attributes are named the same as the options, except prepended by `data-fireslider-`. Two word options, like hoverPause, are instead `data-fireslider-hover-pause`.

Breakpoints
-----------

Breakpoint options are similar to the main options, but limited to:

Option | Description | Type | Default 
------------- | ------------- | ------------- | -------------
breakpoint | Max pixel-width of the breakpoint range. | int | N/A
show | The amount of slides to show in the slider at once. | int | 1
active | The position of the active slide. | int | 1

Setting up breakpoint options is a breeze:

```javascript
var breakpoints = [
	{breakpoint: 1200, show: 5, active: 3},
	{breakpoint: 840, show: 3, active: 2},
	{breakpoint: 460, show: 1, active: 1}
];

FireSlider.slider(".slider", { effect: "fadeInOut" }, breakpoints);
```

You can also pass breakpoints via data-attribues, however, **they have to be formatted as valid JSON:**

```html
<ul class="slider" data-fireslider-breakpoints='[{"breakpoint": 360, "show": 1, "active": 1},{"breakpoint": 580, "show": 2, "active": 1},{"breakpoint": 720, "show": 3, "active": 2},{"breakpoint": 860, "show": 4, "active": 2}]'>
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
FireSlider.slider(".slider", {
	pager: "#pager",
	pagerTemplate: '<a href="#" class="pager-dot"></a>'
});
```

Optionally, you can clone your entire original slide, creating a "thumbnail" by setting `pagerTemplate: "clone"`:

```javascript
FireSlider.slider(".slider", {
	pager: "#pager",
	pagerTemplate: "clone"
});
```

**Tags**

You can also further customize the output using tags:

```javascript
FireSlider.slider(".slider", {
	pager: "#pager",
	pagerTemplate: '<a href="#" class="pager-dot-{{num}}">{{description}}</a>'
});
```

Tag | Description
------------- | -------------
{{num}} | The slide's position.
{{src}} | The first image's src from the slide.
{{description}} | See below.

**{{description}} Tag**

You may add an additional data-attribute to your slide element:

```html
<ul class="slider">
	<li><img src="path/to/image1.jpg" data-fireslider-pager-description="Image One"></li>
	<li><img src="path/to/image2.jpg" data-fireslider-pager-description="Image Two"></li>
	<li><img src="path/to/image3.jpg" data-fireslider-pager-description="Image Three"></li>
</ul>
```

The pager will output the `data-fireslider-pager-description` in place of the `{{description}}` tag.

Custom Transition Effects
--------
You can add your own transition effects to fireSlider. Transition effects are written using velocity.js.

**Create a new transition effect:**
```javascript
var slideInOut = function(element, opts) {
	var duration = (opts.snapping) ? 0 : opts.speed;
	V(element, {translateX: [(opts.nextPos + '%'), (opts.currPos + '%')]}, {duration: duration, queue: opts.effect, easing: opts.easing});
};
```
As you can see, we refer to `Velocity` as `V`. For more examples, see the source code (fireSlider.effect object).

**Register new transition effect:**
```javascript
FireSlider.effect.register('slideInOut', slideInOut);
```
To register the new tranistion effect, we pass fireSlider's register function the transition's name, and function.

**Now you can call the transition effect like normal:**
```html
<ul class="slider" data-fireslider-speed="300" data-fireslider-pager="#pager" data-fireslider-effect="slideInOut">
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
effect | The name of the effect (we pass this to Velocity for queueing). | String
easing | The desired easing to be used (see Velocity.js easing). | String, Array
speed | The desired speed of the transition (Velocity refers to this as 'duration'). | int
snapping | This will be true if the slide is tranistion from the end of the slider. | boolean
currPos | The slides position before transitioning (This is a translateX position). | int
nextPos | The slides position after transitioning (This is a translateX position). | int

It is best to set `duration: 0` if snapping is true, this will prevent slides to "jump" from one end to the other.

Events
------
fireSlider will trigger custom events that can be hooked into:

Event | Description
------------- | -------------
"fireslider-init" | Triggered right after the slider is initialized.
"fireslider-before-transition" | Triggered right before a slide has transitioned.
"fireslider-before-pager-transition" | Same as "fireslider-before-transition", but triggers when pager is used.
"fireslider-after-transition" | Triggered right after a slide has transitioned.
"fireslider-after-pager-transition" | Same as "fireslider-after-transition", but triggers when pager is used
"fireslider-refreshed" | Triggered whenever the slider gets refreshed like on window resize.

You can listen for events like this:

```javascript
FireSlider.eventManager.listen('fireslider-init', function(data) {
	console.log("Slider " + (data.index + 1) + " has initialized!");
});

var slider = FireSlider.slider(".my_slider");
```

**Event Data**

The data available in an event listener:

Property | Description
------------- | -------------
breakpoints | Array of breakpoints set for the slider.
data | The data-attributs set for the slider.
index | The index of the slider (zero-indexed).
isPaused | True if slider is paused.
next | Function that goes to the next slide.
options | The combined options set on the slider (data-attributes, default options, and javascript options).
pause | Function that pauses the slider.
play | Function that plays the slider.
prev | Functino that goes to the previous slide.
reverse | Function that plays the slider in reverse.
positions | Array of integers (translateX position of each slide).
settings | Various settings used by fireSlider (simular to options, but these are not persistent).
slider | The slider DOM element object.
slides | Array of slide DOM element objects that are contained in the slider.

Contribute
----------
**Build** - (Requires [npm](http://nodejs.org/) and [gulp](http://gulpjs.com/))

Install the project dependencies:

```
$ npm update
```

Start gulp:

```
$ gulp
```

**Issues**

You can submit issues [here.](https://github.com/mmonkey/fireSlider/issues)


----------
[MIT License.](LICENSE.md) © CJ O'Hara and Tyler Fowle.