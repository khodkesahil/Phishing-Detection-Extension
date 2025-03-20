// Background script for Phishing URL Detector extension

// Default icons
const DEFAULT_ICON = {
  "48": "icon48.png",
  "128": "icon128.png"
};

// Warning icons (when a phishing URL is detected)
const WARNING_ICON = {
  "48": "warning_icon48.png",
  "128": "warning_icon128.png"
};

// Initialize extension state
let currentState = {
  isWarning: false,
  lastCheckedUrl: "",
  apiEndpoint: "http://localhost:5000/check_url" // Default API endpoint
};

// Listen for installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Phishing URL Detector extension installed");
  setDefaultIcon();
});

// Function to set the default icon
function setDefaultIcon() {
  chrome.action.setIcon({ path: DEFAULT_ICON });
  currentState.isWarning = false;
}

// Function to set the warning icon
function setWarningIcon() {
  chrome.action.setIcon({ path: WARNING_ICON });
  currentState.isWarning = true;
}

// Function to show a notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: currentState.isWarning ? WARNING_ICON["48"] : DEFAULT_ICON["48"],
    title: title,
    message: message
  });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkUrl") {
    checkUrl(message.url)
      .then(result => {
        sendResponse(result);
        
        // Update icon based on result
        if (result.is_phishing) {
          setWarningIcon();
          showNotification(
            "Phishing Alert", 
            `The URL ${message.url} may be unsafe!`
          );
        } else {
          setDefaultIcon();
        }
      })
      .catch(error => {
        console.error("Error checking URL:", error);
        sendResponse({ error: "Failed to check URL" });
      });
    
    // Return true to indicate we will respond asynchronously
    return true;
  }
  
  if (message.action === "resetIcon") {
    setDefaultIcon();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === "updateApiEndpoint") {
    currentState.apiEndpoint = message.endpoint;
    sendResponse({ success: true });
    return true;
  }
});

// Function to check URL with the API
async function checkUrl(url) {
  try {
    currentState.lastCheckedUrl = url;
    
    const response = await fetch(currentState.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url })
    });
    
    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error in checkUrl:", error);
    throw error;
  }
}

// Optional: Listen for tab updates to check URLs automatically
// Uncomment if you want the extension to automatically check URLs when navigating
/*
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Only check http/https URLs
    if (tab.url.startsWith('http')) {
      checkUrl(tab.url)
        .then(result => {
          if (result.is_phishing) {
            setWarningIcon();
            showNotification(
              "Phishing Alert", 
              `The URL ${tab.url} may be unsafe!`
            );
          } else {
            setDefaultIcon();
          }
        })
        .catch(error => {
          console.error("Error checking URL automatically:", error);
        });
    }
  }
});
*/

