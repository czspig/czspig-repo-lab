/* 猪猪 Repo 研究所 · 页面逻辑（数据见 data.js） */
(function () {
	const $ = (id) => document.getElementById(id);
	const esc = (s) =>
		String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
	const store = {
		get(k) {
			try {
				return localStorage.getItem(k);
			} catch (e) {
				return null;
			}
		},
		set(k, v) {
			try {
				localStorage.setItem(k, v);
			} catch (e) {}
		},
	};

	/* ---------- 明暗主题 ---------- */
	const root = document.documentElement;
	const isDark = () =>
		root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
	$("themeBtn").addEventListener("click", () => {
		const next = isDark() ? "light" : "dark";
		root.dataset.theme = next;
		store.set("repo-lab-theme", next);
	});

	/* ---------- 技术栈雷达横条 ---------- */
	const pill = (s) =>
		`<span class="pill"><svg viewBox="0 0 24 24" aria-hidden="true" fill="${s.color || "currentColor"}"><path d="${s.d}"/></svg>${esc(s.name)}</span>`;
	const pills = STACKS.map(pill).join("");
	// 复制一份接在后面，动画平移一半宽度即可无缝循环；复制的那份对读屏隐藏
	$("track").innerHTML = pills + `<span style="display:contents" aria-hidden="true">${pills}</span>`;
	$("matrixMeta").textContent = `${STACKS.length} stacks // source-level`;

	/* ---------- 统计 ---------- */
	$("statReports").textContent = REPORTS.length;
	$("statStacks").textContent = STACKS.length;

	/* ---------- 研究台账 ---------- */
	const state = { q: "", tag: "", view: store.get("repo-lab-view") === "list" ? "list" : "grid" };
	const allTags = [...new Set(REPORTS.flatMap((r) => r.tags || []))];

	function renderTags() {
		if (!allTags.length) return;
		$("tags").innerHTML = ["", ...allTags]
			.map((t) => `<button type="button" class="tag-btn" data-tag="${esc(t)}" aria-pressed="${t === state.tag}">${t ? esc(t) : "全部"}</button>`)
			.join("");
	}

	function matches(r) {
		if (state.tag && !(r.tags || []).includes(state.tag)) return false;
		if (!state.q) return true;
		const hay = [r.title, r.repo, r.summary, ...(r.tags || []), ...(r.stack || [])].join(" ").toLowerCase();
		return hay.includes(state.q);
	}

	function card(r) {
		return `<a class="report" href="${esc(r.file)}">
			<div class="report-top"><span class="report-repo">${esc(r.repo)}</span><time>${esc(r.date)}</time></div>
			<h3>${esc(r.title)}</h3>
			<p>${esc(r.summary)}</p>
			<div class="report-tags">${(r.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
			<span class="report-read">阅读报告 →</span>
		</a>`;
	}

	function showEmpty(noData) {
		const action = $("emptyAction");
		$("emptyTitle").textContent = noData ? "第一份报告还在实验台上" : "没有找到匹配的报告";
		$("emptyText").textContent = noData
			? "首批开源项目解析正在整理中。可以先去 GitHub 点个 Star，新报告上线会第一时间出现在这里。"
			: "换个关键词，或者清除筛选再看看。";
		if (noData) {
			action.textContent = "去 GitHub 关注 ↗";
			action.href = "https://github.com/czspig/czspig-repo-lab";
			action.target = "_blank";
			action.rel = "noopener";
			action.onclick = null;
		} else {
			action.textContent = "清除筛选";
			action.href = "#ledger";
			action.removeAttribute("target");
			action.onclick = (e) => {
				e.preventDefault();
				state.q = "";
				state.tag = "";
				$("q").value = "";
				renderTags();
				renderGrid();
			};
		}
	}

	function renderGrid() {
		const list = REPORTS.filter(matches);
		const grid = $("grid");
		grid.classList.toggle("is-list", state.view === "list");
		grid.innerHTML = list.map(card).join("");
		grid.hidden = !list.length;
		$("empty").hidden = !!list.length;
		if (!list.length) showEmpty(!REPORTS.length);
		$("count").textContent = state.q || state.tag ? `找到 ${list.length} / ${REPORTS.length} 份` : `共 ${REPORTS.length} 份`;
		document.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === state.view)));
	}

	$("q").addEventListener("input", (e) => {
		state.q = e.target.value.trim().toLowerCase();
		renderGrid();
	});
	$("tags").addEventListener("click", (e) => {
		const b = e.target.closest("[data-tag]");
		if (!b) return;
		state.tag = b.dataset.tag;
		renderTags();
		renderGrid();
	});
	document.querySelectorAll("[data-view]").forEach((b) =>
		b.addEventListener("click", () => {
			state.view = b.dataset.view;
			store.set("repo-lab-view", state.view);
			renderGrid();
		}),
	);

	renderTags();
	renderGrid();

	/* ---------- 实验日志（新的在上） ---------- */
	$("logList").innerHTML = LOG.slice()
		.reverse()
		.map((l) => `<li><time>${esc(l.date)}</time><div><h3>${esc(l.title)}</h3><p>${esc(l.body)}</p></div></li>`)
		.join("");
})();
