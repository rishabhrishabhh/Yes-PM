// Replace this with your deployed Worker URL after Step 4 of the deploy guide
const WORKER_URL = "https://yes-pm-worker.YOUR_SUBDOMAIN.workers.dev";

// --- Tab switching ---
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// --- Get Unstuck ---
document.getElementById("findPrecedentBtn").addEventListener("click", async () => {
  const situation = document.getElementById("situationInput").value.trim();
  const resultsDiv = document.getElementById("results");
  if (!situation) return;

  resultsDiv.innerHTML = "<p>Searching precedent...</p>";

  try {
    const res = await fetch(`${WORKER_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML =
        "<p>No matching cases yet. Try different phrasing, or the corpus may still be small.</p>";
      return;
    }

    resultsDiv.innerHTML = data.results
      .map(
        (c) => `
        <div class="case-card">
          <h3>${c.title}</h3>
          <p class="score">match score: ${c.score.toFixed(2)}</p>
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
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error">Something went wrong: ${err.message}</p>`;
  }
});

// --- Submit a case ---
document.getElementById("caseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const statusDiv = document.getElementById("submitStatus");
  statusDiv.textContent = "Uploading...";

  const payload = {
    case_id: document.getElementById("caseId").value.trim(),
    title: document.getElementById("title").value.trim(),
    metadata: {
      framework: document.getElementById("framework").value.trim(),
      industry: document.getElementById("industry").value.trim(),
      company_stage: document.getElementById("companyStage").value.trim(),
      problem_type: document.getElementById("problemType").value.trim(),
    },
    sections: {
      situation: document.getElementById("situation").value.trim(),
      stakes: document.getElementById("stakes").value.trim(),
      diagnosis: document.getElementById("diagnosis").value.trim(),
      decision: document.getElementById("decision").value.trim(),
      outcome: document.getElementById("outcome").value.trim(),
      precedent: document.getElementById("precedent").value.trim(),
    },
  };

  try {
    const res = await fetch(`${WORKER_URL}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    statusDiv.textContent = `Uploaded! ${data.chunks_uploaded} sections indexed.`;
    document.getElementById("caseForm").reset();
  } catch (err) {
    statusDiv.textContent = `Error: ${err.message}`;
  }
});
