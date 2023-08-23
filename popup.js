document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-button');
    const urlContainer = document.getElementById('url-container');

    saveButton.addEventListener('click', saveCurrentUrl);

    loadSavedUrls();

    function saveCurrentUrl() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentUrl = tabs[0].url;

            chrome.storage.sync.get({ savedUrls: [] }, function(result) {
                const savedUrls = result.savedUrls;
                savedUrls.push(currentUrl);

                chrome.storage.sync.set({ savedUrls: savedUrls }, function() {
                    urlContainer.innerHTML = '';
                    loadSavedUrls();
                });
            });
        });
    }

    function loadSavedUrls() {
        chrome.storage.sync.get({ savedUrls: [] }, function(result) {
            const savedUrls = result.savedUrls;

            savedUrls.forEach(function(url, index) {
                const listItem = document.createElement('li');
                listItem.classList.add('url-list-item');

                const urlLink = document.createElement('a');
                urlLink.href = url;
                urlLink.target = '_blank';
                urlLink.textContent = url;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    savedUrls.splice(index, 1);
                    chrome.storage.sync.set({ savedUrls: savedUrls }, function() {
                        urlContainer.innerHTML = '';
                        loadSavedUrls();
                    });
                });

                listItem.appendChild(urlLink);
                listItem.appendChild(deleteButton);

                urlContainer.appendChild(listItem);
            });
        });
    }
});