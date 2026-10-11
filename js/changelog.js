/**
 * Summit Linux — changelog page interactions.
 *
 * Owns: print button binding, footer version injection from
 * data/version.json (single source of truth), and the client-side
 * version filter. No shared files are touched from here.
 */
(() => {
	"use strict";

	function setupPrint() {
		const printBtn = document.getElementById("chlPrint");
		if (!printBtn || printBtn.hasAttribute("data-print-bound")) return;
		printBtn.setAttribute("data-print-bound", "true");
		printBtn.addEventListener("click", () => {
			window.print();
		});
	}

	function setupVersion() {
		const versionEl = document.getElementById("chlVersion");
		if (!versionEl) return;
		window
			.fetch("data/version.json", { headers: { Accept: "application/json" } })
			.then((res) => {
				if (!res.ok) throw new Error(`version.json: HTTP ${res.status}`);
				return res.json();
			})
			.then((data) => {
				const site = typeof data?.site === "string" ? data.site.trim() : "";
				const updated =
					typeof data?.updated === "string" ? data.updated.trim() : "";
				const text = [site, updated].filter(Boolean).join(" · ");
				if (text) versionEl.textContent = text;
			})
			.catch(() => {
				/* keep the static fallback text in the HTML */
			});
	}

	function setupFilter() {
		const filter = document.getElementById("chlFilter");
		const noMatch = document.getElementById("chlNoMatch");
		if (!(filter instanceof HTMLInputElement)) return;
		const groups = Array.from(document.querySelectorAll(".rel-group"));
		if (!groups.length) return;
		const archive = document.querySelector("details.rel-archive");

		filter.addEventListener("input", () => {
			const query = filter.value.trim().toLowerCase();
			let visible = 0;
			groups.forEach((group) => {
				const haystack = (group.textContent || "").toLowerCase();
				const show = !query || haystack.includes(query);
				group.style.display = show ? "" : "none";
				if (show) visible += 1;
			});
			// While filtering, force the archive open so matches inside
			// collapsed eras stay visible; restore when the query clears.
			if (archive instanceof HTMLDetailsElement) {
				if (query) archive.open = true;
				else archive.removeAttribute("open");
			}
			if (noMatch instanceof HTMLElement) {
				noMatch.hidden = visible !== 0;
			}
		});
	}

	document.addEventListener("DOMContentLoaded", () => {
		setupPrint();
		setupVersion();
		setupFilter();
	});
})();
