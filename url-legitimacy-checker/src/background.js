// This file contains the background script for the Chrome extension. It listens for URL changes and communicates with the content script to validate the URL.

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.runtime.sendMessage({ url: tab.url });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'validateUrl') {
        // Here you would call the URL validation logic
        // For example, you could import a function from urlValidator.js
        import('./utils/urlValidator.js').then(module => {
            const isValid = module.default(request.url);
            sendResponse({ isValid: isValid });
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});