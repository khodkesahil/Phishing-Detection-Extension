document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'checkUrl') {
            const url = request.url;
            // Here you would typically call the URL validation function
            // For demonstration, let's assume we have a simple check
            const isSecure = validateUrl(url); // This function should be defined in urlValidator.js

            if (!isSecure) {
                const warningMessage = document.createElement('div');
                warningMessage.textContent = 'Warning: This URL may not be secure!';
                warningMessage.style.color = 'red';
                document.body.appendChild(warningMessage);
            }
        }
    });
});