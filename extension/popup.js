const titleElement = document.querySelector("#pageTitle");
const urlElement = document.querySelector("#pageUrl");
const statusElement = document.querySelector("#status");
let activePage = { title: "Manual evidence record", url: "" };

async function readActivePage() {
  if (!globalThis.chrome?.tabs) {
    activePage = { title: "Manufacturer catalog - demonstration", url: "https://example.com/parts/catalog" };
    titleElement.textContent = activePage.title;
    urlElement.textContent = activePage.url;
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activePage = { title: tab?.title || "Untitled page", url: tab?.url || "" };
  titleElement.textContent = activePage.title;
  urlElement.textContent = activePage.url;
}

async function getRecords() {
  if (!globalThis.chrome?.storage) return [];
  const value = await chrome.storage.local.get({ evidenceRecords: [] });
  return Array.isArray(value.evidenceRecords) ? value.evidenceRecords : [];
}

document.querySelector("#evidenceForm").addEventListener("submit", async event => {
  event.preventDefault();
  const record = {
    schemaVersion: "1.0",
    id: crypto.randomUUID(),
    capturedUtc: new Date().toISOString(),
    pageTitle: activePage.title,
    pageUrl: activePage.url,
    fact: document.querySelector("#fact").value.trim(),
    authority: document.querySelector("#authority").value,
    strength: Number(document.querySelector("#strength").value),
    caseName: document.querySelector("#caseName").value.trim(),
    notes: document.querySelector("#notes").value.trim()
  };
  if (globalThis.chrome?.storage) {
    const records = await getRecords();
    records.unshift(record);
    await chrome.storage.local.set({ evidenceRecords: records });
  }
  statusElement.textContent = "Saved. Open Archive to review or export.";
  statusElement.classList.add("success");
  document.querySelector("#fact").value = "";
  document.querySelector("#notes").value = "";
});

document.querySelector("#openArchive").addEventListener("click", () => {
  if (globalThis.chrome?.runtime) chrome.runtime.openOptionsPage();
  else location.href = "archive.html";
});

readActivePage().catch(error => {
  titleElement.textContent = "Page unavailable";
  urlElement.textContent = error.message;
});
