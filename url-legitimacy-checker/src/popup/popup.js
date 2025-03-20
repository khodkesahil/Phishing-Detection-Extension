document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('url-input');
    const checkButton = document.getElementById('check-button');
    const resultMessage = document.getElementById('result-message');

    checkButton.addEventListener('click', function() {
        const url = urlInput.value;
        if (url) {
            chrome.runtime.sendMessage({ url: url }, function(response) {
                if (response && response.isValid) {
                    resultMessage.textContent = 'The URL is secure.';
                    resultMessage.style.color = 'green';
                } else {
                    resultMessage.textContent = 'The URL is not secure.';
                    resultMessage.style.color = 'red';
                }
            });
        } else {
            resultMessage.textContent = 'Please enter a URL.';
            resultMessage.style.color = 'orange';
        }
    });
});