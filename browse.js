const WORKER_URL = "https://yes-pm-worker.rishabhukrishabh.workers.dev";

// A fixed taxonomy so the category row always looks complete, even while
// the corpus is small — any industry tag on a case that isn't in this list
// still shows up automatically, appended after these.
const PREDEFINED_INDUSTRIES = [
  "B2B SaaS",
  "B2C / Consumer",
  "Marketplace",
  "Fintech",
  "E-commerce",
  "Subscription streaming",
  "Healthtech",
  "Edtech",
  "Enterprise / Traditional",
  "Media & Entertainment",
];

let allCases = [];
let activeCategory = "All";

async function init() {
  const categoryRow = document.getElementById("categoryRow");
  const resultsDiv = document.getElementById("browseResults");

  try {
    const res = await fetch(`${WORKER_URL}/api/browse`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    allCases = data.cases || [];
    renderCategories();
    renderCases(allCases);
  } catch (err) {
    categoryRow.innerHTML = "";
    resultsDiv.innerHTML = `<p class="error">Couldn't load the library: ${err.message}</p>`;
  }
}

function countFor(industry) {
  if (industry === "All") return allCases.length;
  return allCases.filter((c) => c.industry === industry).length;
}

function renderCategories() {
  const categoryRow = document.getElementById("categoryRow");

  const dataIndustries = Array.from(new Set(allCases.map((c) => c.industry).filter(Boolean)));
  const extra = dataIndustries.filter((i) => !PREDEFINED_INDUSTRIES.includes(i)).sort();
  const categories = ["All", ...PREDEFINED_INDUSTRIES, ...extra];

  categoryRow.innerHTML = categories
    .map((cat) => {
      const count = countFor(cat);
      const emptyClass = cat !== "All" && count === 0 ? " is-empty" : "";
      return `<button class="category-pill${cat === activeCategory ? " active" : ""}${emptyClass}" data-category="${cat}">${cat} <span class="pill-count">${count}</span></button>`;
    })
    .join("");

  categoryRow.querySelectorAll(".category-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      categoryRow.querySelectorAll(".category-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filtered =
        activeCategory === "All" ? allCases : allCases.filter((c) => c.industry === activeCategory);
      renderCases(filtered);
    });
  });
}

function renderCases(cases) {
  const resultsDiv = document.getElementById("browseResults");

  if (cases.length === 0) {
    resultsDiv.innerHTML =
      activeCategory === "All"
        ? "<p>No cases in the library yet. Head back and contribute one to get started.</p>"
        : "<p>No cases in this category yet — check back soon, or try a different one.</p>";
    return;
  }

  resultsDiv.innerHTML = cases
    .map(
      (c) => `
      <div class="case-card">
        <h3>${c.title}</h3>
        <p class="score">${c.framework || "no framework tagged"} · ${c.industry || "industry unspecified"} · ${c.company_stage || "stage unspecified"}</p>
        <p class="precedent-line"><strong>Precedent:</strong> ${c.sections.precedent || ""}</p>
        <details>
          <summary>Full case</summary>
          <p><strong>Situation:</strong> ${c.sections.situation || ""}</p>
          <p><strong>Stakes:</strong> ${c.sections.stakes || ""}</p>
          <p><strong>Diagnosis:</strong> ${c.sections.diagnosis || ""}</p>
          <p><strong>Decision:</strong> ${c.sections.decision || ""}</p>
          <p><strong>Outcome:</strong> ${c.sections.outcome || ""}</p>
        </details>
      </div>`
    )
    .join("");
}

init();
