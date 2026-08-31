const WORKER_URL = "https://yes-pm-worker.rishabhukrishabh.workers.dev";

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
