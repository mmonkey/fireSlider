/* fireSlider (0.1.0). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
!function() {
    fireSlider = function(e, t, i) {
        // Add class to node's classList
        function n(e, t) {
            e.classList ? e.classList.add(t) : e.className += " " + t;
        }
        // Remove class from node's classList
        function r(e, t) {
            e.classList ? e.classList.remove(t) : e.className = e.className.replace(new RegExp("(^|\\b)" + t.split(" ").join("|") + "(\\b|$)", "gi"), " ");
        }
        // Returns true if node has className
        function a(e, t) {
            var i = !1;
            return e.classList && e.classList.contains(t) && (i = !0), i;
        }
        function d() {
            L = E.querySelectorAll(":scope > " + t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function l(e, t) {
            var i = N.totalSlides * t - e.length;
            // Add elements if there is a possitive difference
            if (i > 0) for (var n = 0; i > n; n++) {
                var d = e[n % N.totalSlides].cloneNode(!0);
                a(d, "fire-slider-active") && r(d, "fire-slider-active"), E.appendChild(d);
            }
            // Remove elements if there is a negative difference
            if (0 > i) for (var l = e.length - 1; l >= e.length + i; l--) E.removeChild(L[l]);
            return i;
        }
        // Updates show and active based on breakpoints set in options
        function o() {
            if (// Reset show and active
            N.show = t.show, N.active = t.active, "undefined" != typeof i) {
                for (var e = -1, n = -1, r = 0; r < i.length; r++) i[r].breakpoint && i[r].breakpoint >= N.windowWidth && (i[r].breakpoint < n || -1 === n) && (e = r, 
                n = i[r].breakpoint);
                -1 !== e && (i[e].show && (N.show = i[e].show), i[e].active && (N.active = i[e].active));
            }
        }
        // Returns the amount of times the slides should be duplicated to fit within the window width
        function s() {
            var e = 1, t = 0;
            // How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
            // Create a multiply based on the number of additional slides needed
            return N.windowWidth = window.innerWidth, N.slideWidth * N.totalSlides < N.windowWidth && (t = Math.ceil((N.windowWidth - N.slideWidth * N.totalSlides) / N.slideWidth)), 
            t += 2 * N.totalSlides, t > 0 && (e += Math.ceil(t / N.totalSlides)), e;
        }
        // Position Slides
        function c(e) {
            var i = -100 * Math.ceil(e.length / 2) + 100 * (N.active - 1), n = [], r = [];
            N.minX = i, N.maxX = i + 100 * (e.length - 1);
            for (var a = Math.floor(e.length / 2); a < e.length; a++) A(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = N.slideWidthPercent + "%", e[a].style.position = "absolute", 
            r.push(i), i += 100;
            for (a = 0; a < Math.floor(e.length / 2); a++) A(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = N.slideWidthPercent + "%", e[a].style.position = "absolute", 
            n.push(i), i += 100;
            k = n.concat(r), A.Utilities.dequeue(e, t.effect);
        }
        // Calculates positions for revolution amount
        function f(e, i) {
            for (var n = 0; n < L.length; n++) {
                for (var r = k.shift(), a = r, d = 0; i > d; d++) a -= 100, a < N.minX && (a = N.maxX), 
                a > N.maxX && (a = N.minX);
                A(L[n], {
                    translateX: a + "%"
                }, {
                    duration: 0,
                    queue: t.effect
                }), k.push(a);
            }
        }
        // Create and trigger an event
        function u(e, t) {
            var i = {};
            document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !1)) : (i = document.createEventObject(), 
            i.eventType = t), i.eventName = t, document.createEvent ? e.dispatchEvent(i) : e.fireEvent("on" + i.eventType, i);
        }
        // Fills pager with empty spans based on total slides, adds active class to the first slide
        function p() {
            if ("undefined" != typeof N.pager) {
                for (var e = 0; e < N.totalSlides; e++) {
                    var t = document.createElement("span");
                    N.pager.appendChild(t);
                }
                N.pagerSpans = N.pager.querySelectorAll(":scope > span"), n(N.pagerSpans[0], "fire-pager-active");
            }
        }
        // Gets the index of a DOM element relative to it's parent element
        function v(e) {
            for (var t = -1, i = e.parentNode.childNodes, n = 0; n < i.length; n++) e === i[n] && (t = n);
            return t;
        }
        // Starts the timer
        function h() {
            b = setInterval(W, t.delay);
        }
        // Stops the timer
        function S() {
            clearInterval(b);
        }
        // Set up the inital state of fireSlider
        function g() {
            p(), // Check Breakpoints
            o(), N.slideWidthPercent = 1 / N.show * 100, N.slideWidth = N.sliderWidth / N.show;
            // Caluculate the multiplyer
            var e = s();
            l(L, e), // Set the first active slide
            N.currentSlide = 0, n(L[N.currentSlide], "fire-slider-active"), // position the elements of the array
            d(), c(L), u(E, "fire-slider-init"), h();
        }
        // Refresh positions, breakpoints and slide count
        function m() {
            // Pause transitions
            S(), // Update breakpoints and width settings
            N.windowWidth = window.innerWidth, N.sliderWidth = E.offsetWidth, o(), N.slideWidthPercent = 1 / N.show * 100, 
            N.slideWidth = N.sliderWidth / N.show;
            var e = s();
            if (L.length !== e * N.totalSlides) {
                // Remove active class
                r(L[N.currentSlide], "fire-slider-active");
                // Multipy slides and calculate difference
                var i = l(L, e);
                // Fetch new slider
                d(), // Position slides
                c(L), N.currentSlide > L.length && (// Calculate current slide
                N.currentSlide = N.currentSlide % L.length, // Get new positions
                f(E, Math.abs(i)), A.Utilities.dequeue(L, t.effect)), // Re-add active class
                n(L[N.currentSlide], "fire-slider-active");
            } else c(L), f(E, N.currentSlide), A.Utilities.dequeue(L, t.effect);
            // Play Transitions
            h();
        }
        // Basic slide transition effect
        function w(e, i) {
            var n = 0;
            i.multiplier && (n = 100 * i.multiplier), A(e, {
                translateX: i.oldPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), i.snapping ? A(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }) : A(e, {
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
                w(e, i);
                break;

              default:
                w(e, i);
            }
        }
        // Go to previous slide
        function X() {
            // Stop timer
            S(), // Remove active classes
            r(L[N.currentSlide], "fire-slider-active"), "undefined" != typeof N.pager && r(N.pagerSpans[N.currentSlide % N.totalSlides], "fire-pager-active"), 
            N.currentSlide -= 1, N.currentSlide < 0 && (N.currentSlide = L.length - 1);
            // Calculate New Position
            for (var e = 0; e < L.length; e++) {
                var i = k.shift(), a = i + 100, d = !1;
                a < N.minX && (a = N.maxX, d = !0), a > N.maxX && (a = N.minX, d = !0), y(L[e], {
                    oldPosition: i,
                    newPosition: a,
                    snapping: d
                }), k.push(a);
            }
            A.Utilities.dequeue(L, t.effect), // Add active classes
            n(L[N.currentSlide], "fire-slider-active"), "undefined" != typeof N.pager && n(N.pagerSpans[N.currentSlide % N.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            u(E, "fire-slider-prev"), // Restart timer
            h();
        }
        // Go to next slide
        function W() {
            // Stop timer
            S(), // Remove active classes
            r(L[N.currentSlide], "fire-slider-active"), "undefined" != typeof N.pager && r(N.pagerSpans[N.currentSlide % N.totalSlides], "fire-pager-active"), 
            N.currentSlide += 1, N.currentSlide > L.length - 1 && (N.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < L.length; e++) {
                var i = k.shift(), a = i - 100, d = !1;
                a < N.minX && (a = N.maxX, d = !0), a > N.maxX && (a = N.minX, d = !0), y(L[e], {
                    oldPosition: i,
                    newPosition: a,
                    snapping: d
                }), k.push(a);
            }
            A.Utilities.dequeue(L, t.effect), // Add active classes
            n(L[N.currentSlide], "fire-slider-active"), "undefined" != typeof N.pager && n(N.pagerSpans[N.currentSlide % N.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            u(E, "fire-slider-prev"), // Restart timer
            h();
        }
        // Go to the slide relative to the index of a pager span
        function P(e) {
            var i = N.currentSlide % N.totalSlides, a = e - i;
            if (0 !== a) {
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (// Stop Timer
                S(), // Re-load slides
                d(), // Remove active classes
                r(L[N.currentSlide], "fire-slider-active"), r(N.pagerSpans[N.currentSlide % N.totalSlides], "fire-pager-active"), 
                0 > a) // Previous Direction
                for (var l = 0; l < L.length; l++) {
                    for (var o = k.shift(), s = o, c = !1, f = 0; f < Math.abs(a); f++) s += 100, s < N.minX && (s = N.maxX, 
                    c = !0), s > N.maxX && (s = N.minX, c = !0);
                    y(L[l], {
                        oldPosition: o,
                        newPosition: s,
                        snapping: c
                    }), k.push(s);
                } else // Next Direction
                for (var u = 0; u < L.length; u++) {
                    for (var p = k.shift(), v = p, g = !1, m = 0; m < Math.abs(a); m++) v -= 100, v < N.minX && (v = N.maxX, 
                    g = !0), v > N.maxX && (v = N.minX, g = !0);
                    y(L[u], {
                        oldPosition: p,
                        newPosition: v,
                        snapping: g
                    }), k.push(v);
                }
                // Perform transitions
                A.Utilities.dequeue(L, t.effect), // Set current slide
                N.currentSlide = (N.currentSlide + a) % L.length, // Add new active classes
                n(L[N.currentSlide], "fire-slider-active"), n(N.pagerSpans[N.currentSlide % N.totalSlides], "fire-pager-active"), 
                // Restart timer
                h();
            }
        }
        var q = {
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
        for (var x in q) q.hasOwnProperty(x) && !t.hasOwnProperty(x) && (t[x] = q[x]);
        var E = document.querySelectorAll(e)[0], L = E.querySelectorAll(":scope > " + t.slide), b = {}, k = [], N = {
            show: t.show,
            active: t.active,
            pagerSpans: [],
            totalSlides: L.length,
            windowWidth: window.innerWidth,
            sliderWidth: E.offsetWidth,
            slideWidth: E.offsetWidth / t.show,
            slideWidthPercent: 1 / t.show * 100,
            currentSlide: 0,
            minX: 0,
            maxX: 0
        };
        // Set up Velocity
        if ("undefined" != typeof t.prev && (N.prev = document.querySelectorAll(t.prev)[0]), 
        "undefined" != typeof t.next && (N.next = document.querySelectorAll(t.next)[0]), 
        "undefined" != typeof t.pager && (N.pager = document.querySelectorAll(t.pager)[0]), 
        window.jQuery) var A = $.Velocity; else var A = Velocity;
        g(), // Click events
        "undefined" != typeof N.next && N.next.addEventListener("click", function(e) {
            e.preventDefault(), W();
        }), "undefined" != typeof N.prev && N.prev.addEventListener("click", function(e) {
            e.preventDefault(), X();
        }), "undefined" != typeof N.pager && N.pager.addEventListener("click", function(e) {
            e.preventDefault(), "SPAN" === e.target.tagName && P(v(e.target));
        }), // Pause on hover events
        E.addEventListener("mouseover", function() {
            t.hoverPause && S();
        }), E.addEventListener("mouseout", function() {
            t.hoverPause && h();
        }), // Disable link interaction if slide is not active slide
        t.disableLinks && E.addEventListener("click", function(e) {
            "A" === e.target.tagName && (a(e.target.parentNode, "fire-slider-active") || e.preventDefault());
        }), // Window resize event
        window.addEventListener("resize", function() {
            m();
        });
    };
}(), // Example listeners
document.addEventListener("fire-slider-init", function() {}), document.addEventListener("fire-slider-next", function() {});