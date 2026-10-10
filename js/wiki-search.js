/**
 * Summit Linux — dependency-free live search for wiki articles.
 *
 * Wiring (added in wiki-*.html):
 *   <div class="wiki-search-wrap">
 *     <input class="wiki-search" type="search" ... />
 *     <div class="search-results" hidden></div>
 *   </div>
 * placed as the first child of .article, plus:
 *   <script src="js/wiki-search.js"></script>
 *
 * Behaviour:
 * - index built from h2/h3 + following paragraph text
 * - live filtering, match highlight via mark.search-hit
 * - click navigates (smooth scroll) to the anchored heading
 * - Enter jumps to the first result, Escape clears
 * - pre/code/.terminal content is never indexed
 */
(() => {
	"use strict";

	const esc = (s) =>
		String(s).replace(/[&<>"']/g, (c) => ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		}[c]));

	const hi = (text, q) => {
		if (!q) return esc(text);
		const idx = text.toLowerCase().indexOf(q);
		if (idx < 0) return esc(text);
		return (
			esc(text.slice(0, idx)) +
			'<mark class="search-hit">' +
			esc(text.slice(idx, idx + q.length)) +
			"</mark>" +
			esc(text.slice(idx + q.length))
		);
	};

	const slugify = (s) =>
		s
			.toLowerCase()
			.replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff\u4e00-\u9fff]+/gi, "-")
			.replace(/^-+|-+$/g, "") || "section";

	const snippetFor = (heading) => {
		let el = heading.nextElementSibling;
		let guard = 0;
		while (el && guard++ < 8) {
			if (el.matches && el.matches("h2, h3")) break;
			if (el.matches && el.matches("p") && el.textContent.trim()) {
				const t = el.textContent.trim().replace(/\s+/g, " ");
				return t.length > 160 ? t.slice(0, 157) + "…" : t;
			}
			if (el.matches && el.matches("li, .callout") && el.textContent.trim()) {
				const t = el.textContent.trim().replace(/\s+/g, " ");
				return t.length > 160 ? t.slice(0, 157) + "…" : t;
			}
			el = el.nextElementSibling;
		}
		return "";
	};

	const emptyText = (input) =>
		input.getAttribute("data-empty") ||
		input.getAttribute("placeholder") ||
		"No results";

	function init(article) {
		let wrap = article.querySelector(":scope > .wiki-search-wrap");
		let input = wrap ? wrap.querySelector("input.wiki-search") : null;
		let box = wrap ? wrap.querySelector("div.search-results") : null;
		if (!input || !box) return;

		// Build index from headings (skip anything inside pre/code).
		const heads = Array.from(article.querySelectorAll("h2, h3")).filter(
			(h) => !h.closest("pre, code, .terminal"),
		);
		const index = heads.map((h) => {
			if (!h.id) h.id = slugify(h.textContent);
			return { id: h.id, el: h, title: h.textContent.trim().replace(/\s+/g, " "), snippet: snippetFor(h) };
		});

		let active = -1;

		const clearMarks = () => {
			article.querySelectorAll("mark.search-hit").forEach((m) => {
				const t = document.createTextNode(m.textContent);
				m.replaceWith(t);
			});
		};

		const hide = () => {
			box.hidden = true;
			box.innerHTML = "";
			active = -1;
		};

		const go = (id) => {
			const t = document.getElementById(id);
			if (!t) return;
			try {
				history.replaceState(null, "", "#" + id);
			} catch (e) {}
			t.setAttribute("tabindex", "-1");
			t.scrollIntoView({ behavior: "smooth", block: "start" });
			try {
				t.focus({ preventScroll: true });
			} catch (e) {}
		};

		const render = (q) => {
			const query = q.trim().toLowerCase();
			if (query.length < 2) {
				hide();
				return;
			}
			const hits = index
				.filter(
					(it) =>
						it.title.toLowerCase().includes(query) ||
						it.snippet.toLowerCase().includes(query),
				)
				.slice(0, 12);
			active = hits.length ? 0 : -1;
			if (!hits.length) {
				box.hidden = false;
				box.innerHTML =
					'<div class="search-empty">' + esc(emptyText(input)) + "</div>";
				return;
			}
			box.hidden = false;
			box.innerHTML = hits
				.map(
					(it, i) =>
						'<a class="search-item' +
						(i === active ? " is-active" : "") +
						'" href="#' +
						esc(it.id) +
						'" data-target="' +
						esc(it.id) +
						'"><span class="search-title result-title">' +
						hi(it.title, query) +
						'</span><span class="search-snippet result-snippet">' +
						hi(it.snippet, query) +
						"</span></a>",
				)
				.join("");
		};

		input.addEventListener("input", () => render(input.value));
		input.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				input.value = "";
				hide();
				input.blur();
			} else if (e.key === "Enter") {
				const first = box.querySelector("a.search-item");
				if (first) {
					e.preventDefault();
					go(first.getAttribute("data-target"));
					hide();
				}
			} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				const items = Array.from(box.querySelectorAll("a.search-item"));
				if (!items.length) return;
				e.preventDefault();
				active =
					e.key === "ArrowDown"
						? (active + 1) % items.length
						: (active - 1 + items.length) % items.length;
				items.forEach((a, i) => a.classList.toggle("is-active", i === active));
				items[active].scrollIntoView({ block: "nearest" });
			}
		});
		box.addEventListener("click", (e) => {
			const a = e.target.closest ? e.target.closest("a.search-item") : null;
			if (!a) return;
			e.preventDefault();
			go(a.getAttribute("data-target"));
			hide();
		});
		document.addEventListener("click", (e) => {
			if (!wrap.contains(e.target)) hide();
			else if (input.value.trim().length >= 2 && box.hidden) render(input.value);
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () =>
			document.querySelectorAll(".article").forEach(init),
		);
	} else {
		document.querySelectorAll(".article").forEach(init);
	}
})();
