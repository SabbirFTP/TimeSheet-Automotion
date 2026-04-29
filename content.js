async function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

function realClick(el) {
    if (!el) return;
    el.focus();
    ['mousedown', 'mouseup', 'click'].forEach(t => el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window, buttons: 1 })));
}

async function findField(labelText) {
    const selectors = ['div[role="heading"]', 'div.M7eMe', 'div.HoXoMd', 'div[role="listitem"] span'];
    for (const s of selectors) {
        const elements = document.querySelectorAll(s);
        for (const el of elements) {
            if (el.innerText.trim().toLowerCase().includes(labelText.toLowerCase())) {
                const container = el.closest('[role="listitem"]');
                if (container) return container;
            }
        }
    }
    return null;
}

async function handleDropdown(container, value) {
    const listbox = container.querySelector('div[role="listbox"]');
    if (!listbox) return false;

    realClick(listbox);
    await delay(1200);

    const options = Array.from(document.querySelectorAll('div[role="option"]'));
    const target = options.find(o => {
        const rect = o.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const textMatch = o.innerText.trim().toLowerCase().includes(value.toLowerCase());
        return isVisible && textMatch;
    });

    if (target) {
        const inner = target.querySelector('span.vRMGwf') || target;
        realClick(inner);
        await delay(600);
        if (listbox.innerText.toLowerCase().includes('choose')) {
            target.focus();
            target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
        }
        return true;
    }
    return false;
}

async function runAutomation() {
    const state = await chrome.storage.local.get(['automationData', 'currentIndex', 'isActive', 'originalUrl']);
    if (!state.isActive || !state.automationData || state.currentIndex >= state.automationData.length) {
        if (state.isActive) await chrome.storage.local.set({ isActive: false });
        return;
    }

    if (window.location.href.includes('/formResponse')) {
        const another = Array.from(document.querySelectorAll('a')).find(a => a.innerText.toLowerCase().includes('submit another'));
        if (another) another.click();
        else window.location.href = state.originalUrl || window.location.href.split('/formResponse')[0] + '/viewform';
        return;
    }

    const entry = state.automationData[state.currentIndex];
    await delay(1500);

    // 1. Email Checkbox (Record Email)
    const emailDiv = Array.from(document.querySelectorAll('div[role="checkbox"]')).find(d => d.getAttribute('aria-label')?.toLowerCase().includes('record'));
    if (emailDiv && emailDiv.getAttribute('aria-checked') === 'false') realClick(emailDiv);

    // 2. Date
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 3. Dropdowns
    const nameField = await findField("Employee Name");
    if (nameField) await handleDropdown(nameField, "Monjel Morshed Sabbir");
    await delay(800);

    const idField = await findField("Employee ID");
    if (idField) await handleDropdown(idField, "202503");
    await delay(800);

    // 4. Texts
    const projField = await findField("Project");
    if (projField) {
        const tx = projField.querySelector('textarea, input');
        if (tx) { tx.value = entry.project; tx.dispatchEvent(new Event('input', { bubbles: true })); tx.dispatchEvent(new Event('blur', { bubbles: true })); }
    }
    
    const descField = await findField("Description");
    if (descField) {
        const tx = descField.querySelector('textarea, input');
        if (tx) { tx.value = entry.description; tx.dispatchEvent(new Event('input', { bubbles: true })); tx.dispatchEvent(new Event('blur', { bubbles: true })); }
    }

    // 5. Times (Hour/Minute)
    const fillT = async (label, val) => {
        const c = await findField(label);
        if (c && val) {
            const [h, m] = val.split(':');
            const ins = c.querySelectorAll('input[type="number"]');
            if (ins.length >= 2) {
                ins[0].value = h; ins[0].dispatchEvent(new Event('input', { bubbles: true }));
                ins[1].value = m; ins[1].dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    };
    await fillT("Start Time", entry.start_time);
    await fillT("End Time", entry.end_time);

    // 6. Rating
    const rateField = await findField("Rating");
    if (rateField) {
        const rad = rateField.querySelector('div[role="radio"][aria-label="10"]');
        if (rad) realClick(rad);
    }

    // 7. Copy
    const copy = Array.from(document.querySelectorAll('div[role="checkbox"]')).find(d => d.getAttribute('aria-label')?.toLowerCase().includes('send me a copy'));
    if (copy && copy.getAttribute('aria-checked') === 'false') realClick(copy);

    await delay(1000);
    const sub = Array.from(document.querySelectorAll('div[role="button"], span[role="button"]')).find(b => b.innerText.toLowerCase().includes('submit'));
    if (sub) {
        await chrome.storage.local.set({ currentIndex: state.currentIndex + 1 });
        realClick(sub);
    }
}

if (document.readyState === 'complete') checkAndRun();
else window.addEventListener('load', checkAndRun);

function checkAndRun() {
    chrome.storage.local.get(['isActive'], (res) => { if (res && res.isActive) runAutomation(); });
}

chrome.runtime.onMessage.addListener(m => { if (m.action === "START_AUTOMATION") runAutomation(); });
