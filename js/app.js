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
			"title.mirror": "File mirror · Summit Linux",
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
			"desc.mirror":
				"Browse Summit Linux repository files in a simple FTP-like listing with search and filters.",
		},
		err: {
			lead: "page not found",
			missing: "missing:",
			btnEn: "Home (EN)",
			btnRu: "Главная (RU)",
			btnHome: "Back to home",
			suggestTitle: "Popular pages:",
			searchPh: "Search site…",
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
		mir2: {
			crumb: "Mirror",
			title: "File mirror",
			lead: "Browse the project repository like a simple FTP listing — folders and files, without hunting through GitHub manually.",
			sourceLabel: "Source repository:",
			scopeNote: "Search and filters apply to the current folder listing only.",
			"sec.browse": "Browse files",
			searchLabel: "Filter in this folder",
			searchPh: "Type to filter by name…",
			typeAll: "All",
			typeDirs: "Folders",
			typeFiles: "Files",
			perPage: "Per page",
			"col.name": "Name",
			"col.size": "Size",
			"col.links": "Links",
			open: "Open",
			raw: "Raw",
			download: "Download",
			github: "GitHub",
			root: "root",
			loading: "Loading folder…",
			empty: "No matches in this folder.",
			emptyHint: "Try another search term or reset the filters.",
			error: "Could not load the file list.",
			notFound: "Folder not found in the repository.",
			rateLimit:
				"GitHub API rate limit reached (60 requests per hour without login). Please wait a few minutes and try again.",
			limitNote: "Unauthenticated GitHub API allows 60 requests per hour.",
			retry: "Retry",
			clear: "Reset",
			page: "Page",
			of: "of",
			prev: "← Prev",
			next: "Next →",
			items: "entries",
			noExt: "no extension",
		},
		pkg: {
			crumb: "Packages",
			title: "Packages",
			lead: "Browse built packages from the Summit package repository — versions, sizes and verification files in one minimalist table.",
			sourceLabel: "Source repository:",
			scopeNote: "Search and filters apply to the current folder listing only.",
			"sec.browse": "Browse packages",
			searchLabel: "Filter in this folder",
			searchPh: "Type to filter by name…",
			typeAll: "All",
			typeDirs: "Folders",
			typeFiles: "Files",
			perPage: "Per page",
			"col.name": "Name",
			"col.size": "Size",
			"col.date": "Date",
			"col.links": "Files",
			version: "Version",
			arch: "Arch",
			pkg: "Package",
			checksum: "Checksum",
			sig: "Signature",
			key: "Key",
			sources: "Sources",
			guide: "Guide",
			open: "Open",
			raw: "Raw",
			download: "Download",
			github: "GitHub",
			root: "root",
			loading: "Loading packages…",
			slowTitle: "Loading is taking too long?",
			abortReset:
				"Stop loading and reset packages per page to the previous value",
			aborted: "Loading stopped. The list was not updated.",
			empty: "No packages in this folder.",
			emptyHint: "Try another search term or reset the filters.",
			error: "Could not load the package list.",
			notFound:
				"Package repository not found yet — it will appear here once published.",
			rateLimit:
				"GitHub API rate limit reached (60 requests per hour without login). Please wait a few minutes and try again.",
			limitNote: "Unauthenticated GitHub API allows 60 requests per hour.",
			retry: "Retry",
			clear: "Reset",
			page: "Page",
			of: "of",
			prev: "← Prev",
			next: "Next →",
			items: "packages",
			noExt: "no extension",
		},
		idx: {
			calloutLabel: "Coming soon: ",
			calloutText:
				"signed mirrors, <code>picu trust</code> key rotation and refreshed site. See ",
			calloutAnd: " and ",
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
			secMulti: "Multiple inits and variants on one system",
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
			cmdSearchPh: "Filter commands…",
			noMatch: "No commands match your filter.",
			related: "Related:",
			copy: "Copy",
			copied: "copied ✓",
			copyCodeAria: "Copy code to clipboard",
			exampleT: "Example",
			outputT: "Sample output",
			more: "Show example",
			less: "Hide",
			verStable: "Stable",
			verUnstable: "Unstable",
			verNoteU:
				"Unstable builds may print extra lines; commands stay the same.",
			cheatsheet: "Cheatsheet",
			cheatTitle: "picu cheatsheet",
			close: "Close",
			since: "since",
			trustMoreT: "How trust works",
			trustP1:
				"picu trusts keys, not files. A package installs only if its index entry carries a signature from a key you trusted on purpose.",
			trustP2:
				"Every sync checks three things: the signature is real, the index has not expired, and the version is not older than what you have — no quiet downgrades.",
			trustP3:
				"Mirrors are treated as strangers: even the official mirror installs nothing without a valid signature. Community mirrors need your explicit trust first.",
			trustP4:
				"Keys can be replaced without reinstalling: old keys retire to a block-list, new keys take over, and picu tells you when it happens.",
			cmd: {
				add: { desc: "Install a package from a trusted mirror." },
				cook: { desc: "Build a package from its recipe in isolation." },
				cut: { desc: "Remove an installed package." },
				find: { desc: "Search repository indexes for packages." },
				sync: { desc: "Refresh repository indexes and check signatures." },
				rebase: {
					desc: "Switch the system to a different mirror or release.",
				},
				list: { desc: "Show installed packages." },
				info: { desc: "Show version, recipe and mirror details." },
				update: {
					desc: "Upgrade installed packages to trusted versions.",
				},
				trust: {
					desc: "Manage trusted keys and rotate them.",
					un: "Key rotation arrived in 0.3.0 — unstable extends it with automatic expiry checks.",
				},
				help: { desc: "Show help for any command." },
			},
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
			rel061t: "stable-v0.6.1 — 2026-10-11",
			rel060t: "stable-v0.6.0 — 2026-10-11",
			rel05xt: "debug-unstable-v0.5.0 → v0.5.1 — 2026-10-10",
			rel040t: "unstable-v0.4.0 — 2026-10-10",
			rel001t: "0.1 — 2026-09-02, initial upload era 2026-09-19/20",
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
			{ href: "#multi-init", i18n: "wiki.secMulti" },
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
			{
				href: "#website",
				i18n: "chl.grpSite",
				children: [
					{ href: "#site-0-6-1", i18n: "chl.rel061t" },
					{ href: "#site-0-6-0", i18n: "chl.rel060t" },
					{ href: "#site-0-5-x", i18n: "chl.rel05xt" },
					{ href: "#site-0-4-0", i18n: "chl.rel040t" },
					{ href: "#site-0-1", i18n: "chl.rel001t" },
				],
			},
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

	// ---- picu command catalogue (picu-new.html / picu.html only).
	// Usage/example/output strings are code and never translated; the
	// short descriptions resolve via pc.cmd.<id>.desc at render time.
	var PICU_COMMANDS = [
		{
			id: "add",
			usage: "picu add <pkg>",
			example: "picu add Vim",
			output:
				"[ OK ] finding in mirror\n[ OK ] checking version\n[ ? ] install? [Y/n] Y\n[ OK ] installation completed",
			related: ["find", "info", "update"],
			since: "0.1.0",
		},
		{
			id: "cook",
			usage: "picu cook <pkg>",
			example: "picu cook hello-2.12",
			output:
				"[ OK ] recipe loaded\n[ .. ] building in isolation\n[ OK ] package ready",
			related: ["add", "info"],
			since: "0.1.0",
		},
		{
			id: "cut",
			usage: "picu cut <pkg>",
			example: "picu cut hello",
			output: "[ ? ] remove hello-2.12? [Y/n] Y\n[ OK ] removed",
			related: ["list", "add"],
			since: "0.1.0",
		},
		{
			id: "find",
			usage: "picu find <query>",
			example: "picu find editor",
			output: "Vim — Vi improved code editor\nNano — small text editor",
			related: ["add", "info"],
			since: "0.1.0",
		},
		{
			id: "sync",
			usage: "picu sync",
			example: "picu sync",
			output: "[ OK ] index verified (signed)\n[ OK ] 3 mirrors in sync",
			related: ["update", "trust"],
			since: "0.1.0",
		},
		{
			id: "rebase",
			usage: "picu rebase <release>",
			example: "picu rebase stable",
			output: "[ OK ] mirror verified\n[ OK ] release pinned: stable",
			related: ["sync", "update"],
			since: "0.2.0",
		},
		{
			id: "list",
			usage: "picu list",
			example: "picu list",
			output: "Vim 23.12\nNano 8.0",
			related: ["info", "cut"],
			since: "0.1.0",
		},
		{
			id: "info",
			usage: "picu info <pkg>",
			example: "picu info Vim",
			output: "Version: 23.12\nMirror: Summit Official\nRecipe: vim.picu",
			related: ["find", "add"],
			since: "0.1.0",
		},
		{
			id: "update",
			usage: "picu update",
			example: "picu update",
			output: "[ OK ] 2 updates installed\n[ OK ] system is current",
			related: ["sync", "list"],
			since: "0.1.0",
		},
		{
			id: "trust",
			usage: "picu trust [--rotate]",
			example: "picu trust --rotate",
			output: "[ OK ] new key accepted\n[ OK ] old key retired",
			related: ["sync", "rebase"],
			since: "0.3.0",
			unKey: "pc.cmd.trust.un",
		},
		{
			id: "help",
			usage: "picu help [command]",
			example: "picu help add",
			output: "Usage: picu add <pkg>\nInstall a package from a trusted mirror.",
			related: ["find"],
			since: "0.1.0",
		},
	];
	window.__summitPicuCommands = PICU_COMMANDS;

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

	// picu: enhance Vue-rendered copy terminals via the shared main.js
	// pattern (no-op until main.js loads and exposes the hook).
	function refreshCopyButtons() {
		try {
			if (typeof window.SummitCopyTerminals === "function")
				window.SummitCopyTerminals();
		} catch (e) {
			/* ignore */
		}
	}

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
			window.__summitTreePage = treePage || null;
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
						// picu features (picu-new.html / picu.html only).
						cmdQuery: "",
						openCmd: null,
						verTab: "stable",
						cheatOpen: false,
						cheatReturnFocus: null,
						ver: { stable: "0.3.0", unstable: "0.4.0-dev" },
						picuCmds: PICU_COMMANDS,
						// 404: site search query.
						errSearch: "",
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
					// picu: live command filter (name + usage, code only).
					filteredCmds: function () {
						var q = String(this.cmdQuery || "")
							.trim()
							.toLowerCase();
						if (!q) return this.picuCmds;
						return this.picuCmds.filter(function (c) {
							return (
								String(c.id).toLowerCase().indexOf(q) !== -1 ||
								String(c.usage).toLowerCase().indexOf(q) !== -1
							);
						});
					},
					// picu: version tab label with the loaded numbers.
					verTabLabel: function () {
						return this.verTab === "stable"
							? this.t("pc.verStable") + " " + this.ver.stable
							: this.t("pc.verUnstable") + " " + this.ver.unstable;
					},
					// 404: site-wide search across every tree page.
					siteResults: function () {
						var q = String(this.errSearch || "")
							.trim()
							.toLowerCase();
						if (!q) return [];
						var self = this,
							out = [];
						Object.keys(TREE_PAGES).forEach(function (file) {
							if (file === "picu.html") return; // legacy orphan, same tree as picu-new
							var nodes = flattenTree(SUMMIT_TREES[TREE_PAGES[file]] || []);
							nodes.forEach(function (n) {
								if (!n || !n.href) return;
								var label = self.t(n.i18n);
								if ((label + " " + n.href).toLowerCase().indexOf(q) !== -1)
									out.push({ page: file, href: n.href, label: label });
							});
						});
						return out.slice(0, 8);
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
					// picu: accordion (one open at a time).
					toggleCmd: function (id) {
						this.openCmd = this.openCmd === id ? null : id;
					},
					// picu: related-command shortcut (filter + expand).
					focusCmd: function (id) {
						this.cmdQuery = id;
						this.openCmd = id;
					},
					// picu: version tabs.
					setVerTab: function (tab) {
						if (tab === "stable" || tab === "unstable") this.verTab = tab;
					},
					// picu: cheatsheet modal (focus trap like news dialog).
					openCheat: function () {
						try {
							this.cheatReturnFocus = document.activeElement || null;
						} catch (e) {
							this.cheatReturnFocus = null;
						}
						this.cheatOpen = true;
						try {
							document.body.classList.add("modal-open");
						} catch (e) {
							/* ignore */
						}
						var self = this;
						try {
							window.setTimeout(function () {
								try {
									var dlg = document.getElementById("pcu-cheat-dialog");
									if (dlg) {
										var btn = dlg.querySelector("[data-pcu-cheat-close]");
										(btn || dlg).focus();
									}
								} catch (e) {
									/* ignore */
								}
							}, 30);
						} catch (e) {
							/* ignore */
						}
					},
					closeCheat: function () {
						this.cheatOpen = false;
						try {
							document.body.classList.remove("modal-open");
						} catch (e) {
							/* ignore */
						}
						try {
							if (this.cheatReturnFocus && this.cheatReturnFocus.focus)
								this.cheatReturnFocus.focus();
						} catch (e) {
							/* ignore */
						}
						this.cheatReturnFocus = null;
					},
					cheatTrap: function (ev) {
						if (!this.cheatOpen || !ev || ev.key !== "Tab") return;
						var dlg = null;
						try {
							dlg = document.getElementById("pcu-cheat-dialog");
						} catch (e) {
							dlg = null;
						}
						if (!dlg) return;
						var items = null;
						try {
							items = dlg.querySelectorAll(
								'button, [href], input, [tabindex]:not([tabindex="-1"])',
							);
						} catch (e) {
							items = null;
						}
						if (!items || !items.length) return;
						var first = items[0];
						var last = items[items.length - 1];
						try {
							if (ev.shiftKey && document.activeElement === first) {
								ev.preventDefault();
								last.focus();
							} else if (!ev.shiftKey && document.activeElement === last) {
								ev.preventDefault();
								first.focus();
							}
						} catch (e) {
							/* ignore */
						}
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
					// picu: Escape closes the cheatsheet; version badge
					// numbers come from data/version.json (fallback kept).
					try {
						document.addEventListener("keydown", function (ev) {
							if (ev && ev.key === "Escape" && self.cheatOpen)
								self.closeCheat();
						});
					} catch (e) {
						/* ignore */
					}
					if (self.pageKey === "picu") {
						try {
							window
								.fetch("data/version.json", { cache: "force-cache" })
								.then(function (res) {
									if (!res.ok) throw new Error("version http");
									return res.json();
								})
								.then(function (json) {
									if (
										json &&
										json.picu &&
										(json.picu.stable || json.picu.unstable)
									) {
										self.ver = {
											stable: json.picu.stable || self.ver.stable,
											unstable: json.picu.unstable || self.ver.unstable,
										};
									}
								})
								.catch(function () {
									/* offline — fallback stays */
								});
						} catch (e) {
							/* ignore */
						}
					}
					refreshCopyButtons();
				},
				updated: function () {
					// picu: enhance Vue-rendered copy terminals (cheap:
					// already-enhanced blocks are skipped).
					if (this.pageKey === "picu") refreshCopyButtons();
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
				// Scrollspy: when the current section changes (scroll or hash),
				// open the ancestor branch and persist it. Runs only on change,
				// so a user-collapsed branch stays shut until its section
				// becomes current again — clicks never force it open.
				watch: {
					"$root.activeHref": function (href) {
						if (!href) return;
						if (
							!this.open &&
							(href === this.item.href || subtreeHas(this.item, href))
						) {
							this.open = true;
							this.persist();
						}
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
					// Hash sync: track the section. Expansion is left to the
					// scrollspy watcher so clicks never fight user-collapsed
					// branches; the branch opens once its section scrolls in.
					onNav: function () {
						var r = this.$root;
						if (r && r.setActive) r.setActive(this.item.href);
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

/* ==========================================================================
 * Summit Linux — scrollspy for tree pages (wiki/about/download/picu-new/
 * news/status/changelog + any registered tree page).
 *
 * De-aggressed IntersectionObserver: a slightly wider middle band
 * (rootMargin "-35% 0px -55% 0px", ~10% viewport) with ratio-gated
 * visibility (hairline 1px intersections are ignored) plus a short
 * ~100 ms dwell — the highlight follows quickly but tied/ambiguous
 * frames still settle before committing. Unambiguous frames (clean-leave
 * exit with one section left, or a single strong candidate) commit
 * immediately. Small-section gates: blocks shorter than 30% of the
 * viewport need 35% of themselves visible to count, displace a sticky
 * current only at 60% (clearly dominant), and dwell 220 ms. Ties resolve
 * to the deepest section in document order. In-page anchor clicks glide
 * via html.anchor-smooth (never on page load with #hash).
 * On change the root activeHref updates (same path as hash sync, so
 * highlight + aria-current reuse existing logic) and the TreeItem watcher
 * opens + persists the ancestor branch. No collapsing: user-opened
 * branches stay as the user left them. No hash writes. Reduced-motion
 * keeps instant behavior (dwell bypassed). No-ops without
 * IntersectionObserver or anchors.
 * ========================================================================== */
(() => {
	"use strict";

	function spyReady(fn) {
		if (document.readyState === "loading")
			document.addEventListener("DOMContentLoaded", fn);
		else fn();
	}

	spyReady(function () {
		if (!("IntersectionObserver" in window)) return;
		var page = window.__summitTreePage;
		var trees = window.__summitTrees;
		if (!page || !trees || !trees[page]) return;
		var hrefs = [];
		(function flatten(nodes) {
			(nodes || []).forEach(function (n) {
				if (n && n.href) hrefs.push(n.href);
				flatten(n && n.children);
			});
		})(trees[page]);
		var scope = null;
		try {
			scope = document.querySelector("main") || document;
		} catch (e) {
			scope = document;
		}
		var targets = [];
		hrefs.forEach(function (href) {
			var id = String(href).charAt(0) === "#" ? String(href).slice(1) : null;
			if (!id) return;
			var el = null;
			try {
				el = scope.querySelector("#" + CSS.escape(id));
			} catch (e) {
				try {
					el = document.getElementById(id);
				} catch (e2) {
					el = null;
				}
			}
			if (el) targets.push({ href: href, el: el });
		});
		if (!targets.length) return;
		// Hysteresis: enter needs a real overlap (ratio gate), exit needs a
		// clean leave. Hairline single-pixel intersections never count.
		// Small-section gates: blocks shorter than SHORT_VH viewports must
		// show a larger share of themselves (RATIO_SHORT_ENTER) to count,
		// and displace a sticky current only when clearly dominant
		// (RATIO_TAKEOVER). Tiny candidates also dwell slightly longer.
		var RATIO_ENTER = 0.05;
		var RATIO_SHORT_ENTER = 0.35;
		var RATIO_TAKEOVER = 0.6;
		var DWELL_MS = 100;
		var DWELL_SHORT_MS = 220;
		var SHORT_VH = 0.3;
		var reduceMotion = false;
		try {
			reduceMotion =
				window.matchMedia &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		} catch (e) {
			reduceMotion = false;
		}
		var inBand = {};
		var bandRatio = {};
		var enterGate = {};
		function measureShort() {
			var vh = 1;
			try {
				vh = window.innerHeight || 1;
			} catch (e) {
				vh = 1;
			}
			targets.forEach(function (t) {
				var h = 0;
				try {
					h =
						(t.el.getBoundingClientRect() || {}).height ||
						t.el.offsetHeight ||
						0;
				} catch (e) {
					h = 0;
				}
				t.short = h > 0 && h < vh * SHORT_VH;
				enterGate[t.href] = t.short ? RATIO_SHORT_ENTER : RATIO_ENTER;
			});
		}
		measureShort();
		// Heights shift as fonts/images settle — re-measure on load too.
		try {
			if (window.addEventListener)
				window.addEventListener("load", measureShort);
		} catch (e) {
			/* ignore */
		}
		try {
			if (window.addEventListener)
				window.addEventListener("resize", measureShort, {
					passive: true,
				});
		} catch (e) {
			try {
				window.addEventListener("resize", measureShort);
			} catch (e2) {
				/* ignore */
			}
		}
		function appliedHref() {
			try {
				return window.__summitApp ? window.__summitApp.activeHref : null;
			} catch (e) {
				return null;
			}
		}
		function targetByHref(href) {
			for (var i = 0; i < targets.length; i++) {
				if (targets[i].href === href) return targets[i];
			}
			return null;
		}
		function pickCurrent() {
			// Deepest-in-document-order wins: targets are in tree order,
			// so the last in-band section is the tie-break (after gates).
			var vis = targets.filter(function (t) {
				return inBand[t.href];
			});
			if (!vis.length) return fallbackCurrent();
			var deepest = vis[vis.length - 1].href;
			// Sticky current: a short challenger takes over only when
			// clearly dominant; otherwise the current holds (no flicker).
			var applied = appliedHref();
			if (applied && inBand[applied] && applied !== deepest) {
				var chal = targetByHref(deepest);
				if (chal && chal.short && (bandRatio[deepest] || 0) < RATIO_TAKEOVER)
					return applied;
			}
			return deepest;
		}
		function fallbackCurrent() {
			// Above the first section: the first section is current.
			try {
				var y = window.scrollY || window.pageYOffset || 0;
				var top = targets[0].el.getBoundingClientRect().top + y;
				if (y <= top + 2) return targets[0].href;
			} catch (e) {
				/* ignore */
			}
			return null; // below the last section: keep previous highlight
		}
		function applyCurrent(cur) {
			if (!cur || !window.__summitApp) return;
			try {
				if (window.__summitApp.activeHref !== cur)
					window.__summitApp.setActive(cur);
			} catch (e) {
				/* ignore */
			}
		}
		// Dwell/debounce: commit a switch only if the candidate is still
		// current after DWELL_MS. Kills flicker from band-edge crossings
		// and tiny fast-scroll jitters.
		var pending = null;
		var dwellTimer = null;
		function cancelPending() {
			pending = null;
			try {
				if (dwellTimer) window.clearTimeout(dwellTimer);
			} catch (e) {
				/* ignore */
			}
			dwellTimer = null;
		}
		function schedule(cur) {
			if (!cur) return;
			try {
				if (window.__summitApp && window.__summitApp.activeHref === cur) {
					cancelPending();
					return;
				}
			} catch (e) {
				/* ignore */
			}
			if (reduceMotion) {
				pending = cur;
				applyCurrent(cur);
				return;
			}
			if (pending === cur) return;
			pending = cur;
			try {
				if (dwellTimer) window.clearTimeout(dwellTimer);
			} catch (e) {
				/* ignore */
			}
			dwellTimer = window.setTimeout(function () {
				dwellTimer = null;
				var still = pickCurrent();
				if (still && still === pending) applyCurrent(still);
				else if (still) {
					// Candidate changed mid-dwell: re-dwell on the newest.
					pending = null;
					schedule(still);
				} else pending = null;
			}, dwellFor(pending));
		}
		function dwellFor(href) {
			var t = href ? targetByHref(href) : null;
			return t && t.short ? DWELL_SHORT_MS : DWELL_MS;
		}
		var io = null;
		try {
			io = new IntersectionObserver(
				function (entries) {
					var left = false;
					entries.forEach(function (en) {
						var id = en.target && en.target.id ? en.target.id : "";
						if (!id) return;
						var ratio =
							typeof en.intersectionRatio === "number"
								? en.intersectionRatio
								: en.isIntersecting
									? 1
									: 0;
						// Gated entry (per-section gate: higher for short
						// blocks) vs clean-leave exit: hysteresis. Ratios are
						// always tracked for the takeover check.
						if (!en.isIntersecting) {
							if (inBand["#" + id]) left = true;
							inBand["#" + id] = false;
							bandRatio["#" + id] = 0;
						} else {
							bandRatio["#" + id] = ratio;
							if (
								!inBand["#" + id] &&
								ratio >= (enterGate["#" + id] || RATIO_ENTER)
							)
								inBand["#" + id] = true;
						}
					});
					var cur = pickCurrent();
					var applied = appliedHref();
					if (!cur || cur === applied) {
						cancelPending();
						return;
					}
					if (reduceMotion) {
						pending = cur;
						applyCurrent(cur);
						return;
					}
					// Fast paths (feel instant): an unambiguous clean-leave
					// exit with one section left, or a single normal
					// candidate — commit now (entry was already ratio-gated,
					// so a lone section is never a mistake). Lone SHORT
					// sections still dwell: they flicker, ties need settling.
					var visCount = 0;
					for (var vi = 0; vi < targets.length; vi++) {
						if (inBand[targets[vi].href]) visCount++;
					}
					var cand = targetByHref(cur);
					var loneNormal = visCount === 1 && cand && !cand.short;
					if ((left && visCount === 1) || loneNormal) {
						cancelPending();
						pending = cur;
						applyCurrent(cur);
						return;
					}
					schedule(cur);
				},
				{
					rootMargin: "-35% 0px -55% 0px",
					threshold: [0, 0.15, 0.35, 0.6],
				},
			);
		} catch (e) {
			return;
		}
		targets.forEach(function (t) {
			try {
				io.observe(t.el);
			} catch (e) {
				/* ignore */
			}
		});
		// Smooth in-page anchor glide (tree/sidebar/TOC link jumps): enable
		// smooth scrolling on real anchor clicks only — never on page load
		// with #hash (the class starts absent). Scrollspy keeps committing
		// through the glide and hash sync is untouched.
		var smoothTimer = null;
		function anchorSmoothOn() {
			try {
				document.documentElement.classList.add("anchor-smooth");
			} catch (e) {
				/* ignore */
			}
			try {
				if (smoothTimer) window.clearTimeout(smoothTimer);
			} catch (e) {
				/* ignore */
			}
			try {
				smoothTimer = window.setTimeout(function () {
					try {
						document.documentElement.classList.remove("anchor-smooth");
					} catch (e) {
						/* ignore */
					}
				}, 1200);
			} catch (e) {
				/* ignore */
			}
		}
		try {
			document.addEventListener(
				"click",
				function (ev) {
					var el =
						ev.target && ev.target.closest
							? ev.target.closest('a[href^="#"]')
							: null;
					if (!el) return;
					var href = el.getAttribute ? el.getAttribute("href") : "";
					if (href && href.length > 1) anchorSmoothOn();
				},
				true,
			);
		} catch (e) {
			/* ignore */
		}
	});
})();
