async function updateStats() {
  const state = await chrome.storage.local.get(['automationData', 'currentIndex', 'isActive']);
  const statsGrid = document.getElementById('statsGrid');
  const totalEl = document.getElementById('totalTasks');
  const leftEl = document.getElementById('leftTasks');
  const doneEl = document.getElementById('doneTasks');

  if (state.automationData && state.automationData.length > 0) {
    statsGrid.style.display = 'grid';
    const total = state.automationData.length;
    const done = state.currentIndex || 0;
    const left = total - done;

    totalEl.textContent = total;
    leftEl.textContent = left;
    doneEl.textContent = done;
  } else {
    statsGrid.style.display = 'none';
  }
}

document.getElementById('startButton').addEventListener('click', async () => {
  const jsonInput = document.getElementById('jsonInput').value;
  const submitDate = document.getElementById('submitDate').value;
  const statusEl = document.getElementById('status');

  try {
    const data = JSON.parse(jsonInput);
    if (!Array.isArray(data)) throw new Error("Input must be a JSON array.");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url.startsWith("https://docs.google.com/forms")) {
      statusEl.textContent = "Please open a Google Form first.";
      statusEl.className = "error";
      return;
    }

    statusEl.textContent = "Automation Started!";
    statusEl.className = "success";

    await chrome.storage.local.set({ 
      automationData: data, 
      currentIndex: 0, 
      isActive: true,
      customDate: submitDate || null, // Optional custom date
      originalUrl: tab.url.split('?')[0].split('#')[0]
    });
    
    updateStats();

    chrome.tabs.sendMessage(tab.id, { action: "START_AUTOMATION" }, (response) => {
      if (chrome.runtime.lastError) {
        chrome.tabs.reload(tab.id);
      }
    });

  } catch (e) {
    statusEl.textContent = "Error: " + e.message;
    statusEl.className = "error";
  }
});

document.getElementById('resetButton').addEventListener('click', async () => {
  await chrome.storage.local.set({ automationData: [], currentIndex: 0, isActive: false, customDate: null });
  document.getElementById('jsonInput').value = '';
  document.getElementById('submitDate').value = '';
  document.getElementById('status').textContent = 'Progress reset.';
  document.getElementById('status').className = '';
  updateStats();
});

// Initial load
updateStats();
chrome.storage.local.get(['customDate'], (res) => {
  if (res.customDate) document.getElementById('submitDate').value = res.customDate;
});
