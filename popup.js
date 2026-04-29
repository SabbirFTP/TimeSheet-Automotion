// ================= CONFIG =================
const EMPLOYEE_NAME = "Mr Monjel Morshed Sabbir";
const EMPLOYEE_ID = "202503";

// ================= THEME =================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'system';
  setTheme(savedTheme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.id.replace('theme-', '');
      setTheme(theme);
    });
  });
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    document.getElementById('theme-system').classList.add('active');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById(`theme-${theme}`).classList.add('active');
  }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (localStorage.getItem('theme') === 'system') {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});

// ================= MODAL =================
function initModals() {
  const infoModal = document.getElementById('infoModal');
  const promptModal = document.getElementById('promptModal');
  const infoBtn = document.getElementById('infoBtn');
  const promptTrainerBtn = document.getElementById('promptTrainerBtn');
  const closeInfoModal = document.getElementById('closeInfoModal');
  const closePromptModal = document.getElementById('closePromptModal');

  infoBtn.addEventListener('click', () => {
    infoModal.classList.add('active');
  });

  promptTrainerBtn.addEventListener('click', () => {
    promptModal.classList.add('active');
  });

  closeInfoModal.addEventListener('click', () => {
    infoModal.classList.remove('active');
  });

  closePromptModal.addEventListener('click', () => {
    promptModal.classList.remove('active');
  });

  // Close on overlay click
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      infoModal.classList.remove('active');
    }
  });

  promptModal.addEventListener('click', (e) => {
    if (e.target === promptModal) {
      promptModal.classList.remove('active');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      infoModal.classList.remove('active');
      promptModal.classList.remove('active');
    }
  });
}

// ================= COPY TO CLIPBOARD =================
function initCopyButtons() {
  const copySampleBtn = document.getElementById('copySampleBtn');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const sampleData = document.getElementById('sampleData');
  const promptText = document.getElementById('promptText');

  copySampleBtn.addEventListener('click', async () => {
    await copyToClipboard(sampleData.textContent, copySampleBtn);
  });

  copyPromptBtn.addEventListener('click', async () => {
    await copyToClipboard(promptText.textContent, copyPromptBtn);
  });
}

async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.innerHTML;
    button.classList.add('copied');
    button.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      <span>Copied!</span>
    `;

    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalText;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// ================= DATE CLEAR =================
function initDateClear() {
  const dateInput = document.getElementById('submitDate');
  const dateClearBtn = document.getElementById('dateClearBtn');

  dateClearBtn.addEventListener('click', () => {
    dateInput.value = '';
    dateInput.focus();
  });

  // Show/hide clear button based on value
  dateInput.addEventListener('input', () => {
    dateClearBtn.style.display = dateInput.value ? 'flex' : 'none';
  });

  // Initial state
  dateClearBtn.style.display = dateInput.value ? 'flex' : 'none';
}

// ================= STATS =================
function updateStats(total, left, done) {
  const statsGrid = document.getElementById('statsGrid');
  const totalTasks = document.getElementById('totalTasks');
  const leftTasks = document.getElementById('leftTasks');
  const doneTasks = document.getElementById('doneTasks');

  if (total > 0) {
    statsGrid.style.display = 'grid';
    totalTasks.textContent = total;
    leftTasks.textContent = left;
    doneTasks.textContent = done;
  } else {
    statsGrid.style.display = 'none';
  }
}

// ================= MAIN AUTOMATION =================
async function startAutomation() {
  const jsonInput = document.getElementById('jsonInput');
  const submitDate = document.getElementById('submitDate');
  const status = document.getElementById('status');
  const startButton = document.getElementById('startButton');

  try {
    const data = JSON.parse(jsonInput.value);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Please provide a valid JSON array');
    }

    // Validate each entry
    for (const entry of data) {
      if (!entry.project || !entry.description || !entry.start_time || !entry.end_time) {
        throw new Error('Each entry must have: project, description, start_time, end_time');
      }
    }

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('docs.google.com/forms')) {
      throw new Error('Please open a Google Form first');
    }

    // Store data
    await chrome.storage.local.set({
      automationData: data,
      currentIndex: 0,
      isActive: true,
      customDate: submitDate.value || null,
      originalUrl: tab.url.split('?')[0].split('#')[0]
    });

    // Update UI
    updateStats(data.length, data.length, 0);
    status.textContent = `Starting automation for ${data.length} tasks...`;
    status.className = 'success';
    startButton.disabled = true;
    startButton.innerHTML = `
      <span class="btn-icon">
        <svg viewBox="0 0 24 24" class="spinning"><path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 14c3.31 0 6-2.69 6-6h-2c0 2.21-1.79 4-4 4V8z"/></svg>
      </span>
      Running...
    `;

    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, { action: 'START_AUTOMATION' });

    // Poll for progress updates
    pollProgress();

  } catch (error) {
    status.textContent = error.message;
    status.className = 'error';
  }
}

async function pollProgress() {
  const status = document.getElementById('status');
  const startButton = document.getElementById('startButton');

  const interval = setInterval(async () => {
    const state = await chrome.storage.local.get([
      'automationData',
      'currentIndex',
      'isActive'
    ]);

    if (!state.isActive || !state.automationData) {
      clearInterval(interval);
      startButton.disabled = false;
      startButton.innerHTML = `
        <span class="btn-icon">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </span>
        Start Automation
      `;
      return;
    }

    const total = state.automationData.length;
    const done = state.currentIndex;
    const left = total - done;

    updateStats(total, left, done);

    if (done >= total) {
      clearInterval(interval);
      status.textContent = 'All tasks completed successfully!';
      status.className = 'success';
      startButton.disabled = false;
      startButton.innerHTML = `
        <span class="btn-icon">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </span>
        Start Automation
      `;
      await chrome.storage.local.set({ isActive: false });
    } else {
      status.textContent = `Processing task ${done + 1} of ${total}...`;
    }
  }, 500);
}

async function resetProgress() {
  const status = document.getElementById('status');
  const startButton = document.getElementById('startButton');

  await chrome.storage.local.set({
    automationData: null,
    currentIndex: 0,
    isActive: false
  });

  updateStats(0, 0, 0);
  status.textContent = 'Progress reset. Ready to start fresh.';
  status.className = 'success';
  startButton.disabled = false;
  startButton.innerHTML = `
    <span class="btn-icon">
      <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    </span>
    Start Automation
  `;
}

// ================= UTILS =================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ================= DAILY NOTES =================
async function initDailyNotes() {
  const notesArea = document.getElementById('dailyNotes');
  const copyBtn = document.getElementById('copyNotesBtn');
  const clearBtn = document.getElementById('clearNotesBtn');
  const status = document.getElementById('status');

  // Auto-resize textarea
  const autoResize = () => {
    notesArea.style.height = 'auto';
    notesArea.style.height = (notesArea.scrollHeight) + 'px';
  };

  // Load existing notes
  const { dailyNotes } = await chrome.storage.local.get('dailyNotes');
  if (dailyNotes) {
    notesArea.value = dailyNotes;
    autoResize();
  }

  // Auto-save with debounce
  const saveNotes = debounce(async (text) => {
    await chrome.storage.local.set({ dailyNotes: text });
    console.log('Notes auto-saved');
  }, 750);

  notesArea.addEventListener('input', () => {
    autoResize();
    saveNotes(notesArea.value);
  });

  // Toolbar Actions
  copyBtn.addEventListener('click', async () => {
    if (notesArea.value) {
      await navigator.clipboard.writeText(notesArea.value);
      status.textContent = 'Notes copied to clipboard!';
      status.className = 'success';
      setTimeout(() => status.textContent = '', 2000);
    }
  });

  clearBtn.addEventListener('click', async () => {
    if (!notesArea.value.trim()) return; // Don't show alert if already empty

    if (confirm('Clear all daily notes?')) {
      notesArea.value = '';
      autoResize();
      await chrome.storage.local.set({ dailyNotes: '' });
      status.textContent = 'Notes cleared.';
      status.className = 'success';
      setTimeout(() => status.textContent = '', 2000);
    }
  });
}

// ================= ACCORDION LOGIC =================
async function initAccordion() {
  const assistantToggle = document.getElementById('assistantToggle');
  const assistantSection = document.getElementById('assistantSection');
  const assistantContent = document.getElementById('assistantContent');
  
  const automationToggle = document.getElementById('automationToggle');
  const automationSection = automationToggle.parentElement;
  const automationContent = document.getElementById('automationContent');

  const openSection = (section, content) => {
    section.classList.remove('collapsed');
    content.classList.remove('hidden');
  };

  const closeSection = (section, content) => {
    section.classList.add('collapsed');
    content.classList.add('hidden');
  };

  assistantToggle.addEventListener('click', () => {
    if (assistantSection.classList.contains('collapsed')) {
      openSection(assistantSection, assistantContent);
      closeSection(automationSection, automationContent);
    } else {
      // If already open, swap to the other one
      closeSection(assistantSection, assistantContent);
      openSection(automationSection, automationContent);
    }
  });

  automationToggle.addEventListener('click', () => {
    if (automationSection.classList.contains('collapsed')) {
      openSection(automationSection, automationContent);
      closeSection(assistantSection, assistantContent);
    } else {
      // If already open, swap to the other one
      closeSection(automationSection, automationContent);
      openSection(assistantSection, assistantContent);
    }
  });

  // Initial State: Expand Assistant by default unless automation is active
  const state = await chrome.storage.local.get(['isActive']);
  if (state.isActive) {
    openSection(automationSection, automationContent);
    closeSection(assistantSection, assistantContent);
  } else {
    openSection(assistantSection, assistantContent);
    closeSection(automationSection, automationContent);
  }
}

// ================= CHAT HELPER =================
async function initChatHelper() {
  const container = document.getElementById('chatUrlContainer');
  const { trainedChatUrl } = await chrome.storage.local.get('trainedChatUrl');

  if (!trainedChatUrl) {
    renderInsertState(container);
  } else {
    renderActiveState(container, trainedChatUrl);
  }
}

function renderInsertState(container) {
  container.innerHTML = `
    <button class="insert-chat-btn" id="insertChatBtn">
      Configure AI Chat URL
    </button>
  `;

  document.getElementById('insertChatBtn').addEventListener('click', () => {
    renderInputState(container, '');
  });
}

function renderInputState(container, existingUrl) {
  const isEditing = existingUrl !== '';
  container.innerHTML = `
    <div class="chat-url-input-wrapper">
      <input type="url" class="chat-input" id="chatUrlInput" placeholder="Paste trained AI chat URL..." value="${existingUrl}">
      <div class="chat-actions">
        <button class="save-btn" id="saveChatBtn">${isEditing ? 'Update' : 'Save'}</button>
        ${isEditing ? '<button class="remove-btn" id="removeChatBtn">Remove</button>' : ''}
        <button class="cancel-btn" id="cancelChatBtn">Cancel</button>
      </div>
    </div>
  `;

  const input = document.getElementById('chatUrlInput');
  input.focus();

  document.getElementById('saveChatBtn').addEventListener('click', async () => {
    const url = input.value.trim();
    const status = document.getElementById('status');
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    
    if (!urlRegex.test(url)) {
      status.textContent = 'Please enter a valid URL';
      status.className = 'error';
      return;
    }

    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    await chrome.storage.local.set({ trainedChatUrl: finalUrl });
    status.textContent = 'URL Saved!';
    status.className = 'success';
    initChatHelper();
    setTimeout(() => status.textContent = '', 2000);
  });

  if (isEditing) {
    document.getElementById('removeChatBtn').addEventListener('click', async () => {
      if (confirm('Remove Chat URL?')) {
        await chrome.storage.local.remove('trainedChatUrl');
        initChatHelper();
      }
    });
  }

  document.getElementById('cancelChatBtn').addEventListener('click', () => {
    initChatHelper();
  });
}

function renderActiveState(container, url) {
  container.innerHTML = `
    <div class="chat-url-display-wrapper">
      <button class="open-chat-btn" id="openChatBtn">
        Open Trained AI Chat
      </button>
      <button class="edit-chat-btn" id="editChatBtn" title="Edit URL">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
    </div>
  `;

  document.getElementById('openChatBtn').addEventListener('click', () => {
    window.open(url, '_blank');
  });

  document.getElementById('editChatBtn').addEventListener('click', () => {
    renderInputState(container, url);
  });
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initModals();
  initCopyButtons();
  initDateClear();
  initChatHelper();
  initDailyNotes();
  initAccordion();

  document.getElementById('startButton').addEventListener('click', startAutomation);
  document.getElementById('resetButton').addEventListener('click', resetProgress);

  // Check for existing progress
  chrome.storage.local.get(['automationData', 'currentIndex', 'isActive'], (state) => {
    if (state.automationData && state.automationData.length > 0) {
      const total = state.automationData.length;
      const done = state.currentIndex || 0;
      const left = total - done;
      updateStats(total, left, done);
    }
  });
});

// Animations
const style = document.createElement('style');
style.textContent = `
  .spinning { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
