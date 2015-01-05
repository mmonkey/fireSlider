/* fireSlider (0.1.3). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
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
        function d(e, t) {
            var i = !1;
            return e.classList && e.classList.contains(t) && (i = !0), i;
        }
        function l() {
            N = n(E, t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function o(e, t) {
            var i = j.totalSlides * t - e.length;
            // Add elements if there is a possitive difference
            if (i > 0) for (var n = 0; i > n; n++) {
                var r = e[n % j.totalSlides].cloneNode(!0);
                d(r, "fire-slider-active") && a(r, "fire-slider-active"), E.appendChild(r);
            }
            // Remove elements if there is a negative difference
            if (0 > i) for (var l = e.length - 1; l >= e.length + i; l--) E.removeChild(N[l]);
            return i;
        }
        // Updates show and active based on breakpoints set in options
        function s() {
            if (// Reset show and active
            j.show = t.show, j.active = t.active, "undefined" != typeof i) {
                for (var e = -1, n = -1, r = 0; r < i.length; r++) i[r].breakpoint && i[r].breakpoint >= j.windowWidth && (i[r].breakpoint < n || -1 === n) && (e = r, 
                n = i[r].breakpoint);
                -1 !== e && (i[e].show && (j.show = i[e].show), i[e].active && (j.active = i[e].active));
            }
        }
        // Returns the amount of times the slides should be duplicated to fit within the window width
        function c() {
            var e = 1, t = 0;
            // How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
            // Create a multiply based on the number of additional slides needed
            return j.windowWidth = window.innerWidth, j.slideWidth * j.totalSlides < j.windowWidth && (t = Math.ceil((j.windowWidth - j.slideWidth * j.totalSlides) / j.slideWidth)), 
            t += 2 * j.totalSlides, t > 0 && (e += Math.ceil(t / j.totalSlides)), e;
        }
        // Position Slides
        function u(e) {
            var i = -100 * Math.ceil(e.length / 2) + 100 * (j.active - 1), n = [], r = [];
            j.minX = i, j.maxX = i + 100 * (e.length - 1);
            for (var a = Math.floor(e.length / 2); a < e.length; a++) M(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = j.slideWidthPercent + "%", e[a].style.position = "absolute", 
            r.push(i), i += 100;
            for (a = 0; a < Math.floor(e.length / 2); a++) M(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = j.slideWidthPercent + "%", e[a].style.position = "absolute", 
            n.push(i), i += 100;
            k = n.concat(r), window.jQuery ? $(e).dequeue(t.effect) : M.Utilities.dequeue(e, t.effect);
        }
        // Calculates positions for revolution amount
        function f(e, i) {
            for (var n = 0; n < N.length; n++) {
                for (var r = k.shift(), a = r, d = 0; i > d; d++) a -= 100, a < j.minX && (a = j.maxX), 
                a > j.maxX && (a = j.minX);
                M(N[n], {
                    translateX: a + "%"
                }, {
                    duration: 0,
                    queue: t.effect
                }), k.push(a);
            }
        }
        // Create and trigger an event
        function p(e, t) {
            var i = {};
            document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !1)) : (i = document.createEventObject(), 
            i.eventType = t), i.eventName = t, document.createEvent ? e.dispatchEvent(i) : e.fireEvent("on" + i.eventType, i);
        }
        // Fills pager with empty spans based on total slides, adds active class to the first slide
        function h() {
            if ("undefined" != typeof j.pager) {
                for (var e = 0; e < j.totalSlides; e++) {
                    var t = document.createElement("span");
                    j.pager.appendChild(t);
                }
                j.pagerSpans = n(j.pager, "span"), r(j.pagerSpans[0], "fire-pager-active");
            }
        }
        // Gets the index of a DOM element relative to it's parent element
        function v(e) {
            for (var t = -1, i = e.parentNode.childNodes, n = 0; n < i.length; n++) e === i[n] && (t = n);
            return t;
        }
        // Starts the timer
        function g() {
            0 !== t.delay && (b = setInterval(q, t.delay));
        }
        // Stops the timer
        function w() {
            0 !== t.delay && clearInterval(b);
        }
        // Set up the inital state of fireSlider
        function S() {
            h(), // Check Breakpoints
            s(), j.slideWidthPercent = 1 / j.show * 100, j.slideWidth = j.sliderWidth / j.show;
            // Caluculate the multiplyer
            var e = c();
            o(N, e), // Set the first active slide
            j.currentSlide = 0, r(N[j.currentSlide], "fire-slider-active"), // position the elements of the array
            l(), u(N), p(E, "fire-slider-init"), g();
        }
        // Refresh positions, breakpoints and slide count
        function m() {
            // Pause transitions
            w(), // Update breakpoints and width settings
            j.windowWidth = window.innerWidth, j.sliderWidth = E.offsetWidth, s(), j.slideWidthPercent = 1 / j.show * 100, 
            j.slideWidth = j.sliderWidth / j.show;
            var e = c();
            if (N.length !== e * j.totalSlides) {
                // Remove active class
                a(N[j.currentSlide], "fire-slider-active");
                // Multipy slides and calculate difference
                var i = o(N, e);
                // Fetch new slider
                l(), // Position slides
                u(N), j.currentSlide > N.length && (// Calculate current slide
                j.currentSlide = j.currentSlide % N.length, // Get new positions
                f(E, Math.abs(i)), window.jQuery ? $(N).dequeue(t.effect) : M.Utilities.dequeue(N, t.effect)), 
                // Re-add active class
                r(N[j.currentSlide], "fire-slider-active");
            } else u(N), f(E, j.currentSlide), window.jQuery ? $(N).dequeue(t.effect) : M.Utilities.dequeue(N, t.effect);
            // Play Transitions
            g();
        }
        // Basic slide transition effect
        function y(e, i) {
            var n = 0;
            i.multiplier && (n = 100 * i.multiplier), M(e, {
                translateX: i.oldPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), i.snapping ? M(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }) : M(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: t.speed,
                queue: t.effect
            });
        }
        // Routes slide to correct transition
        function X(e, i) {
            switch (t.effect) {
              case "slideInOut":
                y(e, i);
                break;

              default:
                y(e, i);
            }
        }
        // Go to previous slide
        function W() {
            // Stop timer
            w(), // Remove active classes
            a(N[j.currentSlide], "fire-slider-active"), "undefined" != typeof j.pager && a(j.pagerSpans[j.currentSlide % j.totalSlides], "fire-pager-active"), 
            j.currentSlide -= 1, j.currentSlide < 0 && (j.currentSlide = N.length - 1);
            // Calculate New Position
            for (var e = 0; e < N.length; e++) {
                var i = k.shift(), n = i + 100, d = !1;
                n < j.minX && (n = j.maxX, d = !0), n > j.maxX && (n = j.minX, d = !0), X(N[e], {
                    oldPosition: i,
                    newPosition: n,
                    snapping: d
                }), k.push(n);
            }
            window.jQuery ? $(N).dequeue(t.effect) : M.Utilities.dequeue(N, t.effect), // Add active classes
            r(N[j.currentSlide], "fire-slider-active"), "undefined" != typeof j.pager && r(j.pagerSpans[j.currentSlide % j.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            p(E, "fire-slider-prev"), // Restart timer
            g();
        }
        // Go to next slide
        function q() {
            // Stop timer
            w(), // Remove active classes
            a(N[j.currentSlide], "fire-slider-active"), "undefined" != typeof j.pager && a(j.pagerSpans[j.currentSlide % j.totalSlides], "fire-pager-active"), 
            j.currentSlide += 1, j.currentSlide > N.length - 1 && (j.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < N.length; e++) {
                var i = k.shift(), n = i - 100, d = !1;
                n < j.minX && (n = j.maxX, d = !0), n > j.maxX && (n = j.minX, d = !0), X(N[e], {
                    oldPosition: i,
                    newPosition: n,
                    snapping: d
                }), k.push(n);
            }
            window.jQuery ? $(N).dequeue(t.effect) : M.Utilities.dequeue(N, t.effect), // Add active classes
            r(N[j.currentSlide], "fire-slider-active"), "undefined" != typeof j.pager && r(j.pagerSpans[j.currentSlide % j.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            p(E, "fire-slider-prev"), // Restart timer
            g();
        }
        // Go to the slide relative to the index of a pager span
        function P(e) {
            var i = j.currentSlide % j.totalSlides, n = e - i;
            if (0 !== n) {
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (// Stop Timer
                w(), // Re-load slides
                l(), // Remove active classes
                a(N[j.currentSlide], "fire-slider-active"), a(j.pagerSpans[j.currentSlide % j.totalSlides], "fire-pager-active"), 
                0 > n) // Previous Direction
                for (var d = 0; d < N.length; d++) {
                    for (var o = k.shift(), s = o, c = !1, u = 0; u < Math.abs(n); u++) s += 100, s < j.minX && (s = j.maxX, 
                    c = !0), s > j.maxX && (s = j.minX, c = !0);
                    X(N[d], {
                        oldPosition: o,
                        newPosition: s,
                        snapping: c
                    }), k.push(s);
                } else // Next Direction
                for (var f = 0; f < N.length; f++) {
                    for (var p = k.shift(), h = p, v = !1, S = 0; S < Math.abs(n); S++) h -= 100, h < j.minX && (h = j.maxX, 
                    v = !0), h > j.maxX && (h = j.minX, v = !0);
                    X(N[f], {
                        oldPosition: p,
                        newPosition: h,
                        snapping: v
                    }), k.push(h);
                }
                // Perform transitions
                window.jQuery ? $(N).dequeue(t.effect) : M.Utilities.dequeue(N, t.effect), // Set current slide
                j.currentSlide = (j.currentSlide + n) % N.length, // Add new active classes
                r(N[j.currentSlide], "fire-slider-active"), r(j.pagerSpans[j.currentSlide % j.totalSlides], "fire-pager-active"), 
                // Restart timer
                g();
            }
        }
        var L = {
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
        for (var x in L) L.hasOwnProperty(x) && !t.hasOwnProperty(x) && (t[x] = L[x]);
        var E = document.querySelectorAll(e)[0], N = n(E, t.slide), b = {}, k = [], j = {
            show: t.show,
            active: t.active,
            pagerSpans: [],
            totalSlides: N.length,
            windowWidth: window.innerWidth,
            sliderWidth: E.offsetWidth,
            slideWidth: E.offsetWidth / t.show,
            slideWidthPercent: 1 / t.show * 100,
            currentSlide: 0,
            minX: 0,
            maxX: 0
        };
        "undefined" != typeof t.prev && (j.prev = document.querySelectorAll(t.prev)[0]), 
        "undefined" != typeof t.next && (j.next = document.querySelectorAll(t.next)[0]), 
        "undefined" != typeof t.pager && (j.pager = document.querySelectorAll(t.pager)[0]);
        // Set up V
        var M;
        M = window.jQuery ? $.Velocity : Velocity, S(), // Click events
        "undefined" != typeof j.next && j.next.addEventListener("click", function(e) {
            e.preventDefault(), q();
        }), "undefined" != typeof j.prev && j.prev.addEventListener("click", function(e) {
            e.preventDefault(), W();
        }), "undefined" != typeof j.pager && j.pager.addEventListener("click", function(e) {
            e.preventDefault(), "SPAN" === e.target.tagName && P(v(e.target));
        }), // Pause on hover events
        E.addEventListener("mouseover", function() {
            t.hoverPause && w();
        }), E.addEventListener("mouseout", function() {
            t.hoverPause && g();
        }), // Disable link interaction if slide is not active slide
        t.disableLinks && E.addEventListener("click", function(e) {
            "A" === e.target.tagName && (d(e.target.parentNode, "fire-slider-active") || e.preventDefault());
        }), // Window resize event
        window.addEventListener("resize", function() {
            m();
        });
    };
}(), // Example listeners
document.addEventListener("fire-slider-init", function() {}), document.addEventListener("fire-slider-next", function() {});