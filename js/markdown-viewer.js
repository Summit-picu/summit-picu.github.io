/**
 * Summit Linux — Markdown rendering.
 *
 * Uses marked for GitHub-Flavored Markdown and DOMPurify for sanitization.
 * Highlight.js is used when it is available for fenced code blocks.
 */
(() => {
    "use strict";

    const escapeHtml = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (character) => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            };

            return entities[character];
        });

    const highlightCode = (code, language) => {
        if (!window.hljs) return escapeHtml(code);

        const normalizedLanguage = String(language || "").toLowerCase();

        if (normalizedLanguage && window.hljs.getLanguage(normalizedLanguage)) {
            return window.hljs.highlight(code, {
                language: normalizedLanguage,
            }).value;
        }

        return window.hljs.highlightAuto(code).value;
    };

    const renderMarkdown = (source) => {
        if (!window.marked || !window.DOMPurify) {
            return "<p>Markdown renderer is not available.</p>";
        }

        const renderer = new window.marked.Renderer();

        renderer.link = ({ href, title, text }) => {
            const safeTitle = title ? ` title="${escapeHtml(title)}"` : "";
            return `<a href="${escapeHtml(href)}"${safeTitle} target="_blank" rel="noopener noreferrer">${text}</a>`;
        };

        renderer.code = ({ text, lang }) => {
            const language = String(lang || "").trim();
            const className = language ? ` class="language-${escapeHtml(language)}"` : "";
            return `<pre><code${className}>${highlightCode(text, language)}</code></pre>`;
        };

        const html = window.marked.parse(String(source ?? ""), {
            async: false,
            breaks: false,
            gfm: true,
            headerIds: false,
            mangle: false,
            renderer,
        });

        return window.DOMPurify.sanitize(html, {
            USE_PROFILES: { html: true },
            ADD_ATTR: ["target", "rel", "loading"],
        });
    };

    window.SummitMarkdown = {
        render: renderMarkdown,
    };
})();
