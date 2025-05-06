document.addEventListener('DOMContentLoaded', () => {
  // Load saved tabs from storage
  function loadTabs() {
    chrome.storage.sync.get(['savedTabs'], (result) => {
      const savedTabs = result.savedTabs || [];
      const tabList = document.getElementById('saved-tabs');
      tabList.innerHTML = ''; // Clear existing list
      // Reverse the array to show most recent tabs first
      savedTabs.slice().

      reverse().forEach((tab, index) => {
        const li = document.createElement('li');
        const titleDiv = document.createElement('div');
        titleDiv.textContent = tab.title || tab.url; // Fallback to URL if no title
        titleDiv.className = 'tab-title';
        
        const linkContainer = document.createElement('div');
        linkContainer.className = 'link-container';
        
        const a = document.createElement('a');
        a.href = tab.url;
        a.textContent = tab.url;
        a.className = 'tab-link';
        
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.className = 'clear-button';
        clearButton.dataset.index = index; // Store index for removal
        
        linkContainer.appendChild(a);
        linkContainer.appendChild(clearButton);
        li.appendChild(titleDiv);
        li.appendChild(linkContainer);
        tabList.appendChild(li);
      });

      // Re-attach link event listeners
      attachLinkListeners();
    });
  }

  // Attach click listeners to tab links
  function attachLinkListeners() {
    const links = document.querySelectorAll('.tab-link');
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        const url = link.getAttribute('href');
        if (url && /^https?:\/\//.test(url)) {
          chrome.tabs.create({ url, active: false }, () => {
            console.log(`Opened ${url} in a new background tab`);
          });
        } else {
          console.error('Invalid URL:', url);
        }
      });
    });
  }

  // Handle add URL button click
  const addUrlButton = document.getElementById('add-url');
  addUrlButton.addEventListener('click', () => {
    const urlInput = document.getElementById('url-input');
    let url = urlInput.value.trim();
    
    // Ensure URL has a protocol
    if (url && !/^https?:\/\//.test(url)) {
      url = 'https://' + url;
    }

    // Validate URL
    if (url && /^https?:\/\/.+$/.test(url)) {
      chrome.storage.sync.get(['savedTabs'], (result) => {
        const savedTabs = result.savedTabs || [];
        // Use URL as title since no page title is available
        savedTabs.push({ url, title: url });
        chrome.storage.sync.set({ savedTabs }, () => {
          urlInput.value = ''; // Clear input
          loadTabs(); // Refresh the list
        });
      });
    } else {
      alert('Please enter a valid URL');
    }
  });

  // Allow pressing Enter to add URL
  const urlInput = document.getElementById('url-input');
  urlInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addUrlButton.click();
    }
  });

  // Handle individual clear button clicks
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('clear-button')) {
      const index = parseInt(event.target.dataset.index, 10);
      chrome.storage.sync.get(['savedTabs'], (result) => {
        let savedTabs = result.savedTabs || [];
        // Adjust index for reversed display
        const actualIndex = savedTabs.length - 1 - index;
        if (actualIndex >= 0 && actualIndex < savedTabs.length) {
          savedTabs.splice(actualIndex, 1); // Remove the tab object at the adjusted index
          chrome.storage.sync.set({ savedTabs }, () => {
            loadTabs(); // Refresh the list
          });
        }
      });
    }
  });

  // Handle clear all button
  const clearAllButton = document.getElementById('clear-all');
  clearAllButton.addEventListener('click', () => {
    chrome.storage.sync.set({ savedTabs: [] }, () => {
      loadTabs(); // Refresh the list
    });
  });

  // Initial load of tabs
  loadTabs();
});