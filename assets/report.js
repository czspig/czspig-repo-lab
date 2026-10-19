/* 解析报告页：明暗主题 + 目录高亮 */
(function () {
	const root = document.documentElement;
	const isDark = () =>
		root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
	document.getElementById("themeBtn").addEventListener("click", () => {
		const next = isDark() ? "light" : "dark";
		root.dataset.theme = next;
		try {
			localStorage.setItem("repo-lab-theme", next);
		} catch (e) {}
	});

	const links = [...document.querySelectorAll(".toc a")];
	const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
	const spy = new IntersectionObserver(
		(entries) => {
			entries.forEach((en) => {
				if (!en.isIntersecting) return;
				links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
			});
		},
		{ rootMargin: "-20% 0px -70% 0px" },
	);
	sections.forEach((s) => s && spy.observe(s));
})();
