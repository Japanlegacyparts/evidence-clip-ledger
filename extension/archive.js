let records = [];

async function loadRecords() {
  if (!globalThis.chrome?.storage) {
    records = [
      { id: "demo-1", capturedUtc: new Date().toISOString(), pageTitle: "Official parts catalog - demonstration", pageUrl: "https://example.com/parts/catalog", fact: "Application includes the documented model code and production boundary.", authority: "A", strength: 5, caseName: "AE86 alternator verification", notes: "Confirm connector and pulley alignment against the physical candidate." },
      { id: "demo-2", capturedUtc: new Date(Date.now() - 3600000).toISOString(), pageTitle: "Technical dimensions - demonstration", pageUrl: "https://example.com/parts/dimensions", fact: "Pivot width and mounting-hole diameter match the candidate measurement.", authority: "B", strength: 4, caseName: "AE86 alternator verification", notes: "Independent dimensional cross-check." }
    ];
  } else {
    const value = await chrome.storage.local.get({ evidenceRecords: [] });
    records = Array.isArray(value.evidenceRecords) ? value.evidenceRecords : [];
  }
  render();
}

async function persist() {
  if (globalThis.chrome?.storage) await chrome.storage.local.set({ evidenceRecords: records });
  render();
}

function escapeText(value) {
  const span = document.createElement("span");
  span.textContent = value || "";
  return span.innerHTML;
}

function render() {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  const filtered = records.filter(record => [record.caseName, record.pageTitle, record.pageUrl, record.fact, record.notes].some(value => String(value || "").toLowerCase().includes(query)));
  document.querySelector("#recordCount").textContent = records.length;
  document.querySelector("#strongCount").textContent = records.filter(record => record.strength >= 4 && ["A", "B", "C"].includes(record.authority)).length;
  document.querySelector("#caseCount").textContent = new Set(records.map(record => record.caseName).filter(Boolean)).size;
  const list = document.querySelector("#recordList");
  if (!filtered.length) {
    list.innerHTML = '<p class="empty">No matching evidence records.</p>';
    return;
  }
  list.innerHTML = filtered.map(record => `
    <article class="record">
      <div class="grade grade-${escapeText(record.authority)}"><strong>${escapeText(record.authority)}</strong><span>${Number(record.strength)}/5</span></div>
      <div class="record-body">
        <p class="case-name">${escapeText(record.caseName || "Unassigned case")}</p>
        <h2>${escapeText(record.fact)}</h2>
        <a href="${escapeText(record.pageUrl)}" target="_blank" rel="noreferrer">${escapeText(record.pageTitle)}</a>
        <p class="record-url">${escapeText(record.pageUrl)}</p>
        ${record.notes ? `<p class="record-notes">${escapeText(record.notes)}</p>` : ""}
        <small>${new Date(record.capturedUtc).toLocaleString()}</small>
      </div>
      <button class="delete-record" data-id="${escapeText(record.id)}" aria-label="Delete record">×</button>
    </article>`).join("");
  list.querySelectorAll(".delete-record").forEach(button => button.addEventListener("click", async () => {
    records = records.filter(record => record.id !== button.dataset.id);
    await persist();
  }));
}

function download(filename, content, type) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([content], { type }));
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 500);
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

document.querySelector("#search").addEventListener("input", render);
document.querySelector("#exportJson").addEventListener("click", () => download("evidence-clip-ledger.json", JSON.stringify({ schemaVersion: "1.0", exportedUtc: new Date().toISOString(), records }, null, 2), "application/json"));
document.querySelector("#exportCsv").addEventListener("click", () => {
  const head = "captured_utc,case,page_title,page_url,fact,authority,strength,notes\n";
  const body = records.map(record => [record.capturedUtc, record.caseName, record.pageTitle, record.pageUrl, record.fact, record.authority, record.strength, record.notes].map(csv).join(",")).join("\n");
  download("evidence-clip-ledger.csv", head + body + "\n", "text/csv");
});
document.querySelector("#clearAll").addEventListener("click", async () => {
  if (confirm("Delete every locally stored evidence record?")) { records = []; await persist(); }
});
loadRecords();
