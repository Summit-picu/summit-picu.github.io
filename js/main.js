/**
 * Summit Linux — shared page interactions.
 *
 * Handles the mobile navigation, reveal animations, snowfall, and header state.
 */
(() => {
    "use strict";

    const closeMobileNav = (nav, toggle) => {
        nav.classList.remove("nav-open");
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-expanded", "false");
    };

    function setupMobileNavigation() {
        const toggle = document.querySelector(".nav-toggle");
        const nav = document.querySelector(".nav");

        if (!toggle || !nav) return;

        toggle.addEventListener("click", (event) => {
            event.stopPropagation();

            const isOpen = nav.classList.toggle("nav-open");
            toggle.classList.toggle("is-active", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => closeMobileNav(nav, toggle));
        });

        document.addEventListener("click", (event) => {
            if (!nav.contains(event.target) && !toggle.contains(event.target)) {
                closeMobileNav(nav, toggle);
            }
        });
    }

    function setupScrollReveal() {
        const targets = document.querySelectorAll(
            ".card, .heading, .hero-content, .article > *, .content-layout",
        );

        if (!targets.length) return;

        if (!("IntersectionObserver" in window)) {
            targets.forEach((element) => element.classList.add("visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px",
            },
        );

        targets.forEach((element, index) => {
            element.classList.add("reveal");
            element.style.transitionDelay = `${Math.min(index % 6, 5) * 60}ms`;
            observer.observe(element);
        });
    }

    function setupSnowfall() {
        const layer = document.querySelector(".snow-overlay");
        if (!layer) return;

        const isMobile =
            window.matchMedia?.("(max-width: 700px)").matches ?? false;
        const count = isMobile ? 42 : 72;
        const fragment = document.createDocumentFragment();

        for (let index = 0; index < count; index += 1) {
            const flake = document.createElement("span");

            flake.style.setProperty("--l", `${(Math.random() * 100).toFixed(2)}%`);
            flake.style.setProperty(
                "--size",
                `${(2.5 + Math.random() * 4.5).toFixed(1)}px`,
            );
            flake.style.setProperty(
                "--dur",
                `${(8 + Math.random() * 11).toFixed(1)}s`,
            );
            flake.style.setProperty(
                "--delay",
                `${(-Math.random() * 18).toFixed(1)}s`,
            );
            flake.style.setProperty(
                "--op",
                (0.25 + Math.random() * 0.45).toFixed(2),
            );
            flake.style.setProperty(
                "--drift",
                `${(Math.random() * 70 - 35).toFixed(1)}px`,
            );

            fragment.appendChild(flake);
        }

        layer.appendChild(fragment);
    }

    function setupHeaderScrollState() {
        const header = document.querySelector(".header");
        if (!header) return;

        const update = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 12);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupMobileNavigation();
        setupScrollReveal();
        setupHeaderScrollState();
        setupSnowfall();
    });
})();
