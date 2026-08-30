const WORKER_URL = "https://yes-pm-worker.rishabhukrishabh.workers.dev";

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

    if (allCases.length === 0) {
      categoryRow.innerHTML = "";
      resultsDiv.innerHTML = "<p>No cases in the library yet. Head back and contribute one to get started.</p>";
      return;
    }

    renderCategories();
    renderCases(allCases);
  } catch (err) {
    categoryRow.innerHTML = "";
    resultsDiv.innerHTML = `<p class="error">Couldn't load the library: ${err.message}</p>`;
  }
}

function renderCategories() {
  const categoryRow = document.getElementById("categoryRow");

  // Build the category list straight from whatever industries actually
  // exist in the corpus right now, so it grows on its own as cases are added.
  const industries = Array.from(
    new Set(allCases.map((c) => c.industry).filter(Boolean))
  ).sort();

  const categories = ["All", ...industries];

  categoryRow.innerHTML = categories
    .map(
      (cat) => `<button class="category-pill${cat === activeCategory ? " active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");

  categoryRow.querySelectorAll(".category-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      categoryRow.querySelectorAll(".category-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filtered =
        activeCategory === "All"
          ? allCases
          : allCases.filter((c) => c.industry === activeCategory);
      renderCases(filtered);
    });
  });
}

function renderCases(cases) {
  const resultsDiv = document.getElementById("browseResults");

  if (cases.length === 0) {
    resultsDiv.innerHTML = "<p>No cases in this category yet.</p>";
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
