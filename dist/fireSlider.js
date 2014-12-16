!function() {
    fireSlider = function(e, t, n) {
        // Add class to node's classList
        function r(e, t) {
            e.classList ? e.classList.add(t) : e.className += " " + t;
        }
        // Remove class from node's classList
        function l(e, t) {
            e.classList ? e.classList.remove(t) : e.className = e.className.replace(new RegExp("(^|\\b)" + t.split(" ").join("|") + "(\\b|$)", "gi"), " ");
        }
        // Returns true if node has className
        function a(e, t) {
            var i = !1;
            return e.classList && e.classList.contains(t) && (i = !0), i;
        }
        // Returns the last index of the array that contains the class
        function d(e, t) {
            for (var i = -1, n = 0; n < e.length; n++) (" " + e[n].className + " ").indexOf(" " + t + " ") > -1 && (i = n);
            return i;
        }
        // Returns a new array from a DOM list
        function o(e) {
            for (var t = [], i = 0; i < e.length; i++) {
                var n = e[i].cloneNode(!0);
                t.push(n);
            }
            return t;
        }
        function s() {
            N = X.querySelectorAll(":scope > " + t.slide);
        }
        // Duplicates slides based on the multiplier, returns new array
        function c(e, t) {
            for (var i = A.totalSlides * t - e.length, n = 0; i > n; n++) {
                var r = e[n % A.totalSlides].cloneNode(!0);
                a(r, "fire-slider-active") && l(r, "fire-slider-active"), X.appendChild(r);
            }
        }
        // Updates show and active based on breakpoints set in options
        function u() {
            if (// Reset show and active
            A.show = t.show, A.active = t.active, "undefined" != typeof n) {
                for (var e = -1, i = -1, r = 0; r < n.length; r++) n[r].breakpoint && n[r].breakpoint >= A.windowWidth && (n[r].breakpoint < i || -1 === i) && (e = r, 
                i = n[r].breakpoint);
                -1 !== e && (n[e].show && (A.show = n[e].show), n[e].active && (A.active = n[e].active));
            }
        }
        // Returns the amount of times the slides should be duplicated to fit within the window width
        function f() {
            var e = 1, t = 0;
            // How many additional slides do we need to cover the width of the screen plus 2 more for the next transition
            // Create a multiply based on the number of additional slides needed
            return A.windowWidth = window.innerWidth, A.slideWidth * A.totalSlides < A.windowWidth && (t = Math.ceil((A.windowWidth - A.slideWidth * A.totalSlides) / A.slideWidth)), 
            t += 2, t > 0 && (e += Math.ceil(t / A.totalSlides)), e;
        }
        // Position Slides
        function h(e) {
            var i = -100 * Math.ceil(e.length / 2) + 100 * (A.active - 1), n = [], r = [];
            A.minX = i, A.maxX = i + 100 * (e.length - 1);
            for (var l = Math.floor(e.length / 2); l < e.length; l++) Velocity(e[l], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[l].style.width = A.slideWidthPercent + "%", e[l].style.position = "absolute", 
            r.push(i), i += 100;
            for (l = 0; l < Math.ceil(e.length / 2); l++) Velocity(e[l], {
                translateX: i + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), e[l].style.width = A.slideWidthPercent + "%", e[l].style.position = "absolute", 
            n.push(i), i += 100;
            k = n.concat(r), Velocity.Utilities.dequeue(e, t.effect);
        }
        // Update slides postion based on current slide postion
        /*function shiftSlides(array) {
			for(var i = 0; i < (settings.currentSlide); i++) {
				for(var j = 0; j < array.length; j++) {
					if(Math.floor(parseFloat(array[j].style.left) * 10000) === Math.floor(parseFloat(settings.minX) * 10000)) {
						array[j].style.left = parseFloat(settings.maxX) + '%';
					} else {
						array[j].style.left = (parseFloat(array[j].style.left) - settings.slideWidthPercent) + '%';
					}
				}
			}
		}*/
        // Create and trigger an event
        function v(e, t) {
            var i = {};
            document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !1)) : (i = document.createEventObject(), 
            i.eventType = t), i.eventName = t, document.createEvent ? e.dispatchEvent(i) : e.fireEvent("on" + i.eventType, i);
        }
        // Fills pager with empty spans based on total slides, adds active class to the first slide
        function p() {
            for (var e = 0; e < A.totalSlides; e++) {
                var t = document.createElement("span");
                A.pager.appendChild(t);
            }
            A.pagerSpans = A.pager.querySelectorAll(":scope > span"), r(A.pagerSpans[0], "fire-pager-active");
        }
        // Gets the index of a DOM element relative to it's parent element
        function g(e) {
            for (var t = -1, i = e.parentNode.childNodes, n = 0; n < i.length; n++) e === i[n] && (t = n);
            return t;
        }
        // Starts the timer
        function S() {
            M = setInterval(L, t.delay);
        }
        // Stops the timer
        function w() {
            clearInterval(M);
        }
        // Set up the inital state of fireSlider
        function m() {
            p(), // Check Breakpoints
            u(), A.slideWidthPercent = 1 / A.show * 100, A.slideWidth = A.sliderWidth / A.show;
            // Caluculate the multiplyer
            var e = f();
            c(N, e), // Set the first active slide
            A.currentSlide = 0, r(N[A.currentSlide], "fire-slider-active"), // position the elements of the array
            s(), h(N), v(X, "fire-slider-init");
        }
        // Refresh positions, breakpoints and slide count
        function y() {
            // Update breakpoints and width settings
            A.windowWidth = window.innerWidth, A.sliderWidth = X.offsetWidth, u(), A.slideWidthPercent = 1 / A.show * 100, 
            A.slideWidth = A.sliderWidth / A.show;
            var e = f();
            if (N.length !== e * A.totalSlides) {
                var t = o(N);
                // Unshift Temp[]
                //unshiftArray(temp, Math.floor(temp.length / 2));
                // Find index of active element, store the index and remove class
                //var index = getClassIndex(temp, "fire-slider-active");
                //removeClass(temp[index], 'fire-slider-active');
                // Multiply slides with new multiplier
                t = c(t, e), //addClass(newArr[index], 'fire-slider-active');
                // Shift newArr[]
                //var reshift = Math.floor(newArr.length / 2);
                //shiftArray(newArr, reshift);
                // Re-add active class and update active
                //settings.currentSlide = index;
                // Empty slider
                X.innerHTML = "", // Re-position Elements
                h(t), //shiftSlides(newArr);
                // Save new slides array
                N = t.slice();
                // Add new elements to slider
                var n = t.length;
                for (i = 0; n > i; i++) X.appendChild(t.shift());
            }
        }
        // Basic slide transition effect
        function W(e, i) {
            var n = 0;
            i.multiplier && (n = 100 * i.multiplier), Velocity(e, {
                translateX: i.oldPosition + "%"
            }, {
                duration: 0,
                queue: t.effect
            }), Velocity(e, {
                translateX: i.newPosition + "%"
            }, {
                duration: t.speed,
                queue: t.effect,
                begin: function() {
                    -1 === i.zIndex && (e.style.zIndex = -1);
                },
                complete: function() {
                    e.style.zIndex = "";
                }
            });
        }
        // Routes slide to correct transition
        function x(e, i) {
            switch (t.effect) {
              case "slideInOut":
                W(e, i);
                break;

              default:
                W(e, i);
            }
        }
        // Go to previous slide
        function E() {
            // Stop timer
            //pause();
            // Remove active classes
            l(N[A.currentSlide], "fire-slider-active"), l(A.pagerSpans[A.currentSlide % A.totalSlides], "fire-pager-active"), 
            A.currentSlide -= 1, A.currentSlide < 0 && (A.currentSlide = N.length - 1);
            // Calculate New Position
            for (var e = 0; e < N.length; e++) {
                var i = k.shift(), n = i + 100, a = 0;
                n < A.minX && (n = A.maxX, a = -1), n > A.maxX && (n = A.minX, a = -1), x(N[e], {
                    oldPosition: i,
                    newPosition: n,
                    zIndex: a
                }), k.push(n);
            }
            Velocity.Utilities.dequeue(N, t.effect), // Add active classes
            r(N[A.currentSlide], "fire-slider-active"), r(A.pagerSpans[A.currentSlide % A.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            v(X, "fire-slider-prev");
        }
        // Go to next slide
        function L() {
            // Stop timer
            //pause();
            // Remove active classes
            l(N[A.currentSlide], "fire-slider-active"), l(A.pagerSpans[A.currentSlide % A.totalSlides], "fire-pager-active"), 
            A.currentSlide += 1, A.currentSlide > N.length - 1 && (A.currentSlide = 0);
            // Calculate next position
            for (var e = 0; e < N.length; e++) {
                var i = k.shift(), n = i - 100, a = 0;
                n < A.minX && (n = A.maxX, a = -1), n > A.maxX && (n = A.minX, a = -1), x(N[e], {
                    oldPosition: i,
                    newPosition: n,
                    zIndex: a
                }), k.push(n);
            }
            Velocity.Utilities.dequeue(N, t.effect), // Add active classes
            r(N[A.currentSlide], "fire-slider-active"), r(A.pagerSpans[A.currentSlide % A.totalSlides], "fire-pager-active"), 
            // Trigger event fire-slider-prev
            v(X, "fire-slider-prev");
        }
        // Go to the slide relative to the index of a pager span
        function b(e) {
            var i = A.currentSlide % A.totalSlides, n = e - i;
            if (0 !== n) {
                // Stop Timer
                w();
                for (var a = X.querySelectorAll(":scope > " + t.slide), o = [], s = 0; s < a.length; s++) o.push(a[s].style.left);
                // Remove active classes
                var c = d(a, "fire-slider-active");
                // Using the difference, determine where the slides' next position will be and send to transition manager
                if (l(a[c], "fire-slider-active"), l(A.pagerSpans[A.currentSlide % A.totalSlides], "fire-pager-active"), 
                n > 0) {
                    for (s = n; s < a.length; s++) x(a[s], parseFloat(o.shift()), {
                        direction: "next",
                        multiplier: Math.abs(n)
                    });
                    for (s = 0; n > s; s++) x(a[s], parseFloat(o.shift()), {
                        direction: "next",
                        multiplier: Math.abs(n)
                    });
                } else {
                    for (s = a.length + n; s < a.length; s++) x(a[s], parseFloat(o.shift()), {
                        direction: "prev",
                        multiplier: Math.abs(n)
                    });
                    for (s = 0; s < a.length + n; s++) x(a[s], parseFloat(o.shift()), {
                        direction: "prev",
                        multiplier: Math.abs(n)
                    });
                }
                // Perform transitions
                Velocity.Utilities.dequeue(a, t.effect), // Set current slide
                A.currentSlide = (A.currentSlide + n) % a.length, // Add new active classes
                r(a[(A.currentSlide + Math.floor(a.length / 2)) % a.length], "fire-slider-active"), 
                r(A.pagerSpans[A.currentSlide % A.totalSlides], "fire-pager-active"), // Restart timer
                S();
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
        var X = document.querySelectorAll(e)[0], N = X.querySelectorAll(":scope > " + t.slide), M = {}, k = [], A = {
            show: t.show,
            active: t.active,
            prev: document.querySelectorAll(t.prev)[0],
            next: document.querySelectorAll(t.next)[0],
            pager: document.querySelectorAll(t.pager)[0],
            pagerSpans: [],
            totalSlides: N.length,
            windowWidth: window.innerWidth,
            sliderWidth: X.offsetWidth,
            slideWidth: X.offsetWidth / t.show,
            slideWidthPercent: 1 / t.show * 100,
            currentSlide: 0,
            minX: 0,
            maxX: 0
        };
        m(), // Click events
        A.next.addEventListener("click", function(e) {
            e.preventDefault(), L();
        }), A.prev.addEventListener("click", function(e) {
            e.preventDefault(), E();
        }), A.pager.addEventListener("click", function(e) {
            e.preventDefault(), "SPAN" === e.target.tagName && b(g(e.target));
        }), // Pause on hover events
        X.addEventListener("mouseover", function() {
            t.hoverPause && w();
        }), X.addEventListener("mouseout", function() {
            t.hoverPause && S();
        }), // Disable link interaction if slide is not active slide
        t.disableLinks && X.addEventListener("click", function(e) {
            "A" === e.target.tagName && (a(e.target.parentNode, "fire-slider-active") || e.preventDefault());
        }), // Window resize event
        window.addEventListener("resize", function() {
            y();
        });
    };
}(), // Example listeners
document.addEventListener("fire-slider-init", function() {}), document.addEventListener("fire-slider-next", function() {});