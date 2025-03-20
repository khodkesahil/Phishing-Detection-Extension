// Function to check URL with the API
function checkUrlWithApi(url, callback) {
  fetch('https://phishing-detection-extension-3ouc.onrender.com/check-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    callback(data);
  })
  .catch(error => {
    callback({ error: error.message });
  });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check when the page is fully loaded and has a valid URL
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    checkUrlWithApi(tab.url, (result) => {
      if (!result.error && result.result) {
        const predictionLabel = result.result.prediction_label;
        const predictionScore = result.result.prediction_score;
        
        // Update the extension badge based on the result
        if (predictionLabel === "1") {
          // Phishing detected
          chrome.action.setBadgeText({ text: "⚠️", tabId: tabId });
          chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: tabId });
          
          // Notify the content script to show a warning
          chrome.tabs.sendMessage(tabId, {
            action: "showWarning",
            score: predictionScore
          });
        } else {
          // Safe site
          chrome.action.setBadgeText({ text: "✓", tabId: tabId });
          chrome.action.setBadgeBackgroundColor({ color: "#00FF00", tabId: tabId });
        }
        
        // Store the result for the popup
        chrome.storage.local.set({ [tab.url]: result });
      }
    });
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkUrl') {
    checkUrlWithApi(request.url, sendResponse);
    return true; // Required to use sendResponse asynchronously
  }
  
  if (request.action === 'getCurrentUrl') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      sendResponse({url: tabs[0].url});
    });
    return true;
  }
});
