!function() {
    fireSlider = function(e, t, i) {
        // Add class to node's classList
        function r(e, t) {
            e.classList ? e.classList.add(t) : e.className += " " + t;
        }
        // Remove class from node's classList
        function n(e, t) {
            e.classList ? e.classList.remove(t) : e.className = e.className.replace(new RegExp("(^|\\b)" + t.split(" ").join("|") + "(\\b|$)", "gi"), " ");
        }
        // Returns true if node has className
        function l(e, t) {
            var i = !1;
            return e.classList && e.classList.contains(t) && (i = !0), i;
        }
        // Returns the last index of the array that contains the class
        function a(e, t) {
            for (var i = -1, r = 0; r < e.length; r++) (" " + e[r].className + " ").indexOf(" " + t + " ") > -1 && (i = r);
            return i;
        }
        function s() {
            b = X.querySelectorAll(":scope > " + t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function d(e, t) {
            var i = k.totalSlides * t - e.length;
            // Add elements if there is a possitive difference
            if (i > 0) for (var r = 0; i > r; r++) {
                var a = e[r % k.totalSlides].cloneNode(!0);
                l(a, "fire-slider-active") && n(a, "fire-slider-active"), X.appendChild(a);
            }
            // Remove elements if there is a negative difference
            if (0 > i) for (var s = e.length - 1; s >= e.length + i; s--) X.removeChild(b[s]);
        }
        // Updates show and active based on breakpoints set in options
        function o() {
            if (// Reset show and active
            k.show = t.show, k.active = t.active, "undefined" != typeof i) {
                for (var e = -1, r = -1, n = 0; n < i.length; n++) i[n].breakpoint && i[n].breakpoint >= k.windowWidth && (i[n].breakpoint < r || -1 === r) && (e = n, 
                r = i[n].breakpoint);
                -1 !== e && (i[e].show && (k.show = i[e].show), i[e].active && (k.active = i[e].active));
            }
        }
        // Returns the amount of times the slides should be duplicated to fit within the window width
        function c() {
            var e = 1, t = 0;
            // How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
            // Create a multiply based on the number of additional slides needed
            return k.windowWidth = window.innerWidth, k.slideWidth * k.totalSlides < k.windowWidth && (t = Math.ceil((k.windowWidth - k.slideWidth * k.totalSlides) / k.slideWidth)), 
            t += 2, t > 0 && (e += Math.ceil(t / k.totalSlides)), e;
        }
        // Position Slides
        function u(e) {
            var i = -100 * Math.ceil(e.length / 2) + 100 * (k.active - 1), r = [], n = [];
            k.minX = i, k.maxX = i + 100 * (e.length - 1);
            for (var l = Math.floor(e.length / 2); l < e.length; l++) Velocity(e[l], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[l].style.width = k.slideWidthPercent + "%", e[l].style.position = "absolute", 
            n.push(i), i += 100;
            for (l = 0; l < Math.ceil(e.length / 2); l++) Velocity(e[l], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[l].style.width = k.slideWidthPercent + "%", e[l].style.position = "absolute", 
            r.push(i), i += 100;
            N = r.concat(n), Velocity.Utilities.dequeue(e, t.effect);
        }
        // Create and trigger an event
        function f(e, t) {
            var i = {};
            document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !1)) : (i = document.createEventObject(), 
            i.eventType = t), i.eventName = t, document.createEvent ? e.dispatchEvent(i) : e.fireEvent("on" + i.eventType, i);
        }
        // Fills pager with empty spans based on total slides, adds active class to the first slide
        function h() {
            for (var e = 0; e < k.totalSlides; e++) {
                var t = document.createElement("span");
                k.pager.appendChild(t);
            }
            k.pagerSpans = k.pager.querySelectorAll(":scope > span"), r(k.pagerSpans[0], "fire-pager-active");
        }
        // Gets the index of a DOM element relative to it's parent element
        function v(e) {
            for (var t = -1, i = e.parentNode.childNodes, r = 0; r < i.length; r++) e === i[r] && (t = r);
            return t;
        }
        // Starts the timer
        function p() {
            x = setInterval(E, t.delay);
        }
        // Stops the timer
        function S() {
            clearInterval(x);
        }
        // Set up the inital state of fireSlider
        function g() {
            h(), // Check Breakpoints
            o(), k.slideWidthPercent = 1 / k.show * 100, k.slideWidth = k.sliderWidth / k.show;
            // Caluculate the multiplyer
            var e = c();
            d(b, e), // Set the first active slide
            k.currentSlide = 0, r(b[k.currentSlide], "fire-slider-active"), // position the elements of the array
            s(), u(b), f(X, "fire-slider-init");
        }
        // Refresh positions, breakpoints and slide count
        function w() {
            // Update breakpoints and width settings
            k.windowWidth = window.innerWidth, k.sliderWidth = X.offsetWidth, o(), k.slideWidthPercent = 1 / k.show * 100, 
            k.slideWidth = k.sliderWidth / k.show;
            var e = c();
            b.length !== e * k.totalSlides ? (// Remove active class
            n(b[k.currentSlide], "fire-slider-active"), // Update currentSlide
            k.currentSlide = k.currentSlide % k.totalSlides, d(b, e), // Re-add active class
            r(b[k.currentSlide], "fire-slider-active"), // Re-position slides
            s(), u(b)) : u(b);
        }
        // Basic slide transition effect
        function m(e, i) {
            var r = 0;
            i.multiplier && (r = 100 * i.multiplier), Velocity(e, {
                translateX: i.oldPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), i.snapping ? Velocity(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }) : Velocity(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: t.speed,
                queue: t.effect
            });
        }
        // Routes slide to correct transition
        function y(e, i) {
            switch (t.effect) {
              case "slideInOut":
                m(e, i);
                break;

              default:
                m(e, i);
            }
        }
        // Go to previous slide
        function W() {
            // Stop timer
            //pause();
            // Remove active classes
            n(b[k.currentSlide], "fire-slider-active"), n(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            k.currentSlide -= 1, k.currentSlide < 0 && (k.currentSlide = b.length - 1);
            // Calculate New Position
            for (var e = 0; e < b.length; e++) {
                var i = N.shift(), l = i + 100, a = !1;
                l < k.minX && (l = k.maxX, a = !0), l > k.maxX && (l = k.minX, a = !0), y(b[e], {
                    oldPosition: i,
                    newPosition: l,
                    snapping: a
                }), N.push(l);
            }
            Velocity.Utilities.dequeue(b, t.effect), // Add active classes
            r(b[k.currentSlide], "fire-slider-active"), r(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            f(X, "fire-slider-prev");
        }
        // Go to next slide
        function E() {
            // Stop timer
            //pause();
            // Remove active classes
            n(b[k.currentSlide], "fire-slider-active"), n(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            k.currentSlide += 1, k.currentSlide > b.length - 1 && (k.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < b.length; e++) {
                var i = N.shift(), l = i - 100, a = !1;
                l < k.minX && (l = k.maxX, a = !0), l > k.maxX && (l = k.minX, a = !0), y(b[e], {
                    oldPosition: i,
                    newPosition: l,
                    snapping: a
                }), N.push(l);
            }
            Velocity.Utilities.dequeue(b, t.effect), // Add active classes
            r(b[k.currentSlide], "fire-slider-active"), r(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            f(X, "fire-slider-prev");
        }
        // Go to the slide relative to the index of a pager span
        function L(e) {
            var i = k.currentSlide % k.totalSlides, l = e - i;
            if (0 !== l) {
                // Stop Timer
                S();
                for (var s = X.querySelectorAll(":scope > " + t.slide), d = [], o = 0; o < s.length; o++) d.push(s[o].style.left);
                // Remove active classes
                var c = a(s, "fire-slider-active");
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (n(s[c], "fire-slider-active"), n(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
                l > 0) {
                    for (o = l; o < s.length; o++) y(s[o], parseFloat(d.shift()), {
                        direction: "next",
                        multiplier: Math.abs(l)
                    });
                    for (o = 0; l > o; o++) y(s[o], parseFloat(d.shift()), {
                        direction: "next",
                        multiplier: Math.abs(l)
                    });
                } else {
                    for (o = s.length + l; o < s.length; o++) y(s[o], parseFloat(d.shift()), {
                        direction: "prev",
                        multiplier: Math.abs(l)
                    });
                    for (o = 0; o < s.length + l; o++) y(s[o], parseFloat(d.shift()), {
                        direction: "prev",
                        multiplier: Math.abs(l)
                    });
                }
                // Perform transitions
                Velocity.Utilities.dequeue(s, t.effect), // Set current slide
                k.currentSlide = (k.currentSlide + l) % s.length, // Add new active classes
                r(s[(k.currentSlide + Math.floor(s.length / 2)) % s.length], "fire-slider-active"), 
                r(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), // Restart timer
                p();
            }
        }
        var P = {
            slide: "li",
            show: 1,
            active: 1,
            prev: "#prev",
            next: "#next",
            pager: "#pager",
            speed: 500,
            delay: 5e3,
            effect: "slideInOut",
            hoverPause: !1,
            disableLinks: !0
        };
        // Merge defaults with options
        t = t || {};
        for (var q in P) P.hasOwnProperty(q) && !t.hasOwnProperty(q) && (t[q] = P[q]);
        var X = document.querySelectorAll(e)[0], b = X.querySelectorAll(":scope > " + t.slide), x = {}, N = [], k = {
            show: t.show,
            active: t.active,
            prev: document.querySelectorAll(t.prev)[0],
            next: document.querySelectorAll(t.next)[0],
            pager: document.querySelectorAll(t.pager)[0],
            pagerSpans: [],
            totalSlides: b.length,
            windowWidth: window.innerWidth,
            sliderWidth: X.offsetWidth,
            slideWidth: X.offsetWidth / t.show,
            slideWidthPercent: 1 / t.show * 100,
            currentSlide: 0,
            minX: 0,
            maxX: 0
        };
        g(), // Click events
        k.next.addEventListener("click", function(e) {
            e.preventDefault(), E();
        }), k.prev.addEventListener("click", function(e) {
            e.preventDefault(), W();
        }), k.pager.addEventListener("click", function(e) {
            e.preventDefault(), "SPAN" === e.target.tagName && L(v(e.target));
        }), // Pause on hover events
        X.addEventListener("mouseover", function() {
            t.hoverPause && S();
        }), X.addEventListener("mouseout", function() {
            t.hoverPause && p();
        }), // Disable link interaction if slide is not active slide
        t.disableLinks && X.addEventListener("click", function(e) {
            "A" === e.target.tagName && (l(e.target.parentNode, "fire-slider-active") || e.preventDefault());
        }), // Window resize event
        window.addEventListener("resize", function() {
            w();
        });
    };
}(), // Example listeners
document.addEventListener("fire-slider-init", function() {}), document.addEventListener("fire-slider-next", function() {});