/**
 * Summit Linux — shared page interactions.
 *
 * Handles the mobile navigation, reveal animations, snowfall, header state,
 * matte dark theme (DARK-V2), smooth anchors and header shortcuts.
 */
(() => {
	"use strict";

	const THEME_KEY = "summit-theme";

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

		// Close on menu item click.
		nav.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => closeMobileNav(nav, toggle));
		});

		// Close on outside click.
		document.addEventListener("click", (event) => {
			if (!nav.contains(event.target) && !toggle.contains(event.target)) {
				closeMobileNav(nav, toggle);
			}
		});

		// Close on Escape.
		document.addEventListener("keydown", (event) => {
			if (event.key !== "Escape") return;
			if (!nav.classList.contains("nav-open")) return;
			closeMobileNav(nav, toggle);
			toggle.focus?.();
		});

		// Reset state when leaving mobile breakpoint (CSS hides the panel).
		window.addEventListener(
			"resize",
			() => {
				if (window.matchMedia?.("(min-width: 761px)").matches ?? false) {
					closeMobileNav(nav, toggle);
				}
			},
			{ passive: true },
		);
	}

	function setupScrollReveal() {
		const targets = document.querySelectorAll(
			".card, .news-card, .heading, .hero-content, .article > *, .content-layout",
		);

		if (!targets.length) return;

		if (!("IntersectionObserver" in window)) {
			targets.forEach((element) => {
				element.classList.add("visible");
			});
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
			// Stagger: per-card delay inside grids, capped so long lists stay snappy.
			const inGrid = element.closest?.(".grid, .news-grid") ? 1 : 0;
			const slot = inGrid
				? Array.prototype.indexOf.call(
						element.parentElement?.children ?? [],
						element,
					)
				: index;
			const safeSlot = slot < 0 ? index % 6 : slot % 6;
			element.style.transitionDelay = `${Math.min(safeSlot, 5) * 60}ms`;
			observer.observe(element);
		});
	}

	function setupSmoothAnchors() {
		// CSS scroll-behavior handles the animation; JS only guards
		// reduced-motion and missing targets. No hijack of normal anchors.
		document.querySelectorAll('a[href^="#"]').forEach((link) => {
			link.addEventListener("click", (event) => {
				const id = link.getAttribute("href");
				if (!id || id.length < 2) return;
				const target = document.querySelector(id);
				if (!target) return;
				event.preventDefault();
				const reduced =
					window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
					false;
				target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
				if (target instanceof HTMLElement) {
					target.setAttribute("tabindex", "-1");
					target.focus({ preventScroll: true });
				}
			});
		});
	}

	function setupSnowfall() {
		// Single-engine snow: the canvas owns all flakes (perf + click-through).
		// The CSS-span layer stays disabled so two engines never run at once.
		const layer = document.querySelector(".snow-overlay");
		if (!layer) return;
		layer.innerHTML = "";
	}

	function setupSnowDeferred() {
		// Lazy snow: start after first paint / load so LCP is not blocked.
		const start = () => setupSnowCanvas();
		if (document.readyState === "complete") {
			if ("requestIdleCallback" in window) {
				window.requestIdleCallback(start, { timeout: 800 });
			} else {
				window.setTimeout(start, 60);
			}
			return;
		}
		window.addEventListener(
			"load",
			() => {
				if ("requestIdleCallback" in window) {
					window.requestIdleCallback(start, { timeout: 800 });
				} else {
					window.setTimeout(start, 60);
				}
			},
			{ once: true },
		);
		// Fallback if load hangs (slow trackers): start anyway after 4s.
		window.setTimeout(() => {
			if (!document.querySelector(".snow-canvas")) start();
		}, 4000);
	}

	function setupSnowCanvas() {
		if (document.querySelector(".snow-canvas")) return;
		if (
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
			false
		) {
			return;
		}

		// Perf budget: DPR<=1.5, desktop 160 / small 80 / coarse 80
		// flakes, sprites instead of per-frame gradients, hidden-pause.
		const isCoarse =
			window.matchMedia?.("(hover: none)").matches ??
			(false || "ontouchstart" in window);
		const isSmall = window.matchMedia?.("(max-width: 700px)").matches ?? false;

		const canvas = document.createElement("canvas");
		canvas.className = "snow-canvas";
		canvas.setAttribute("aria-hidden", "true");
		// Defense: canvas must stay a plain fixed layer (no own stacking ctx).
		canvas.style.opacity = "1";
		canvas.style.filter = "none";
		canvas.style.transform = "none";
		document.body.appendChild(canvas);

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const RADIUS = 120;
		let width = 0;
		let height = 0;
		let flakes = [];
		let running = true;
		let raf = 0;

		const pointer = { x: -9999, y: -9999 };

		const flakeCount = () => {
			if (isCoarse || isSmall) return 80;
			return 160;
		};

		// --- pre-rendered sprites: one gradient each, drawn via drawImage.
		function makeSprite(size, draw) {
			const off = document.createElement("canvas");
			off.width = size;
			off.height = size;
			const c = off.getContext("2d");
			if (!c) return null;
			draw(c, size);
			return off;
		}
		const circleSprite = makeSprite(64, (c, s) => {
			const g = c.createRadialGradient(
				s * 0.42,
				s * 0.42,
				s * 0.05,
				s / 2,
				s / 2,
				s / 2,
			);
			g.addColorStop(0, "#ffffff");
			g.addColorStop(0.55, "rgba(255, 255, 255, 0.85)");
			g.addColorStop(1, "rgba(217, 236, 244, 0)");
			c.fillStyle = g;
			c.beginPath();
			c.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
			c.fill();
		});

		function resize() {
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		function buildFlakes() {
			const count = flakeCount();
			flakes = Array.from({ length: count }, () => {
				// Dense soft flakes: round sprites, radius 1.5–5,
				// medium sway, alpha up to 0.75.
				const r = 1.5 + Math.random() * 3.5;
				return {
					x: Math.random() * width,
					y: Math.random() * height,
					r,
					size: r * 2,
					sprite: circleSprite,
					speed: 0.8 + Math.random() * 2.4,
					phase: Math.random() * Math.PI * 2,
					sway: 0.8 + Math.random() * 1.8,
					alpha: 0.25 + Math.random() * 0.5,
					vx: 0,
					vy: 0,
				};
			});
		}

		function step() {
			raf = 0;
			if (!running || document.hidden) return; // paused — restart via visibility handler

			ctx.clearRect(0, 0, width, height);

			const pointerOnScreen = pointer.x > -9000 && !isCoarse;

			for (const flake of flakes) {
				flake.phase += 0.008 + flake.speed * 0.004;
				flake.y += flake.speed + flake.vy;
				flake.x += Math.cos(flake.phase) * 0.6 * flake.sway + flake.vx;

				if (pointerOnScreen) {
					const dx = flake.x - pointer.x;
					const dy = flake.y - pointer.y;
					if (dx < RADIUS && dx > -RADIUS && dy < RADIUS && dy > -RADIUS) {
						const dist = Math.hypot(dx, dy);
						if (dist < RADIUS && dist > 0.5) {
							const force = (RADIUS - dist) / RADIUS;
							flake.vx += (dx / dist) * force * 0.7;
							flake.vy += (dy / dist) * force * 0.7;
						}
					}
				}

				flake.vx *= 0.94;
				flake.vy *= 0.94;

				if (flake.y > height + 8) {
					flake.y = -8;
					flake.x = Math.random() * width;
					flake.vx = 0;
					flake.vy = 0;
				} else if (flake.y < -10) {
					flake.y = height + 8;
				}

				if (flake.x > width + 8) flake.x = -8;
				else if (flake.x < -8) flake.x = width + 8;

				const a = flake.alpha > 0.75 ? 0.75 : flake.alpha;
				ctx.globalAlpha = a;
				if (flake.sprite) {
					const s = flake.size;
					ctx.drawImage(flake.sprite, flake.x - s / 2, flake.y - s / 2, s, s);
				} else {
					ctx.fillStyle = "#ffffff";
					ctx.beginPath();
					ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			ctx.globalAlpha = 1;
			raf = requestAnimationFrame(step);
		}

		function kick() {
			if (raf || !running || document.hidden) return;
			raf = requestAnimationFrame(step);
		}

		// Desktop only: pointer repulsion. Touch/coarse skipped (no scroll jank).
		if (!isCoarse) {
			window.addEventListener(
				"pointermove",
				(event) => {
					pointer.x = event.clientX;
					pointer.y = event.clientY;
				},
				{ passive: true },
			);
			document.addEventListener("pointerleave", () => {
				pointer.x = -9999;
				pointer.y = -9999;
			});
		}
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				running = false;
				if (raf) {
					cancelAnimationFrame(raf);
					raf = 0;
				}
			} else {
				running = true;
				kick();
			}
		});

		let resizeTimer = 0;
		window.addEventListener("resize", () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				resize();
				buildFlakes();
			}, 150);
		});

		resize();
		buildFlakes();
		kick();
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

	function setupLangDropdown() {
		const dropdowns = document.querySelectorAll(".lang-dropdown");
		if (!dropdowns.length) return;

		const closeAllLang = () => {
			document.querySelectorAll(".lang-dropdown.open").forEach((dropdown) => {
				dropdown.classList.remove("open");
				dropdown
					.querySelector(".lang-btn")
					?.setAttribute("aria-expanded", "false");
			});
		};

		const rememberLang = (code) => {
			try {
				if (code) window.localStorage.setItem("summit-lang", code);
			} catch (error) {
				/* storage unavailable */
			}
		};

		dropdowns.forEach((dropdown) => {
			const btn = dropdown.querySelector(".lang-btn");
			if (!btn) return;

			btn.addEventListener("click", (event) => {
				event.stopPropagation();
				const wasOpen = dropdown.classList.contains("open");
				closeAllLang();
				dropdown.classList.toggle("open", !wasOpen);
				btn.setAttribute("aria-expanded", String(!wasOpen));
			});

			dropdown.querySelectorAll(".lang-item").forEach((item) => {
				item.addEventListener("click", (event) => {
					if (item.hasAttribute("data-lang")) {
						event.preventDefault();
						const code = item.getAttribute("data-lang");
						rememberLang(code);
						flashToast("Translation coming soon — showing English");
						const enLink = dropdown.querySelector(
							".lang-item:not([data-lang])",
						);
						const href = enLink?.getAttribute("href");
						closeAllLang();
						if (href)
							window.setTimeout(() => window.location.assign(href), 900);
						return;
					}
					rememberLang(item.getAttribute("href") || item.textContent.trim());
				});
			});
		});

		document.addEventListener("click", (event) => {
			if (!event.target.closest?.(".lang-dropdown")) closeAllLang();
		});

		document.addEventListener("keydown", (event) => {
			if (event.key !== "Escape") return;
			closeAllLang();
		});
	}

	// ---- DARK-V2 theme: matte night in the light hue, no neon/glow. ----
	function getStoredTheme() {
		try {
			const saved = window.localStorage.getItem(THEME_KEY);
			if (saved === "dark" || saved === "light") return saved;
		} catch (error) {
			/* storage unavailable */
		}
		return null;
	}

	function getPreferredTheme() {
		const stored = getStoredTheme();
		if (stored) return stored;
		// No enforce-light on first visit: respect OS preference.
		if (window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false) {
			return "dark";
		}
		return "light";
	}

	function swapIcons(theme) {
		// Dark SVG swap: img.inline-icon[src$='.svg'] without -dark toggles to
		// *-dark.svg in dark theme and back in light. Files are created by
		// another agent — if a *-dark.svg is missing, Image() onerror keeps
		// the old src and the CSS filter fallback still inverts the icon.
		try {
			const dark = theme === "dark";
			const imgs = document.querySelectorAll('img.inline-icon[src$=".svg"]');
			imgs.forEach((img) => {
				const current = img.getAttribute("src") || "";
				if (!current) return;
				if (!img.dataset.lightSrc) {
					if (/-dark\.svg(?=[?#]|$)/i.test(current)) {
						img.dataset.lightSrc = current.replace(
							/-dark\.svg(?=[?#]|$)/i,
							".svg",
						);
					} else {
						img.dataset.lightSrc = current;
					}
				}
				const lightSrc = img.dataset.lightSrc;
				if (dark) {
					if (/-dark\.svg(?=[?#]|$)/i.test(current)) return;
					const candidate = lightSrc.replace(/\.svg(?=[?#]|$)/i, "-dark.svg");
					if (candidate === current) return;
					const probe = new Image();
					probe.onload = () => {
						if (img.isConnected) img.setAttribute("src", candidate);
					};
					probe.onerror = () => {
						/* missing *-dark.svg — CSS filter fallback covers it */
					};
					probe.src = candidate;
				} else {
					if (current !== lightSrc) img.setAttribute("src", lightSrc);
				}
			});
		} catch (error) {
			/* icon swap unavailable */
		}
	}

	function applyTheme(theme, animate = true) {
		const next = theme === "dark" ? "dark" : "light";
		const root = document.documentElement;
		root.setAttribute("data-theme", next);
		root.style.colorScheme = next;
		if (animate) {
			root.classList.add("theme-anim");
			window.clearTimeout(applyTheme.timer);
			applyTheme.timer = window.setTimeout(() => {
				root.classList.remove("theme-anim");
			}, 450);
		}
		syncThemeToggle(next);
		swapIcons(next);
		try {
			window.localStorage.setItem(THEME_KEY, next);
		} catch (error) {
			/* storage unavailable */
		}
	}
	applyTheme.timer = 0;

	function syncThemeToggle(theme) {
		const btn = document.querySelector(".theme-toggle");
		if (!btn) return;
		const isDark = theme === "dark";
		btn.setAttribute("aria-pressed", String(isDark));
		btn.setAttribute(
			"aria-label",
			isDark ? "Switch to light theme" : "Switch to dark theme",
		);
		btn.setAttribute("title", isDark ? "Light theme (t)" : "Dark theme (t)");
		const icon = btn.querySelector(".theme-toggle-icon");
		if (icon) icon.textContent = isDark ? "☀" : "☾";
	}

	function toggleTheme() {
		const current = document.documentElement.getAttribute("data-theme");
		const next = current === "dark" ? "light" : "dark";
		applyTheme(next, true);
		swapIcons(next);
	}

	function setupThemeToggle() {
		// Apply stored/OS theme ASAP (no forced light on first visit).
		applyTheme(getPreferredTheme(), false);
		swapIcons(document.documentElement.getAttribute("data-theme"));

		let button = document.querySelector(".theme-toggle");
		if (!button) {
			// Spec: the toggle lives inside .nav (fallback: .navbar).
			const host =
				document.querySelector(".nav") ?? document.querySelector(".navbar");
			if (!host) return;
			button = document.createElement("button");
			button.type = "button";
			button.className = "theme-toggle";
			button.setAttribute("aria-pressed", "false");
			const icon = document.createElement("span");
			icon.className = "theme-toggle-icon";
			icon.setAttribute("aria-hidden", "true");
			icon.textContent = "☾";
			button.append(icon);
			host.append(button);
		}
		syncThemeToggle(document.documentElement.getAttribute("data-theme"));

		if (button.hasAttribute("data-theme-bound")) return;
		button.setAttribute("data-theme-bound", "true");
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			toggleTheme();
		});

		// Follow OS changes only while the user has no saved choice.
		try {
			window
				.matchMedia?.("(prefers-color-scheme: dark)")
				?.addEventListener?.("change", (event) => {
					if (getStoredTheme()) return;
					applyTheme(event.matches ? "dark" : "light", true);
				});
		} catch (error) {
			/* listener unavailable */
		}
	}

	function setupToTop() {
		if (document.querySelector(".to-top")) return;

		const button = document.createElement("button");
		button.type = "button";
		button.className = "to-top";
		button.setAttribute("aria-label", "Scroll to top");
		button.setAttribute("title", "Back to top");
		button.textContent = "↑";
		button.addEventListener("click", () => {
			const reduced =
				window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
				false;
			window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
		});
		document.body.append(button);

		const update = () => {
			button.classList.toggle("is-visible", window.scrollY > 600);
		};
		update();
		window.addEventListener("scroll", update, { passive: true });
	}

	const HERO_LINES = [
		"$ picu sync",
		"[ OK ] fetching repositories",
		"[ OK ] verifying signatures",
		"[ OK ] sync completed successfully",
	];

	function typeHero() {
		// Hero typing runs ONLY into .code-write. No .code-write — no autoprint.
		const target = document.querySelector(".code-write");
		if (!target || target.hasAttribute("data-typing-done")) return;
		if (
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
			false
		) {
			target.textContent = HERO_LINES.join("\n");
			target.setAttribute("data-typing-done", "true");
			return;
		}

		if (target.textContent.trim().length > 0) return; // existing content — keep it
		target.setAttribute("data-typing", "true");
		target.setAttribute("data-typing-done", "true");

		const typed = document.createElement("span");
		typed.className = "hero-typed";
		const caret = document.createElement("span");
		caret.className = "typing-caret";
		caret.setAttribute("aria-hidden", "true");
		target.replaceChildren(typed, caret);

		const fullText = HERO_LINES.join("\n");
		let index = 0;
		const tick = () => {
			index += 1;
			typed.textContent = fullText.slice(0, index);
			if (index < fullText.length) {
				window.setTimeout(tick, fullText[index - 1] === "\n" ? 240 : 34);
			}
		};
		window.setTimeout(tick, 650);
	}

	function setupPreloader() {
		let preloader = document.querySelector(".preloader");
		if (!preloader) {
			preloader = document.createElement("div");
			preloader.className = "preloader";
			preloader.setAttribute("aria-hidden", "true");
			const ring = document.createElement("div");
			ring.className = "preloader-ring";
			preloader.append(ring);
			document.body.append(preloader);
		}

		let hidden = false;
		const hide = () => {
			if (hidden || !preloader.isConnected) return;
			hidden = true;
			preloader.classList.add("is-hidden");
			window.setTimeout(() => preloader.remove(), 600);
		};

		if (document.readyState === "complete") {
			hide();
		} else {
			window.addEventListener("load", hide, { once: true });
			window.setTimeout(hide, 4000); // fallback if load hangs
		}
	}

	function getToast() {
		let toast = document.querySelector(".copy-toast");
		if (!toast) {
			toast = document.createElement("div");
			toast.className = "copy-toast";
			toast.setAttribute("role", "status");
			document.body.append(toast);
		}
		return toast;
	}
	function flashToast(message) {
		const toast = getToast();
		toast.textContent = message;
		toast.classList.add("is-visible");
		window.clearTimeout(flashToast.timer);
		flashToast.timer = window.setTimeout(() => {
			toast.classList.remove("is-visible");
		}, 1600);
	}
	flashToast.timer = 0;

	function showCopyToast() {
		flashToast("copied");
	}

	function copyTerminal() {
		document.querySelectorAll(".terminal[data-copy]").forEach((terminal) => {
			if (terminal.querySelector(".copy-btn")) return;

			const button = document.createElement("button");
			button.type = "button";
			button.className = "copy-btn";
			button.textContent = "Copy";
			button.setAttribute("aria-label", "Copy code to clipboard");
			button.addEventListener("click", async () => {
				const pre = terminal.querySelector("pre");
				const text = pre ? pre.innerText : terminal.innerText;
				try {
					if (navigator.clipboard?.writeText) {
						await navigator.clipboard.writeText(text);
					} else {
						throw new Error("clipboard API unavailable");
					}
				} catch (error) {
					const area = document.createElement("textarea");
					area.value = text;
					area.setAttribute("aria-hidden", "true");
					document.body.append(area);
					area.select();
					document.execCommand("copy");
					area.remove();
				}
				button.textContent = "copied ✓";
				showCopyToast();
				window.setTimeout(() => {
					button.textContent = "Copy";
				}, 1600);
			});
			terminal.append(button);
		});
	}

	function setupFaq() {
		const items = document.querySelectorAll("details.faq");
		if (!items.length) return;
		items.forEach((item) => {
			item.addEventListener("toggle", () => {
				if (!item.open || !item.parentElement) return;
				item.parentElement
					.querySelectorAll("details.faq[open]")
					.forEach((other) => {
						if (other !== item) other.open = false;
					});
			});
		});
	}

	function setupShortcuts() {
		// Clean names + ?lang=: current language comes from the query string
		// first, then the persisted summit-lang choice (Chrome-first i18n).
		const params = new URLSearchParams(window.location.search);
		const stored = (() => {
			try {
				return window.localStorage.getItem("summit-lang");
			} catch (error) {
				return null;
			}
		})();
		const lang = params.get("lang") === "ru" || stored === "ru" ? "ru" : "en";
		const suffix = `?lang=${lang}`;
		const routes = {
			h: `index.html${suffix}`,
			d: `download.html${suffix}`,
			p: `picu-new.html${suffix}`,
			n: `news.html${suffix}`,
			w: `wiki.html${suffix}`,
		};

		let pendingG = false;
		let gTimer = 0;

		document.addEventListener("keydown", (event) => {
			const target = event.target;
			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement ||
				(target instanceof HTMLElement && target.isContentEditable)
			) {
				return;
			}
			if (event.ctrlKey || event.metaKey || event.altKey) return;

			// Theme shortcut: t toggles matte dark / light (DARK-V2).
			if (
				event.key === "t" ||
				event.key === "T" ||
				event.key === "е" ||
				event.key === "Е"
			) {
				if (!pendingG) {
					event.preventDefault();
					toggleTheme();
					return;
				}
			}

			if (pendingG) {
				pendingG = false;
				window.clearTimeout(gTimer);
				const page = routes[event.key.toLowerCase()];
				if (page) {
					event.preventDefault();
					window.location.assign(page);
				}
				return;
			}

			if (event.key === "g") {
				pendingG = true;
				gTimer = window.setTimeout(() => {
					pendingG = false;
				}, 800);
			} else if (event.key === "/") {
				const search = document.querySelector(
					'input[type="search"], .search-input',
				);
				if (search instanceof HTMLElement) {
					event.preventDefault();
					search.focus();
				}
			}
		});
	}

	document.addEventListener("DOMContentLoaded", () => {
		setupMobileNavigation();
		setupScrollReveal();
		setupSmoothAnchors();
		setupHeaderScrollState();
		setupSnowfall();
		setupSnowDeferred();
		setupLangDropdown();
		setupThemeToggle();
		setupToTop();
		typeHero();
		setupPreloader();
		copyTerminal();
		setupFaq();
		setupShortcuts();
	});
})();
