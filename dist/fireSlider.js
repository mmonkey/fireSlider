/* fireSlider (0.1.4). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
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
        function a(e, t) {
            e.classList ? e.classList.remove(t) : e.className = e.className.replace(new RegExp("(^|\\b)" + t.split(" ").join("|") + "(\\b|$)", "gi"), " ");
        }
        // Returns true if node has className
        function o(e, t) {
            var i = !1;
            return e.classList && e.classList.contains(t) && (i = !0), i;
        }
        function l() {
            E = n(k, t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function d(e, t) {
            var i = M.totalSlides * t - e.length;
            // Add elements if there is a possitive difference
            if (i > 0) for (var n = 0; i > n; n++) {
                var r = e[n % M.totalSlides].cloneNode(!0);
                o(r, "fire-slider-active") && a(r, "fire-slider-active"), k.appendChild(r);
            }
            // Remove elements if there is a negative difference
            if (0 > i) for (var l = e.length - 1; l >= e.length + i; l--) k.removeChild(E[l]);
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
            for (var a = Math.floor(e.length / 2); a < e.length; a++) D(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = M.slideWidthPercent + "%", e[a].style.position = "absolute", 
            r.push(i), i += 100;
            for (a = 0; a < Math.floor(e.length / 2); a++) D(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = M.slideWidthPercent + "%", e[a].style.position = "absolute", 
            n.push(i), i += 100;
            j = n.concat(r), window.jQuery ? $(e).dequeue(t.effect) : D.Utilities.dequeue(e, t.effect);
        }
        // Calculates positions for revolution amount
        function f(e, i) {
            for (var n = 0; n < E.length; n++) {
                for (var r = j.shift(), a = r, o = 0; i > o; o++) a -= 100, a < M.minX && (a = M.maxX), 
                a > M.maxX && (a = M.minX);
                D(E[n], {
                    translateX: a + "%"
                }, {
                    duration: 0,
                    queue: t.effect
                }), j.push(a);
            }
        }
        // Create and trigger an event
        function p(e, t) {
            var i;
            document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !0)) : document.createEventObject && (// IE < 9
            i = document.createEventObject(), i.eventType = t), i.eventName = t, e.dispatchEvent ? e.dispatchEvent(i) : e.fireEvent && Q["on" + t] ? // IE < 9
            e.fireEvent("on" + i.eventType, i) : e[t] ? e[t]() : e["on" + t] && e["on" + t]();
        }
        // Event listener for built-in and custom events
        function h(e, t, i) {
            e.listenListener ? e.listenListener(t, i, !1) : e.attachEvent && Q["on" + t] ? // IE < 9
            e.attachEvent("on" + t, i) : e["on" + t] = i;
        }
        // Fills pager with empty spans based on total slides, adds active class to the first slide
        function v() {
            if ("undefined" != typeof M.pager) {
                for (var e = 0; e < M.totalSlides; e++) {
                    var t = document.createElement("span");
                    M.pager.appendChild(t);
                }
                M.pagerSpans = n(M.pager, "span"), r(M.pagerSpans[0], "fire-pager-active");
            }
        }
        // Gets the index of a DOM element relative to it's parent element
        function g(e) {
            for (var t = -1, i = e.parentNode.childNodes, n = 0; n < i.length; n++) e === i[n] && (t = n);
            return t;
        }
        // Starts the timer
        function w() {
            0 !== t.delay && (L = setInterval(P, t.delay));
        }
        // Stops the timer
        function S() {
            0 !== t.delay && clearInterval(L);
        }
        // Set up the inital state of fireSlider
        function m() {
            v(), // Check Breakpoints
            s(), M.slideWidthPercent = 1 / M.show * 100, M.slideWidth = M.sliderWidth / M.show;
            // Caluculate the multiplyer
            var e = u();
            d(E, e), // Set the first active slide
            M.currentSlide = 0, r(E[M.currentSlide], "fire-slider-active"), // position the elements of the array
            l(), c(E), p(k, "fire-slider-init"), w();
        }
        // Refresh positions, breakpoints and slide count
        function y() {
            // Pause transitions
            S(), // Update breakpoints and width settings
            M.windowWidth = window.innerWidth, M.sliderWidth = k.offsetWidth, s(), M.slideWidthPercent = 1 / M.show * 100, 
            M.slideWidth = M.sliderWidth / M.show;
            var e = u();
            if (E.length !== e * M.totalSlides) {
                // Remove active class
                a(E[M.currentSlide], "fire-slider-active");
                // Multipy slides and calculate difference
                var i = d(E, e);
                // Fetch new slider
                l(), // Position slides
                c(E), M.currentSlide > E.length && (// Calculate current slide
                M.currentSlide = M.currentSlide % E.length, // Get new positions
                f(k, Math.abs(i)), window.jQuery ? $(E).dequeue(t.effect) : D.Utilities.dequeue(E, t.effect)), 
                // Re-add active class
                r(E[M.currentSlide], "fire-slider-active");
            } else c(E), f(k, M.currentSlide), window.jQuery ? $(E).dequeue(t.effect) : D.Utilities.dequeue(E, t.effect);
            // Play Transitions
            w();
        }
        // Basic slide transition effect
        function X(e, i) {
            var n = 0;
            i.multiplier && (n = 100 * i.multiplier), D(e, {
                translateX: i.oldPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), i.snapping ? D(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }) : D(e, {
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
        function q() {
            // Stop timer
            S(), // Remove active classes
            a(E[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && a(M.pagerSpans[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            M.currentSlide -= 1, M.currentSlide < 0 && (M.currentSlide = E.length - 1);
            // Calculate New Position
            for (var e = 0; e < E.length; e++) {
                var i = j.shift(), n = i + 100, o = !1;
                n < M.minX && (n = M.maxX, o = !0), n > M.maxX && (n = M.minX, o = !0), W(E[e], {
                    oldPosition: i,
                    newPosition: n,
                    snapping: o
                }), j.push(n);
            }
            window.jQuery ? $(E).dequeue(t.effect) : D.Utilities.dequeue(E, t.effect), // Add active classes
            r(E[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && r(M.pagerSpans[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            p(k, "fire-slider-prev"), // Restart timer
            w();
        }
        // Go to next slide
        function P() {
            // Stop timer
            S(), // Remove active classes
            a(E[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && a(M.pagerSpans[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            M.currentSlide += 1, M.currentSlide > E.length - 1 && (M.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < E.length; e++) {
                var i = j.shift(), n = i - 100, o = !1;
                n < M.minX && (n = M.maxX, o = !0), n > M.maxX && (n = M.minX, o = !0), W(E[e], {
                    oldPosition: i,
                    newPosition: n,
                    snapping: o
                }), j.push(n);
            }
            window.jQuery ? $(E).dequeue(t.effect) : D.Utilities.dequeue(E, t.effect), // Add active classes
            r(E[M.currentSlide], "fire-slider-active"), "undefined" != typeof M.pager && r(M.pagerSpans[M.currentSlide % M.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            p(k, "fire-slider-prev"), // Restart timer
            w();
        }
        // Go to the slide relative to the index of a pager span
        function b(e) {
            var i = M.currentSlide % M.totalSlides, n = e - i;
            if (0 !== n) {
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (// Stop Timer
                S(), // Re-load slides
                l(), // Remove active classes
                a(E[M.currentSlide], "fire-slider-active"), a(M.pagerSpans[M.currentSlide % M.totalSlides], "fire-pager-active"), 
                0 > n) // Previous Direction
                for (var o = 0; o < E.length; o++) {
                    for (var d = j.shift(), s = d, u = !1, c = 0; c < Math.abs(n); c++) s += 100, s < M.minX && (s = M.maxX, 
                    u = !0), s > M.maxX && (s = M.minX, u = !0);
                    W(E[o], {
                        oldPosition: d,
                        newPosition: s,
                        snapping: u
                    }), j.push(s);
                } else // Next Direction
                for (var f = 0; f < E.length; f++) {
                    for (var p = j.shift(), h = p, v = !1, g = 0; g < Math.abs(n); g++) h -= 100, h < M.minX && (h = M.maxX, 
                    v = !0), h > M.maxX && (h = M.minX, v = !0);
                    W(E[f], {
                        oldPosition: p,
                        newPosition: h,
                        snapping: v
                    }), j.push(h);
                }
                // Perform transitions
                window.jQuery ? $(E).dequeue(t.effect) : D.Utilities.dequeue(E, t.effect), // Set current slide
                M.currentSlide = (M.currentSlide + n) % E.length, // Add new active classes
                r(E[M.currentSlide], "fire-slider-active"), r(M.pagerSpans[M.currentSlide % M.totalSlides], "fire-pager-active"), 
                // Restart timer
                w();
            }
        }
        var x = {
            slide: "li",
            show: 1,
            active: 1,
            speed: 500,
            delay: 5e3,
            effect: "slideInOut",
            hoverPause: !1,
            disableLinks: !0
        };
        // Merge defaults with options
        t = t || {};
        for (var N in x) x.hasOwnProperty(N) && !t.hasOwnProperty(N) && (t[N] = x[N]);
        var k = document.querySelectorAll(e)[0], E = n(k, t.slide), L = {}, j = [], M = {
            show: t.show,
            active: t.active,
            pagerSpans: [],
            totalSlides: E.length,
            windowWidth: window.innerWidth,
            sliderWidth: k.offsetWidth,
            slideWidth: k.offsetWidth / t.show,
            slideWidthPercent: 1 / t.show * 100,
            currentSlide: 0,
            minX: 0,
            maxX: 0
        };
        "undefined" != typeof t.prev && (M.prev = document.querySelectorAll(t.prev)[0]), 
        "undefined" != typeof t.next && (M.next = document.querySelectorAll(t.next)[0]), 
        "undefined" != typeof t.pager && (M.pager = document.querySelectorAll(t.pager)[0]);
        // Set up V
        var D;
        D = window.jQuery ? $.Velocity : Velocity;
        // Custom events will bind to these htmlEvents in ie < 9
        var Q = {
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
        m(), // Click events
        "undefined" != typeof M.next && h(M.next, "click", function(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = !1, P();
        }), "undefined" != typeof M.prev && h(M.prev, "click", function(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = !1, q();
        }), "undefined" != typeof M.pager && h(M.pager, "click", function(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = !1;
            var t = e.target ? e.target : e.srcElement;
            "SPAN" === t.tagName && b(g(t));
        }), // Pause on hover events
        h(k, "mouseover", function() {
            t.hoverPause && S();
        }), h(k, "mouseout", function() {
            t.hoverPause && w();
        }), // Disable link interaction if slide is not active slide
        t.disableLinks && h(k, "click", function(e) {
            var t = e.target ? e.target : e.srcElement;
            "A" === t.tagName && (o(t.parentNode, "fire-slider-active") || (e.preventDefault ? e.preventDefault() : e.returnValue = !1));
        }), // Window resize event
        h(window, "resize", function() {
            y();
        }), // Example listeners
        h(document, "fire-slider-init", function() {}), h(document, "fire-slider-next", function() {});
    };
}();