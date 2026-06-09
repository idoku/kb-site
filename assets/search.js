(() => {
  const root = document.documentElement;
  const storedMode = localStorage.getItem("kb-color-mode");
  if (storedMode) root.dataset.colorMode = storedMode;

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = root.dataset.colorMode === "dark" ? "light" : "dark";
      root.dataset.colorMode = next;
      localStorage.setItem("kb-color-mode", next);
    });
  });

  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const indexUrl = document.body.dataset.searchIndex;
  if (!input || !results || !indexUrl) return;
  const siteRoot = indexUrl.replace(/search-index\.json$/, "");

  let records = [];
  fetch(indexUrl)
    .then((response) => (response.ok ? response.json() : []))
    .then((data) => {
      records = Array.isArray(data) ? data : [];
    })
    .catch(() => {
      records = [];
    });

  const normalize = (value) => String(value || "").toLowerCase();
  const scoreRecord = (record, terms) => {
    const haystack = normalize(
      [record.title, record.summary, record.type, record.path, (record.tags || []).join(" ")].join(" ")
    );
    return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
  };

  input.addEventListener("input", () => {
    const terms = normalize(input.value).split(/\s+/).filter(Boolean);
    results.replaceChildren();
    if (!terms.length) return;

    records
      .map((record) => ({ record, score: scoreRecord(record, terms) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
      .slice(0, 8)
      .forEach(({ record }) => {
        const link = document.createElement("a");
        link.href = `${siteRoot}${record.url || ""}`;
        link.textContent = record.title;
        results.appendChild(link);
      });
  });
})();
