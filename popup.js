document.addEventListener('DOMContentLoaded', function() {
    const currentUrlDiv = document.getElementById('currentUrl');
    const resultDiv = document.getElementById('result');
    const checkAgainBtn = document.getElementById('checkAgainBtn');
    
    // Get current tab URL and check it
    function checkCurrentPage() {
      resultDiv.textContent = 'Checking...';
      resultDiv.className = 'checking';
      
      chrome.runtime.sendMessage({action: 'getCurrentUrl'}, function(response) {
        const currentUrl = response.url;
        currentUrlDiv.textContent = currentUrl;
        
        chrome.runtime.sendMessage(
          {action: 'checkUrl', url: currentUrl},
          function(response) {
            if (response.error) {
              showResult(`Error: ${response.error}`, 'dangerous');
            } else {
              const predictionLabel = response.result.prediction_label;
              const predictionScore = response.result.prediction_score;
              
              if (predictionLabel === "1") {
                showResult(`Warning: This URL is likely phishing (${predictionScore}% confidence)`, 'dangerous');
              } else {
                showResult(`Safe: This URL appears legitimate (${100-predictionScore}% confidence)`, 'safe');
              }
            }
          }
        );
      });
    }
    
    function showResult(message, type) {
      resultDiv.textContent = message;
      resultDiv.className = type;
    }
    
    // Check the current page when popup opens
    checkCurrentPage();
    
    // Add event listener for "Check Again" button
    checkAgainBtn.addEventListener('click', checkCurrentPage);
  });
  