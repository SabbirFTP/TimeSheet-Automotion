// ================= UTIL =================
async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function realClick(el) {
  if (!el) return;
  el.focus();
  ["mousedown", "mouseup", "click"].forEach((t) =>
    el.dispatchEvent(
      new MouseEvent(t, {
        bubbles: true,
        cancelable: true,
        view: window,
        buttons: 1,
      })
    )
  );
}

const normalize = (str) =>
  str?.toLowerCase().replace(/^mr\s+/i, "").trim();

// ================= FIELD FINDER =================
async function findField(labelText) {
  const elements = document.querySelectorAll('[role="listitem"]');

  for (const el of elements) {
    const label = el.innerText?.toLowerCase();
    if (label && label.includes(labelText.toLowerCase())) {
      return el;
    }
  }
  return null;
}

// ================= DROPDOWN (FIXED) =================
async function handleDropdown(container, value) {
  const listbox = container.querySelector('[role="listbox"]');
  if (!listbox) return false;

  listbox.scrollIntoView({ block: "center" });
  await delay(300);

  realClick(listbox);

  // Wait for dropdown options (dynamic)
  let options = [];
  for (let i = 0; i < 15; i++) {
    options = Array.from(document.querySelectorAll('[role="option"]'));
    if (options.length) break;
    await delay(200);
  }

  if (!options.length) {
    console.log("❌ No dropdown options found");
    return false;
  }

  // DEBUG (optional)
  // options.forEach(o => console.log(">>", o.innerText));

  // Try exact match first
  let target = options.find(
    (o) =>
      normalize(o.innerText) === normalize(value)
  );

  // Fallback: partial match
  if (!target) {
    target = options.find((o) =>
      normalize(o.innerText).includes(normalize(value))
    );
  }

  if (!target) {
    console.log("❌ Option not found:", value);
    return false;
  }

  target.scrollIntoView({ block: "center" });
  await delay(200);

  realClick(target);
  await delay(500);

  return true;
}

// ================= TEXT INPUT =================
function fillText(container, value) {
  const input = container.querySelector("textarea, input");
  if (!input) return;

  input.focus();
  input.value = value;

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("blur", { bubbles: true }));
}

// ================= TIME =================
async function fillTime(label, val) {
  const container = await findField(label);
  if (!container || !val) return;

  const [h, m] = val.split(":");
  const inputs = container.querySelectorAll('input[type="number"]');

  if (inputs.length >= 2) {
    inputs[0].value = h;
    inputs[1].value = m;

    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// ================= MAIN =================
async function runAutomation() {
  const state = await chrome.storage.local.get([
    "automationData",
    "currentIndex",
    "isActive",
    "originalUrl",
  ]);

  if (
    !state.isActive ||
    !state.automationData ||
    state.currentIndex >= state.automationData.length
  ) {
    if (state.isActive) {
      await chrome.storage.local.set({ isActive: false });
    }
    return;
  }

  // Handle submission page
  if (window.location.href.includes("/formResponse")) {
    const another = Array.from(document.querySelectorAll("a")).find((a) =>
      a.innerText.toLowerCase().includes("submit another")
    );

    if (another) {
      another.click();
    } else {
      window.location.href =
        state.originalUrl ||
        window.location.href.split("/formResponse")[0] + "/viewform";
    }
    return;
  }

  const entry = state.automationData[state.currentIndex];
  await delay(1500);

  // Email checkbox
  const email = Array.from(
    document.querySelectorAll('div[role="checkbox"]')
  ).find((d) =>
    d.getAttribute("aria-label")?.toLowerCase().includes("record")
  );

  if (email && email.getAttribute("aria-checked") === "false") {
    realClick(email);
  }

  // Date
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
    dateInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Dropdowns
  const nameField = await findField("Employee Name");
  if (nameField) {
    await handleDropdown(nameField, "Monjel Morshed Sabbir"); // smart normalized
  }

  await delay(500);

  const idField = await findField("Employee ID");
  if (idField) {
    await handleDropdown(idField, "202503");
  }

  await delay(500);

  // Text
  const proj = await findField("Project");
  if (proj) fillText(proj, entry.project);

  const desc = await findField("Description");
  if (desc) fillText(desc, entry.description);

  // Time
  await fillTime("Start Time", entry.start_time);
  await fillTime("End Time", entry.end_time);

  // Rating (always 10)
  const rate = await findField("Self Rating");
  if (rate) {
    const r = rate.querySelector('div[role="radio"][aria-label="10"]');
    if (r) realClick(r);
  }

  // Copy checkbox
  const copy = Array.from(
    document.querySelectorAll('div[role="checkbox"]')
  ).find((d) =>
    d.getAttribute("aria-label")?.toLowerCase().includes("copy")
  );

  if (copy && copy.getAttribute("aria-checked") === "false") {
    realClick(copy);
  }

  await delay(1000);

  // Submit
  const submit = Array.from(
    document.querySelectorAll('[role="button"]')
  ).find((b) => b.innerText.toLowerCase().includes("submit"));

  if (submit) {
    await chrome.storage.local.set({
      currentIndex: state.currentIndex + 1,
    });

    realClick(submit);
  }
}

// ================= INIT =================
function checkAndRun() {
  chrome.storage.local.get(["isActive"], (res) => {
    if (res?.isActive) runAutomation();
  });
}

if (document.readyState === "complete") {
  checkAndRun();
} else {
  window.addEventListener("load", checkAndRun);
}

chrome.runtime.onMessage.addListener((m) => {
  if (m.action === "START_AUTOMATION") {
    runAutomation();
  }
});