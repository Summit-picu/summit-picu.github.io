/**
 * Summit Linux — status page enhancements.
 *
 * - Fetches data/version.json once on load (no setInterval auto-refresh
 *   to avoid surprise network traffic; manual reload re-polls).
 * - Renders banner + footer version text from a single source
 *   (static fallback text in HTML covers no-JS).
 * - Updates <time data-status-updated> "last checked" element.
 * - Toggles the mirror table empty-state row (#mirror-empty) when
 *   #mirror-tbody has no data rows.
 */
(() => {
	"use strict";

	function updateEmptyState() {
		var tbody = document.getElementById("mirror-tbody");
		if (!tbody) return;
		var empty = document.getElementById("mirror-empty");
		if (!empty) return;
		var rows = tbody.querySelectorAll("tr:not(#mirror-empty)");
		empty.hidden = rows.length !== 0;
	}

	function applyVersion(data) {
		if (!data || typeof data !== "object") return;
		var site = typeof data.site === "string" ? data.site : "";
		var updated = typeof data.updated === "string" ? data.updated : "";
		if (!site || !updated) return;
		var label = site + " · " + updated;

		document.querySelectorAll("[data-status-version]").forEach(function (el) {
			el.textContent = label;
		});

		var time = document.querySelector("[data-status-updated]");
		if (time) {
			time.setAttribute("datetime", updated);
			time.textContent = updated;
			time.setAttribute("title", "Version: " + label);
		}
	}

	function loadVersionOnce() {
		updateEmptyState();
		if (!("fetch" in window)) return;
		fetch("data/version.json", { cache: "no-cache" })
			.then(function (res) {
				if (!res.ok) throw new Error("version.json HTTP " + res.status);
				return res.json();
			})
			.then(applyVersion)
			.catch(function () {
				/* keep static fallback text */
			});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", loadVersionOnce, {
			once: true,
		});
	} else {
		loadVersionOnce();
	}
})();
