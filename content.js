// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "showWarning") {
      // Create warning banner
      const banner = document.createElement('div');
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #f44336;
        color: white;
        text-align: center;
        padding: 10px;
        font-size: 16px;
        z-index: 10000;
        font-family: Arial, sans-serif;
      `;
      
      banner.innerHTML = `
        <strong>⚠️ Warning: This website may be a phishing attempt! ⚠️</strong>
        <p>Our security check indicates this site is suspicious (${request.score}% confidence).</p>
        <button id="phishing-proceed" style="margin: 5px; padding: 5px 10px;">Proceed Anyway</button>
        <button id="phishing-leave" style="margin: 5px; padding: 5px 10px;">Leave Site</button>
      `;
      
      document.body.prepend(banner);
      
      // Add event listeners to buttons
      document.getElementById('phishing-proceed').addEventListener('click', function() {
        banner.remove();
      });
      
      document.getElementById('phishing-leave').addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
      });
      
      sendResponse({status: "Warning shown"});
    }
    
    return true;
  });
  