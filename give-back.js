const WORKER_URL = "https://yes-pm-worker.rishabhukrishabh.workers.dev";

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
