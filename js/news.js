/**
 * Summit Linux — public news feed.
 *
 * News is read from a PRIVATE Supabase Storage bucket through the
 * Storage API using the browser-safe publishable key. The public
 * site never writes to Storage.
 */
(() => {
    "use strict";

    const config = window.SUMMIT_SUPABASE;
    const isRussian = document.documentElement.lang === "ru";
    const grid = document.querySelector('[data-news-grid="true"]');
    const modal = document.getElementById("news-viewer");

    if (!config || !grid) return;

    const text = isRussian
        ? {
              empty: "Пока новостей нет.",
              loadError: "Не удалось загрузить новости.",
              open: "Открыть",
              close: "Закрыть",
              news: "Новость",
          }
        : {
              empty: "No news yet.",
              loadError: "Could not load the news feed.",
              open: "Open",
              close: "Close",
              news: "News",
          };

    const storageUrl = () => {
        const base = config.url.replace(/\/$/, "");
        const bucket = encodeURIComponent(config.newsBucket);
        const path = config.newsPath
            .split("/")
            .map(encodeURIComponent)
            .join("/");

        return `${base}/storage/v1/object/${bucket}/${path}`;
    };

    const formatDate = (value) => {
        if (!value) return "";

        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) return value;

        return new Intl.DateTimeFormat(isRussian ? "ru-RU" : "en-GB", {
            dateStyle: "long",
        }).format(date);
    };

    const getLocaleContent = (post) => post[isRussian ? "ru" : "en"] || {};

    const closeModal = () => {
        modal?.classList.remove("open");
        document.body.classList.remove("modal-open");
    };

    const openModal = (post) => {
        if (!modal || !window.SummitMarkdown) return;

        const content = getLocaleContent(post);
        modal.querySelector("[data-news-title]").textContent = content.title || text.news;
        modal.querySelector("[data-news-meta]").textContent = `${formatDate(post.date)} · ${text.news}`;
        modal.querySelector("[data-news-body]").innerHTML = window.SummitMarkdown.render(content.body || "");
        modal.classList.add("open");
        document.body.classList.add("modal-open");
    };

    const render = (posts) => {
        grid.replaceChildren();

        if (!posts.length) {
            const empty = document.createElement("div");
            empty.className = "news-empty card";
            empty.textContent = text.empty;
            grid.appendChild(empty);
            return;
        }

        posts.forEach((post) => {
            const content = getLocaleContent(post);
            if (!content.title || !content.body || post.published === false) return;

            const card = document.createElement("article");
            card.className = "card news-card";
            card.innerHTML = `
                <button class="news-card-button" type="button">
                    <small>${formatDate(post.date)}</small>
                    <h3></h3>
                    <p></p>
                    <span class="news-card-link">${text.open} →</span>
                </button>
            `;

            card.querySelector("h3").textContent = content.title;
            card.querySelector("p").textContent =
                content.excerpt ||
                content.body
                    .replace(/```[\s\S]*?```/g, " ")
                    .replace(/[#>*_`~\[\]()]/g, "")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 180);

            card.querySelector("button").addEventListener("click", () => openModal(post));
            grid.appendChild(card);
        });
    };

    const load = async () => {
        try {
            const response = await fetch(`${storageUrl()}?v=${Date.now()}`, {
                cache: "no-store",
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${config.anonKey}`,
                },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const posts = Array.isArray(data)
                ? data
                : Array.isArray(data.posts)
                  ? data.posts
                  : [];

            posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
            render(posts);
        } catch (error) {
            console.error("Summit news feed:", error);
            grid.innerHTML = `<div class="news-empty card">${text.loadError}</div>`;
        }
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

    load();
})();
