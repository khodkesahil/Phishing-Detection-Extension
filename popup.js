document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const checkButton = document.getElementById('checkButton');
    const result = document.getElementById('result');

    // Backend API URL - update this to match your Flask server address
    const API_URL = 'https://phishing-detection-extension-3ouc.onrender.com/check-url';
    const TIMEOUT_MS = 60000; // 60 seconds timeout for API calls

    checkButton.addEventListener('click', checkURL);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkURL();
        }
    });

    // Function to validate URL format
    function isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Function to add http:// prefix if missing
    function formatURL(url) {
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            return 'http://' + url;
        }
        return url;
    }

    async function checkURL() {
        let url = urlInput.value.trim();
        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Format URL if needed
        url = formatURL(url);
        
        // Validate URL format
        if (!isValidURL(url)) {
            result.style.display = 'block';
            result.className = 'unsafe';
            result.textContent = 'Invalid URL format. Please enter a valid URL.';
            return;
        }

        // Show loading state
        checkButton.disabled = true;
        checkButton.textContent = 'Checking...';
        result.style.display = 'none';

        try {
            // Create a promise that rejects after timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS);
            });

            // Display checking indicator in the result area
            result.style.display = 'block';
            result.className = 'checking';
            result.textContent = 'Checking URL safety...';

            // Race between the fetch and the timeout
            const response = await Promise.race([
                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: url }),
                    // Remove these potentially problematic options
                    // mode: 'cors',
                    // credentials: 'same-origin'
                }),
                timeoutPromise
            ]);

            console.log('Server response status:', response.status);
            const responseText = await response.text();
            console.log('Server response body:', responseText);

            if (!response.ok) {
                throw new Error(`Server error (${response.status}): ${responseText || 'No details provided'}`);
            }

            let data;
            try {
                // Parse the response text instead of using response.json()
                data = JSON.parse(responseText);
                console.log('Parsed data:', data);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Invalid JSON response from server');
            }
            
            if (!data || typeof data.is_phishing === 'undefined') {
                throw new Error('Unexpected response format from server');
            }
            
            // Display result
            result.style.display = 'block';
            if (data.is_phishing) {
                result.className = 'unsafe';
                result.innerHTML = '<strong>⚠️ Warning:</strong> This URL has been detected as a potential phishing site! Be careful.';
            } else {
                result.className = 'safe';
                result.innerHTML = '<strong>✅ Safe:</strong> This URL appears to be legitimate.';
            }
        } catch (error) {
            console.error('Error:', error);
            result.style.display = 'block';
            result.className = 'error';
            
            // Provide more specific error messages based on error type
            if (error.message === 'Request timed out') {
                result.innerHTML = '<strong>⚠️ Timeout:</strong> The server took too long to respond. Please try again later.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                result.innerHTML = '<strong>⚠️ Network Error:</strong> Could not connect to the API server. Please check your internet connection and make sure the API server is running.';
            } else if (error.message.includes('Server error')) {
                result.innerHTML = `<strong>⚠️ Server Error:</strong> ${error.message}`;
            } else if (error.message.includes('JSON')) {
                result.innerHTML = '<strong>⚠️ Data Error:</strong> Received invalid data from server. Please contact support.';
            } else {
                result.innerHTML = '<strong>⚠️ Error:</strong> Could not check URL safety. Please make sure the API server is running and try again.';
            }
            
            // Add a retry button
            const retryButton = document.createElement('button');
            retryButton.textContent = 'Try Again';
            retryButton.className = 'retry-button';
            retryButton.addEventListener('click', checkURL);
            result.appendChild(document.createElement('br'));
            result.appendChild(retryButton);
        } finally {
            // Reset button state
            checkButton.disabled = false;
            checkButton.textContent = 'Check URL';
        }
    }

    // Optional: Auto-fill with current tab URL
    try {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs && tabs[0] && tabs[0].url) {
                // Don't auto-fill with chrome:// URLs as they can't be processed by the API
                if (!tabs[0].url.startsWith('chrome://')) {
                    urlInput.value = tabs[0].url;
                }
            }
        });
    } catch (e) {
        console.error('Error accessing tabs:', e);
        // Continue silently if we can't access tabs
    }
});

// Add CSS for the checking state and retry button
const style = document.createElement('style');
style.textContent = `
.checking {
    background-color: #e3f2fd;
    color: #0d47a1;
    border: 1px solid #90caf9;
    padding: 10px;
}

.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef5350;
    padding: 10px;
}

.retry-button {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #4285F4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.retry-button:hover {
    background-color: #3367D6;
}
`;
document.head.appendChild(style);
