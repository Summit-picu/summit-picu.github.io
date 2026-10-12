/**
 * Summit Linux — public news feed.
 *
 * Latest cards + archive are rendered from a single data source:
 * `data/news.json` (fetch) with a built-in fallback array.
 * If a PRIVATE Supabase Storage bucket is configured, it is tried
 * first; the public site never writes to Storage.
 */
(() => {
	"use strict";

	const FETCH_TIMEOUT_MS = 8000;

	const config = window.SUMMIT_SUPABASE;
	// NOTE: computed per render (never cached once) — app.js re-renders
	// #app after the i18n dictionaries load, so a stale value would stick
	// the feed in the wrong language.
	const isRussian = () =>
		document.documentElement.lang === "ru" || window.__summitLang === "ru";
	const latest = () => document.querySelector('[data-news-latest="true"]');
	const gridEl = () => document.querySelector('[data-news-grid="true"]');
	const modal = document.getElementById("news-viewer");
	const cardTpl = document.getElementById("news-card-tpl");

	if (!gridEl()) return;

	const strings = () =>
		isRussian()
			? {
					empty: "Пока новостей нет.",
					loadError: "Не удалось загрузить новости.",
					loading: "Загрузка…",
					open: "Открыть",
					close: "Закрыть",
					news: "Новость",
					retry: "Повторить",
				}
			: {
					empty: "No news yet.",
					loadError: "Could not load the news feed.",
					loading: "Loading…",
					open: "Open",
					close: "Close",
					news: "News",
					retry: "Retry",
				};

	// Built-in fallback (mirrors data/news.json). Used when fetch fails,
	// e.g. file:// preview without a local server.
	const FALLBACK_POSTS = [
		{
			id: "stable-v0-6-1",
			date: "2026-10-11",
			published: true,
			en: {
				title: "stable-v0.6.1: site features",
				excerpt:
					"Download and status pages expanded on top of the Vue build, shared translation dictionaries.",
				body: "Download and status pages expanded on top of the Vue build, shared translation dictionaries.",
			},
			ru: {
				title: "stable-v0.6.1: возможности сайта",
				excerpt:
					"Страницы скачивания и статуса расширены поверх Vue-сборки, общие словари переводов.",
				body: "Страницы скачивания и статуса расширены поверх Vue-сборки, общие словари переводов.",
			},
		},
		{
			id: "stable-v0-6-0",
			date: "2026-10-11",
			published: true,
			en: {
				title: "stable-v0.6.0: Vue migration",
				excerpt:
					"Vue app shell, single-file pages and unified English/Russian dictionaries.",
				body: "Vue app shell, single-file pages and unified English/Russian dictionaries.",
			},
			ru: {
				title: "stable-v0.6.0: переход на Vue",
				excerpt:
					"Vue-оболочка, однофайловые страницы и единые словари английского и русского.",
				body: "Vue-оболочка, однофайловые страницы и единые словари английского и русского.",
			},
		},
		{
			id: "ui-v0-4-0-v0-5-1",
			date: "2026-10-10",
			published: true,
			en: {
				title: "UI updates: v0.4.0 – v0.5.1",
				excerpt:
					"Two huge UI updates followed by a locale cleanup of duplicated page files.",
				body: "Two huge UI updates followed by a locale cleanup of duplicated page files.",
			},
			ru: {
				title: "Обновления интерфейса: v0.4.0 – v0.5.1",
				excerpt:
					"Два крупных обновления интерфейса и чистка дублей файлов локалей.",
				body: "Два крупных обновления интерфейса и чистка дублей файлов локалей.",
			},
		},
	];

	const storageUrl = () => {
		if (!config) return null;
		const base = config.url.replace(/\/$/, "");
		const bucket = encodeURIComponent(config.newsBucket);
		const path = config.newsPath.split("/").map(encodeURIComponent).join("/");

		return `${base}/storage/v1/object/${bucket}/${path}`;
	};

	const formatDate = (value) => {
		if (!value) return "";

		const date = new Date(`${value}T00:00:00`);
		if (Number.isNaN(date.getTime())) return value;

		return new Intl.DateTimeFormat(isRussian() ? "ru-RU" : "en-GB", {
			dateStyle: "long",
		}).format(date);
	};

	// ISO date for <time datetime="YYYY-MM-DD">; falls back to raw value.
	const isoDate = (value) => {
		if (!value) return "";
		const m = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
		if (m) return m[1];
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return date.toISOString().slice(0, 10);
	};

	const getLocaleContent = (post) => post[isRussian() ? "ru" : "en"] || {};

	const excerptOf = (content) =>
		content.excerpt ||
		(content.body || "")
			.replace(/```[\s\S]*?```/g, " ")
			.replace(/[#>*_`~\[\]()]/g, "")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 180);

	let lastFocused = null;

	const focusablesIn = (root) =>
		root.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);

	const trapTab = (event) => {
		if (event.key !== "Tab" || !modal) return;
		const items = focusablesIn(modal);
		if (!items.length) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	const closeModal = () => {
		modal?.classList.remove("open");
		document.body.classList.remove("modal-open");
		modal?.removeEventListener("keydown", trapTab);
		if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
		lastFocused = null;
	};

	const openModal = (post, opener) => {
		if (!modal || !window.SummitMarkdown) return;

		lastFocused = opener || document.activeElement;
		const content = getLocaleContent(post);
		const text = strings();
		modal.querySelector("[data-news-title]").textContent =
			content.title || text.news;
		const meta = modal.querySelector("[data-news-meta]");
		meta.replaceChildren();
		const time = document.createElement("time");
		time.setAttribute("datetime", isoDate(post.date));
		time.textContent = formatDate(post.date);
		meta.append(time, ` · ${text.news}`);
		modal.querySelector("[data-news-body]").innerHTML =
			window.SummitMarkdown.render(content.body || "");
		modal.classList.add("open");
		document.body.classList.add("modal-open");
		modal.addEventListener("keydown", trapTab);
		modal.querySelector("[data-news-close]")?.focus();
	};

	const setLoading = (root) => {
		root.replaceChildren();
		const box = document.createElement("div");
		box.className = "news-loading card";
		box.setAttribute("data-news-loading", "");
		const label = document.createElement("span");
		label.setAttribute("data-i18n", "news.loading");
		label.textContent = strings().loading;
		box.appendChild(label);
		root.appendChild(box);
	};

	const showEmpty = (root) => {
		root.replaceChildren();
		const empty = document.createElement("div");
		empty.className = "news-empty card";
		empty.setAttribute("data-i18n", "news.empty");
		empty.textContent = strings().empty;
		root.appendChild(empty);
	};

	const showError = (root, retry) => {
		root.replaceChildren();
		const box = document.createElement("div");
		box.className = "news-error card";
		box.setAttribute("role", "alert");
		const msg = document.createElement("span");
		msg.setAttribute("data-i18n", "news.loadError");
		msg.textContent = strings().loadError;
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "news-retry";
		btn.setAttribute("data-i18n", "news.retry");
		btn.textContent = strings().retry;
		btn.addEventListener("click", retry);
		box.append(msg, btn);
		root.appendChild(box);
	};

	const buildCard = (post) => {
		const content = getLocaleContent(post);
		if (!content.title || !content.body || post.published === false)
			return null;

		let card;
		if (cardTpl && cardTpl.content.firstElementChild) {
			card = cardTpl.content.firstElementChild.cloneNode(true);
		} else {
			card = document.createElement("article");
			card.className = "card news-card";
			card.innerHTML =
				'<button class="news-card-button" type="button"><time datetime=""></time><h3></h3><p></p><span class="news-card-link" data-news-open-label></span></button>';
		}

		const time = card.querySelector("time");
		time.setAttribute("datetime", isoDate(post.date));
		time.textContent = formatDate(post.date);
		card.querySelector("h3").textContent = content.title;
		card.querySelector("p").textContent = excerptOf(content);
		const openLabel =
			card.querySelector("[data-news-open-label]") ||
			card.querySelector(".news-card-link");
		openLabel.setAttribute("data-i18n", "news.open");
		openLabel.textContent = `${strings().open} →`;

		const button = card.querySelector("button");
		button.addEventListener("click", () => openModal(post, button));
		return card;
	};

	// Latest = first 3 posts; archive = the rest.
	// render() always clears its roots first (replaceChildren), so every
	// branch — posts, empty, error — hides the [data-news-loading] stub.
	const render = (posts) => {
		const latestRoot = latest();
		const gridRoot = gridEl();
		const targets = [latestRoot, gridRoot].filter(Boolean);
		if (!posts.length) {
			targets.forEach((root) => {
				showEmpty(root);
			});
			return;
		}

		const latestPosts = posts.slice(0, 3);
		const archivePosts = posts.slice(3);

		if (latestRoot) {
			latestRoot.replaceChildren();
			latestPosts.forEach((post) => {
				const card = buildCard(post);
				if (card) latestRoot.appendChild(card);
			});
			if (!latestRoot.children.length) showEmpty(latestRoot);
		}

		if (!gridRoot) return;
		gridRoot.replaceChildren();
		archivePosts.forEach((post) => {
			const card = buildCard(post);
			if (card) gridRoot.appendChild(card);
		});
		if (!gridRoot.children.length) showEmpty(gridRoot);
	};

	const normalize = (data) =>
		(Array.isArray(data)
			? data
			: Array.isArray(data.posts)
				? data.posts
				: []
		).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

	// fetch with an AbortController timeout so a hanging Supabase
	// endpoint can never leave the feed in "Loading…" forever.
	const fetchJson = async (url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) => {
		const controller = new AbortController();
		const timer = setTimeout(
			() => controller.abort(new Error(`timeout after ${timeoutMs}ms: ${url}`)),
			timeoutMs,
		);
		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			return await response.json();
		} finally {
			clearTimeout(timer);
		}
	};

	const fetchLocal = async () =>
		normalize(await fetchJson("data/news.json", { cache: "no-store" }));

	const fetchRemote = async () => {
		const url = storageUrl();
		if (!url) throw new Error("no supabase config");
		return normalize(
			await fetchJson(`${url}?v=${Date.now()}`, {
				cache: "no-store",
				headers: {
					apikey: config.anonKey,
					Authorization: `Bearer ${config.anonKey}`,
				},
			}),
		);
	};

	let lastPosts = null;
	let inFlight = null;

	const load = () => {
		// Idempotent + re-callable: concurrent callers share one flight;
		// render() re-queries the containers every time, so a Vue
		// $forceUpdate that wiped the cards is repaired, not duplicated.
		if (inFlight) return inFlight;
		inFlight = (async () => {
			[latest(), gridEl()].filter(Boolean).forEach((root) => {
				setLoading(root);
			});
			// Prefer remote feed when configured; fall back to local JSON,
			// then to the built-in array (file:// preview).
			try {
				if (config) {
					try {
						lastPosts = await fetchRemote();
						render(lastPosts);
						return lastPosts;
					} catch (remoteError) {
						console.warn("Summit news feed (remote):", remoteError);
					}
				}
				try {
					lastPosts = await fetchLocal();
					render(lastPosts);
				} catch (localError) {
					console.warn("Summit news feed (local):", localError);
					lastPosts = [...FALLBACK_POSTS].sort((a, b) =>
						String(b.date || "").localeCompare(String(a.date || "")),
					);
					render(lastPosts);
				}
			} catch (error) {
				console.error("Summit news feed:", error);
				const retry = () => load();
				[latest(), gridEl()].filter(Boolean).forEach((root) => {
					showError(root, retry);
				});
			}
			return lastPosts;
		})().finally(() => {
			inFlight = null;
		});
		return inFlight;
	};

	// Re-callable handle for console / other scripts.
	window.SummitNews = window.SummitNews || {};
	window.SummitNews.reload = load;
	window.SummitNews.render = (posts) => {
		if (Array.isArray(posts)) lastPosts = posts;
		if (lastPosts) render(lastPosts);
	};

	document.querySelectorAll("[data-news-close]").forEach((button) => {
		button.addEventListener("click", closeModal);
	});

	modal?.addEventListener("click", (event) => {
		if (event.target === modal) closeModal();
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") closeModal();
	});

	// app.js has no lang-change event today: re-render in the current
	// language when the <html lang> flips (MutationObserver), when the
	// i18n-ready signal arrives, and once more on a timer as a safety net
	// for the Vue $forceUpdate that wipes vanilla cards out of #app.
	const rerenderCurrent = () => {
		if (lastPosts) render(lastPosts);
		else load();
	};
	document.addEventListener("summit:i18n-ready", rerenderCurrent);
	document.addEventListener("summit:lang-changed", rerenderCurrent);
	try {
		new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === "attributes" && m.attributeName === "lang") {
					rerenderCurrent();
					break;
				}
			}
		}).observe(document.documentElement, { attributes: true });
	} catch (observerError) {
		console.warn("Summit news feed (lang observer):", observerError);
	}
	setTimeout(() => {
		// Repair pass: if Vue re-rendered #app after our insert, the cards
		// are gone and/or the loading stub is back — render again.
		const stale =
			document.querySelector("[data-news-loading]") ||
			(gridEl() && !gridEl().children.length && lastPosts?.length);
		if (stale) rerenderCurrent();
	}, 1500);

	load();
})();
