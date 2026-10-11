/**
 * Summit Linux — Vue chrome i18n (header/nav/footer only).
 *
 * - Languages: en, ru (SUPPORTED). Body content stays hardcoded EN for SEO;
 *   only header/nav/footer templates use {{ t('...') }}.
 * - Priority: ?lang= query > localStorage "summit-lang" > navigator.language.
 * - Dictionaries load via relative fetch('i18n/<lang>.json') with force-cache;
 *   dotted lookup t(k) falls back to English, then to the key itself.
 * - setLang() updates documentElement.lang + localStorage and rewrites ?lang=
 *   via history.replaceState (no reload). Chrome-first: body untouched.
 * - Mounts a single Vue app on #app (header+main+footer). If Vue or the
 *   dictionaries are unavailable (offline/file://), the embedded EN_FALLBACK
 *   keeps the chrome rendered — never blank, never stuck behind [v-cloak].
 */
(() => {
	"use strict";

	// Idempotency: js/app.js is the canonical copy with the same guard —
	// whichever loads first wins, the second is a no-op.
	if (window.__summitI18nLoaded) return;
	window.__summitI18nLoaded = true;

	var SUPPORTED = ["en", "ru"];
	var FALLBACK = "en";
	var LANG_KEY = "summit-lang";
	var EN_FALLBACK = {
		nav: {
			home: "Home",
			about: "About",
			download: "Download",
			picu: "picu",
			news: "News",
			wiki: "Wiki",
			status: "Status",
			changelog: "Changelog",
		},
		toc: { title: "Contents" },
		crumb: { home: "Home" },
		btn: {
			download: "Download",
			meetPicu: "Meet picu",
			openWiki: "Open Wiki",
			picuGuide: "picu guide",
			aboutProject: "About the project",
			systemStatus: "System status",
			downloadPdf: "Download PDF",
			sourceCode: "Source code",
			github: "GitHub",
			discordSoon: "Discord (soon)",
		},
		foot: { note: "Summit Linux & picu · Independent open-source project" },
		search: {
			placeholder: "Search…",
			wikiPlaceholder: "Search wiki…",
			label: "Search wiki",
			empty: "No results",
		},
		aria: {
			navToggle: "Open menu",
			themeLight: "Switch to light theme",
			themeDark: "Switch to dark theme",
			toTop: "Scroll to top",
		},
		toast: { coming: "Full translation coming — showing English" },
		meta: {
			"title.index": "Summit Linux",
			"title.about": "About · Summit Linux",
			"title.download": "Download · Summit Linux",
			"title.picu": "picu · Summit Linux",
			"title.news": "News · Summit Linux",
			"title.wiki": "Wiki · Summit Linux",
			"title.status": "Status · Summit Linux",
			"title.developing": "In developing · Summit Linux",
			"title.404": "404 · Summit Linux",
			"desc.index":
				"Independent Linux distribution built on LFS with picu package manager: transparency, security, source builds.",
			"desc.about":
				"Summit Linux philosophy, LFS source-based system, picu package manager stack and roadmap.",
			"desc.download":
				"Download Summit Linux images, verify checksums and signatures, system requirements.",
			"desc.picu":
				"picu package manager: source recipes, binary packages, signed mirrors and trust model.",
			"desc.news":
				"Summit Linux news: releases, picu updates and project milestones.",
			"desc.wiki":
				"Summit Linux Wiki: installation, picu commands, repositories, mirrors and FAQ.",
			"desc.status":
				"Summit Linux status — site, mirrors, picu registry and CI.",
			"desc.developing": "Page in developing — Summit Linux.",
			"desc.404": "Page not found — Summit Linux.",
		},
		err: {
			lead: "page not found",
			missing: "missing:",
			btnEn: "Home (EN)",
			btnRu: "Главная (RU)",
		},
		banner: {
			text: "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			link: "Read news",
			dismiss: "Dismiss",
		},
		mir: {
			title: "Official / Community mirrors",
			link: "Mirror list",
			"col.mirror": "Mirror",
			"col.type": "Type",
			"col.url": "URL",
			"col.status": "Status",
			official: "Official mirror",
			community: "Community mirror",
			communities: "Community mirrors",
			local: "Local build",
			signedPlanned: "Signed index (planned)",
			signed: "Signed index",
			cook: "picu cook",
			officialUrl:
				"<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			officialUrlShort: "<code>mirror.summit-linux.org</code> (coming soon)",
			noCommunity: "— (no community mirrors yet)",
			none: "—",
			comingSoon: "Coming soon",
			available: "Available",
		},
		common: { discuss: "Discuss on GitHub" },
		social: { discord: "Discord (soon)", telegram: "Telegram (soon)" },
	};

	var cache = { en: EN_FALLBACK, ru: null };

	function fromQuery() {
		try {
			var v = new URLSearchParams(window.location.search).get("lang");
			return SUPPORTED.indexOf(v) !== -1 ? v : null;
		} catch (e) {
			return null;
		}
	}

	function fromNavigator() {
		try {
			var n = String(window.navigator.language || "en")
				.slice(0, 2)
				.toLowerCase();
			return SUPPORTED.indexOf(n) !== -1 ? n : FALLBACK;
		} catch (e) {
			return FALLBACK;
		}
	}

	function currentLang() {
		var q = fromQuery();
		if (q) return q;
		try {
			var s = window.localStorage.getItem(LANG_KEY);
			if (SUPPORTED.indexOf(s) !== -1) return s;
		} catch (e) {
			/* storage unavailable */
		}
		return fromNavigator();
	}

	function lookup(obj, dotted) {
		if (!obj) return undefined;
		var parts = String(dotted).split(".");
		var cur = obj;
		for (var i = 0; i < parts.length; i++) {
			if (cur == null || typeof cur !== "object" || !(parts[i] in cur))
				return undefined;
			cur = cur[parts[i]];
		}
		return cur;
	}

	function t(k) {
		var lang = window.__summitLang || currentLang();
		var v = lookup(cache[lang] || {}, k);
		if (v != null) return v;
		var f = lookup(cache.en || {}, k);
		return f != null ? f : k;
	}

	function loadDict(lang) {
		if (cache[lang]) return Promise.resolve(cache[lang]);
		return window
			.fetch("i18n/" + lang + ".json", { cache: "force-cache" })
			.then(function (res) {
				if (!res.ok) throw new Error("i18n http " + res.status);
				return res.json();
			})
			.then(function (json) {
				cache[lang] = json;
				return json;
			});
	}

	function setLang(lang) {
		if (SUPPORTED.indexOf(lang) === -1) lang = FALLBACK;
		window.__summitLang = lang;
		try {
			window.localStorage.setItem(LANG_KEY, lang);
		} catch (e) {
			/* storage unavailable */
		}
		try {
			document.documentElement.setAttribute("lang", lang);
		} catch (e) {
			/* ignore */
		}
		try {
			var url = new URL(window.location.href);
			url.searchParams.set("lang", lang);
			window.history.replaceState(null, "", url.toString());
		} catch (e) {
			/* ignore (file:// etc.) */
		}
		if (window.__summitApp) {
			try {
				window.__summitApp.lang = lang;
			} catch (e) {
				/* ignore */
			}
		}
	}

	window.SummitI18n = {
		SUPPORTED: SUPPORTED,
		currentLang: currentLang,
		loadDict: loadDict,
		t: t,
		setLang: setLang,
	};

	function mount() {
		if (!window.Vue || !window.Vue.createApp) return false;
		if (!document.getElementById("app")) return false;
		try {
			var app = window.Vue.createApp({
				data: function () {
					return {
						lang: window.__summitLang || currentLang(),
						dict: cache,
						fb: EN_FALLBACK,
					};
				},
				methods: {
					t: function (k) {
						var v = lookup(this.dict[this.lang] || {}, k);
						if (v != null) return v;
						var f = lookup(this.fb, k);
						return f != null ? f : k;
					},
				},
			});
			window.__summitApp = app.mount("#app");
			return true;
		} catch (e) {
			return false;
		}
	}

	function init() {
		var lang = currentLang();
		window.__summitLang = lang;
		try {
			document.documentElement.setAttribute("lang", lang);
		} catch (e) {
			/* ignore */
		}
		mount();
		Promise.all([loadDict("en"), loadDict(lang)])
			.then(function () {
				if (window.__summitApp) {
					try {
						window.__summitApp.$forceUpdate();
					} catch (e) {
						/* ignore */
					}
				}
			})
			.catch(function () {
				/* offline/file:// — EN_FALLBACK already active */
			});
		// Persist ?lang= navigations (lang dropdown) for the next page load.
		document.addEventListener(
			"click",
			function (ev) {
				var el =
					ev.target && ev.target.closest
						? ev.target.closest('a[href*="?lang="]')
						: null;
				if (!el) return;
				try {
					var u = new URL(el.getAttribute("href"), window.location.href);
					var l = u.searchParams.get("lang");
					if (SUPPORTED.indexOf(l) !== -1)
						window.localStorage.setItem(LANG_KEY, l);
				} catch (e) {
					/* ignore */
				}
			},
			true,
		);
	}

	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", init);
	else init();
})();
