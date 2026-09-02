/* Summit Linux — small UI behaviours: mobile nav + scroll reveal. */

(function () {
    "use strict";

    function setupMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".nav");

        if (!toggle || !nav) return;

        toggle.addEventListener("click", function (event) {
            event.stopPropagation();
            var open = nav.classList.toggle("nav-open");
            toggle.classList.toggle("is-active", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });

        nav.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
                nav.classList.remove("nav-open");
                toggle.classList.remove("is-active");
                toggle.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", function (event) {
            if (!nav.contains(event.target) && !toggle.contains(event.target)) {
                nav.classList.remove("nav-open");
                toggle.classList.remove("is-active");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    function setupScrollReveal() {
        var targets = document.querySelectorAll(
            ".card, .heading, .hero-content, .article > *, .content-layout"
        );

        if (!("IntersectionObserver" in window) || targets.length === 0) {
            targets.forEach(function (el) {
                el.classList.add("visible");
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        targets.forEach(function (el, index) {
            el.classList.add("reveal");
            el.style.transitionDelay = Math.min(index % 6, 5) * 60 + "ms";
            observer.observe(el);
        });
    }

    function setupHeaderScrollState() {
        var header = document.querySelector(".header");
        if (!header) return;

        function update() {
            header.classList.toggle("is-scrolled", window.scrollY > 12);
        }

        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNav();
        setupScrollReveal();
        setupHeaderScrollState();
    });
})();
