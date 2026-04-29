async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findField(labelText) {
  const headings = document.querySelectorAll('div[role="heading"], div[role="listitem"] span');
  for (const el of headings) {
    const text = el.innerText.trim();
    if (text.toLowerCase().includes(labelText.toLowerCase())) {
      const container = el.closest('[role="listitem"]');
      if (container) return container;
    }
  }
  return null;
}

async function fillField(labelText, value) {
  if (value === undefined || value === null) return false;
  const container = await findField(labelText);
  if (!container) return false;

  // Handle Listbox (Dropdowns)
  const listbox = container.querySelector('div[role="listbox"]');
  if (listbox) {
    listbox.click();
    await delay(500);
    const options = document.querySelectorAll('div[role="option"]');
    for (const opt of options) {
      if (opt.innerText.trim() === value || opt.getAttribute('data-value') === value) {
        opt.click();
        await delay(300);
        return true;
      }
    }
    return false;
  }

  // Handle Radio buttons (Rating)
  const radio = container.querySelector(`div[role="radio"][aria-label="${value}"], div[role="radio"][data-value="${value}"]`);
  if (radio) {
    radio.click();
    return true;
  }

  // Try input or textarea
  const input = container.querySelector('input, textarea');
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }

  return false;
}

async function fillTime(labelText, timeStr) {
  if (!timeStr) return;
  const container = await findField(labelText);
  if (!container) return;

  const [hour, minute] = timeStr.split(':');
  const inputs = container.querySelectorAll('input[type="number"]');
  if (inputs.length >= 2) {
    inputs[0].value = hour;
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = minute;
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  return false;
}

async function setCheckbox(ariaLabel, shouldCheck) {
  const checkbox = document.querySelector(`div[role="checkbox"][aria-label*="${ariaLabel}"]`);
  if (checkbox) {
    const isChecked = checkbox.getAttribute('aria-checked') === 'true';
    if (isChecked !== shouldCheck) {
      checkbox.click();
    }
  }
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

  // 1. Employee Name
  await fillField("Employee Name", "Mr Monjel Morshed Sabbir");
  await delay(500);

  // 2. Employee ID
  await fillField("Employee ID", "202503");
  await delay(500);

  // 3. Project
  if (entry.project) await fillField("Project", entry.project);
  await delay(500);

  // 4. Task Description
  if (entry.description) await fillField("Description", entry.description);
  await delay(500);

  // 5. Start Time
  if (entry.start_time) await fillTime("Start Time", entry.start_time);
  await delay(500);

  // 6. End Time
  if (entry.end_time) await fillTime("End Time", entry.end_time);
  await delay(500);

  // 7. Notes (Optional)
  if (entry.notes) await fillField("Notes", entry.notes);
  await delay(500);

  // 8. Rating (Always 10)
  await fillField("Rating", "10");
  await delay(500);

  // 9. Send copy (Always true)
  await setCheckbox("Send me a copy", true);
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
