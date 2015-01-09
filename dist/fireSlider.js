/* fireSlider (0.1.6). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
!function() {
    fireSlider = function(e, t, i) {
        function n(e, t) {
            ret = [];
            for (var i = 0; i < e.childNodes.length; ++i) "undefined" != typeof e.childNodes[i].tagName && e.childNodes[i].tagName.toLowerCase() === t.toLowerCase() && ret.push(e.childNodes[i]);
            return ret;
        }
        // Add class to node's classList
        function r(e, t) {
            e.classList ? e.classList.add(t) : e.className += " " + t;
        }
        // Remove class from node's classList
        function o(e, t) {
            e.classList ? e.classList.remove(t) : e.className = e.className.replace(new RegExp("(^|\\b)" + t.split(" ").join("|") + "(\\b|$)", "gi"), " ");
        }
        // Returns true if node has className
        function a(e, t) {
            var i = !1;
            return e.classList && e.classList.contains(t) && (i = !0), i;
        }
        function l() {
            k = n(N, t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function d(e, t) {
            var i = M.totalSlides * t - e.length;
            // Add elements if there is a possitive difference
            if (i > 0) for (var n = 0; i > n; n++) {
                var r = e[n % M.totalSlides].cloneNode(!0);
                a(r, "fire-slider-active") && o(r, "fire-slider-active"), N.appendChild(r);
            }
            // Remove elements if there is a negative difference
            if (0 > i) for (var l = e.length - 1; l >= e.length + i; l--) N.removeChild(k[l]);
            return i;
        }
        // Updates show and active based on breakpoints set in options
        function s() {
            if (// Reset show and active
            M.show = t.show, M.active = t.active, "undefined" != typeof i) {
                for (var e = -1, n = -1, r = 0; r < i.length; r++) i[r].breakpoint && i[r].breakpoint >= M.windowWidth && (i[r].breakpoint < n || -1 === n) && (e = r, 
                n = i[r].breakpoint);
                -1 !== e && (i[e].show && (M.show = i[e].show), i[e].active && (M.active = i[e].active));
            }
        }
        // Returns the amount of times the slides should be duplicated to fit within the window width
        function u() {
            var e = 1, t = 0;
            // How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
            // Create a multiply based on the number of additional slides needed
            return M.windowWidth = window.innerWidth, M.slideWidth * M.totalSlides < M.windowWidth && (t = Math.ceil((M.windowWidth - M.slideWidth * M.totalSlides) / M.slideWidth)), 
            t += 2 * M.totalSlides, t > 0 && (e += Math.ceil(t / M.totalSlides)), e;
        }
        // Position Slides
        function c(e) {
            var i = -100 * Math.ceil(e.length / 2) + 100 * (M.active - 1), n = [], r = [];
            M.minX = i, M.maxX = i + 100 * (e.length - 1);
            for (var o = Math.floor(e.length / 2); o < e.length; o++) C(e[o], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[o].style.width = M.slideWidthPercent + "%", e[o].style.position = "absolute", 
            r.push(i), i += 100;
            for (o = 0; o < Math.floor(e.length / 2); o++) C(e[o], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[o].style.width = M.slideWidthPercent + "%", e[o].style.position = "absolute", 
            n.push(i), i += 100;
            j = n.concat(r), window.jQuery ? $(e).dequeue(t.effect) : C.Utilities.dequeue(e, t.effect);
        }
        // Calculates positions for revolution amount
        function f(e, i) {
            for (var n = 0; n < k.length; n++) {
                for (var r = j.shift(), o = r, a = 0; i > a; a++) o -= 100, o < M.minX && (o = M.maxX), 
                o > M.maxX && (o = M.minX);
                C(k[n], {
                    translateX: o + "%"
                }, {
                    duration: 0,
                    queue: t.effect
                }), j.push(o);
            }
        }
        // Create and trigger an event
        function h(e, t) {
            var i;
            document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !0)) : document.createEventObject && (// IE < 9
            i = document.createEventObject(), i.eventType = t), i.eventName = t, e.dispatchEvent ? e.dispatchEvent(i) : e.fireEvent && D["on" + t] ? // IE < 9
            e.fireEvent("on" + i.eventType, i) : e[t] ? e[t]() : e["on" + t] && e["on" + t]();
        }
        // Event listener for built-in and custom events
        function p(e, t, i) {
            e.listenListener ? e.listenListener(t, i, !1) : e.attachEvent && D["on" + t] ? // IE < 9
            e.attachEvent("on" + t, i) : e["on" + t] = i;
        }
        // Fills pager with elements based on total slides, adds active class to the first slide
        function v() {
            if ("undefined" != typeof M.pager) {
                for (var e = 0; e < M.totalSlides; e++) if (t.thumbnails) {
                    var i = k[e].cloneNode(!0);
                    M.pager.appendChild(i);
                } else {
                    var o = document.createElement("span");
                    M.pager.appendChild(o);
                }
                M.pagerElems = t.thumbnails ? n(M.pager, t.slide) : n(M.pager, "span"), r(M.pagerElems[0], "fire-pager-active");
            }
        }
        // Gets the index of a DOM element relative to it's parent element
        function m(e) {
            for (var t = -1, i = e.parentNode.childNodes, n = 0; n < i.length; n++) e === i[n] && (t = n);
            return t;
        }
        // Starts the timer
        function g() {
            0 !== t.delay && (L = setInterval(b, t.delay));
        }
        // Stops the timer
        function w() {
            0 !== t.delay && clearInterval(L);
        }
        // Set up the inital state of fireSlider
        function S() {
            v(), // Check Breakpoints
            s(), M.slideWidthPercent = 1 / M.show * 100, M.slideWidth = M.sliderWidth / M.show;
            // Caluculate the multiplyer
            var e = u();
            d(k, e), // Set the first active slide
            M.currentSlide = 0, r(k[M.currentSlide], "fire-slider-active"), // position the elements of the array
            l(), c(k), h(N, "fire-slider-init"), g();
        }
        // Refresh positions, breakpoints and slide count
        function y() {
            // Pause transitions
            w(), // Update breakpoints and width settings
            M.windowWidth = window.innerWidth, M.sliderWidth = N.offsetWidth, s(), M.slideWidthPercent = 1 / M.show * 100, 
            M.slideWidth = M.sliderWidth / M.show;
            var e = u();
            if (k.length !== e * M.totalSlides) {
                // Remove active class
                o(k[M.currentSlide], "fire-slider-active");
                // Multipy slides and calculate difference
                var i = d(k, e);
                // Fetch new slider
                l(), // Position slides
                c(k), M.currentSlide > k.length && (// Calculate current slide
                M.currentSlide = M.currentSlide % k.length, // Get new positions
                f(N, Math.abs(i)), window.jQuery ? $(k).dequeue(t.effect) : C.Utilities.dequeue(k, t.effect)), 
                // Re-add active class
                r(k[M.currentSlide], "fire-slider-active");
            } else c(k), f(N, M.currentSlide), window.jQuery ? $(k).dequeue(t.effect) : C.Utilities.dequeue(k, t.effect);
            // Play Transitions
            g();
        }
        // Basic slide transition effect
        function X(e, i) {
            var n = 0;
            i.multiplier && (n = 100 * i.multiplier), C(e, {
                translateX: i.oldPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), i.snapping ? C(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }) : C(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: t.speed,
                queue: t.effect
            });
        }
        // Routes slide to correct transition
        function W(e, i) {
            switch (t.effect) {
              case "slideInOut":
                X(e, i);
                break;

              default:
                X(e, i);
            }
        }
        // Go to previous slide
        function E() {
            // Stop timer
            w(), // Remove active classes
            o(k[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && o(M.pagerElems[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            M.currentSlide -= 1, M.currentSlide < 0 && (M.currentSlide = k.length - 1);
            // Calculate New Position
            for (var e = 0; e < k.length; e++) {
                var i = j.shift(), n = i + 100, a = !1;
                n < M.minX && (n = M.maxX, a = !0), n > M.maxX && (n = M.minX, a = !0), W(k[e], {
                    oldPosition: i,
                    newPosition: n,
                    snapping: a
                }), j.push(n);
            }
            window.jQuery ? $(k).dequeue(t.effect) : C.Utilities.dequeue(k, t.effect), // Add active classes
            r(k[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && r(M.pagerElems[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            h(N, "fire-slider-prev"), // Restart timer
            g();
        }
        // Go to next slide
        function b() {
            // Stop timer
            w(), // Remove active classes
            o(k[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && o(M.pagerElems[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            M.currentSlide += 1, M.currentSlide > k.length - 1 && (M.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < k.length; e++) {
                var i = j.shift(), n = i - 100, a = !1;
                n < M.minX && (n = M.maxX, a = !0), n > M.maxX && (n = M.minX, a = !0), W(k[e], {
                    oldPosition: i,
                    newPosition: n,
                    snapping: a
                }), j.push(n);
            }
            window.jQuery ? $(k).dequeue(t.effect) : C.Utilities.dequeue(k, t.effect), // Add active classes
            r(k[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && r(M.pagerElems[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            h(N, "fire-slider-prev"), // Restart timer
            g();
        }
        // Go to the slide relative to the index of a pager elements
        function q(e) {
            var i = M.currentSlide % M.totalSlides, n = e - i;
            if (0 !== n) {
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (// Stop Timer
                w(), // Re-load slides
                l(), // Remove active classes
                o(k[M.currentSlide], "fire-slider-active"), o(M.pagerElems[M.currentSlide % M.totalSlides], "fire-pager-active"), 
                0 > n) // Previous Direction
                for (var a = 0; a < k.length; a++) {
                    for (var d = j.shift(), s = d, u = !1, c = 0; c < Math.abs(n); c++) s += 100, s < M.minX && (s = M.maxX, 
                    u = !0), s > M.maxX && (s = M.minX, u = !0);
                    W(k[a], {
                        oldPosition: d,
                        newPosition: s,
                        snapping: u
                    }), j.push(s);
                } else // Next Direction
                for (var f = 0; f < k.length; f++) {
                    for (var h = j.shift(), p = h, v = !1, m = 0; m < Math.abs(n); m++) p -= 100, p < M.minX && (p = M.maxX, 
                    v = !0), p > M.maxX && (p = M.minX, v = !0);
                    W(k[f], {
                        oldPosition: h,
                        newPosition: p,
                        snapping: v
                    }), j.push(p);
                }
                // Perform transitions
                window.jQuery ? $(k).dequeue(t.effect) : C.Utilities.dequeue(k, t.effect), // Set current slide
                M.currentSlide = (M.currentSlide + n) % k.length, // Add new active classes
                r(k[M.currentSlide], "fire-slider-active"), r(M.pagerElems[M.currentSlide % M.totalSlides], "fire-pager-active"), 
                // Restart timer
                g();
            }
        }
        var P = {
            slide: "li",
            show: 1,
            active: 1,
            speed: 500,
            delay: 5e3,
            effect: "slideInOut",
            hoverPause: !1,
            disableLinks: !0,
            thumbnails: !1
        };
        // Merge defaults with options
        t = t || {};
        for (var x in P) P.hasOwnProperty(x) && !t.hasOwnProperty(x) && (t[x] = P[x]);
        var N = document.querySelectorAll(e)[0], k = n(N, t.slide), L = {}, j = [], M = {
            show: t.show,
            active: t.active,
            pagerElems: [],
            totalSlides: k.length,
            windowWidth: window.innerWidth,
            sliderWidth: N.offsetWidth,
            slideWidth: N.offsetWidth / t.show,
            slideWidthPercent: 1 / t.show * 100,
            currentSlide: 0,
            minX: 0,
            maxX: 0
        };
        "undefined" != typeof t.prev && (M.prev = document.querySelectorAll(t.prev)[0]), 
        "undefined" != typeof t.next && (M.next = document.querySelectorAll(t.next)[0]), 
        "undefined" != typeof t.pager && (M.pager = document.querySelectorAll(t.pager)[0]);
        // Set up V
        var C;
        C = window.jQuery ? $.Velocity : Velocity;
        // Custom events will bind to these htmlEvents in ie < 9
        var D = {
            onload: 1,
            onunload: 1,
            onblur: 1,
            onchange: 1,
            onfocus: 1,
            onreset: 1,
            onselect: 1,
            onsubmit: 1,
            onabort: 1,
            onkeydown: 1,
            onkeypress: 1,
            onkeyup: 1,
            onclick: 1,
            ondblclick: 1,
            onmousedown: 1,
            onmousemove: 1,
            onmouseout: 1,
            onmouseover: 1,
            onmouseup: 1
        };
        S(), // Click events
        "undefined" != typeof M.next && p(M.next, "click", function(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = !1, b();
        }), "undefined" != typeof M.prev && p(M.prev, "click", function(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = !1, E();
        }), "undefined" != typeof M.pager && p(M.pager, "click", function(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = !1;
            var i = e.target ? e.target : e.srcElement, n = t.thumbnails ? t.slide : "span";
            console.log(n), i.tagName.toLowerCase() === n.toLowerCase() && q(m(i));
        }), // Pause on hover events
        p(N, "mouseover", function() {
            t.hoverPause && w();
        }), p(N, "mouseout", function() {
            t.hoverPause && g();
        }), // Disable link interaction if slide is not active slide
        t.disableLinks && p(N, "click", function(e) {
            var t = e.target ? e.target : e.srcElement;
            "A" === t.tagName && (a(t.parentNode, "fire-slider-active") || (e.preventDefault ? e.preventDefault() : e.returnValue = !1));
        }), // Window resize event
        p(window, "resize", function() {
            y();
        }), // Example listeners
        p(document, "fire-slider-init", function() {}), p(document, "fire-slider-next", function() {});
    };
}();