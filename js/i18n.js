/* Summit Linux — i18n engine.
   Works with plain data-i18n="key" attributes on any element.

   Language persistence works two ways at once, so switching language
   on ANY page carries over to EVERY other page of the site:

   1. localStorage — works instantly across all pages when the site
      is served from a real origin (http/https, GitHub Pages, etc).

   2. A "lang" query parameter that this script automatically adds
      to every internal link on the page. This makes the language
      travel along even when the site is opened directly from disk
      (file://), where browsers do not share localStorage between
      separate .html files.

   Falls back gracefully: chosen language -> English -> original
   markup already present in the page (so nothing ever goes blank). */

(function () {
    "use strict";

    var STORAGE_KEY = "summit-lang";
    var URL_PARAM = "lang";
    var DEFAULT_LANG = "en";

    var DICT = window.SUMMIT_I18N || {};
    var LANGS = window.SUMMIT_LANGS || [];

    var originals = new Map();

    function captureOriginals() {
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            if (!originals.has(el)) {
                originals.set(el, el.innerHTML);
            }
        });
    }

    function resolve(lang, key) {
        var langDict = DICT[lang] || {};
        var enDict = DICT[DEFAULT_LANG] || {};

        if (Object.prototype.hasOwnProperty.call(langDict, key)) {
            return langDict[key];
        }

        if (Object.prototype.hasOwnProperty.call(enDict, key)) {
            return enDict[key];
        }

        return null;
    }

    function isInternalPageLink(href) {
        if (!href) return false;
        if (href.charAt(0) === "#") return false;
        if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^file:/i.test(href)) return false;
        if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return false;
        if (!/\.html?(\?|#|$)/i.test(href)) return false;
        return true;
    }

    function withLangParam(href, lang) {
        var hash = "";
        var main = href;
        var hashIndex = href.indexOf("#");

        if (hashIndex !== -1) {
            hash = href.slice(hashIndex);
            main = href.slice(0, hashIndex);
        }

        var query = "";
        var path = main;
        var qIndex = main.indexOf("?");

        if (qIndex !== -1) {
            path = main.slice(0, qIndex);
            query = main.slice(qIndex + 1);
        }

        var params = [];
        query.split("&").forEach(function (pair) {
            if (!pair) return;
            var k = pair.split("=")[0];
            if (k !== URL_PARAM) params.push(pair);
        });
        params.push(URL_PARAM + "=" + encodeURIComponent(lang));

        return path + "?" + params.join("&") + hash;
    }

    function syncInternalLinks(lang) {
        document.querySelectorAll("a[href]").forEach(function (a) {
            var href = a.getAttribute("href");
            if (isInternalPageLink(href)) {
                a.setAttribute("href", withLangParam(href, lang));
            }
        });
    }

    function syncAddressBar(lang) {
        if (!window.history || !window.history.replaceState) return;
        try {
            var href = withLangParam(
                window.location.pathname.split("/").pop() +
                    window.location.search +
                    window.location.hash,
                lang
            );
            window.history.replaceState(null, "", href);
        } catch (e) {
            /* some browsers block history edits on file:// — safe to ignore */
        }
    }

    function applyLang(lang, options) {
        options = options || {};

        captureOriginals();

        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var key = el.getAttribute("data-i18n");
            var value = resolve(lang, key);

            if (value !== null) {
                el.innerHTML = value;
            } else if (originals.has(el)) {
                el.innerHTML = originals.get(el);
            }
        });

        document.documentElement.setAttribute("lang", lang);

        document.querySelectorAll(".language-button").forEach(function (btn) {
            var codeEl = btn.querySelector(".language-code");
            if (codeEl) {
                codeEl.textContent = lang.toUpperCase();
            }
        });

        document.querySelectorAll(".language-menu a[data-lang]").forEach(function (a) {
            var active = a.getAttribute("data-lang") === lang;
            a.classList.toggle("active", active);
            a.setAttribute("aria-current", active ? "true" : "false");
        });

        syncInternalLinks(lang);

        if (!options.skipAddressBar) {
            syncAddressBar(lang);
        }

        try {
            window.localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            /* storage unavailable (private mode, file://, etc.) —
               the link-based propagation above still keeps every
               page in sync as the user navigates the site. */
        }
    }

    function getLangFromURL() {
        try {
            var params = new URLSearchParams(window.location.search);
            var fromUrl = params.get(URL_PARAM);
            if (fromUrl && DICT[fromUrl]) {
                return fromUrl;
            }
        } catch (e) {
            /* ignore */
        }
        return null;
    }

    function getLangFromStorage() {
        try {
            var stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && DICT[stored]) {
                return stored;
            }
        } catch (e) {
            /* ignore */
        }
        return null;
    }

    function getLangFromBrowser() {
        var nav = (navigator.language || navigator.userLanguage || DEFAULT_LANG)
            .toLowerCase()
            .slice(0, 2);
        return DICT[nav] ? nav : null;
    }

    function detectInitialLang() {
        return (
            getLangFromURL() ||
            getLangFromStorage() ||
            getLangFromBrowser() ||
            DEFAULT_LANG
        );
    }

    function buildLanguageMenu() {
        document.querySelectorAll(".language-menu[data-i18n-menu]").forEach(function (menu) {
            menu.innerHTML = "";

            LANGS.forEach(function (lang) {
                var a = document.createElement("a");
                a.href = "#";
                a.setAttribute("data-lang", lang.code);
                a.setAttribute("role", "menuitem");
                a.innerHTML =
                    '<span class="flag" aria-hidden="true">' + lang.flag + "</span>" +
                    '<span class="lang-name">' + lang.name + "</span>";
                menu.appendChild(a);
            });
        });
    }

    function wireMenus() {
        document.querySelectorAll(".language-menu a[data-lang]").forEach(function (a) {
            a.addEventListener("click", function (event) {
                event.preventDefault();
                applyLang(a.getAttribute("data-lang"));

                var menu = a.closest(".language");
                if (menu) {
                    var btn = menu.querySelector(".language-button");
                    if (btn) {
                        btn.setAttribute("aria-expanded", "false");
                        btn.focus();
                    }
                    menu.classList.remove("open");
                }
            });
        });

        document.querySelectorAll(".language-button").forEach(function (btn) {
            btn.setAttribute("aria-haspopup", "true");
            btn.setAttribute("aria-expanded", "false");

            btn.addEventListener("click", function (event) {
                event.stopPropagation();

                var wrap = btn.closest(".language");
                var isOpen = wrap.classList.toggle("open");
                btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        });

        document.addEventListener("click", function () {
            document.querySelectorAll(".language.open").forEach(function (wrap) {
                wrap.classList.remove("open");
                var btn = wrap.querySelector(".language-button");
                if (btn) btn.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                document.querySelectorAll(".language.open").forEach(function (wrap) {
                    wrap.classList.remove("open");
                });
            }
        });

        /* Live sync across tabs/windows open on the same origin: if the
           user changes language in one tab, every other open tab of the
           site updates immediately without needing a reload. */
        window.addEventListener("storage", function (event) {
            if (event.key === STORAGE_KEY && event.newValue && DICT[event.newValue]) {
                applyLang(event.newValue, { skipAddressBar: true });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        buildLanguageMenu();
        wireMenus();
        applyLang(detectInitialLang(), { skipAddressBar: true });
    });
})();
