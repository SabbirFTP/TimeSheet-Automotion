async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findField(labelText) {
  const headings = document.querySelectorAll('div[role="heading"], div[role="listitem"] span');
  for (const el of headings) {
    const text = el.innerText.toLowerCase();
    if (text.includes(labelText.toLowerCase())) {
      // Find the closest wrapper that usually contains the input
      const container = el.closest('[role="listitem"]') || el.parentElement.parentElement;
      return container.querySelector('input, textarea');
    }
  }
  return null;
}

async function fillField(labelText, value) {
  if (value === undefined || value === null) return false;
  const input = await findField(labelText);
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }
  return false;
}

async function runAutomation() {
  const { automationData, currentIndex, isActive, originalUrl } = await chrome.storage.local.get(['automationData', 'currentIndex', 'isActive', 'originalUrl']);
  
  if (!isActive || !automationData || currentIndex >= automationData.length) {
    if (isActive) {
      console.log("Automation finished.");
      await chrome.storage.local.set({ isActive: false });
    }
    return;
  }

  // If we are on the confirmation page, go back to the form
  if (window.location.href.includes('/formResponse')) {
     window.location.href = originalUrl || window.location.href.split('/formResponse')[0] + '/viewform';
     return;
  }

  const entry = automationData[currentIndex];
  console.log(`Processing entry ${currentIndex + 1}/${automationData.length}:`, entry);

  await delay(1500);

  // Fill project
  if (entry.project) await fillField("project", entry.project);
  await delay(500);

  // Fill description
  if (entry.description) await fillField("description", entry.description);
  await delay(500);

  // Fill start time
  if (entry.start_time) await fillField("start", entry.start_time);
  await delay(500);

  // Fill end time
  if (entry.end_time) await fillField("end", entry.end_time);
  await delay(1000);

  // Find and click submit
  const buttons = document.querySelectorAll('div[role="button"], span[role="button"]');
  const submitBtn = Array.from(buttons).find(b => b.innerText.toLowerCase().includes('submit'));

  if (submitBtn) {
    console.log("Submitting form...");
    await chrome.storage.local.set({ currentIndex: currentIndex + 1 });
    submitBtn.click();
    
    // Wait for submission and the load event will kick in next
    await delay(3000);
    const anotherLink = Array.from(document.querySelectorAll('a')).find(a => a.innerText.toLowerCase().includes('submit another'));
    if (anotherLink) {
        anotherLink.click();
    } else {
        window.location.reload();
    }
  } else {
    console.error("Submit button not found");
  }
}

// Check on load if automation is active
if (document.readyState === 'complete') {
    checkAndRun();
} else {
    window.addEventListener('load', checkAndRun);
}

function checkAndRun() {
    chrome.storage.local.get(['isActive'], (result) => {
        if (result.isActive) {
            runAutomation();
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_AUTOMATION") {
    runAutomation();
  }
});
