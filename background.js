chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-and-close-tab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const url = tab.url;
      const title = tab.title || url; // Use URL as fallback if title is empty
      // Load existing saved tabs, append new tab object, and save
      chrome.storage.sync.get(['savedTabs'], (result) => {
        const savedTabs = result.savedTabs || [];
        savedTabs.push({ url, title });
        chrome.storage.sync.set({ savedTabs }, () => {
          // Close the tab
          chrome.tabs.remove(tab.id);
        });
      });
    });
  }
});