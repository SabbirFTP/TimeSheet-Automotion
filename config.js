// Default configurations
const DEFAULT_CONFIG = {
  employeeName: "Mr Monjel Morshed Sabbir",
  employeeId: "202503",
  defaultRating: "10",
  sendCopy: true,
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf_d1RBXPkxtoCzCfGWKnnbnlAk2ILn2Mgis7eYn3Kh6XBlzQ/viewform?pli=1&pli=1",
  trainedChatUrl: ""
};

// Config Manager
const ConfigManager = {
  async get(key) {
    const data = await chrome.storage.local.get(key);
    return data[key] !== undefined ? data[key] : DEFAULT_CONFIG[key];
  },

  async getAll() {
    const data = await chrome.storage.local.get(Object.keys(DEFAULT_CONFIG));
    return { ...DEFAULT_CONFIG, ...data };
  },

  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },

  async setAll(configObj) {
    await chrome.storage.local.set(configObj);
  }
};
