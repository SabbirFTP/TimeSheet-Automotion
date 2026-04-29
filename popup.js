document.getElementById('startButton').addEventListener('click', async () => {
  const jsonInput = document.getElementById('jsonInput').value;
  const statusEl = document.getElementById('status');

  try {
    const data = JSON.parse(jsonInput);
    if (!Array.isArray(data)) throw new Error("Input must be a JSON array.");

    statusEl.textContent = "Processing...";
    statusEl.className = "success";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.startsWith("https://docs.google.com/forms")) {
      statusEl.textContent = "Please open a Google Form first.";
      statusEl.className = "error";
      return;
    }

    // Save to storage and notify content script
    await chrome.storage.local.set({ 
      automationData: data, 
      currentIndex: 0, 
      isActive: true,
      originalUrl: tab.url.split('?')[0].split('#')[0]
    });
    
    chrome.tabs.sendMessage(tab.id, { action: "START_AUTOMATION" });

  } catch (e) {
    statusEl.textContent = "Invalid JSON: " + e.message;
    statusEl.className = "error";
  }
});
