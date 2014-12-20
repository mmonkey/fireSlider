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
            b = P.querySelectorAll(":scope > " + t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function o(e, t) {
            var i = V.totalSlides * t - e.length;
            // Add elements if there is a possitive difference
            if (i > 0) for (var r = 0; i > r; r++) {
                var a = e[r % V.totalSlides].cloneNode(!0);
                l(a, "fire-slider-active") && n(a, "fire-slider-active"), P.appendChild(a);
            }
            // Remove elements if there is a negative difference
            if (0 > i) for (var s = e.length - 1; s >= e.length + i; s--) P.removeChild(b[s]);
            return i;
        }
        // Updates show and active based on breakpoints set in options
        function d() {
            if (// Reset show and active
            V.show = t.show, V.active = t.active, "undefined" != typeof i) {
                for (var e = -1, r = -1, n = 0; n < i.length; n++) i[n].breakpoint && i[n].breakpoint >= V.windowWidth && (i[n].breakpoint < r || -1 === r) && (e = n, 
                r = i[n].breakpoint);
                -1 !== e && (i[e].show && (V.show = i[e].show), i[e].active && (V.active = i[e].active));
            }
        }
        // Returns the amount of times the slides should be duplicated to fit within the window width
        function c() {
            var e = 1, t = 0;
            // How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
            // Create a multiply based on the number of additional slides needed
            return V.windowWidth = window.innerWidth, V.slideWidth * V.totalSlides < V.windowWidth && (t = Math.ceil((V.windowWidth - V.slideWidth * V.totalSlides) / V.slideWidth)), 
            t += 2, t > 0 && (e += Math.ceil(t / V.totalSlides)), e;
        }
        // Position Slides
        function u(e) {
            var i = -100 * Math.ceil(e.length / 2) + 100 * (V.active - 1), r = [], n = [];
            V.minX = i, V.maxX = i + 100 * (e.length - 1);
            for (var l = Math.floor(e.length / 2); l < e.length; l++) Velocity(e[l], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[l].style.width = V.slideWidthPercent + "%", e[l].style.position = "absolute", 
            n.push(i), i += 100;
            for (l = 0; l < Math.floor(e.length / 2); l++) Velocity(e[l], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[l].style.width = V.slideWidthPercent + "%", e[l].style.position = "absolute", 
            r.push(i), i += 100;
            N = r.concat(n), Velocity.Utilities.dequeue(e, t.effect);
        }
        // Calculates positions for revolution amount
        function f(e, i) {
            for (var r = 0; r < b.length; r++) {
                for (var n = N.shift(), l = n, a = 0; i > a; a++) l -= 100, l < V.minX && (l = V.maxX), 
                l > V.maxX && (l = V.minX);
                Velocity(b[r], {
                    translateX: l + "%"
                }, {
                    duration: 0,
                    queue: t.effect
                }), N.push(l);
            }
        }
        // Create and trigger an event
        function h(e, t) {
            var i = {};
            document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !1)) : (i = document.createEventObject(), 
            i.eventType = t), i.eventName = t, document.createEvent ? e.dispatchEvent(i) : e.fireEvent("on" + i.eventType, i);
        }
        // Fills pager with empty spans based on total slides, adds active class to the first slide
        function v() {
            for (var e = 0; e < V.totalSlides; e++) {
                var t = document.createElement("span");
                V.pager.appendChild(t);
            }
            V.pagerSpans = V.pager.querySelectorAll(":scope > span"), r(V.pagerSpans[0], "fire-pager-active");
        }
        // Gets the index of a DOM element relative to it's parent element
        function p(e) {
            for (var t = -1, i = e.parentNode.childNodes, r = 0; r < i.length; r++) e === i[r] && (t = r);
            return t;
        }
        // Starts the timer
        function S() {
            M = setInterval(q, t.delay);
        }
        // Stops the timer
        function g() {
            clearInterval(M);
        }
        // Set up the inital state of fireSlider
        function m() {
            v(), // Check Breakpoints
            d(), V.slideWidthPercent = 1 / V.show * 100, V.slideWidth = V.sliderWidth / V.show;
            // Caluculate the multiplyer
            var e = c();
            o(b, e), // Set the first active slide
            V.currentSlide = 0, r(b[V.currentSlide], "fire-slider-active"), // position the elements of the array
            s(), u(b), h(P, "fire-slider-init"), S();
        }
        // Refresh positions, breakpoints and slide count
        function w() {
            // Update breakpoints and width settings
            V.windowWidth = window.innerWidth, V.sliderWidth = P.offsetWidth, d(), V.slideWidthPercent = 1 / V.show * 100, 
            V.slideWidth = V.sliderWidth / V.show;
            var e = c();
            if (b.length !== e * V.totalSlides) {
                // Remove active class
                n(b[V.currentSlide], "fire-slider-active");
                // Multipy slides and calculate difference
                var i = o(b, e);
                // Fetch new slider
                s(), // Position slides
                u(b), V.currentSlide > b.length && (// Calculate current slide
                V.currentSlide = V.currentSlide % b.length, // Get new positions
                f(P, Math.abs(i)), Velocity.Utilities.dequeue(b, t.effect)), // Re-add active class
                r(b[V.currentSlide], "fire-slider-active");
            } else u(b), f(P, V.currentSlide), Velocity.Utilities.dequeue(b, t.effect);
        }
        // Basic slide transition effect
        function y(e, i) {
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
        function W(e, i) {
            switch (t.effect) {
              case "slideInOut":
                y(e, i);
                break;

              default:
                y(e, i);
            }
        }
        // Go to previous slide
        function X() {
            // Stop timer
            g(), // Remove active classes
            n(b[V.currentSlide], "fire-slider-active"), n(V.pagerSpans[V.currentSlide % V.totalSlides], "fire-pager-active"), 
            V.currentSlide -= 1, V.currentSlide < 0 && (V.currentSlide = b.length - 1);
            // Calculate New Position
            for (var e = 0; e < b.length; e++) {
                var i = N.shift(), l = i + 100, a = !1;
                l < V.minX && (l = V.maxX, a = !0), l > V.maxX && (l = V.minX, a = !0), W(b[e], {
                    oldPosition: i,
                    newPosition: l,
                    snapping: a
                }), N.push(l);
            }
            Velocity.Utilities.dequeue(b, t.effect), // Add active classes
            r(b[V.currentSlide], "fire-slider-active"), r(V.pagerSpans[V.currentSlide % V.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            h(P, "fire-slider-prev"), // Restart timer
            S();
        }
        // Go to next slide
        function q() {
            // Stop timer
            g(), // Remove active classes
            n(b[V.currentSlide], "fire-slider-active"), n(V.pagerSpans[V.currentSlide % V.totalSlides], "fire-pager-active"), 
            V.currentSlide += 1, V.currentSlide > b.length - 1 && (V.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < b.length; e++) {
                var i = N.shift(), l = i - 100, a = !1;
                l < V.minX && (l = V.maxX, a = !0), l > V.maxX && (l = V.minX, a = !0), W(b[e], {
                    oldPosition: i,
                    newPosition: l,
                    snapping: a
                }), N.push(l);
            }
            Velocity.Utilities.dequeue(b, t.effect), // Add active classes
            r(b[V.currentSlide], "fire-slider-active"), r(V.pagerSpans[V.currentSlide % V.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            h(P, "fire-slider-prev"), // Restart timer
            S();
        }
        // Go to the slide relative to the index of a pager span
        function E(e) {
            var i = V.currentSlide % V.totalSlides, l = e - i;
            if (0 !== l) {
                // Stop Timer
                g();
                for (var s = P.querySelectorAll(":scope > " + t.slide), o = [], d = 0; d < s.length; d++) o.push(s[d].style.left);
                // Remove active classes
                var c = a(s, "fire-slider-active");
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (n(s[c], "fire-slider-active"), n(V.pagerSpans[V.currentSlide % V.totalSlides], "fire-pager-active"), 
                l > 0) {
                    for (d = l; d < s.length; d++) W(s[d], parseFloat(o.shift()), {
                        direction: "next",
                        multiplier: Math.abs(l)
                    });
                    for (d = 0; l > d; d++) W(s[d], parseFloat(o.shift()), {
                        direction: "next",
                        multiplier: Math.abs(l)
                    });
                } else {
                    for (d = s.length + l; d < s.length; d++) W(s[d], parseFloat(o.shift()), {
                        direction: "prev",
                        multiplier: Math.abs(l)
                    });
                    for (d = 0; d < s.length + l; d++) W(s[d], parseFloat(o.shift()), {
                        direction: "prev",
                        multiplier: Math.abs(l)
                    });
                }
                // Perform transitions
                Velocity.Utilities.dequeue(s, t.effect), // Set current slide
                V.currentSlide = (V.currentSlide + l) % s.length, // Add new active classes
                r(s[(V.currentSlide + Math.floor(s.length / 2)) % s.length], "fire-slider-active"), 
                r(V.pagerSpans[V.currentSlide % V.totalSlides], "fire-pager-active"), // Restart timer
                S();
            }
        }
        var x = {
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
        for (var L in x) x.hasOwnProperty(L) && !t.hasOwnProperty(L) && (t[L] = x[L]);
        var P = document.querySelectorAll(e)[0], b = P.querySelectorAll(":scope > " + t.slide), M = {}, N = [], V = {
            show: t.show,
            active: t.active,
            prev: document.querySelectorAll(t.prev)[0],
            next: document.querySelectorAll(t.next)[0],
            pager: document.querySelectorAll(t.pager)[0],
            pagerSpans: [],
            totalSlides: b.length,
            windowWidth: window.innerWidth,
            sliderWidth: P.offsetWidth,
            slideWidth: P.offsetWidth / t.show,
            slideWidthPercent: 1 / t.show * 100,
            currentSlide: 0,
            minX: 0,
            maxX: 0
        };
        m(), // Click events
        V.next.addEventListener("click", function(e) {
            e.preventDefault(), q();
        }), V.prev.addEventListener("click", function(e) {
            e.preventDefault(), X();
        }), V.pager.addEventListener("click", function(e) {
            e.preventDefault(), "SPAN" === e.target.tagName && E(p(e.target));
        }), // Pause on hover events
        P.addEventListener("mouseover", function() {
            t.hoverPause && g();
        }), P.addEventListener("mouseout", function() {
            t.hoverPause && S();
        }), // Disable link interaction if slide is not active slide
        t.disableLinks && P.addEventListener("click", function(e) {
            "A" === e.target.tagName && (l(e.target.parentNode, "fire-slider-active") || e.preventDefault());
        }), // Window resize event
        window.addEventListener("resize", function() {
            w();
        });
    };
}(), // Example listeners
document.addEventListener("fire-slider-init", function() {}), document.addEventListener("fire-slider-next", function() {});