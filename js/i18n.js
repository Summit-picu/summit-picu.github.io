/**
 * Summit Linux — client-side chrome i18n (no duplicated page files).
 *
 * - Dictionaries for 25 languages: full en + ru, chrome + picu-content
 *   entries for the rest (code samples inside pre/code/.terminal are
 *   never touched — see apply()).
 * - Article content always stays as authored (EN on -eng pages, RU on -ru).
 *   Other languages translate the chrome and show a toast:
 *   "Full translation coming — showing English".
 * - Language choice persists in localStorage under "summit-lang"
 *   (same key used by js/main.js).
 * - Legacy snake_case data-i18n keys from picu.html are supported
 *   via ALIAS and map to the same canonical dictionaries.
 */
(() => {
	"use strict";

	const LANG_KEY = "summit-lang";
	const FALLBACK = "en";

	const LANGS = [
		"en",
		"ru",
		"uk",
		"zh",
		"ja",
		"de",
		"fr",
		"pl",
		"es",
		"pt",
		"it",
		"tr",
		"ar",
		"hi",
		"bn",
		"id",
		"vi",
		"ko",
		"nl",
		"sv",
		"cs",
		"ro",
		"hu",
		"el",
		"kk",
	];

	const NATIVE = {
		en: "English",
		ru: "Русский",
		uk: "Українська",
		zh: "中文",
		ja: "日本語",
		de: "Deutsch",
		fr: "Français",
		pl: "Polski",
		es: "Español",
		pt: "Português",
		it: "Italiano",
		tr: "Türkçe",
		ar: "العربية",
		hi: "हिन्दी",
		bn: "বাংলা",
		id: "Bahasa Indonesia",
		vi: "Tiếng Việt",
		ko: "한국어",
		nl: "Nederlands",
		sv: "Svenska",
		cs: "Čeština",
		ro: "Română",
		hu: "Magyar",
		el: "Ελληνικά",
		kk: "Қазақша",
	};

	/** Legacy picu.html snake_case keys -> canonical keys. */
	const ALIAS = {
		nav_home: "nav.home",
		nav_about: "nav.about",
		nav_download: "nav.download",
		nav_picu: "nav.picu",
		nav_wiki: "nav.wiki",
		footer_copyright: "foot.note",
		picu_title: "content.picuTitle",
		picu_intro: "content.picuIntro",
		picu_commands_h2: "content.picuCommandsH2",
		picu_source_h2: "content.picuSourceH2",
		picu_source_p: "content.picuSourceP",
		picu_binary_h2: "content.picuBinaryH2",
		picu_binary_p: "content.picuBinaryP",
		picu_trust_h2: "content.picuTrustH2",
		picu_trust_callout_label: "content.picuTrustCalloutLabel",
		picu_trust_callout_text: "content.picuTrustCalloutText",
		picu_example_h2: "content.picuExampleH2",
		footer_commands: "content.footerCommands",
		footer_security: "content.footerSecurity",
		footer_recipes: "content.footerRecipes",
	};

	const I18N = {
		en: {
			"nav.home": "Home",
			"nav.about": "About",
			"nav.download": "Download",
			"nav.picu": "picu",
			"nav.news": "News",
			"nav.wiki": "Wiki",
			"nav.status": "Status",
			"toc.title": "Contents",
			"crumb.home": "Home",
			"btn.download": "Download",
			"btn.meetPicu": "Meet picu",
			"btn.openWiki": "Open Wiki",
			"btn.picuGuide": "picu guide",
			"btn.aboutProject": "About the project",
			"btn.systemStatus": "System status",
			"btn.downloadPdf": "Download PDF",
			"btn.sourceCode": "Source code",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (soon)",
			"foot.note": "Summit Linux & picu · Independent open-source project",
			"search.placeholder": "Search…",
			"aria.navToggle": "Open menu",
			"aria.themeLight": "Switch to light theme",
			"aria.themeDark": "Switch to dark theme",
			"aria.toTop": "Scroll to top",
			"toast.coming": "Full translation coming — showing English",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "About · Summit Linux",
			"meta.title.download": "Download · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "News · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Status · Summit Linux",
			"meta.title.developing": "In developing · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Independent Linux distribution built on LFS with picu package manager: transparency, security, source builds.",
			"meta.desc.about":
				"Summit Linux philosophy, LFS source-based system, picu package manager stack and roadmap.",
			"meta.desc.download":
				"Download Summit Linux images, verify checksums and signatures, system requirements.",
			"meta.desc.picu":
				"picu package manager: source recipes, binary packages, signed mirrors and trust model.",
			"meta.desc.news":
				"Summit Linux news: releases, picu updates and project milestones.",
			"meta.desc.wiki":
				"Summit Linux Wiki: installation, picu commands, repositories, mirrors and FAQ.",
			"meta.desc.status":
				"Summit Linux status — site, mirrors, picu registry and CI.",
			"meta.desc.developing": "Page in developing — Summit Linux.",
			"meta.desc.404": "Page not found — Summit Linux.",
			"hero.lead":
				"Independent Linux distribution based on LFS, focused on transparency, stability, minimal overhead, and complete control over the system.",
			"err.lead": "page not found",
			"banner.text":
				"Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl":
				"<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort":
				"<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu is the package manager at the centre of Summit Linux. It handles source builds, binary packages, repositories, signatures and package metadata.",
			"content.picuCommandsH2": "Core commands",
			"content.picuSourceH2": "Source builds",
			"content.picuSourceP":
				"Packages can be described using declarative <code>.picu</code> recipes.",
			"content.picuBinaryH2": "Binary packages",
			"content.picuBinaryP":
				"picu can install signed binary tarballs after validating their hashes and signatures.",
			"content.picuTrustH2": "Trust",
			"content.picuTrustCalloutLabel":
				"Unsafe repositories are blocked by default.",
			"content.picuTrustCalloutText":
				"An explicit <code>--allow-unsafe</code> override is required to install from an unsafe mirror.",
			"content.picuExampleH2": "Example",
			"content.footerCommands": "Commands",
			"content.footerSecurity": "Security",
			"content.footerRecipes": "Recipes",
			"err.missing": "missing:",
		},
		ru: {
			"nav.home": "Главная",
			"nav.about": "О проекте",
			"nav.download": "Скачать",
			"nav.picu": "picu",
			"nav.news": "Новости",
			"nav.wiki": "Вики",
			"nav.status": "Статус",
			"toc.title": "Содержание",
			"crumb.home": "Главная",
			"btn.download": "Скачать",
			"btn.meetPicu": "Что такое picu",
			"btn.openWiki": "Открыть вики",
			"btn.picuGuide": "Гайд по picu",
			"btn.aboutProject": "О проекте",
			"btn.systemStatus": "Статус системы",
			"btn.downloadPdf": "Скачать PDF",
			"btn.sourceCode": "Source code",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (скоро)",
			"foot.note":
				"Summit Linux и picu · Независимый проект с открытым исходным кодом",
			"search.placeholder": "Поиск…",
			"aria.navToggle": "Открыть меню",
			"aria.themeLight": "Перейти на светлую тему",
			"aria.themeDark": "Перейти на тёмную тему",
			"aria.toTop": "Наверх",
			"toast.coming": "Полный перевод скоро — показан английский",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "О проекте · Summit Linux",
			"meta.title.download": "Скачать · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Новости · Summit Linux",
			"meta.title.wiki": "Вики · Summit Linux",
			"meta.title.status": "Статус · Summit Linux",
			"meta.title.developing": "В разработке · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Независимый дистрибутив Linux на базе LFS с менеджером picu: прозрачность, безопасность, сборка из исходников.",
			"meta.desc.about":
				"Философия Summit Linux, система на базе LFS, пакетный менеджер picu и дорожная карта.",
			"meta.desc.download":
				"Скачать образы Summit Linux, проверка контрольных сумм и подписей, системные требования.",
			"meta.desc.picu":
				"Пакетный менеджер picu: рецепты из исходников, бинарные пакеты, подписанные зеркала и модель доверия.",
			"meta.desc.news":
				"Новости Summit Linux: релизы, обновления picu и этапы проекта.",
			"meta.desc.wiki":
				"Вики Summit Linux: установка, команды picu, репозитории, зеркала и частые вопросы.",
			"meta.desc.status":
				"Статус Summit Linux — сайт, зеркала, реестр picu и CI.",
			"meta.desc.developing": "Страница в разработке — Summit Linux.",
			"meta.desc.404": "Страница не найдена — Summit Linux.",
			"hero.lead":
				"Независимый дистрибутив Linux на базе LFS, ориентированный на прозрачность, стабильность, минимальные накладные расходы и полный контроль над системой.",
			"err.lead": "страница не найдена",
			"banner.text":
				"Последнее: picu 0.3.0 — ротация доверия. Подписанные зеркала скоро.",
			"banner.link": "Читать новости",
			"banner.dismiss": "Закрыть",
			"shots.kicker": "Скриншоты",
			"shots.title": "Summit в картинках.",
			"shots.lead": "Заглушки — настоящие скриншоты будут добавлены сюда.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Официальные / зеркала сообщества",
			"mir.link": "Список зеркал",
			"mir.col.mirror": "Зеркало",
			"mir.col.type": "Тип",
			"mir.col.url": "URL",
			"mir.col.status": "Статус",
			"mir.official": "Официальное зеркало",
			"mir.community": "Зеркало сообщества",
			"mir.communities": "Зеркала сообщества",
			"mir.local": "Локальная сборка",
			"mir.signedPlanned": "Подписанный индекс (в планах)",
			"mir.signed": "Подписанный индекс",
			"mir.cook": "picu cook",
			"mir.officialUrl":
				"<code>mirror.summit-linux.org</code> (скоро — пока недоступно)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (скоро)",
			"mir.noCommunity": "— (зеркал сообщества пока нет)",
			"mir.none": "—",
			"mir.comingSoon": "Скоро",
			"mir.available": "Доступно",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu — пакетный менеджер в центре Summit Linux. Он управляет сборкой из исходников, бинарными пакетами, репозиториями, подписями и метаданными пакетов.",
			"content.picuCommandsH2": "Основные команды",
			"content.picuSourceH2": "Сборка из исходников",
			"content.picuSourceP":
				"Пакеты описываются декларативными <code>.picu</code>-рецептами.",
			"content.picuBinaryH2": "Бинарные пакеты",
			"content.picuBinaryP":
				"picu умеет устанавливать подписанные бинарные архивы после проверки хешей и подписей.",
			"content.picuTrustH2": "Доверие",
			"content.picuTrustCalloutLabel":
				"Небезопасные репозитории заблокированы по умолчанию.",
			"content.picuTrustCalloutText":
				"Для установки с небезопасного зеркала нужен явный флаг <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Пример",
			"content.footerCommands": "Команды",
			"content.footerSecurity": "Безопасность",
			"content.footerRecipes": "Рецепты",
			"err.missing": "отсутствует:",
		},
		uk: {
			"nav.home": "Головна",
			"nav.about": "Про проєкт",
			"nav.download": "Завантажити",
			"nav.picu": "picu",
			"nav.news": "Новини",
			"nav.wiki": "Вікі",
			"nav.status": "Статус",
			"toc.title": "Зміст",
			"crumb.home": "Головна",
			"btn.download": "Завантажити",
			"btn.meetPicu": "Що таке picu",
			"btn.openWiki": "Відкрити вікі",
			"btn.picuGuide": "Гайд з picu",
			"btn.aboutProject": "Про проєкт",
			"btn.systemStatus": "Статус системи",
			"btn.downloadPdf": "Завантажити PDF",
			"btn.sourceCode": "Вихідний код",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (скоро)",
			"foot.note": "Summit Linux і picu · Незалежний проєкт з відкритим кодом",
			"search.placeholder": "Пошук…",
			"aria.navToggle": "Відкрити меню",
			"aria.themeLight": "Перейти до світлої теми",
			"aria.themeDark": "Перейти до темної теми",
			"aria.toTop": "Догори",
			"toast.coming": "Повний переклад скоро — показано англійську",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Про проєкт · Summit Linux",
			"meta.title.download": "Завантажити · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Новини · Summit Linux",
			"meta.title.wiki": "Вікі · Summit Linux",
			"meta.title.status": "Статус · Summit Linux",
			"meta.title.developing": "У розробці · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Незалежний дистрибутив Linux на базі LFS з менеджером пакетів picu: прозорість, безпека, збірка з джерел.",
			"meta.desc.about":
				"Філософія Summit Linux, система на базі LFS, менеджер пакетів picu та дорожня карта.",
			"meta.desc.download":
				"Завантажити образи Summit Linux, перевірка контрольних сум і підписів, системні вимоги.",
			"meta.desc.picu":
				"Менеджер пакетів picu: рецепти з джерел, бінарні пакети, підписані дзеркала та модель довіри.",
			"meta.desc.news":
				"Новини Summit Linux: релізи, оновлення picu та етапи проєкту.",
			"meta.desc.wiki":
				"Вікі Summit Linux: встановлення, команди picu, репозиторії, дзеркала та FAQ.",
			"meta.desc.status":
				"Статус Summit Linux — сайт, дзеркала, реєстр picu та CI.",
			"meta.desc.developing": "Сторінка в розробці — Summit Linux.",
			"meta.desc.404": "Сторінку не знайдено — Summit Linux.",
			"hero.lead":
				"Незалежний дистрибутив Linux на базі LFS, орієнтований на прозорість, стабільність, мінімальні накладні витрати та повний контроль над системою.",
			"err.lead": "сторінку не знайдено",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu — менеджер пакунків у центрі Summit Linux. Він керує збіркою з джерел, бінарними пакунками, репозиторіями, підписами та метаданими пакунків.",
			"content.picuCommandsH2": "Основні команди",
			"content.picuSourceH2": "Збірка з джерел",
			"content.picuSourceP":
				"Пакунки описуються декларативними <code>.picu</code>-рецептами.",
			"content.picuBinaryH2": "Бінарні пакунки",
			"content.picuBinaryP":
				"picu вміє встановлювати підписані бінарні архіви після перевірки хешів і підписів.",
			"content.picuTrustH2": "Довіра",
			"content.picuTrustCalloutLabel":
				"Небезпечні репозиторії заблоковано за замовчуванням.",
			"content.picuTrustCalloutText":
				"Для встановлення з небезпечного дзеркала потрібен явний прапор <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Приклад",
			"content.footerCommands": "Команди",
			"content.footerSecurity": "Безпека",
			"content.footerRecipes": "Рецепти",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		zh: {
			"nav.home": "首页",
			"nav.about": "关于",
			"nav.download": "下载",
			"nav.picu": "picu",
			"nav.news": "新闻",
			"nav.wiki": "维基",
			"nav.status": "状态",
			"toc.title": "目录",
			"crumb.home": "首页",
			"btn.download": "下载",
			"btn.meetPicu": "认识 picu",
			"btn.openWiki": "打开维基",
			"btn.picuGuide": "picu 指南",
			"btn.aboutProject": "关于本项目",
			"btn.systemStatus": "系统状态",
			"btn.downloadPdf": "下载 PDF",
			"btn.sourceCode": "源代码",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord（即将推出）",
			"foot.note": "Summit Linux 与 picu · 独立开源项目",
			"search.placeholder": "搜索…",
			"aria.navToggle": "打开菜单",
			"aria.themeLight": "切换到浅色主题",
			"aria.themeDark": "切换到深色主题",
			"aria.toTop": "回到顶部",
			"toast.coming": "完整翻译即将推出——当前显示英文",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "关于 · Summit Linux",
			"meta.title.download": "下载 · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "新闻 · Summit Linux",
			"meta.title.wiki": "维基 · Summit Linux",
			"meta.title.status": "状态 · Summit Linux",
			"meta.title.developing": "开发中 · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"基于 LFS 的独立 Linux 发行版，配备 picu 包管理器：透明、安全、源码构建。",
			"meta.desc.about":
				"Summit Linux 理念、基于 LFS 的源码系统、picu 包管理器技术栈与路线图。",
			"meta.desc.download":
				"下载 Summit Linux 镜像，校验校验和与签名，系统要求。",
			"meta.desc.picu":
				"picu 包管理器：源码配方、二进制包、签名镜像与信任模型。",
			"meta.desc.news": "Summit Linux 新闻：版本发布、picu 更新与项目里程碑。",
			"meta.desc.wiki":
				"Summit Linux 维基：安装、picu 命令、仓库、镜像与常见问题。",
			"meta.desc.status": "Summit Linux 状态——站点、镜像、picu 注册表与 CI。",
			"meta.desc.developing": "页面开发中——Summit Linux。",
			"meta.desc.404": "未找到页面——Summit Linux。",
			"hero.lead":
				"基于 LFS 的独立 Linux 发行版，注重透明、稳定、最小开销和对系统的完全控制。",
			"err.lead": "未找到页面",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu 是 Summit Linux 核心的包管理器，负责源码构建、二进制包、仓库、签名和包元数据。",
			"content.picuCommandsH2": "核心命令",
			"content.picuSourceH2": "源码构建",
			"content.picuSourceP": "软件包使用声明式 <code>.picu</code> 配方描述。",
			"content.picuBinaryH2": "二进制包",
			"content.picuBinaryP": "校验哈希与签名后，picu 可安装已签名的二进制包。",
			"content.picuTrustH2": "信任",
			"content.picuTrustCalloutLabel": "默认阻止不安全的仓库。",
			"content.picuTrustCalloutText":
				"从不安全镜像安装需要显式使用 <code>--allow-unsafe</code> 参数。",
			"content.picuExampleH2": "示例",
			"content.footerCommands": "命令",
			"content.footerSecurity": "安全",
			"content.footerRecipes": "配方",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		ja: {
			"nav.home": "ホーム",
			"nav.about": "概要",
			"nav.download": "ダウンロード",
			"nav.picu": "picu",
			"nav.news": "ニュース",
			"nav.wiki": "Wiki",
			"nav.status": "ステータス",
			"toc.title": "目次",
			"crumb.home": "ホーム",
			"btn.download": "ダウンロード",
			"btn.meetPicu": "picuとは",
			"btn.openWiki": "Wikiを開く",
			"btn.picuGuide": "picuガイド",
			"btn.aboutProject": "プロジェクトについて",
			"btn.systemStatus": "システム状態",
			"btn.downloadPdf": "PDFをダウンロード",
			"btn.sourceCode": "ソースコード",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord（近日公開）",
			"foot.note": "Summit Linux と picu · 独立したオープンソースプロジェクト",
			"search.placeholder": "検索…",
			"aria.navToggle": "メニューを開く",
			"aria.themeLight": "ライトテーマに切り替え",
			"aria.themeDark": "ダークテーマに切り替え",
			"aria.toTop": "トップへ戻る",
			"toast.coming": "完全な翻訳は近日公開——英語で表示しています",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "概要 · Summit Linux",
			"meta.title.download": "ダウンロード · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "ニュース · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "ステータス · Summit Linux",
			"meta.title.developing": "開発中 · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"LFSベースの独立したLinuxディストリビューションとpicuパッケージマネージャー：透明性、セキュリティ、ソースビルド。",
			"meta.desc.about":
				"Summit Linuxの理念、LFSベースのソースシステム、picuパッケージマネージャーとロードマップ。",
			"meta.desc.download":
				"Summit Linuxイメージのダウンロード、チェックサムと署名の検証、システム要件。",
			"meta.desc.picu":
				"picuパッケージマネージャー：ソースレシピ、バイナリパッケージ、署名付きミラーと信頼モデル。",
			"meta.desc.news":
				"Summit Linuxニュース：リリース、picuアップデート、プロジェクトの節目。",
			"meta.desc.wiki":
				"Summit Linux Wiki：インストール、picuコマンド、リポジトリ、ミラーとFAQ。",
			"meta.desc.status":
				"Summit Linuxステータス——サイト、ミラー、picuレジストリとCI。",
			"meta.desc.developing": "開発中のページ——Summit Linux。",
			"meta.desc.404": "ページが見つかりません——Summit Linux。",
			"hero.lead":
				"LFSベースの独立したLinuxディストリビューション。透明性、安定性、最小のオーバーヘッド、システムの完全な制御を重視。",
			"err.lead": "ページが見つかりません",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu は Summit Linux の中心となるパッケージマネージャーです。ソースビルド、バイナリパッケージ、リポジトリ、署名、パッケージメタデータを管理します。",
			"content.picuCommandsH2": "主要コマンド",
			"content.picuSourceH2": "ソースビルド",
			"content.picuSourceP":
				"パッケージは宣言的な <code>.picu</code> レシピで記述します。",
			"content.picuBinaryH2": "バイナリパッケージ",
			"content.picuBinaryP":
				"picu はハッシュと署名を検証したうえで署名付きバイナリをインストールできます。",
			"content.picuTrustH2": "信頼",
			"content.picuTrustCalloutLabel":
				"安全でないリポジトリはデフォルトでブロックされます。",
			"content.picuTrustCalloutText":
				"安全でないミラーからインストールするには明示的な <code>--allow-unsafe</code> フラグが必要です。",
			"content.picuExampleH2": "例",
			"content.footerCommands": "コマンド",
			"content.footerSecurity": "セキュリティ",
			"content.footerRecipes": "レシピ",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		de: {
			"nav.home": "Start",
			"nav.about": "Über",
			"nav.download": "Download",
			"nav.picu": "picu",
			"nav.news": "Neuigkeiten",
			"nav.wiki": "Wiki",
			"nav.status": "Status",
			"toc.title": "Inhalt",
			"crumb.home": "Start",
			"btn.download": "Herunterladen",
			"btn.meetPicu": "picu kennenlernen",
			"btn.openWiki": "Wiki öffnen",
			"btn.picuGuide": "picu-Anleitung",
			"btn.aboutProject": "Über das Projekt",
			"btn.systemStatus": "Systemstatus",
			"btn.downloadPdf": "PDF herunterladen",
			"btn.sourceCode": "Quellcode",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (bald)",
			"foot.note": "Summit Linux & picu · Unabhängiges Open-Source-Projekt",
			"search.placeholder": "Suchen…",
			"aria.navToggle": "Menü öffnen",
			"aria.themeLight": "Zum hellen Theme wechseln",
			"aria.themeDark": "Zum dunklen Theme wechseln",
			"aria.toTop": "Nach oben scrollen",
			"toast.coming":
				"Vollständige Übersetzung folgt — Englisch wird angezeigt",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Über · Summit Linux",
			"meta.title.download": "Download · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Neuigkeiten · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Status · Summit Linux",
			"meta.title.developing": "In Entwicklung · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Unabhängige Linux-Distribution auf LFS-Basis mit picu-Paketmanager: Transparenz, Sicherheit, Source-Builds.",
			"meta.desc.about":
				"Summit-Linux-Philosophie, LFS-quellbasiertes System, picu-Paketmanager-Stack und Roadmap.",
			"meta.desc.download":
				"Summit-Linux-Images herunterladen, Prüfsummen und Signaturen prüfen, Systemanforderungen.",
			"meta.desc.picu":
				"picu-Paketmanager: Source-Rezepte, Binärpakete, signierte Spiegel und Vertrauensmodell.",
			"meta.desc.news":
				"Summit-Linux-News: Releases, picu-Updates und Projektmeilensteine.",
			"meta.desc.wiki":
				"Summit-Linux-Wiki: Installation, picu-Befehle, Repositories, Spiegel und FAQ.",
			"meta.desc.status":
				"Summit-Linux-Status — Website, Spiegel, picu-Registry und CI.",
			"meta.desc.developing": "Seite in Entwicklung — Summit Linux.",
			"meta.desc.404": "Seite nicht gefunden — Summit Linux.",
			"hero.lead":
				"Unabhängige Linux-Distribution auf LFS-Basis mit Fokus auf Transparenz, Stabilität, minimalem Overhead und vollständiger Kontrolle über das System.",
			"err.lead": "Seite nicht gefunden",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu ist der Paketmanager im Zentrum von Summit Linux. Er verwaltet Source-Builds, Binärpakete, Repositories, Signaturen und Paketmetadaten.",
			"content.picuCommandsH2": "Kernbefehle",
			"content.picuSourceH2": "Source-Builds",
			"content.picuSourceP":
				"Pakete werden mit deklarativen <code>.picu</code>-Rezepten beschrieben.",
			"content.picuBinaryH2": "Binärpakete",
			"content.picuBinaryP":
				"picu kann signierte Binärarchive nach Prüfung von Hashes und Signaturen installieren.",
			"content.picuTrustH2": "Vertrauen",
			"content.picuTrustCalloutLabel":
				"Unsichere Repositories sind standardmäßig blockiert.",
			"content.picuTrustCalloutText":
				"Für die Installation von einem unsicheren Spiegel ist das explizite Flag <code>--allow-unsafe</code> erforderlich.",
			"content.picuExampleH2": "Beispiel",
			"content.footerCommands": "Befehle",
			"content.footerSecurity": "Sicherheit",
			"content.footerRecipes": "Rezepte",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		fr: {
			"nav.home": "Accueil",
			"nav.about": "À propos",
			"nav.download": "Télécharger",
			"nav.picu": "picu",
			"nav.news": "Nouvelles",
			"nav.wiki": "Wiki",
			"nav.status": "Statut",
			"toc.title": "Sommaire",
			"crumb.home": "Accueil",
			"btn.download": "Télécharger",
			"btn.meetPicu": "Découvrir picu",
			"btn.openWiki": "Ouvrir le wiki",
			"btn.picuGuide": "Guide picu",
			"btn.aboutProject": "À propos du projet",
			"btn.systemStatus": "État du système",
			"btn.downloadPdf": "Télécharger le PDF",
			"btn.sourceCode": "Code source",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (bientôt)",
			"foot.note": "Summit Linux et picu · Projet open source indépendant",
			"search.placeholder": "Rechercher…",
			"aria.navToggle": "Ouvrir le menu",
			"aria.themeLight": "Passer au thème clair",
			"aria.themeDark": "Passer au thème sombre",
			"aria.toTop": "Retour en haut",
			"toast.coming": "Traduction complète à venir — affichage en anglais",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "À propos · Summit Linux",
			"meta.title.download": "Télécharger · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Nouvelles · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Statut · Summit Linux",
			"meta.title.developing": "En développement · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Distribution Linux indépendante basée sur LFS avec le gestionnaire picu : transparence, sécurité, builds source.",
			"meta.desc.about":
				"Philosophie Summit Linux, système source basé sur LFS, pile picu et feuille de route.",
			"meta.desc.download":
				"Télécharger les images Summit Linux, vérifier sommes et signatures, configuration requise.",
			"meta.desc.picu":
				"Gestionnaire picu : recettes source, paquets binaires, miroirs signés et modèle de confiance.",
			"meta.desc.news":
				"Nouvelles Summit Linux : versions, mises à jour picu et jalons du projet.",
			"meta.desc.wiki":
				"Wiki Summit Linux : installation, commandes picu, dépôts, miroirs et FAQ.",
			"meta.desc.status":
				"Statut Summit Linux — site, miroirs, registre picu et CI.",
			"meta.desc.developing": "Page en développement — Summit Linux.",
			"meta.desc.404": "Page introuvable — Summit Linux.",
			"hero.lead":
				"Distribution Linux indépendante basée sur LFS, axée sur la transparence, la stabilité, un surcoût minimal et le contrôle total du système.",
			"err.lead": "page introuvable",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu est le gestionnaire de paquets au centre de Summit Linux. Il gère les builds source, les paquets binaires, les dépôts, les signatures et les métadonnées.",
			"content.picuCommandsH2": "Commandes principales",
			"content.picuSourceH2": "Builds source",
			"content.picuSourceP":
				"Les paquets sont décrits avec des recettes <code>.picu</code> déclaratives.",
			"content.picuBinaryH2": "Paquets binaires",
			"content.picuBinaryP":
				"picu peut installer des archives binaires signées après vérification des hachages et signatures.",
			"content.picuTrustH2": "Confiance",
			"content.picuTrustCalloutLabel":
				"Les dépôts non sûrs sont bloqués par défaut.",
			"content.picuTrustCalloutText":
				"Installation depuis un miroir non sûr exige le drapeau explicite <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Exemple",
			"content.footerCommands": "Commandes",
			"content.footerSecurity": "Sécurité",
			"content.footerRecipes": "Recettes",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		pl: {
			"nav.home": "Strona główna",
			"nav.about": "O projekcie",
			"nav.download": "Pobierz",
			"nav.picu": "picu",
			"nav.news": "Aktualności",
			"nav.wiki": "Wiki",
			"nav.status": "Status",
			"toc.title": "Spis treści",
			"crumb.home": "Strona główna",
			"btn.download": "Pobierz",
			"btn.meetPicu": "Poznaj picu",
			"btn.openWiki": "Otwórz wiki",
			"btn.picuGuide": "Przewodnik picu",
			"btn.aboutProject": "O projekcie",
			"btn.systemStatus": "Status systemu",
			"btn.downloadPdf": "Pobierz PDF",
			"btn.sourceCode": "Kod źródłowy",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (wkrótce)",
			"foot.note": "Summit Linux i picu · Niezależny projekt open source",
			"search.placeholder": "Szukaj…",
			"aria.navToggle": "Otwórz menu",
			"aria.themeLight": "Przełącz na jasny motyw",
			"aria.themeDark": "Przełącz na ciemny motyw",
			"aria.toTop": "Wróć na górę",
			"toast.coming": "Pełne tłumaczenie wkrótce — wyświetlono język angielski",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "O projekcie · Summit Linux",
			"meta.title.download": "Pobierz · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Aktualności · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Status · Summit Linux",
			"meta.title.developing": "W przygotowaniu · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Niezależna dystrybucja Linuksa oparta na LFS z menedżerem pakietów picu: przejrzystość, bezpieczeństwo, budowanie ze źródeł.",
			"meta.desc.about":
				"Filozofia Summit Linux, system źródłowy oparty na LFS, stos picu i plan rozwoju.",
			"meta.desc.download":
				"Pobierz obrazy Summit Linux, weryfikuj sumy kontrolne i podpisy, wymagania systemowe.",
			"meta.desc.picu":
				"Menedżer pakietów picu: przepisy źródłowe, pakiety binarne, podpisane lustra i model zaufania.",
			"meta.desc.news":
				"Aktualności Summit Linux: wydania, aktualizacje picu i kamienie milowe projektu.",
			"meta.desc.wiki":
				"Wiki Summit Linux: instalacja, polecenia picu, repozytoria, lustra i FAQ.",
			"meta.desc.status":
				"Status Summit Linux — strona, lustra, rejestr picu i CI.",
			"meta.desc.developing": "Strona w przygotowaniu — Summit Linux.",
			"meta.desc.404": "Nie znaleziono strony — Summit Linux.",
			"hero.lead":
				"Niezależna dystrybucja Linuksa oparta na LFS, stawiająca na przejrzystość, stabilność, minimalne obciążenie i pełną kontrolę nad systemem.",
			"err.lead": "nie znaleziono strony",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu to menedżer pakietów w centrum Summit Linux. Zarządza budowaniem ze źródeł, pakietami binarnymi, repozytoriami, podpisami i metadanymi pakietów.",
			"content.picuCommandsH2": "Podstawowe polecenia",
			"content.picuSourceH2": "Budowanie ze źródeł",
			"content.picuSourceP":
				"Pakiety opisują deklaratywne przepisy <code>.picu</code>.",
			"content.picuBinaryH2": "Pakiety binarne",
			"content.picuBinaryP":
				"picu potrafi instalować podpisane archiwa binarne po weryfikacji sum i podpisów.",
			"content.picuTrustH2": "Zaufanie",
			"content.picuTrustCalloutLabel":
				"Niebezpieczne repozytoria są domyślnie blokowane.",
			"content.picuTrustCalloutText":
				"Instalacja z niebezpiecznego lustra wymaga jawnej flagi <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Przykład",
			"content.footerCommands": "Polecenia",
			"content.footerSecurity": "Bezpieczeństwo",
			"content.footerRecipes": "Przepisy",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		es: {
			"nav.home": "Inicio",
			"nav.about": "Acerca de",
			"nav.download": "Descargar",
			"nav.picu": "picu",
			"nav.news": "Noticias",
			"nav.wiki": "Wiki",
			"nav.status": "Estado",
			"toc.title": "Contenido",
			"crumb.home": "Inicio",
			"btn.download": "Descargar",
			"btn.meetPicu": "Conoce picu",
			"btn.openWiki": "Abrir wiki",
			"btn.picuGuide": "Guía de picu",
			"btn.aboutProject": "Acerca del proyecto",
			"btn.systemStatus": "Estado del sistema",
			"btn.downloadPdf": "Descargar PDF",
			"btn.sourceCode": "Código fuente",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (pronto)",
			"foot.note":
				"Summit Linux y picu · Proyecto independiente de código abierto",
			"search.placeholder": "Buscar…",
			"aria.navToggle": "Abrir menú",
			"aria.themeLight": "Cambiar a tema claro",
			"aria.themeDark": "Cambiar a tema oscuro",
			"aria.toTop": "Volver arriba",
			"toast.coming": "Traducción completa próximamente — mostrando inglés",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Acerca de · Summit Linux",
			"meta.title.download": "Descargar · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Noticias · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Estado · Summit Linux",
			"meta.title.developing": "En desarrollo · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Distribución Linux independiente basada en LFS con el gestor picu: transparencia, seguridad, compilación desde fuentes.",
			"meta.desc.about":
				"Filosofía de Summit Linux, sistema fuente basado en LFS, pila picu y hoja de ruta.",
			"meta.desc.download":
				"Descargar imágenes de Summit Linux, verificar sumas y firmas, requisitos del sistema.",
			"meta.desc.picu":
				"Gestor picu: recetas fuente, paquetes binarios, réplicas firmadas y modelo de confianza.",
			"meta.desc.news":
				"Noticias de Summit Linux: lanzamientos, actualizaciones de picu e hitos del proyecto.",
			"meta.desc.wiki":
				"Wiki de Summit Linux: instalación, comandos picu, repositorios, réplicas y FAQ.",
			"meta.desc.status":
				"Estado de Summit Linux — sitio, réplicas, registro picu y CI.",
			"meta.desc.developing": "Página en desarrollo — Summit Linux.",
			"meta.desc.404": "Página no encontrada — Summit Linux.",
			"hero.lead":
				"Distribución Linux independiente basada en LFS, centrada en la transparencia, la estabilidad, la sobrecarga mínima y el control total del sistema.",
			"err.lead": "página no encontrada",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu es el gestor de paquetes en el centro de Summit Linux. Gestiona compilaciones fuente, paquetes binarios, repositorios, firmas y metadatos.",
			"content.picuCommandsH2": "Comandos principales",
			"content.picuSourceH2": "Compilación desde fuentes",
			"content.picuSourceP":
				"Los paquetes se describen con recetas declarativas <code>.picu</code>.",
			"content.picuBinaryH2": "Paquetes binarios",
			"content.picuBinaryP":
				"picu puede instalar archivos binarios firmados tras verificar hashes y firmas.",
			"content.picuTrustH2": "Confianza",
			"content.picuTrustCalloutLabel":
				"Los repositorios inseguros están bloqueados por defecto.",
			"content.picuTrustCalloutText":
				"Instalar desde una réplica insegura requiere el indicador explícito <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Ejemplo",
			"content.footerCommands": "Comandos",
			"content.footerSecurity": "Seguridad",
			"content.footerRecipes": "Recetas",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		pt: {
			"nav.home": "Início",
			"nav.about": "Sobre",
			"nav.download": "Baixar",
			"nav.picu": "picu",
			"nav.news": "Notícias",
			"nav.wiki": "Wiki",
			"nav.status": "Estado",
			"toc.title": "Conteúdo",
			"crumb.home": "Início",
			"btn.download": "Baixar",
			"btn.meetPicu": "Conheça picu",
			"btn.openWiki": "Abrir wiki",
			"btn.picuGuide": "Guia picu",
			"btn.aboutProject": "Sobre o projeto",
			"btn.systemStatus": "Estado do sistema",
			"btn.downloadPdf": "Baixar PDF",
			"btn.sourceCode": "Código-fonte",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (em breve)",
			"foot.note":
				"Summit Linux e picu · Projeto independente de código aberto",
			"search.placeholder": "Pesquisar…",
			"aria.navToggle": "Abrir menu",
			"aria.themeLight": "Mudar para tema claro",
			"aria.themeDark": "Mudar para tema escuro",
			"aria.toTop": "Voltar ao topo",
			"toast.coming": "Tradução completa em breve — mostrando inglês",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Sobre · Summit Linux",
			"meta.title.download": "Baixar · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Notícias · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Estado · Summit Linux",
			"meta.title.developing": "Em desenvolvimento · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Distribuição Linux independente baseada em LFS com o gerenciador picu: transparência, segurança, compilação da fonte.",
			"meta.desc.about":
				"Filosofia Summit Linux, sistema fonte baseado em LFS, pilha picu e roteiro.",
			"meta.desc.download":
				"Baixar imagens Summit Linux, verificar somas e assinaturas, requisitos do sistema.",
			"meta.desc.picu":
				"Gerenciador picu: receitas fonte, pacotes binários, espelhos assinados e modelo de confiança.",
			"meta.desc.news":
				"Notícias Summit Linux: lançamentos, atualizações picu e marcos do projeto.",
			"meta.desc.wiki":
				"Wiki Summit Linux: instalação, comandos picu, repositórios, espelhos e FAQ.",
			"meta.desc.status":
				"Estado Summit Linux — site, espelhos, registro picu e CI.",
			"meta.desc.developing": "Página em desenvolvimento — Summit Linux.",
			"meta.desc.404": "Página não encontrada — Summit Linux.",
			"hero.lead":
				"Distribuição Linux independente baseada em LFS, focada em transparência, estabilidade, sobrecarga mínima e controle total do sistema.",
			"err.lead": "página não encontrada",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu é o gerenciador de pacotes no centro do Summit Linux. Ele gerencia builds fonte, pacotes binários, repositórios, assinaturas e metadados.",
			"content.picuCommandsH2": "Comandos principais",
			"content.picuSourceH2": "Builds fonte",
			"content.picuSourceP":
				"Pacotes são descritos com receitas declarativas <code>.picu</code>.",
			"content.picuBinaryH2": "Pacotes binários",
			"content.picuBinaryP":
				"picu pode instalar arquivos binários assinados após verificar hashes e assinaturas.",
			"content.picuTrustH2": "Confiança",
			"content.picuTrustCalloutLabel":
				"Repositórios inseguros são bloqueados por padrão.",
			"content.picuTrustCalloutText":
				"Instalar de um espelho inseguro exige o indicador explícito <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Exemplo",
			"content.footerCommands": "Comandos",
			"content.footerSecurity": "Segurança",
			"content.footerRecipes": "Receitas",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		it: {
			"nav.home": "Home",
			"nav.about": "Chi siamo",
			"nav.download": "Scarica",
			"nav.picu": "picu",
			"nav.news": "Notizie",
			"nav.wiki": "Wiki",
			"nav.status": "Stato",
			"toc.title": "Contenuti",
			"crumb.home": "Home",
			"btn.download": "Scarica",
			"btn.meetPicu": "Scopri picu",
			"btn.openWiki": "Apri la wiki",
			"btn.picuGuide": "Guida picu",
			"btn.aboutProject": "Sul progetto",
			"btn.systemStatus": "Stato del sistema",
			"btn.downloadPdf": "Scarica PDF",
			"btn.sourceCode": "Codice sorgente",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (a breve)",
			"foot.note": "Summit Linux e picu · Progetto open source indipendente",
			"search.placeholder": "Cerca…",
			"aria.navToggle": "Apri il menu",
			"aria.themeLight": "Passa al tema chiaro",
			"aria.themeDark": "Passa al tema scuro",
			"aria.toTop": "Torna in cima",
			"toast.coming": "Traduzione completa in arrivo — visualizzato in inglese",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Chi siamo · Summit Linux",
			"meta.title.download": "Scarica · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Notizie · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Stato · Summit Linux",
			"meta.title.developing": "In sviluppo · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Distribuzione Linux indipendente basata su LFS con il gestore picu: trasparenza, sicurezza, build da sorgente.",
			"meta.desc.about":
				"Filosofia Summit Linux, sistema sorgente basato su LFS, stack picu e roadmap.",
			"meta.desc.download":
				"Scarica le immagini Summit Linux, verifica checksum e firme, requisiti di sistema.",
			"meta.desc.picu":
				"Gestore picu: ricette sorgente, pacchetti binari, mirror firmati e modello di fiducia.",
			"meta.desc.news":
				"Notizie Summit Linux: release, aggiornamenti picu e traguardi del progetto.",
			"meta.desc.wiki":
				"Wiki Summit Linux: installazione, comandi picu, repository, mirror e FAQ.",
			"meta.desc.status":
				"Stato Summit Linux — sito, mirror, registro picu e CI.",
			"meta.desc.developing": "Pagina in sviluppo — Summit Linux.",
			"meta.desc.404": "Pagina non trovata — Summit Linux.",
			"hero.lead":
				"Distribuzione Linux indipendente basata su LFS, incentrata su trasparenza, stabilità, overhead minimo e controllo completo del sistema.",
			"err.lead": "pagina non trovata",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu è il gestore di pacchetti al centro di Summit Linux. Gestisce build da sorgente, pacchetti binari, repository, firme e metadati.",
			"content.picuCommandsH2": "Comandi principali",
			"content.picuSourceH2": "Build da sorgente",
			"content.picuSourceP":
				"I pacchetti sono descritti con ricette dichiarative <code>.picu</code>.",
			"content.picuBinaryH2": "Pacchetti binari",
			"content.picuBinaryP":
				"picu può installare archivi binari firmati dopo aver verificato hash e firme.",
			"content.picuTrustH2": "Fiducia",
			"content.picuTrustCalloutLabel":
				"I repository non sicuri sono bloccati per impostazione predefinita.",
			"content.picuTrustCalloutText":
				"Per installare da un mirror non sicuro serve il flag esplicito <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Esempio",
			"content.footerCommands": "Comandi",
			"content.footerSecurity": "Sicurezza",
			"content.footerRecipes": "Ricette",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		tr: {
			"nav.home": "Ana Sayfa",
			"nav.about": "Hakkında",
			"nav.download": "İndir",
			"nav.picu": "picu",
			"nav.news": "Haberler",
			"nav.wiki": "Wiki",
			"nav.status": "Durum",
			"toc.title": "İçindekiler",
			"crumb.home": "Ana Sayfa",
			"btn.download": "İndir",
			"btn.meetPicu": "picu ile tanış",
			"btn.openWiki": "Wiki'yi aç",
			"btn.picuGuide": "picu kılavuzu",
			"btn.aboutProject": "Proje hakkında",
			"btn.systemStatus": "Sistem durumu",
			"btn.downloadPdf": "PDF indir",
			"btn.sourceCode": "Kaynak kodu",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (yakında)",
			"foot.note": "Summit Linux ve picu · Bağımsız açık kaynak projesi",
			"search.placeholder": "Ara…",
			"aria.navToggle": "Menüyü aç",
			"aria.themeLight": "Açık temaya geç",
			"aria.themeDark": "Koyu temaya geç",
			"aria.toTop": "Yukarı kaydır",
			"toast.coming": "Tam çeviri yakında — İngilizce gösteriliyor",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Hakkında · Summit Linux",
			"meta.title.download": "İndir · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Haberler · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Durum · Summit Linux",
			"meta.title.developing": "Geliştiriliyor · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"LFS tabanlı bağımsız Linux dağıtımı ve picu paket yöneticisi: şeffaflık, güvenlik, kaynaktan derleme.",
			"meta.desc.about":
				"Summit Linux felsefesi, LFS tabanlı kaynak sistemi, picu yığını ve yol haritası.",
			"meta.desc.download":
				"Summit Linux kalıplarını indir, sağlama toplamlarını ve imzaları doğrula, sistem gereksinimleri.",
			"meta.desc.picu":
				"picu paket yöneticisi: kaynak tarifleri, ikili paketler, imzalı aynalar ve güven modeli.",
			"meta.desc.news":
				"Summit Linux haberleri: sürümler, picu güncellemeleri ve proje kilometre taşları.",
			"meta.desc.wiki":
				"Summit Linux Wiki: kurulum, picu komutları, depolar, aynalar ve SSS.",
			"meta.desc.status":
				"Summit Linux durumu — site, aynalar, picu kaydı ve CI.",
			"meta.desc.developing": "Sayfa geliştiriliyor — Summit Linux.",
			"meta.desc.404": "Sayfa bulunamadı — Summit Linux.",
			"hero.lead":
				"Şeffaflık, kararlılık, minimum ek yük ve sistem üzerinde tam kontrole odaklanan, LFS tabanlı bağımsız Linux dağıtımı.",
			"err.lead": "sayfa bulunamadı",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu, Summit Linux merkezindeki paket yöneticisidir. Kaynaktan derleme, ikili paketler, depolar, imzalar ve paket meta verilerini yönetir.",
			"content.picuCommandsH2": "Temel komutlar",
			"content.picuSourceH2": "Kaynaktan derleme",
			"content.picuSourceP":
				"Paketler, bildirim temelli <code>.picu</code> tarifleriyle tanımlanır.",
			"content.picuBinaryH2": "İkili paketler",
			"content.picuBinaryP":
				"picu, hash ve imzaları doğruladıktan sonra imzalı ikili arşivleri kurabilir.",
			"content.picuTrustH2": "Güven",
			"content.picuTrustCalloutLabel":
				"Güvensiz depolar varsayılan olarak engellenir.",
			"content.picuTrustCalloutText":
				"Güvensiz aynadan kurulum için açık <code>--allow-unsafe</code> bayrağı gerekir.",
			"content.picuExampleH2": "Örnek",
			"content.footerCommands": "Komutlar",
			"content.footerSecurity": "Güvenlik",
			"content.footerRecipes": "Tarifler",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		ar: {
			"nav.home": "الرئيسية",
			"nav.about": "حول",
			"nav.download": "تنزيل",
			"nav.picu": "picu",
			"nav.news": "الأخبار",
			"nav.wiki": "ويكي",
			"nav.status": "الحالة",
			"toc.title": "المحتويات",
			"crumb.home": "الرئيسية",
			"btn.download": "تنزيل",
			"btn.meetPicu": "تعرف على picu",
			"btn.openWiki": "افتح الويكي",
			"btn.picuGuide": "دليل picu",
			"btn.aboutProject": "عن المشروع",
			"btn.systemStatus": "حالة النظام",
			"btn.downloadPdf": "تنزيل PDF",
			"btn.sourceCode": "الكود المصدري",
			"btn.github": "GitHub",
			"btn.discordSoon": "ديسكورد (قريبًا)",
			"foot.note": "Summit Linux و picu · مشروع مفتوح المصدر مستقل",
			"search.placeholder": "بحث…",
			"aria.navToggle": "فتح القائمة",
			"aria.themeLight": "التبديل إلى المظهر الفاتح",
			"aria.themeDark": "التبديل إلى المظهر الداكن",
			"aria.toTop": "العودة إلى الأعلى",
			"toast.coming": "الترجمة الكاملة قريبًا — يتم عرض الإنجليزية",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "حول · Summit Linux",
			"meta.title.download": "تنزيل · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "الأخبار · Summit Linux",
			"meta.title.wiki": "ويكي · Summit Linux",
			"meta.title.status": "الحالة · Summit Linux",
			"meta.title.developing": "قيد التطوير · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"توزيعة لينكس مستقلة مبنية على LFS مع مدير الحزم picu: الشفافية والأمان والبناء من المصدر.",
			"meta.desc.about":
				"فلسفة Summit Linux، نظام مصدري مبني على LFS، حزمة picu وخارطة الطريق.",
			"meta.desc.download":
				"تنزيل صور Summit Linux، والتحقق من المجاميع والتواقيع، ومتطلبات النظام.",
			"meta.desc.picu":
				"مدير الحزم picu: وصفات المصدر، والحزم الثنائية، والمرايا الموقعة ونموذج الثقة.",
			"meta.desc.news":
				"أخبار Summit Linux: الإصدارات وتحديثات picu ومعالم المشروع.",
			"meta.desc.wiki":
				"ويكي Summit Linux: التثبيت وأوامر picu والمستودعات والمرايا والأسئلة الشائعة.",
			"meta.desc.status": "حالة Summit Linux — الموقع والمرايا وسجل picu وCI.",
			"meta.desc.developing": "الصفحة قيد التطوير — Summit Linux.",
			"meta.desc.404": "الصفحة غير موجودة — Summit Linux.",
			"hero.lead":
				"توزيعة لينكس مستقلة مبنية على LFS، تركز على الشفافية والاستقرار والحد الأدنى من الحمل والتحكم الكامل في النظام.",
			"err.lead": "الصفحة غير موجودة",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu هو مدير الحزم في قلب Summit Linux. يدير البناء من المصدر والحزم الثنائية والمستودعات والتواقيع وبيانات الحزم.",
			"content.picuCommandsH2": "الأوامر الأساسية",
			"content.picuSourceH2": "البناء من المصدر",
			"content.picuSourceP": "تُوصف الحزم بوصفات <code>.picu</code> تصريحية.",
			"content.picuBinaryH2": "الحزم الثنائية",
			"content.picuBinaryP":
				"يمكن لـ picu تثبيت الأرشيفات الثنائية الموقعة بعد التحقق من البصمات والتواقيع.",
			"content.picuTrustH2": "الثقة",
			"content.picuTrustCalloutLabel": "المستودعات غير الآمنة محظورة افتراضيًا.",
			"content.picuTrustCalloutText":
				"يتطلب التثبيت من مرآة غير آمنة الراية الصريحة <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "مثال",
			"content.footerCommands": "الأوامر",
			"content.footerSecurity": "الأمان",
			"content.footerRecipes": "الوصفات",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		hi: {
			"nav.home": "होम",
			"nav.about": "परिचय",
			"nav.download": "डाउनलोड",
			"nav.picu": "picu",
			"nav.news": "समाचार",
			"nav.wiki": "विकी",
			"nav.status": "स्थिति",
			"toc.title": "विषय-सूची",
			"crumb.home": "होम",
			"btn.download": "डाउनलोड",
			"btn.meetPicu": "picu से मिलें",
			"btn.openWiki": "विकी खोलें",
			"btn.picuGuide": "picu गाइड",
			"btn.aboutProject": "परियोजना के बारे में",
			"btn.systemStatus": "सिस्टम स्थिति",
			"btn.downloadPdf": "PDF डाउनलोड करें",
			"btn.sourceCode": "स्रोत कोड",
			"btn.github": "GitHub",
			"btn.discordSoon": "डिस्कॉर्ड (जल्द)",
			"foot.note": "Summit Linux और picu · स्वतंत्र ओपन-सोर्स परियोजना",
			"search.placeholder": "खोजें…",
			"aria.navToggle": "मेनू खोलें",
			"aria.themeLight": "हल्की थीम पर जाएं",
			"aria.themeDark": "गहरी थीम पर जाएं",
			"aria.toTop": "ऊपर जाएं",
			"toast.coming": "पूर्ण अनुवाद जल्द — अंग्रेज़ी दिखाई जा रही है",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "परिचय · Summit Linux",
			"meta.title.download": "डाउनलोड · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "समाचार · Summit Linux",
			"meta.title.wiki": "विकी · Summit Linux",
			"meta.title.status": "स्थिति · Summit Linux",
			"meta.title.developing": "विकासाधीन · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"LFS पर आधारित स्वतंत्र Linux वितरण और picu पैकेज प्रबंधक: पारदर्शिता, सुरक्षा, स्रोत बिल्ड।",
			"meta.desc.about":
				"Summit Linux दर्शन, LFS आधारित स्रोत प्रणाली, picu स्टैक और रोडमैप।",
			"meta.desc.download":
				"Summit Linux छवियाँ डाउनलोड करें, चेकसम और हस्ताक्षर सत्यापित करें, सिस्टम आवश्यकताएँ।",
			"meta.desc.picu":
				"picu पैकेज प्रबंधक: स्रोत रेसिपी, बाइनरी पैकेज, हस्ताक्षरित मिरर और ट्रस्ट मॉडल।",
			"meta.desc.news":
				"Summit Linux समाचार: रिलीज़, picu अपडेट और परियोजना उपलब्धियाँ।",
			"meta.desc.wiki":
				"Summit Linux विकी: स्थापना, picu कमांड, रिपॉजिटरी, मिरर और FAQ।",
			"meta.desc.status":
				"Summit Linux स्थिति — साइट, मिरर, picu रजिस्ट्री और CI।",
			"meta.desc.developing": "पृष्ठ विकासाधीन है — Summit Linux।",
			"meta.desc.404": "पृष्ठ नहीं मिला — Summit Linux।",
			"hero.lead":
				"LFS पर आधारित स्वतंत्र Linux वितरण, जो पारदर्शिता, स्थिरता, न्यूनतम ओवरहेड और सिस्टम पर पूर्ण नियंत्रण पर केंद्रित है।",
			"err.lead": "पृष्ठ नहीं मिला",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu Summit Linux के केंद्र में पैकेज प्रबंधक है। यह स्रोत बिल्ड, बाइनरी पैकेज, रिपॉजिटरी, हस्ताक्षर और पैकेज मेटाडेटा संभालता है।",
			"content.picuCommandsH2": "मुख्य कमांड",
			"content.picuSourceH2": "स्रोत बिल्ड",
			"content.picuSourceP":
				"पैकेज घोषणात्मक <code>.picu</code> रेसिपी से वर्णित होते हैं।",
			"content.picuBinaryH2": "बाइनरी पैकेज",
			"content.picuBinaryP":
				"हैश और हस्ताक्षर जांचने के बाद picu हस्ताक्षरित बाइनरी आर्काइव स्थापित कर सकता है।",
			"content.picuTrustH2": "विश्वास",
			"content.picuTrustCalloutLabel": "असुरक्षित रिपॉजिटरी डिफ़ॉल्ट रूप से अवरुद्ध हैं।",
			"content.picuTrustCalloutText":
				"असुरक्षित मिरर से स्थापना के लिए स्पष्ट <code>--allow-unsafe</code> फ़्लैग आवश्यक है।",
			"content.picuExampleH2": "उदाहरण",
			"content.footerCommands": "कमांड",
			"content.footerSecurity": "सुरक्षा",
			"content.footerRecipes": "रेसिपी",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		bn: {
			"nav.home": "হোম",
			"nav.about": "সম্পর্কে",
			"nav.download": "ডাউনলোড",
			"nav.picu": "picu",
			"nav.news": "খবর",
			"nav.wiki": "উইকি",
			"nav.status": "অবস্থা",
			"toc.title": "সূচি",
			"crumb.home": "হোম",
			"btn.download": "ডাউনলোড",
			"btn.meetPicu": "picu সম্পর্কে জানুন",
			"btn.openWiki": "উইকি খুলুন",
			"btn.picuGuide": "picu গাইড",
			"btn.aboutProject": "প্রকল্প সম্পর্কে",
			"btn.systemStatus": "সিস্টেম অবস্থা",
			"btn.downloadPdf": "PDF ডাউনলোড",
			"btn.sourceCode": "সোর্স কোড",
			"btn.github": "GitHub",
			"btn.discordSoon": "ডিসকর্ড (শীঘ্রই)",
			"foot.note": "Summit Linux ও picu · স্বতন্ত্র ওপেন-সোর্স প্রকল্প",
			"search.placeholder": "খুঁজুন…",
			"aria.navToggle": "মেনু খুলুন",
			"aria.themeLight": "হালকা থিমে যান",
			"aria.themeDark": "গাঢ় থিমে যান",
			"aria.toTop": "উপরে যান",
			"toast.coming": "সম্পূর্ণ অনুবাদ আসছে — ইংরেজি দেখানো হচ্ছে",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "সম্পর্কে · Summit Linux",
			"meta.title.download": "ডাউনলোড · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "খবর · Summit Linux",
			"meta.title.wiki": "উইকি · Summit Linux",
			"meta.title.status": "অবস্থা · Summit Linux",
			"meta.title.developing": "উন্নয়নাধীন · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"LFS-ভিত্তিক স্বতন্ত্র Linux ডিস্ট্রো ও picu প্যাকেজ ম্যানেজার: স্বচ্ছতা, নিরাপত্তা, সোর্স বিল্ড।",
			"meta.desc.about":
				"Summit Linux দর্শন, LFS-ভিত্তিক সোর্স সিস্টেম, picu স্ট্যাক ও রোডম্যাপ।",
			"meta.desc.download":
				"Summit Linux ইমেজ ডাউনলোড করুন, চেকসাম ও স্বাক্ষর যাচাই করুন, সিস্টেম প্রয়োজনীয়তা।",
			"meta.desc.picu":
				"picu প্যাকেজ ম্যানেজার: সোর্স রেসিপি, বাইনারি প্যাকেজ, স্বাক্ষরিত মিরর ও ট্রাস্ট মডেল।",
			"meta.desc.news": "Summit Linux খবর: রিলিজ, picu আপডেট ও প্রকল্প মাইলফলক।",
			"meta.desc.wiki":
				"Summit Linux উইকি: ইনস্টলেশন, picu কমান্ড, রিপোজিটরি, মিরর ও FAQ।",
			"meta.desc.status": "Summit Linux অবস্থা — সাইট, মিরর, picu রেজিস্ট্রি ও CI।",
			"meta.desc.developing": "পৃষ্ঠা উন্নয়নাধীন — Summit Linux।",
			"meta.desc.404": "পৃষ্ঠা পাওয়া যায়নি — Summit Linux।",
			"hero.lead":
				"LFS-ভিত্তিক স্বতন্ত্র Linux ডিস্ট্রো, যা স্বচ্ছতা, স্থিতিশীলতা, ন্যূনতম ওভারহেড ও সিস্টেমের সম্পূর্ণ নিয়ন্ত্রণে মনোযোগী।",
			"err.lead": "পৃষ্ঠা পাওয়া যায়নি",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu হলো Summit Linux-এর কেন্দ্রে থাকা প্যাকেজ ম্যানেজার। এটি সোর্স বিল্ড, বাইনারি প্যাকেজ, রিপোজিটরি, স্বাক্ষর ও প্যাকেজ মেটাডেটা পরিচালনা করে।",
			"content.picuCommandsH2": "মূল কমান্ড",
			"content.picuSourceH2": "সোর্স বিল্ড",
			"content.picuSourceP":
				"প্যাকেজগুলো ঘোষণামূলক <code>.picu</code> রেসিপি দিয়ে বর্ণনা করা হয়।",
			"content.picuBinaryH2": "বাইনারি প্যাকেজ",
			"content.picuBinaryP":
				"হ্যাশ ও স্বাক্ষর যাচাইয়ের পর picu স্বাক্ষরিত বাইনারি আর্কাইভ ইনস্টল করতে পারে।",
			"content.picuTrustH2": "আস্থা",
			"content.picuTrustCalloutLabel": "অনিরাপদ রিপোজিটরি ডিফল্টরূপে বন্ধ থাকে।",
			"content.picuTrustCalloutText":
				"অনিরাপদ মিরর থেকে ইনস্টল করতে স্পষ্ট <code>--allow-unsafe</code> ফ্ল্যাগ লাগে।",
			"content.picuExampleH2": "উদাহরণ",
			"content.footerCommands": "কমান্ড",
			"content.footerSecurity": "নিরাপত্তা",
			"content.footerRecipes": "রেসিপি",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		id: {
			"nav.home": "Beranda",
			"nav.about": "Tentang",
			"nav.download": "Unduh",
			"nav.picu": "picu",
			"nav.news": "Berita",
			"nav.wiki": "Wiki",
			"nav.status": "Status",
			"toc.title": "Daftar isi",
			"crumb.home": "Beranda",
			"btn.download": "Unduh",
			"btn.meetPicu": "Kenali picu",
			"btn.openWiki": "Buka wiki",
			"btn.picuGuide": "Panduan picu",
			"btn.aboutProject": "Tentang proyek",
			"btn.systemStatus": "Status sistem",
			"btn.downloadPdf": "Unduh PDF",
			"btn.sourceCode": "Kode sumber",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (segera)",
			"foot.note": "Summit Linux & picu · Proyek sumber terbuka independen",
			"search.placeholder": "Cari…",
			"aria.navToggle": "Buka menu",
			"aria.themeLight": "Beralih ke tema terang",
			"aria.themeDark": "Beralih ke tema gelap",
			"aria.toTop": "Kembali ke atas",
			"toast.coming": "Terjemahan lengkap segera — menampilkan bahasa Inggris",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Tentang · Summit Linux",
			"meta.title.download": "Unduh · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Berita · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Status · Summit Linux",
			"meta.title.developing": "Dalam pengembangan · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Distro Linux independen berbasis LFS dengan manajer paket picu: transparansi, keamanan, build sumber.",
			"meta.desc.about":
				"Filosofi Summit Linux, sistem sumber berbasis LFS, tumpukan picu dan peta jalan.",
			"meta.desc.download":
				"Unduh citra Summit Linux, verifikasi checksum dan tanda tangan, kebutuhan sistem.",
			"meta.desc.picu":
				"Manajer paket picu: resep sumber, paket biner, mirror bertanda tangan dan model kepercayaan.",
			"meta.desc.news":
				"Berita Summit Linux: rilis, pembaruan picu dan tonggak proyek.",
			"meta.desc.wiki":
				"Wiki Summit Linux: instalasi, perintah picu, repositori, mirror dan FAQ.",
			"meta.desc.status":
				"Status Summit Linux — situs, mirror, registri picu dan CI.",
			"meta.desc.developing": "Halaman dalam pengembangan — Summit Linux.",
			"meta.desc.404": "Halaman tidak ditemukan — Summit Linux.",
			"hero.lead":
				"Distro Linux independen berbasis LFS, fokus pada transparansi, stabilitas, overhead minimal, dan kendali penuh atas sistem.",
			"err.lead": "halaman tidak ditemukan",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu adalah manajer paket di pusat Summit Linux. Ia menangani build sumber, paket biner, repositori, tanda tangan, dan metadata paket.",
			"content.picuCommandsH2": "Perintah inti",
			"content.picuSourceH2": "Build sumber",
			"content.picuSourceP":
				"Paket dideskripsikan dengan resep deklaratif <code>.picu</code>.",
			"content.picuBinaryH2": "Paket biner",
			"content.picuBinaryP":
				"picu dapat memasang arsip biner bertanda tangan setelah memverifikasi hash dan tanda tangan.",
			"content.picuTrustH2": "Kepercayaan",
			"content.picuTrustCalloutLabel":
				"Repositori yang tidak aman diblokir secara default.",
			"content.picuTrustCalloutText":
				"Memasang dari mirror yang tidak aman memerlukan flag eksplisit <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Contoh",
			"content.footerCommands": "Perintah",
			"content.footerSecurity": "Keamanan",
			"content.footerRecipes": "Resep",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		vi: {
			"nav.home": "Trang chủ",
			"nav.about": "Giới thiệu",
			"nav.download": "Tải xuống",
			"nav.picu": "picu",
			"nav.news": "Tin tức",
			"nav.wiki": "Wiki",
			"nav.status": "Trạng thái",
			"toc.title": "Mục lục",
			"crumb.home": "Trang chủ",
			"btn.download": "Tải xuống",
			"btn.meetPicu": "Tìm hiểu picu",
			"btn.openWiki": "Mở wiki",
			"btn.picuGuide": "Hướng dẫn picu",
			"btn.aboutProject": "Về dự án",
			"btn.systemStatus": "Trạng thái hệ thống",
			"btn.downloadPdf": "Tải PDF",
			"btn.sourceCode": "Mã nguồn",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (sắp ra mắt)",
			"foot.note": "Summit Linux & picu · Dự án mã nguồn mở độc lập",
			"search.placeholder": "Tìm kiếm…",
			"aria.navToggle": "Mở menu",
			"aria.themeLight": "Chuyển sang giao diện sáng",
			"aria.themeDark": "Chuyển sang giao diện tối",
			"aria.toTop": "Về đầu trang",
			"toast.coming": "Bản dịch đầy đủ sắp ra mắt — đang hiển thị tiếng Anh",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Giới thiệu · Summit Linux",
			"meta.title.download": "Tải xuống · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Tin tức · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Trạng thái · Summit Linux",
			"meta.title.developing": "Đang phát triển · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Bản phân phối Linux độc lập dựa trên LFS với trình quản lý gói picu: minh bạch, bảo mật, build từ nguồn.",
			"meta.desc.about":
				"Triết lý Summit Linux, hệ thống nguồn dựa trên LFS, ngăn xếp picu và lộ trình.",
			"meta.desc.download":
				"Tải ảnh Summit Linux, xác minh checksum và chữ ký, yêu cầu hệ thống.",
			"meta.desc.picu":
				"Trình quản lý gói picu: công thức nguồn, gói nhị phân, mirror đã ký và mô hình tin cậy.",
			"meta.desc.news":
				"Tin Summit Linux: phát hành, cập nhật picu và cột mốc dự án.",
			"meta.desc.wiki":
				"Wiki Summit Linux: cài đặt, lệnh picu, kho lưu trữ, mirror và FAQ.",
			"meta.desc.status":
				"Trạng thái Summit Linux — trang web, mirror, registry picu và CI.",
			"meta.desc.developing": "Trang đang phát triển — Summit Linux.",
			"meta.desc.404": "Không tìm thấy trang — Summit Linux.",
			"hero.lead":
				"Bản phân phối Linux độc lập dựa trên LFS, tập trung vào tính minh bạch, ổn định, chi phí tối thiểu và toàn quyền kiểm soát hệ thống.",
			"err.lead": "không tìm thấy trang",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu là trình quản lý gói ở trung tâm Summit Linux. Nó xử lý build từ nguồn, gói nhị phân, kho lưu trữ, chữ ký và siêu dữ liệu gói.",
			"content.picuCommandsH2": "Lệnh cốt lõi",
			"content.picuSourceH2": "Build từ nguồn",
			"content.picuSourceP":
				"Gói được mô tả bằng công thức khai báo <code>.picu</code>.",
			"content.picuBinaryH2": "Gói nhị phân",
			"content.picuBinaryP":
				"picu có thể cài đặt gói nhị phân đã ký sau khi xác minh hash và chữ ký.",
			"content.picuTrustH2": "Tin cậy",
			"content.picuTrustCalloutLabel":
				"Kho không an toàn bị chặn theo mặc định.",
			"content.picuTrustCalloutText":
				"Cài đặt từ mirror không an toàn cần cờ rõ ràng <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Ví dụ",
			"content.footerCommands": "Lệnh",
			"content.footerSecurity": "Bảo mật",
			"content.footerRecipes": "Công thức",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		ko: {
			"nav.home": "홈",
			"nav.about": "소개",
			"nav.download": "다운로드",
			"nav.picu": "picu",
			"nav.news": "소식",
			"nav.wiki": "위키",
			"nav.status": "상태",
			"toc.title": "목차",
			"crumb.home": "홈",
			"btn.download": "다운로드",
			"btn.meetPicu": "picu 알아보기",
			"btn.openWiki": "위키 열기",
			"btn.picuGuide": "picu 안내서",
			"btn.aboutProject": "프로젝트 소개",
			"btn.systemStatus": "시스템 상태",
			"btn.downloadPdf": "PDF 다운로드",
			"btn.sourceCode": "소스 코드",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord(곧)",
			"foot.note": "Summit Linux 및 picu · 독립 오픈소스 프로젝트",
			"search.placeholder": "검색…",
			"aria.navToggle": "메뉴 열기",
			"aria.themeLight": "라이트 테마로 전환",
			"aria.themeDark": "다크 테마로 전환",
			"aria.toTop": "맨 위로",
			"toast.coming": "전체 번역 예정 — 영어로 표시 중",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "소개 · Summit Linux",
			"meta.title.download": "다운로드 · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "소식 · Summit Linux",
			"meta.title.wiki": "위키 · Summit Linux",
			"meta.title.status": "상태 · Summit Linux",
			"meta.title.developing": "개발 중 · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"LFS 기반 독립 Linux 배포판과 picu 패키지 관리자: 투명성, 보안, 소스 빌드.",
			"meta.desc.about":
				"Summit Linux 철학, LFS 기반 소스 시스템, picu 스택과 로드맵.",
			"meta.desc.download":
				"Summit Linux 이미지 다운로드, 체크섬·서명 검증, 시스템 요구 사항.",
			"meta.desc.picu":
				"picu 패키지 관리자: 소스 레시피, 바이너리 패키지, 서명된 미러와 신뢰 모델.",
			"meta.desc.news":
				"Summit Linux 소식: 릴리스, picu 업데이트와 프로젝트 이정표.",
			"meta.desc.wiki":
				"Summit Linux 위키: 설치, picu 명령어, 저장소, 미러와 FAQ.",
			"meta.desc.status":
				"Summit Linux 상태 — 사이트, 미러, picu 레지스트리와 CI.",
			"meta.desc.developing": "개발 중인 페이지 — Summit Linux.",
			"meta.desc.404": "페이지를 찾을 수 없음 — Summit Linux.",
			"hero.lead":
				"투명성, 안정성, 최소 오버헤드, 시스템에 대한 완전한 제어에 중점을 둔 LFS 기반 독립 Linux 배포판.",
			"err.lead": "페이지를 찾을 수 없음",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu는 Summit Linux 중심의 패키지 관리자입니다. 소스 빌드, 바이너리 패키지, 저장소, 서명, 패키지 메타데이터를 관리합니다.",
			"content.picuCommandsH2": "핵심 명령어",
			"content.picuSourceH2": "소스 빌드",
			"content.picuSourceP":
				"패키지는 선언적 <code>.picu</code> 레시피로 기술됩니다.",
			"content.picuBinaryH2": "바이너리 패키지",
			"content.picuBinaryP":
				"picu는 해시와 서명을 검증한 뒤 서명된 바이너리 압축을 설치할 수 있습니다.",
			"content.picuTrustH2": "신뢰",
			"content.picuTrustCalloutLabel":
				"안전하지 않은 저장소는 기본적으로 차단됩니다.",
			"content.picuTrustCalloutText":
				"안전하지 않은 미러에서 설치하려면 명시적 <code>--allow-unsafe</code> 플래그가 필요합니다.",
			"content.picuExampleH2": "예제",
			"content.footerCommands": "명령어",
			"content.footerSecurity": "보안",
			"content.footerRecipes": "레시피",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		nl: {
			"nav.home": "Home",
			"nav.about": "Over",
			"nav.download": "Downloaden",
			"nav.picu": "picu",
			"nav.news": "Nieuws",
			"nav.wiki": "Wiki",
			"nav.status": "Status",
			"toc.title": "Inhoud",
			"crumb.home": "Home",
			"btn.download": "Downloaden",
			"btn.meetPicu": "Maak kennis met picu",
			"btn.openWiki": "Wiki openen",
			"btn.picuGuide": "picu-handleiding",
			"btn.aboutProject": "Over het project",
			"btn.systemStatus": "Systeemstatus",
			"btn.downloadPdf": "PDF downloaden",
			"btn.sourceCode": "Broncode",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (binnenkort)",
			"foot.note": "Summit Linux & picu · Onafhankelijk open-sourceproject",
			"search.placeholder": "Zoeken…",
			"aria.navToggle": "Menu openen",
			"aria.themeLight": "Schakel over naar licht thema",
			"aria.themeDark": "Schakel over naar donker thema",
			"aria.toTop": "Terug naar boven",
			"toast.coming": "Volledige vertaling volgt — Engels wordt getoond",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Over · Summit Linux",
			"meta.title.download": "Downloaden · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Nieuws · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Status · Summit Linux",
			"meta.title.developing": "In ontwikkeling · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Onafhankelijke Linux-distributie op LFS-basis met picu-pakketbeheer: transparantie, beveiliging, source-builds.",
			"meta.desc.about":
				"Summit-Linux-filosofie, LFS-source-systeem, picu-stack en roadmap.",
			"meta.desc.download":
				"Summit-Linux-images downloaden, checksums en handtekeningen verifiëren, systeemvereisten.",
			"meta.desc.picu":
				"picu-pakketbeheer: source-recepten, binaire pakketten, ondertekende mirrors en vertrouwensmodel.",
			"meta.desc.news":
				"Summit-Linux-nieuws: releases, picu-updates en projectmijlpalen.",
			"meta.desc.wiki":
				"Summit-Linux-wiki: installatie, picu-commando's, repository's, mirrors en FAQ.",
			"meta.desc.status":
				"Summit-Linux-status — site, mirrors, picu-register en CI.",
			"meta.desc.developing": "Pagina in ontwikkeling — Summit Linux.",
			"meta.desc.404": "Pagina niet gevonden — Summit Linux.",
			"hero.lead":
				"Onafhankelijke Linux-distributie op LFS-basis, gericht op transparantie, stabiliteit, minimale overhead en volledige controle over het systeem.",
			"err.lead": "pagina niet gevonden",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu is de pakketbeheerder in het centrum van Summit Linux. Hij beheert source-builds, binaire pakketten, repository's, handtekeningen en pakketmetadata.",
			"content.picuCommandsH2": "Kerncommando's",
			"content.picuSourceH2": "Source-builds",
			"content.picuSourceP":
				"Pakketten worden beschreven met declaratieve <code>.picu</code>-recepten.",
			"content.picuBinaryH2": "Binaire pakketten",
			"content.picuBinaryP":
				"picu kan ondertekende binaire archieven installeren na controle van hashes en handtekeningen.",
			"content.picuTrustH2": "Vertrouwen",
			"content.picuTrustCalloutLabel":
				"Onveilige repository's zijn standaard geblokkeerd.",
			"content.picuTrustCalloutText":
				"Installeren vanaf een onveilige mirror vereist de expliciete vlag <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Voorbeeld",
			"content.footerCommands": "Commando's",
			"content.footerSecurity": "Beveiliging",
			"content.footerRecipes": "Recepten",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		sv: {
			"nav.home": "Hem",
			"nav.about": "Om",
			"nav.download": "Ladda ner",
			"nav.picu": "picu",
			"nav.news": "Nyheter",
			"nav.wiki": "Wiki",
			"nav.status": "Status",
			"toc.title": "Innehåll",
			"crumb.home": "Hem",
			"btn.download": "Ladda ner",
			"btn.meetPicu": "Möt picu",
			"btn.openWiki": "Öppna wikin",
			"btn.picuGuide": "picu-guide",
			"btn.aboutProject": "Om projektet",
			"btn.systemStatus": "Systemstatus",
			"btn.downloadPdf": "Ladda ner PDF",
			"btn.sourceCode": "Källkod",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (snart)",
			"foot.note": "Summit Linux & picu · Oberoende projekt med öppen källkod",
			"search.placeholder": "Sök…",
			"aria.navToggle": "Öppna menyn",
			"aria.themeLight": "Byt till ljust tema",
			"aria.themeDark": "Byt till mörkt tema",
			"aria.toTop": "Tillbaka till toppen",
			"toast.coming": "Fullständig översättning kommer — visar engelska",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Om · Summit Linux",
			"meta.title.download": "Ladda ner · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Nyheter · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Status · Summit Linux",
			"meta.title.developing": "Under utveckling · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Oberoende Linux-distribution baserad på LFS med pakethanteraren picu: transparens, säkerhet, källkodsbyggen.",
			"meta.desc.about":
				"Summit Linux-filosofi, LFS-baserat källsystem, picu-stack och färdplan.",
			"meta.desc.download":
				"Ladda ner Summit Linux-avbildningar, verifiera checksum och signaturer, systemkrav.",
			"meta.desc.picu":
				"Pakethanteraren picu: källrecept, binärpaket, signerade speglar och förtroendemodell.",
			"meta.desc.news":
				"Summit Linux-nyheter: releaser, picu-uppdateringar och projektmilstolpar.",
			"meta.desc.wiki":
				"Summit Linux-wiki: installation, picu-kommandon, repon, speglar och FAQ.",
			"meta.desc.status":
				"Summit Linux-status — webbplats, speglar, picu-register och CI.",
			"meta.desc.developing": "Sida under utveckling — Summit Linux.",
			"meta.desc.404": "Sidan hittades inte — Summit Linux.",
			"hero.lead":
				"Oberoende Linux-distribution baserad på LFS med fokus på transparens, stabilitet, minimal overhead och full kontroll över systemet.",
			"err.lead": "sidan hittades inte",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu är pakethanteraren i centrum av Summit Linux. Den hanterar källkodsbyggen, binärpaket, repon, signaturer och paketmetadata.",
			"content.picuCommandsH2": "Kärnkommandon",
			"content.picuSourceH2": "Källkodsbyggen",
			"content.picuSourceP":
				"Paket beskrivs med deklarativa <code>.picu</code>-recept.",
			"content.picuBinaryH2": "Binärpaket",
			"content.picuBinaryP":
				"picu kan installera signerade binärarkiv efter att ha verifierat hash och signaturer.",
			"content.picuTrustH2": "Förtroende",
			"content.picuTrustCalloutLabel": "Osäkra repon blockeras som standard.",
			"content.picuTrustCalloutText":
				"Installation från en osäker spegel kräver den explicita flaggan <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Exempel",
			"content.footerCommands": "Kommandon",
			"content.footerSecurity": "Säkerhet",
			"content.footerRecipes": "Recept",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		cs: {
			"nav.home": "Domů",
			"nav.about": "O projektu",
			"nav.download": "Stáhnout",
			"nav.picu": "picu",
			"nav.news": "Novinky",
			"nav.wiki": "Wiki",
			"nav.status": "Stav",
			"toc.title": "Obsah",
			"crumb.home": "Domů",
			"btn.download": "Stáhnout",
			"btn.meetPicu": "Seznamte se s picu",
			"btn.openWiki": "Otevřít wiki",
			"btn.picuGuide": "Příručka picu",
			"btn.aboutProject": "O projektu",
			"btn.systemStatus": "Stav systému",
			"btn.downloadPdf": "Stáhnout PDF",
			"btn.sourceCode": "Zdrojový kód",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (brzy)",
			"foot.note": "Summit Linux a picu · Nezávislý open-source projekt",
			"search.placeholder": "Hledat…",
			"aria.navToggle": "Otevřít menu",
			"aria.themeLight": "Přepnout na světlý motiv",
			"aria.themeDark": "Přepnout na tmavý motiv",
			"aria.toTop": "Zpět nahoru",
			"toast.coming": "Plný překlad brzy — zobrazuje se angličtina",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "O projektu · Summit Linux",
			"meta.title.download": "Stáhnout · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Novinky · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Stav · Summit Linux",
			"meta.title.developing": "Ve vývoji · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Nezávislá linuxová distribuce na bázi LFS se správcem balíčků picu: transparentnost, bezpečnost, buildy ze zdrojů.",
			"meta.desc.about":
				"Filozofie Summit Linux, zdrojový systém na bázi LFS, stack picu a roadmap.",
			"meta.desc.download":
				"Stáhněte obrazy Summit Linux, ověřte kontrolní součty a podpisy, systémové požadavky.",
			"meta.desc.picu":
				"Správce balíčků picu: zdrojové recepty, binární balíčky, podepsaná zrcadla a model důvěry.",
			"meta.desc.news":
				"Novinky Summit Linux: vydání, aktualizace picu a milníky projektu.",
			"meta.desc.wiki":
				"Wiki Summit Linux: instalace, příkazy picu, repozitáře, zrcadla a FAQ.",
			"meta.desc.status":
				"Stav Summit Linux — web, zrcadla, registr picu a CI.",
			"meta.desc.developing": "Stránka ve vývoji — Summit Linux.",
			"meta.desc.404": "Stránka nenalezena — Summit Linux.",
			"hero.lead":
				"Nezávislá linuxová distribuce na bázi LFS zaměřená na transparentnost, stabilitu, minimální režii a plnou kontrolu nad systémem.",
			"err.lead": "stránka nenalezena",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu je správce balíčků v centru Summit Linux. Spravuje buildy ze zdrojů, binární balíčky, repozitáře, podpisy a metadata balíčků.",
			"content.picuCommandsH2": "Základní příkazy",
			"content.picuSourceH2": "Buildy ze zdrojů",
			"content.picuSourceP":
				"Balíčky popisují deklarativní recepty <code>.picu</code>.",
			"content.picuBinaryH2": "Binární balíčky",
			"content.picuBinaryP":
				"picu umí instalovat podepsané binární archivy po ověření hashů a podpisů.",
			"content.picuTrustH2": "Důvěra",
			"content.picuTrustCalloutLabel":
				"Nebezpečné repozitáře jsou standardně blokovány.",
			"content.picuTrustCalloutText":
				"Instalace z nebezpečného zrcadla vyžaduje explicitní přepínač <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Příklad",
			"content.footerCommands": "Příkazy",
			"content.footerSecurity": "Bezpečnost",
			"content.footerRecipes": "Recepty",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		ro: {
			"nav.home": "Acasă",
			"nav.about": "Despre",
			"nav.download": "Descarcă",
			"nav.picu": "picu",
			"nav.news": "Știri",
			"nav.wiki": "Wiki",
			"nav.status": "Stare",
			"toc.title": "Cuprins",
			"crumb.home": "Acasă",
			"btn.download": "Descarcă",
			"btn.meetPicu": "Cunoaște picu",
			"btn.openWiki": "Deschide wiki",
			"btn.picuGuide": "Ghid picu",
			"btn.aboutProject": "Despre proiect",
			"btn.systemStatus": "Starea sistemului",
			"btn.downloadPdf": "Descarcă PDF",
			"btn.sourceCode": "Cod sursă",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (în curând)",
			"foot.note": "Summit Linux și picu · Proiect independent open-source",
			"search.placeholder": "Caută…",
			"aria.navToggle": "Deschide meniul",
			"aria.themeLight": "Comută la tema luminoasă",
			"aria.themeDark": "Comută la tema întunecată",
			"aria.toTop": "Înapoi sus",
			"toast.coming": "Traducerea completă în curând — se afișează engleza",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Despre · Summit Linux",
			"meta.title.download": "Descarcă · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Știri · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Stare · Summit Linux",
			"meta.title.developing": "În dezvoltare · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Distribuție Linux independentă bazată pe LFS cu managerul picu: transparență, securitate, builduri din surse.",
			"meta.desc.about":
				"Filosofia Summit Linux, sistem sursă bazat pe LFS, stiva picu și foaia de parcurs.",
			"meta.desc.download":
				"Descarcă imaginile Summit Linux, verifică sumele și semnăturile, cerințe de sistem.",
			"meta.desc.picu":
				"Managerul picu: rețete sursă, pachete binare, oglinzi semnate și model de încredere.",
			"meta.desc.news":
				"Știri Summit Linux: lansări, actualizări picu și repere ale proiectului.",
			"meta.desc.wiki":
				"Wiki Summit Linux: instalare, comenzi picu, depozite, oglinzi și FAQ.",
			"meta.desc.status":
				"Stare Summit Linux — site, oglinzi, registru picu și CI.",
			"meta.desc.developing": "Pagină în dezvoltare — Summit Linux.",
			"meta.desc.404": "Pagina nu a fost găsită — Summit Linux.",
			"hero.lead":
				"Distribuție Linux independentă bazată pe LFS, axată pe transparență, stabilitate, overhead minim și control total asupra sistemului.",
			"err.lead": "pagina nu a fost găsită",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu este managerul de pachete din centrul Summit Linux. Gestionează builduri din surse, pachete binare, depozite, semnături și metadate.",
			"content.picuCommandsH2": "Comenzi de bază",
			"content.picuSourceH2": "Builduri din surse",
			"content.picuSourceP":
				"Pachetele sunt descrise prin rețete declarative <code>.picu</code>.",
			"content.picuBinaryH2": "Pachete binare",
			"content.picuBinaryP":
				"picu poate instala arhive binare semnate după verificarea hashurilor și semnăturilor.",
			"content.picuTrustH2": "Încredere",
			"content.picuTrustCalloutLabel":
				"Depozitele nesigure sunt blocate implicit.",
			"content.picuTrustCalloutText":
				"Instalarea dintr-o oglindă nesigură necesită indicatorul explicit <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Exemplu",
			"content.footerCommands": "Comenzi",
			"content.footerSecurity": "Securitate",
			"content.footerRecipes": "Rețete",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		hu: {
			"nav.home": "Főoldal",
			"nav.about": "Névjegy",
			"nav.download": "Letöltés",
			"nav.picu": "picu",
			"nav.news": "Hírek",
			"nav.wiki": "Wiki",
			"nav.status": "Állapot",
			"toc.title": "Tartalom",
			"crumb.home": "Főoldal",
			"btn.download": "Letöltés",
			"btn.meetPicu": "Ismerd meg picu",
			"btn.openWiki": "Wiki megnyitása",
			"btn.picuGuide": "picu útmutató",
			"btn.aboutProject": "A projektről",
			"btn.systemStatus": "Rendszerállapot",
			"btn.downloadPdf": "PDF letöltése",
			"btn.sourceCode": "Forráskód",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (hamarosan)",
			"foot.note": "Summit Linux és picu · Független nyílt forráskódú projekt",
			"search.placeholder": "Keresés…",
			"aria.navToggle": "Menü megnyitása",
			"aria.themeLight": "Váltás világos témára",
			"aria.themeDark": "Váltás sötét témára",
			"aria.toTop": "Vissza a tetejére",
			"toast.coming": "A teljes fordítás hamarosan — angol nyelvű megjelenítés",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Névjegy · Summit Linux",
			"meta.title.download": "Letöltés · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Hírek · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Állapot · Summit Linux",
			"meta.title.developing": "Fejlesztés alatt · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"LFS-alapú független Linux-disztribúció picu csomagkezelővel: átláthatóság, biztonság, forrásból buildelés.",
			"meta.desc.about":
				"Summit Linux-filozófia, LFS-alapú forrássystem, picu-stack és ütemterv.",
			"meta.desc.download":
				"Summit Linux-képek letöltése, ellenőrzőösszegek és aláírások ellenőrzése, rendszerkövetelmények.",
			"meta.desc.picu":
				"picu csomagkezelő: forrásreceptek, bináris csomagok, aláírt tükrök és bizalmi modell.",
			"meta.desc.news":
				"Summit Linux-hírek: kiadások, picu-frissítések és projektmérföldkövek.",
			"meta.desc.wiki":
				"Summit Linux-wiki: telepítés, picu-parancsok, tárolók, tükrök és GYIK.",
			"meta.desc.status":
				"Summit Linux-állapot — webhely, tükrök, picu-regiszter és CI.",
			"meta.desc.developing": "Fejlesztés alatt álló oldal — Summit Linux.",
			"meta.desc.404": "Az oldal nem található — Summit Linux.",
			"hero.lead":
				"LFS-alapú független Linux-disztribúció, amely az átláthatóságra, stabilitásra, minimális többletterhelésre és a rendszer teljes körű vezérlésére összpontosít.",
			"err.lead": "az oldal nem található",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"A picu a Summit Linux középpontjában álló csomagkezelő. Forrásból buildelést, bináris csomagokat, tárolókat, aláírásokat és csomagmetaadatokat kezel.",
			"content.picuCommandsH2": "Alapvető parancsok",
			"content.picuSourceH2": "Forrásból buildelés",
			"content.picuSourceP":
				"A csomagokat deklaratív <code>.picu</code>-receptek írják le.",
			"content.picuBinaryH2": "Bináris csomagok",
			"content.picuBinaryP":
				"A picu a hashek és aláírások ellenőrzése után telepíti az aláírt bináris archívumokat.",
			"content.picuTrustH2": "Bizalom",
			"content.picuTrustCalloutLabel":
				"A nem biztonságos tárolók alapértelmezés szerint blokkolva vannak.",
			"content.picuTrustCalloutText":
				"Nem biztonságos tükörről telepítéshez explicit <code>--allow-unsafe</code> kapcsoló kell.",
			"content.picuExampleH2": "Példa",
			"content.footerCommands": "Parancsok",
			"content.footerSecurity": "Biztonság",
			"content.footerRecipes": "Receptek",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		el: {
			"nav.home": "Αρχική",
			"nav.about": "Σχετικά",
			"nav.download": "Λήψη",
			"nav.picu": "picu",
			"nav.news": "Νέα",
			"nav.wiki": "Wiki",
			"nav.status": "Κατάσταση",
			"toc.title": "Περιεχόμενα",
			"crumb.home": "Αρχική",
			"btn.download": "Λήψη",
			"btn.meetPicu": "Γνωρίστε το picu",
			"btn.openWiki": "Άνοιγμα wiki",
			"btn.picuGuide": "Οδηγός picu",
			"btn.aboutProject": "Σχετικά με το έργο",
			"btn.systemStatus": "Κατάσταση συστήματος",
			"btn.downloadPdf": "Λήψη PDF",
			"btn.sourceCode": "Πηγαίος κώδικας",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (σύντομα)",
			"foot.note": "Summit Linux και picu · Ανεξάρτητο έργο ανοιχτού κώδικα",
			"search.placeholder": "Αναζήτηση…",
			"aria.navToggle": "Άνοιγμα μενού",
			"aria.themeLight": "Εναλλαγή σε ανοιχτό θέμα",
			"aria.themeDark": "Εναλλαγή σε σκούρο θέμα",
			"aria.toTop": "Επιστροφή στην κορυφή",
			"toast.coming": "Πλήρης μετάφραση σύντομα — προβολή στα αγγλικά",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Σχετικά · Summit Linux",
			"meta.title.download": "Λήψη · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Νέα · Summit Linux",
			"meta.title.wiki": "Wiki · Summit Linux",
			"meta.title.status": "Κατάσταση · Summit Linux",
			"meta.title.developing": "Υπό ανάπτυξη · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"Ανεξάρτητη διανομή Linux βασισμένη σε LFS με διαχειριστή πακέτων picu: διαφάνεια, ασφάλεια, build από πηγαίο κώδικα.",
			"meta.desc.about":
				"Φιλοσοφία Summit Linux, πηγαίο σύστημα βασισμένο σε LFS, στοίβα picu και οδικός χάρτης.",
			"meta.desc.download":
				"Λήψη εικόνων Summit Linux, επαλήθευση αθροισμάτων και υπογραφών, απαιτήσεις συστήματος.",
			"meta.desc.picu":
				"Διαχειριστής πακέτων picu: πηγαίες συνταγές, δυαδικά πακέτα, υπογεγραμμένα κάτοπτρα και μοντέλο εμπιστοσύνης.",
			"meta.desc.news":
				"Νέα Summit Linux: εκδόσεις, ενημερώσεις picu και ορόσημα έργου.",
			"meta.desc.wiki":
				"Wiki Summit Linux: εγκατάσταση, εντολές picu, αποθετήρια, κάτοπτρα και FAQ.",
			"meta.desc.status":
				"Κατάσταση Summit Linux — ιστότοπος, κάτοπτρα, μητρώο picu και CI.",
			"meta.desc.developing": "Σελίδα υπό ανάπτυξη — Summit Linux.",
			"meta.desc.404": "Η σελίδα δεν βρέθηκε — Summit Linux.",
			"hero.lead":
				"Ανεξάρτητη διανομή Linux βασισμένη σε LFS, εστιασμένη στη διαφάνεια, τη σταθερότητα, το ελάχιστο κόστος και τον πλήρη έλεγχο του συστήματος.",
			"err.lead": "η σελίδα δεν βρέθηκε",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"Το picu είναι ο διαχειριστής πακέτων στο κέντρο του Summit Linux. Διαχειρίζεται build από πηγαίο κώδικα, δυαδικά πακέτα, αποθετήρια, υπογραφές και μεταδεδομένα.",
			"content.picuCommandsH2": "Βασικές εντολές",
			"content.picuSourceH2": "Build από πηγαίο κώδικα",
			"content.picuSourceP":
				"Τα πακέτα περιγράφονται με δηλωτικές συνταγές <code>.picu</code>.",
			"content.picuBinaryH2": "Δυαδικά πακέτα",
			"content.picuBinaryP":
				"Το picu μπορεί να εγκαταστήσει υπογεγραμμένα δυαδικά αρχεία αφού επαληθεύσει hash και υπογραφές.",
			"content.picuTrustH2": "Εμπιστοσύνη",
			"content.picuTrustCalloutLabel":
				"Τα μη ασφαλή αποθετήρια αποκλείονται από προεπιλογή.",
			"content.picuTrustCalloutText":
				"Η εγκατάσταση από μη ασφαλές κάτοπτρο απαιτεί τη ρητή σημαία <code>--allow-unsafe</code>.",
			"content.picuExampleH2": "Παράδειγμα",
			"content.footerCommands": "Εντολές",
			"content.footerSecurity": "Ασφάλεια",
			"content.footerRecipes": "Συνταγές",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
		kk: {
			"nav.home": "Басты бет",
			"nav.about": "Жоба туралы",
			"nav.download": "Жүктеу",
			"nav.picu": "picu",
			"nav.news": "Жаңалықтар",
			"nav.wiki": "Уики",
			"nav.status": "Мәртебе",
			"toc.title": "Мазмұны",
			"crumb.home": "Басты бет",
			"btn.download": "Жүктеу",
			"btn.meetPicu": "picu-мен таныс",
			"btn.openWiki": "Уикиді ашу",
			"btn.picuGuide": "picu нұсқаулығы",
			"btn.aboutProject": "Жоба туралы",
			"btn.systemStatus": "Жүйе мәртебесі",
			"btn.downloadPdf": "PDF жүктеу",
			"btn.sourceCode": "Бастапқы код",
			"btn.github": "GitHub",
			"btn.discordSoon": "Discord (жақында)",
			"foot.note": "Summit Linux және picu · Тәуелсіз ашық бастапқы жоба",
			"search.placeholder": "Іздеу…",
			"aria.navToggle": "Мәзірді ашу",
			"aria.themeLight": "Ашық тақырыпқа ауысу",
			"aria.themeDark": "Қараңғы тақырыпқа ауысу",
			"aria.toTop": "Жоғарыға оралу",
			"toast.coming": "Толық аударма жақында — ағылшынша көрсетілуде",
			"meta.title.index": "Summit Linux",
			"meta.title.about": "Жоба туралы · Summit Linux",
			"meta.title.download": "Жүктеу · Summit Linux",
			"meta.title.picu": "picu · Summit Linux",
			"meta.title.news": "Жаңалықтар · Summit Linux",
			"meta.title.wiki": "Уики · Summit Linux",
			"meta.title.status": "Мәртебе · Summit Linux",
			"meta.title.developing": "Әзірленуде · Summit Linux",
			"meta.title.404": "404 · Summit Linux",
			"meta.desc.index":
				"LFS негізіндегі тәуелсіз Linux дистрибутиві және picu пакет менеджері: ашықтық, қауіпсіздік, дереккөзден жинау.",
			"meta.desc.about":
				"Summit Linux философиясы, LFS негізіндегі дереккөз жүйесі, picu стегі және жол картасы.",
			"meta.desc.download":
				"Summit Linux бейнелерін жүктеу, бақылау қосындылары мен қолтаңбаларды тексеру, жүйелік талаптар.",
			"meta.desc.picu":
				"picu пакет менеджері: дереккөз рецептері, бинарлық бумалар, қолтаңбаланған айналар және сенім моделі.",
			"meta.desc.news":
				"Summit Linux жаңалықтары: шығарылымдар, picu жаңартулары және жоба белестері.",
			"meta.desc.wiki":
				"Summit Linux уикиі: орнату, picu командалары, репозиторийлер, айналар және FAQ.",
			"meta.desc.status":
				"Summit Linux мәртебесі — сайт, айналар, picu тізілімі және CI.",
			"meta.desc.developing": "Бет әзірленуде — Summit Linux.",
			"meta.desc.404": "Бет табылмады — Summit Linux.",
			"hero.lead":
				"Ашықтыққа, тұрақтылыққа, минималды үстеме шығынға және жүйені толық басқаруға бағытталған LFS негізіндегі тәуелсіз Linux дистрибутиві.",
			"err.lead": "бет табылмады",
			"content.picuTitle": "picu",
			"content.picuIntro":
				"picu — Summit Linux орталығындағы пакет менеджері. Дереккөзден жинауды, бинарлық бумаларды, репозиторийлерді, қолтаңбалар мен бума метадеректерін басқарады.",
			"content.picuCommandsH2": "Негізгі командалар",
			"content.picuSourceH2": "Дереккөзден жинау",
			"content.picuSourceP":
				"Бумалар декларативті <code>.picu</code>-рецептермен сипатталады.",
			"content.picuBinaryH2": "Бинарлық бумалар",
			"content.picuBinaryP":
				"picu хеш пен қолтаңбаларды тексергеннен кейін қолтаңбаланған бинарлық мұрағаттарды орната алады.",
			"content.picuTrustH2": "Сенім",
			"content.picuTrustCalloutLabel":
				"Қауіпсіз емес репозиторийлер әдепкі бойынша бұғатталған.",
			"content.picuTrustCalloutText":
				"Қауіпсіз емес айнадан орнату үшін айқын <code>--allow-unsafe</code> жалаушасы қажет.",
			"content.picuExampleH2": "Мысал",
			"content.footerCommands": "Командалар",
			"content.footerSecurity": "Қауіпсіздік",
			"content.footerRecipes": "Рецептер",
			"banner.text": "Latest: picu 0.3.0 — trust rotation. Signed mirrors coming soon.",
			"banner.link": "Read news",
			"banner.dismiss": "Dismiss",
			"shots.kicker": "Screenshots",
			"shots.title": "Summit in pictures.",
			"shots.lead": "Placeholders — real screenshots will be added here.",
			"shots.kde": "kde",
			"shots.dwm": "dwm",
			"shots.tty": "tty",
			"mir.title": "Official / Community mirrors",
			"mir.link": "Mirror list",
			"mir.col.mirror": "Mirror",
			"mir.col.type": "Type",
			"mir.col.url": "URL",
			"mir.col.status": "Status",
			"mir.official": "Official mirror",
			"mir.community": "Community mirror",
			"mir.communities": "Community mirrors",
			"mir.local": "Local build",
			"mir.signedPlanned": "Signed index (planned)",
			"mir.signed": "Signed index",
			"mir.cook": "picu cook",
			"mir.officialUrl": "<code>mirror.summit-linux.org</code> (coming soon — not live yet)",
			"mir.officialUrlShort": "<code>mirror.summit-linux.org</code> (coming soon)",
			"mir.noCommunity": "— (no community mirrors yet)",
			"mir.none": "—",
			"mir.comingSoon": "Coming soon",
			"mir.available": "Available",
			"err.missing": "missing:",
		},
	};

	const pick = (lang, key) => {
		const dict = I18N[lang] || {};
		if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
		return I18N[FALLBACK][key];
	};

	const normLang = (value) => {
		if (!value) return null;
		if (LANGS.includes(value)) return value;
		if (/-ru\.html(?:[?#]|$)/.test(value)) return "ru";
		if (/-eng\.html(?:[?#]|$)/.test(value)) return "en";
		if (/(^|\/)index-ru\.html(?:[?#]|$)/.test(value)) return "ru";
		if (/(^|\/)index\.html(?:[?#]|$)/.test(value)) return "en";
		if (/(^|\/)404\.html(?:[?#]|$)/.test(value)) return "en";
		if (/(^|\/)picu\.html(?:[?#]|$)/.test(value)) return "en";
		return null;
	};

	const remember = (lang) => {
		try {
			if (lang) window.localStorage.setItem(LANG_KEY, lang);
		} catch (error) {
			/* storage unavailable */
		}
	};

	const stored = () => {
		try {
			return normLang(window.localStorage.getItem(LANG_KEY));
		} catch (error) {
			return null;
		}
	};

	const getToast = () => {
		let toast = document.querySelector(".copy-toast");
		if (!toast) {
			toast = document.createElement("div");
			toast.className = "copy-toast";
			toast.setAttribute("role", "status");
			document.body.append(toast);
		}
		return toast;
	};

	let toastTimer = 0;
	const flash = (message) => {
		const toast = getToast();
		toast.textContent = message;
		toast.classList.add("is-visible");
		window.clearTimeout(toastTimer);
		toastTimer = window.setTimeout(() => {
			toast.classList.remove("is-visible");
		}, 1800);
	};

	// Single painter for every .lang-btn on the page: flag + label are always
	// set as a pair from the same validated code (single source of truth:
	// localStorage "summit-lang", EN fallback). js/main.js must not paint:
	// its per-item bubble handlers are shadowed by our capture handler below.
	const paintLangButtons = (lang) => {
		const code = LANGS.includes(lang) ? lang : FALLBACK;
		document.querySelectorAll(".lang-dropdown").forEach((dropdown) => {
			dropdown.querySelectorAll(".lang-item").forEach((item) => {
				const itemCode =
					item.getAttribute("data-lang") ||
					normLang(item.getAttribute("href") || "");
				const active = itemCode === code;
				item.classList.toggle("is-active", active);
				if (active) item.setAttribute("aria-current", "true");
				else item.removeAttribute("aria-current");
			});
			const btn = dropdown.querySelector(".lang-btn");
			if (!btn) return;
			const flag =
				btn.querySelector("img.lang-flag") || btn.querySelector("img");
			if (flag) flag.setAttribute("src", `assets/flags/${code}.svg`);
			const label = btn.querySelector("span:last-child");
			if (label) label.textContent = code.toUpperCase();
			dropdown.classList.remove("open");
			btn.setAttribute("aria-expanded", "false");
		});
	};

	const buildLegacyMenu = (lang) => {
		document.querySelectorAll("[data-i18n-menu]").forEach((menu) => {
			const here = window.location.pathname.split("/").pop() || "index.html";
			menu.innerHTML = "";
			LANGS.forEach((code) => {
				const item = document.createElement("a");
				item.className = "lang-item" + (code === lang ? " is-active" : "");
				item.setAttribute("href", here);
				item.setAttribute("role", "menuitem");
				if (code !== "en") item.setAttribute("data-lang", code);
				if (code === lang) item.setAttribute("aria-current", "true");
				const flag = document.createElement("img");
				flag.className = "lang-flag";
				flag.setAttribute("src", `assets/flags/${code}.svg`);
				flag.setAttribute("alt", "");
				item.append(flag, document.createTextNode(NATIVE[code] || code));
				menu.append(item);
			});
		});
	};

	const syncDynamicAria = (lang) => {
		const dark = document.documentElement.getAttribute("data-theme") === "dark";
		const themeLabel = pick(lang, dark ? "aria.themeLight" : "aria.themeDark");
		document.querySelectorAll(".theme-toggle").forEach((btn) => {
			if (themeLabel) {
				btn.setAttribute("aria-label", themeLabel);
				btn.setAttribute("title", themeLabel);
			}
		});
		const topLabel = pick(lang, "aria.toTop");
		document.querySelectorAll(".to-top").forEach((btn) => {
			if (topLabel) {
				btn.setAttribute("aria-label", topLabel);
				btn.setAttribute("title", topLabel);
			}
		});
	};

	const pageSlug = () => {
		const file = (
			window.location.pathname.split("/").pop() || "index.html"
		).toLowerCase();
		const m = file.match(
			/^(index|about|download|picu|news|wiki|status|developing|404)/,
		);
		return m ? m[1] : "index";
	};

	const applyMeta = (lang, slug) => {
		const title = pick(lang, `meta.title.${slug}`);
		if (title != null) document.title = title;
		const desc = pick(lang, `meta.desc.${slug}`);
		if (desc != null) {
			const meta = document.querySelector('meta[name="description"]');
			if (meta) meta.setAttribute("content", desc);
			const ogDesc = document.querySelector('meta[property="og:description"]');
			if (ogDesc) ogDesc.setAttribute("content", desc);
		}
		if (title != null) {
			const ogTitle = document.querySelector('meta[property="og:title"]');
			if (ogTitle) ogTitle.setAttribute("content", title);
		}
	};

	const apply = (lang) => {
		if (!LANGS.includes(lang)) lang = FALLBACK;
		document.querySelectorAll("[data-i18n]").forEach((el) => {
			// Commands and code are never translated: anything inside
			// pre / code / .terminal keeps authored content, even if a
			// data-i18n attribute is present (only chrome elements
			// outside code are painted).
			if (el.closest("pre, code, .terminal")) return;
			const raw = el.getAttribute("data-i18n");
			const value = pick(lang, ALIAS[raw] || raw);
			if (value == null) return;
			if (/<[a-z][\s\S]*>/i.test(value)) el.innerHTML = value;
			else el.textContent = value;
		});
		document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
			const value = pick(lang, el.getAttribute("data-i18n-ph"));
			if (value != null) el.setAttribute("placeholder", value);
		});
		document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
			const value = pick(lang, el.getAttribute("data-i18n-aria"));
			if (value != null) el.setAttribute("aria-label", value);
		});
		document
			.querySelectorAll('input[type="search"], .search-input')
			.forEach((el) => {
				if (!el.hasAttribute("placeholder")) return;
				const value = pick(lang, "search.placeholder");
				if (value != null) el.setAttribute("placeholder", value);
			});
		document.documentElement.setAttribute("lang", lang);
		applyMeta(lang, pageSlug());
		paintLangButtons(lang);
		buildLegacyMenu(lang);
		syncDynamicAria(lang);
	};

	const applyStored = () => {
		const lang =
			stored() ||
			normLang(document.documentElement.getAttribute("lang")) ||
			FALLBACK;
		apply(lang);
	};

	// Capture phase: runs before js/main.js bubble handlers, so our
	// preventDefault + stopPropagation wins over its redirect-to-EN logic.
	// Content stays in place, only the chrome is translated.
	document.addEventListener(
		"click",
		(event) => {
			const target = event.target instanceof Element ? event.target : null;
			if (!target || !target.closest) return;
			const item = target.closest(".lang-item[data-lang]");
			if (item) {
				event.preventDefault();
				event.stopPropagation();
				const code = item.getAttribute("data-lang");
				if (!LANGS.includes(code)) return;
				remember(code);
				apply(code);
				flash(pick(code, "toast.coming"));
				return;
			}
			// Plain EN/RU items are real page navigations: let the default
			// action proceed, but stop propagation so the js/main.js bubble
			// handlers cannot overwrite summit-lang with a raw href.
			const plain = target.closest(".lang-item:not([data-lang])");
			if (plain) {
				event.stopPropagation();
				remember(normLang(plain.getAttribute("href") || ""));
			}
		},
		true,
	);

	if ("MutationObserver" in window) {
		new MutationObserver(() => {
			applyStored();
		}).observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", applyStored);
	} else {
		applyStored();
	}
})();
