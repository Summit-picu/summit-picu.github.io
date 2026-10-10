/**
 * Summit Linux — seasonal overlays (FEST).
 *
 * HOW TO WIRE (HTML is owned by another agent — do NOT edit HTML here):
 *   Add after js/main.js, before </body> on every page:
 *     <script src="js/fest.js" defer></script>
 *   Then open ?fest=halloween or ?fest=newyear.
 *
 * What it does:
 *   - reads ?fest=halloween|newyear, sets html[data-fest],
 *   - dynamically loads css/fest-halloween.css or css/fest-newyear.css,
 *   - halloween: inserts div.fest-decor (inline-SVG web + pumpkin, decor only)
 *     + .fest-badge + autonomous leaves canvas (.fest-leaves-canvas,
 *     orange ellipses). Never touches main.js snow engine.
 *   - newyear: inserts div.garland (bulb spans) into .navbar + .fest-badge
 *     + autonomous second snow canvas (.fest-snow-extra, white circles).
 *     Never touches main.js snow engine.
 */
(() => {
	"use strict";

	const VALID = new Set(["halloween", "newyear"]);
	const CSS_FILE = {
		halloween: "fest-halloween.css",
		newyear: "fest-newyear.css",
	};

	function getFest() {
		try {
			const v = new URLSearchParams(window.location.search).get("fest");
			if (!v) return null;
			const key = v.trim().toLowerCase();
			return VALID.has(key) ? key : null;
		} catch (error) {
			return null;
		}
	}

	function cssHref(file) {
		try {
			const cur = document.currentScript;
			if (cur && cur.src) return new URL("../css/" + file, cur.src).href;
		} catch (error) {
			/* fall through */
		}
		return "css/" + file;
	}

	function loadCss(fest) {
		if (document.querySelector('link[data-fest-css="' + fest + '"]')) return;
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = cssHref(CSS_FILE[fest]);
		link.setAttribute("data-fest-css", fest);
		document.head.appendChild(link);
	}

	function reducedMotion() {
		return (
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
		);
	}

	function addBadge(fest) {
		if (document.querySelector(".fest-badge")) return;
		const badge = document.createElement("div");
		badge.className = "fest-badge";
		badge.setAttribute("aria-hidden", "true");
		badge.textContent =
			fest === "halloween" ? "Spooky season" : "Happy New Year";
		const hero = document.querySelector(".hero-content");
		if (hero) {
			hero.prepend(badge);
			return;
		}
		const main = document.querySelector("main");
		if (main) {
			main.prepend(badge);
			return;
		}
		document.body.prepend(badge);
	}

	function addGarland() {
		const navbar = document.querySelector(".navbar");
		if (!navbar || navbar.querySelector(".garland")) return;
		const garland = document.createElement("div");
		garland.className = "garland";
		garland.setAttribute("aria-hidden", "true");
		for (let i = 0; i < 24; i++) {
			garland.appendChild(document.createElement("span"));
		}
		navbar.appendChild(garland);
	}

	function addHalloweenDecor() {
		if (document.querySelector(".fest-decor")) return;
		const NS = "http://www.w3.org/2000/svg";
		const wrap = document.createElement("div");
		wrap.className = "fest-decor";
		wrap.setAttribute("aria-hidden", "true");

		const web = (cls, flip) => {
			const svg = document.createElementNS(NS, "svg");
			svg.setAttribute("width", "140");
			svg.setAttribute("height", "140");
			svg.setAttribute("viewBox", "0 0 140 140");
			svg.setAttribute("class", cls);
			const g = document.createElementNS(NS, "g");
			g.setAttribute("stroke", "rgba(200,180,220,0.7)");
			g.setAttribute("fill", "none");
			g.setAttribute("stroke-width", "1.5");
			if (flip) g.setAttribute("transform", "translate(140,0) scale(-1,1)");
			// spokes from corner (0,0)
			[
				[0, 0, 130, 20],
				[0, 0, 110, 60],
				[0, 0, 80, 100],
				[0, 0, 40, 125],
				[0, 0, 10, 132],
			].forEach((l) => {
				const p = document.createElementNS(NS, "line");
				p.setAttribute("x1", l[0]);
				p.setAttribute("y1", l[1]);
				p.setAttribute("x2", l[2]);
				p.setAttribute("y2", l[3]);
				g.appendChild(p);
			});
			// rings (quarter arcs)
			[30, 55, 80, 105, 128].forEach((r) => {
				const a = document.createElementNS(NS, "path");
				a.setAttribute("d", "M " + r + " 0 A " + r + " " + r + " 0 0 0 0 " + r);
				g.appendChild(a);
			});
			svg.appendChild(g);
			return svg;
		};

		const pumpkin = () => {
			const svg = document.createElementNS(NS, "svg");
			svg.setAttribute("width", "72");
			svg.setAttribute("height", "64");
			svg.setAttribute("viewBox", "0 0 72 64");
			svg.setAttribute("class", "fest-pumpkin");
			const body = document.createElementNS(NS, "ellipse");
			body.setAttribute("cx", "36");
			body.setAttribute("cy", "36");
			body.setAttribute("rx", "30");
			body.setAttribute("ry", "24");
			body.setAttribute("fill", "#e07b1a");
			svg.appendChild(body);
			[22, 36, 50].forEach((cx) => {
				const rib = document.createElementNS(NS, "ellipse");
				rib.setAttribute("cx", cx);
				rib.setAttribute("cy", "36");
				rib.setAttribute("rx", "9");
				rib.setAttribute("ry", "24");
				rib.setAttribute("fill", "none");
				rib.setAttribute("stroke", "#a34d00");
				rib.setAttribute("stroke-width", "2");
				svg.appendChild(rib);
			});
			const stem = document.createElementNS(NS, "rect");
			stem.setAttribute("x", "33");
			stem.setAttribute("y", "4");
			stem.setAttribute("width", "6");
			stem.setAttribute("height", "12");
			stem.setAttribute("rx", "2");
			stem.setAttribute("fill", "#1e9e6a");
			svg.appendChild(stem);
			[
				[26, 32],
				[46, 32],
			].forEach((c) => {
				const eye = document.createElementNS(NS, "polygon");
				eye.setAttribute(
					"points",
					c[0] +
						"," +
						(c[1] - 6) +
						" " +
						(c[0] - 5) +
						"," +
						(c[1] + 3) +
						" " +
						(c[0] + 5) +
						"," +
						(c[1] + 3),
				);
				eye.setAttribute("fill", "#1c0f00");
				svg.appendChild(eye);
			});
			const grin = document.createElementNS(NS, "path");
			grin.setAttribute(
				"d",
				"M 24 46 L 30 42 L 36 46 L 42 42 L 48 46 L 44 52 L 28 52 Z",
			);
			grin.setAttribute("fill", "#1c0f00");
			svg.appendChild(grin);
			return svg;
		};

		wrap.appendChild(web("fest-web-tl", false));
		wrap.appendChild(web("fest-web-tr", true));
		wrap.appendChild(pumpkin());
		document.body.appendChild(wrap);
	}

	// Light autonomous canvas: white circles (newyear extra snow).
	function startExtraSnow() {
		if (document.querySelector(".fest-snow-extra") || reducedMotion()) return;
		const isSmall = window.matchMedia?.("(max-width: 700px)").matches ?? false;
		const canvas = document.createElement("canvas");
		canvas.className = "fest-snow-extra";
		canvas.setAttribute("aria-hidden", "true");
		document.body.appendChild(canvas);
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let w = 0;
		let h = 0;
		let flakes = [];
		let raf = 0;
		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			w = window.innerWidth;
			h = window.innerHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = w + "px";
			canvas.style.height = h + "px";
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		const build = () => {
			const n = isSmall ? 40 : 80;
			flakes = Array.from({ length: n }, () => ({
				x: Math.random() * w,
				y: Math.random() * h,
				r: 1 + Math.random() * 2.5,
				s: 0.9 + Math.random() * 2.2,
				ph: Math.random() * Math.PI * 2,
				a: 0.3 + Math.random() * 0.45,
			}));
		};
		const step = () => {
			raf = 0;
			if (document.hidden) return;
			ctx.clearRect(0, 0, w, h);
			for (const f of flakes) {
				f.ph += 0.01;
				f.y += f.s;
				f.x += Math.cos(f.ph) * 0.5;
				if (f.y > h + 6) {
					f.y = -6;
					f.x = Math.random() * w;
				}
				if (f.x > w + 6) f.x = -6;
				else if (f.x < -6) f.x = w + 6;
				ctx.globalAlpha = f.a;
				ctx.fillStyle = "#ffffff";
				ctx.beginPath();
				ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalAlpha = 1;
			raf = requestAnimationFrame(step);
		};
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				if (raf) cancelAnimationFrame(raf);
				raf = 0;
			} else if (!raf) raf = requestAnimationFrame(step);
		});
		let t = 0;
		window.addEventListener("resize", () => {
			window.clearTimeout(t);
			t = window.setTimeout(() => {
				resize();
				build();
			}, 150);
		});
		resize();
		build();
		raf = requestAnimationFrame(step);
	}

	// Autonomous canvas: falling orange leaves (halloween).
	function startLeaves() {
		if (document.querySelector(".fest-leaves-canvas") || reducedMotion())
			return;
		const isSmall = window.matchMedia?.("(max-width: 700px)").matches ?? false;
		const canvas = document.createElement("canvas");
		canvas.className = "fest-leaves-canvas";
		canvas.setAttribute("aria-hidden", "true");
		document.body.appendChild(canvas);
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const COLORS = ["#e07b1a", "#ff8c1a", "#c81e3a", "#d9b04c"];
		let w = 0;
		let h = 0;
		let leaves = [];
		let raf = 0;
		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			w = window.innerWidth;
			h = window.innerHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = w + "px";
			canvas.style.height = h + "px";
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		const build = () => {
			const n = isSmall ? 30 : 60;
			leaves = Array.from({ length: n }, () => ({
				x: Math.random() * w,
				y: Math.random() * h,
				rx: 3 + Math.random() * 4,
				ry: 2 + Math.random() * 3,
				s: 0.8 + Math.random() * 1.8,
				ph: Math.random() * Math.PI * 2,
				rot: Math.random() * Math.PI * 2,
				vr: (Math.random() - 0.5) * 0.05,
				c: COLORS[(Math.random() * COLORS.length) | 0],
				a: 0.55 + Math.random() * 0.35,
			}));
		};
		const step = () => {
			raf = 0;
			if (document.hidden) return;
			ctx.clearRect(0, 0, w, h);
			for (const l of leaves) {
				l.ph += 0.012;
				l.rot += l.vr;
				l.y += l.s;
				l.x += Math.cos(l.ph) * 0.7;
				if (l.y > h + 8) {
					l.y = -8;
					l.x = Math.random() * w;
				}
				if (l.x > w + 8) l.x = -8;
				else if (l.x < -8) l.x = w + 8;
				ctx.save();
				ctx.globalAlpha = l.a;
				ctx.translate(l.x, l.y);
				ctx.rotate(l.rot);
				ctx.fillStyle = l.c;
				ctx.beginPath();
				ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}
			ctx.globalAlpha = 1;
			raf = requestAnimationFrame(step);
		};
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				if (raf) cancelAnimationFrame(raf);
				raf = 0;
			} else if (!raf) raf = requestAnimationFrame(step);
		});
		let t = 0;
		window.addEventListener("resize", () => {
			window.clearTimeout(t);
			t = window.setTimeout(() => {
				resize();
				build();
			}, 150);
		});
		resize();
		build();
		raf = requestAnimationFrame(step);
	}

	function init() {
		const fest = getFest();
		if (!fest) return; // no ?fest — leave page untouched
		document.documentElement.setAttribute("data-fest", fest);
		loadCss(fest);
		addBadge(fest);
		if (fest === "newyear") {
			addGarland();
			startExtraSnow();
		} else {
			addHalloweenDecor();
			startLeaves();
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init, { once: true });
	} else {
		init();
	}
})();
