/**
 * Summit Linux — Vue chrome i18n app (canonical: js/app.js).
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
 *
 * NOTE: assets/js/i18n.js is a byte-identical alias kept for compatibility
 * with pages that reference it. The __summitI18nLoaded guard below makes
 * double-loading (app.js + alias) safe: whichever runs first wins.
 */
(() => {
	"use strict";

	// Idempotency: the alias file carries the same guard — second load is a no-op.
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
		common: {
			discuss: "Discuss on GitHub",
			report: "Report website bug & feature request",
		},
		// Section labels for the sidebar tree / TOC / crumbs (same values
		// as i18n/en.json) so first paint and offline/file:// never show
		// raw keys before the dictionaries finish loading.
		wiki: {
			secWhat: "What is Summit Linux",
			secInstall: "Installation",
			secQuick: "Quick start",
			secCommands: "Commands",
			secMirrors: "Repositories and mirrors",
			secFaq: "FAQ",
			secLinks: "Links",
		},
		abt: {
			"sec.principles": "Core principles",
			"sec.base": "Base system",
			"sec.style": "Visual style",
			"sec.mission": "Our mission",
			"sec.features": "Features",
			"sec.stack": "picu stack",
			"sec.roadmap": "Roadmap",
		},
		dl: {
			"sec.status": "Development status",
			"sec.planned": "Planned configuration",
			"sec.release": "First release",
		},
		shots: { kicker: "Screenshots" },
		pc: {
			"sec.commands": "Core commands",
			"sec.source": "Source builds",
			"sec.binary": "Binary packages",
			"sec.trust": "Trust",
			"sec.example": "Example",
		},
		news: { "sec.latest": "Latest", "sec.archive": "Archive" },
		st: {
			"sec.overview": "Overview",
			"sec.site": "Site",
			"sec.mirrors": "Mirrors",
			"sec.registry": "picu registry",
			"sec.ci": "CI",
		},
		chl: {
			grpSummit: "Summit Linux",
			grpPicu: "picu package manager",
			grpSite: "Summit Linux website",
		},
		social: { discord: "Discord (soon)", telegram: "Telegram (soon)" },
	};

	// ---- Collapsible sidebar tree (single source for sidebar + TOC + crumbs).
	// Per-page nodes mirror the real article anchors (h2/h3 ids). Only nodes
	// with real sub-anchors carry children — never ship empty collapsibles.
	// open:true = expanded on first visit; per-page open-state persists in
	// localStorage under "summit-tree-<page>" and hash matches auto-expand.
	var TREE_STATE_PREFIX = "summit-tree-";
	var SUMMIT_TREES = {
		wiki: [
			{ href: "#what-is", i18n: "wiki.secWhat" },
			{ href: "#installation", i18n: "wiki.secInstall" },
			{ href: "#quickstart", i18n: "wiki.secQuick" },
			{ href: "#commands", i18n: "wiki.secCommands" },
			{ href: "#mirrors", i18n: "wiki.secMirrors" },
			{ href: "#faq", i18n: "wiki.secFaq" },
			{ href: "#links", i18n: "wiki.secLinks" },
		],
		about: [
			{ href: "#principles", i18n: "abt.sec.principles" },
			{ href: "#base", i18n: "abt.sec.base" },
			{ href: "#style", i18n: "abt.sec.style" },
			{ href: "#mission", i18n: "abt.sec.mission" },
			{ href: "#features", i18n: "abt.sec.features" },
			{ href: "#stack", i18n: "abt.sec.stack" },
			{ href: "#roadmap", i18n: "abt.sec.roadmap" },
		],
		download: [
			{ href: "#status", i18n: "dl.sec.status" },
			{ href: "#planned", i18n: "dl.sec.planned" },
			{ href: "#release", i18n: "dl.sec.release" },
			{ href: "#screenshots", i18n: "shots.kicker" },
		],
		picu: [
			{ href: "#commands", i18n: "pc.sec.commands" },
			{ href: "#source", i18n: "pc.sec.source" },
			{ href: "#binary", i18n: "pc.sec.binary" },
			{ href: "#trust", i18n: "pc.sec.trust" },
			{ href: "#example", i18n: "pc.sec.example" },
		],
		news: [
			{ href: "#latest", i18n: "news.sec.latest" },
			{ href: "#archive", i18n: "news.sec.archive" },
		],
		status: [
			{
				href: "#overview",
				i18n: "st.sec.overview",
				open: true,
				children: [
					{ href: "#site", i18n: "st.sec.site" },
					{ href: "#mirrors", i18n: "st.sec.mirrors" },
					{ href: "#mirror-table", i18n: "mir.link" },
					{ href: "#registry", i18n: "st.sec.registry" },
					{ href: "#ci", i18n: "st.sec.ci" },
				],
			},
		],
		changelog: [
			{ href: "#summit-linux", i18n: "chl.grpSummit" },
			{ href: "#picu", i18n: "chl.grpPicu" },
			{ href: "#website", i18n: "chl.grpSite" },
		],
	};
	var TREE_PAGES = {
		"wiki.html": "wiki",
		"about.html": "about",
		"download.html": "download",
		"picu-new.html": "picu",
		"picu.html": "picu",
		"news.html": "news",
		"status.html": "status",
		"changelog.html": "changelog",
	};
	var CRUMB_ROOT = {
		wiki: "nav.wiki",
		about: "nav.about",
		download: "nav.download",
		picu: "nav.picu",
		news: "nav.news",
		status: "nav.status",
		changelog: "nav.changelog",
	};
	window.__summitTrees = SUMMIT_TREES;

	function detectTreePage() {
		try {
			var file = (window.location.pathname || "/")
				.split("/")
				.pop()
				.split("?")[0]
				.toLowerCase();
			return TREE_PAGES[file] || null;
		} catch (e) {
			return null;
		}
	}

	function getHash() {
		try {
			return window.location.hash || "";
		} catch (e) {
			return "";
		}
	}

	var treeStateCache = {};

	function loadTreeState(page) {
		if (!page) return {};
		if (treeStateCache[page]) return treeStateCache[page];
		var state = {};
		try {
			var raw = window.localStorage.getItem(TREE_STATE_PREFIX + page);
			if (raw) state = JSON.parse(raw) || {};
		} catch (e) {
			state = {};
		}
		treeStateCache[page] = state;
		return state;
	}

	function saveTreeState(page, href, open) {
		if (!page || !href) return;
		var state = loadTreeState(page);
		state[href] = !!open;
		try {
			window.localStorage.setItem(
				TREE_STATE_PREFIX + page,
				JSON.stringify(state),
			);
		} catch (e) {
			/* storage unavailable */
		}
	}

	function subtreeHas(node, href) {
		if (!node || !href || !node.children) return false;
		for (var i = 0; i < node.children.length; i++) {
			var child = node.children[i];
			if (child.href === href) return true;
			if (subtreeHas(child, href)) return true;
		}
		return false;
	}

	function findTreeNode(nodes, href) {
		if (!nodes || !href) return null;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].href === href) return nodes[i];
			var found = findTreeNode(nodes[i].children, href);
			if (found) return found;
		}
		return null;
	}

	function flattenTree(nodes, out) {
		out = out || [];
		if (!nodes) return out;
		for (var i = 0; i < nodes.length; i++) {
			out.push(nodes[i]);
			flattenTree(nodes[i].children, out);
		}
		return out;
	}

	function defaultTreeOpen(item, page) {
		var state = loadTreeState(page);
		if (item && Object.prototype.hasOwnProperty.call(state, item.href))
			return !!state[item.href];
		if (item && item.open) return true;
		var hash = getHash();
		if (hash && item && (hash === item.href || subtreeHas(item, hash)))
			return true;
		return false;
	}

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
			if (cur == null || typeof cur !== "object" || !(parts[i] in cur)) {
				// Flat-dotted keys (e.g. { st: { "sec.site": ... } }):
				// try the remaining parts joined as one key. Only runs
				// when the nested walk would miss, so previously
				// resolving keys behave exactly as before.
				if (
					cur != null &&
					typeof cur === "object" &&
					parts.slice(i).join(".") in cur
				)
					return cur[parts.slice(i).join(".")];
				return undefined;
			}
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
			var treePage = detectTreePage();
			var treeData =
				treePage && SUMMIT_TREES[treePage] ? SUMMIT_TREES[treePage] : [];
			var app = window.Vue.createApp({
				data: function () {
					return {
						lang: window.__summitLang || currentLang(),
						dict: cache,
						fb: EN_FALLBACK,
						tree: treeData,
						pageKey: treePage,
						activeHref: getHash(),
						crumbRoot:
							treePage && CRUMB_ROOT[treePage] ? CRUMB_ROOT[treePage] : null,
					};
				},
				computed: {
					// TOC lists every node (parents + children) from the
					// same tree data that drives the sidebar.
					flatToc: function () {
						return flattenTree(this.tree);
					},
					// Breadcrumb tail: deepest node matching the hash,
					// else the page root label.
					crumbLabel: function () {
						var node = findTreeNode(this.tree, this.activeHref);
						if (node) return this.t(node.i18n);
						if (this.crumbRoot) return this.t(this.crumbRoot);
						return "";
					},
				},
				methods: {
					t: function (k) {
						var v = lookup(this.dict[this.lang] || {}, k);
						if (v != null) return v;
						var f = lookup(this.fb, k);
						return f != null ? f : k;
					},
					setActive: function (href) {
						this.activeHref = href || "";
					},
				},
				mounted: function () {
					var self = this;
					try {
						window.addEventListener("hashchange", function () {
							self.activeHref = getHash();
						});
					} catch (e) {
						/* ignore */
					}
				},
			});
			// Recursive collapsible node (official vuejs/core classic tree
			// pattern: self-reference by name, local open state, open flag).
			var treeTpl = null;
			try {
				treeTpl = document.getElementById("tree-item-template");
			} catch (e) {
				treeTpl = null;
			}
			app.component("TreeItem", {
				name: "TreeItem",
				template: treeTpl ? "#tree-item-template" : "<li></li>",
				props: {
					item: { type: Object, required: true },
					page: { type: String, default: "" },
				},
				data: function () {
					return { open: defaultTreeOpen(this.item, this.page) };
				},
				computed: {
					hasChildren: function () {
						return !!(this.item.children && this.item.children.length);
					},
					label: function () {
						var r = this.$root;
						return r && r.t ? r.t(this.item.i18n) : this.item.i18n;
					},
					isCurrent: function () {
						var r = this.$root;
						return !!r && r.activeHref === this.item.href;
					},
					isActive: function () {
						var r = this.$root;
						if (!r) return false;
						if (r.activeHref === this.item.href) return true;
						return subtreeHas(this.item, r.activeHref);
					},
				},
				methods: {
					persist: function () {
						saveTreeState(this.page, this.item.href, this.open);
					},
					toggle: function () {
						this.open = !this.open;
						this.persist();
					},
					// Keyboard toggling: Enter/Space click natively;
					// arrows expand/collapse without leaving the button.
					onKey: function (ev) {
						if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
							if (!this.open) {
								ev.preventDefault();
								this.open = true;
								this.persist();
							}
						} else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
							if (this.open) {
								ev.preventDefault();
								this.open = false;
								this.persist();
							}
						}
					},
					// Hash sync: track the section, auto-open on the way down.
					onNav: function () {
						var r = this.$root;
						if (r && r.setActive) r.setActive(this.item.href);
						if (this.hasChildren && !this.open) {
							this.open = true;
							this.persist();
						}
					},
				},
				mounted: function () {
					var r = this.$root;
					if (
						this.hasChildren &&
						!this.open &&
						r &&
						r.activeHref &&
						subtreeHas(this.item, r.activeHref)
					) {
						this.open = true;
					}
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
