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
        function l() {
            L = E.querySelectorAll(":scope > " + t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function d(e, t) {
            var i = k.totalSlides * t - e.length;
            // Add elements if there is a possitive difference
            if (i > 0) for (var n = 0; i > n; n++) {
                var l = e[n % k.totalSlides].cloneNode(!0);
                a(l, "fire-slider-active") && r(l, "fire-slider-active"), E.appendChild(l);
            }
            // Remove elements if there is a negative difference
            if (0 > i) for (var d = e.length - 1; d >= e.length + i; d--) E.removeChild(L[d]);
            return i;
        }
        // Updates show and active based on breakpoints set in options
        function o() {
            if (// Reset show and active
            k.show = t.show, k.active = t.active, "undefined" != typeof i) {
                for (var e = -1, n = -1, r = 0; r < i.length; r++) i[r].breakpoint && i[r].breakpoint >= k.windowWidth && (i[r].breakpoint < n || -1 === n) && (e = r, 
                n = i[r].breakpoint);
                -1 !== e && (i[e].show && (k.show = i[e].show), i[e].active && (k.active = i[e].active));
            }
        }
        // Returns the amount of times the slides should be duplicated to fit within the window width
        function s() {
            var e = 1, t = 0;
            // How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
            // Create a multiply based on the number of additional slides needed
            return k.windowWidth = window.innerWidth, k.slideWidth * k.totalSlides < k.windowWidth && (t = Math.ceil((k.windowWidth - k.slideWidth * k.totalSlides) / k.slideWidth)), 
            t += 2 * k.totalSlides, t > 0 && (e += Math.ceil(t / k.totalSlides)), e;
        }
        // Position Slides
        function c(e) {
            var i = -100 * Math.ceil(e.length / 2) + 100 * (k.active - 1), n = [], r = [];
            k.minX = i, k.maxX = i + 100 * (e.length - 1);
            for (var a = Math.floor(e.length / 2); a < e.length; a++) Velocity(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = k.slideWidthPercent + "%", e[a].style.position = "absolute", 
            r.push(i), i += 100;
            for (a = 0; a < Math.floor(e.length / 2); a++) Velocity(e[a], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[a].style.width = k.slideWidthPercent + "%", e[a].style.position = "absolute", 
            n.push(i), i += 100;
            V = n.concat(r), Velocity.Utilities.dequeue(e, t.effect);
        }
        // Calculates positions for revolution amount
        function f(e, i) {
            for (var n = 0; n < L.length; n++) {
                for (var r = V.shift(), a = r, l = 0; i > l; l++) a -= 100, a < k.minX && (a = k.maxX), 
                a > k.maxX && (a = k.minX);
                Velocity(L[n], {
                    translateX: a + "%"
                }, {
                    duration: 0,
                    queue: t.effect
                }), V.push(a);
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
            if ("undefined" != typeof k.pager) {
                for (var e = 0; e < k.totalSlides; e++) {
                    var t = document.createElement("span");
                    k.pager.appendChild(t);
                }
                k.pagerSpans = k.pager.querySelectorAll(":scope > span"), n(k.pagerSpans[0], "fire-pager-active");
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
            o(), k.slideWidthPercent = 1 / k.show * 100, k.slideWidth = k.sliderWidth / k.show;
            // Caluculate the multiplyer
            var e = s();
            d(L, e), // Set the first active slide
            k.currentSlide = 0, n(L[k.currentSlide], "fire-slider-active"), // position the elements of the array
            l(), c(L), u(E, "fire-slider-init"), h();
        }
        // Refresh positions, breakpoints and slide count
        function m() {
            // Pause transitions
            S(), // Update breakpoints and width settings
            k.windowWidth = window.innerWidth, k.sliderWidth = E.offsetWidth, o(), k.slideWidthPercent = 1 / k.show * 100, 
            k.slideWidth = k.sliderWidth / k.show;
            var e = s();
            if (L.length !== e * k.totalSlides) {
                // Remove active class
                r(L[k.currentSlide], "fire-slider-active");
                // Multipy slides and calculate difference
                var i = d(L, e);
                // Fetch new slider
                l(), // Position slides
                c(L), k.currentSlide > L.length && (// Calculate current slide
                k.currentSlide = k.currentSlide % L.length, // Get new positions
                f(E, Math.abs(i)), Velocity.Utilities.dequeue(L, t.effect)), // Re-add active class
                n(L[k.currentSlide], "fire-slider-active");
            } else c(L), f(E, k.currentSlide), Velocity.Utilities.dequeue(L, t.effect);
            // Play Transitions
            h();
        }
        // Basic slide transition effect
        function w(e, i) {
            var n = 0;
            i.multiplier && (n = 100 * i.multiplier), Velocity(e, {
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
            r(L[k.currentSlide], "fire-slider-active"), "undefined" != typeof k.pager && r(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            k.currentSlide -= 1, k.currentSlide < 0 && (k.currentSlide = L.length - 1);
            // Calculate New Position
            for (var e = 0; e < L.length; e++) {
                var i = V.shift(), a = i + 100, l = !1;
                a < k.minX && (a = k.maxX, l = !0), a > k.maxX && (a = k.minX, l = !0), y(L[e], {
                    oldPosition: i,
                    newPosition: a,
                    snapping: l
                }), V.push(a);
            }
            Velocity.Utilities.dequeue(L, t.effect), // Add active classes
            n(L[k.currentSlide], "fire-slider-active"), "undefined" != typeof k.pager && n(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            u(E, "fire-slider-prev"), // Restart timer
            h();
        }
        // Go to next slide
        function W() {
            // Stop timer
            S(), // Remove active classes
            r(L[k.currentSlide], "fire-slider-active"), "undefined" != typeof k.pager && r(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            k.currentSlide += 1, k.currentSlide > L.length - 1 && (k.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < L.length; e++) {
                var i = V.shift(), a = i - 100, l = !1;
                a < k.minX && (a = k.maxX, l = !0), a > k.maxX && (a = k.minX, l = !0), y(L[e], {
                    oldPosition: i,
                    newPosition: a,
                    snapping: l
                }), V.push(a);
            }
            Velocity.Utilities.dequeue(L, t.effect), // Add active classes
            n(L[k.currentSlide], "fire-slider-active"), "undefined" != typeof k.pager && n(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            u(E, "fire-slider-prev"), // Restart timer
            h();
        }
        // Go to the slide relative to the index of a pager span
        function P(e) {
            var i = k.currentSlide % k.totalSlides, a = e - i;
            if (0 !== a) {
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (// Stop Timer
                S(), // Re-load slides
                l(), // Remove active classes
                r(L[k.currentSlide], "fire-slider-active"), r(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
                0 > a) // Previous Direction
                for (var d = 0; d < L.length; d++) {
                    for (var o = V.shift(), s = o, c = !1, f = 0; f < Math.abs(a); f++) s += 100, s < k.minX && (s = k.maxX, 
                    c = !0), s > k.maxX && (s = k.minX, c = !0);
                    y(L[d], {
                        oldPosition: o,
                        newPosition: s,
                        snapping: c
                    }), V.push(s);
                } else // Next Direction
                for (var u = 0; u < L.length; u++) {
                    for (var p = V.shift(), v = p, g = !1, m = 0; m < Math.abs(a); m++) v -= 100, v < k.minX && (v = k.maxX, 
                    g = !0), v > k.maxX && (v = k.minX, g = !0);
                    y(L[u], {
                        oldPosition: p,
                        newPosition: v,
                        snapping: g
                    }), V.push(v);
                }
                // Perform transitions
                Velocity.Utilities.dequeue(L, t.effect), // Set current slide
                k.currentSlide = (k.currentSlide + a) % L.length, // Add new active classes
                n(L[k.currentSlide], "fire-slider-active"), n(k.pagerSpans[k.currentSlide % k.totalSlides], "fire-pager-active"), 
                // Restart timer
                h();
            }
        }
        var q = {
            slide: "li",
            show: 1,
            active: 1,
            //prev: '#prev',
            //next: '#next',
            //pager: '#pager',
            speed: 500,
            delay: 5e3,
            effect: "slideInOut",
            hoverPause: !1,
            disableLinks: !0
        };
        // Merge defaults with options
        t = t || {};
        for (var x in q) q.hasOwnProperty(x) && !t.hasOwnProperty(x) && (t[x] = q[x]);
        var E = document.querySelectorAll(e)[0], L = E.querySelectorAll(":scope > " + t.slide), b = {}, V = [], k = {
            show: t.show,
            active: t.active,
            //prev: document.querySelectorAll(options.prev)[0],
            //next: document.querySelectorAll(options.next)[0],
            //pager: document.querySelectorAll(options.pager)[0],
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
        "undefined" != typeof t.prev && (k.prev = document.querySelectorAll(t.prev)[0]), 
        "undefined" != typeof t.next && (k.next = document.querySelectorAll(t.next)[0]), 
        "undefined" != typeof t.pager && (k.pager = document.querySelectorAll(t.pager)[0]), 
        g(), // Click events
        "undefined" != typeof k.next && k.next.addEventListener("click", function(e) {
            e.preventDefault(), W();
        }), "undefined" != typeof k.prev && k.prev.addEventListener("click", function(e) {
            e.preventDefault(), X();
        }), "undefined" != typeof k.pager && k.pager.addEventListener("click", function(e) {
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