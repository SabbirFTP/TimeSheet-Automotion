document.getElementById('startButton').addEventListener('click', async () => {
  const jsonInput = document.getElementById('jsonInput').value;
  const statusEl = document.getElementById('status');

  try {
    const data = JSON.parse(jsonInput);
    if (!Array.isArray(data)) throw new Error("Input must be a JSON array.");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url.includes("docs.google.com/forms")) {
      statusEl.textContent = "Please open a Google Form first.";
      statusEl.className = "error";
      return;
    }

    statusEl.textContent = "Automation Started! Refresh page if it doesn't move.";
    statusEl.className = "success";

    await chrome.storage.local.set({ 
      automationData: data, 
      currentIndex: 0, 
      isActive: true,
      originalUrl: tab.url.split('?')[0].split('#')[0]
    });
    
    // Inject and trigger
    chrome.tabs.sendMessage(tab.id, { action: "START_AUTOMATION" }, () => {
      if (chrome.runtime.lastError) {
        // If script isn't loaded yet, reload the tab to inject it
        chrome.tabs.reload(tab.id);
      }
    });

  } catch (e) {
    statusEl.textContent = "Invalid JSON: " + e.message;
    statusEl.className = "error";
  }
});
