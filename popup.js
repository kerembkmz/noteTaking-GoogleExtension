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
                savedUrls.push({
                    url: currentUrl,
                    note: '' // Initialize an empty note
                });

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

            savedUrls.forEach(function(data, index) {
                const listItem = document.createElement('li');
                listItem.classList.add('url-list-item');

                const urlLink = document.createElement('a');
                urlLink.href = data.url;
                urlLink.target = '_blank';
                urlLink.textContent = data.url;

                const noteIcon = document.createElement('span');
                noteIcon.className = 'note-icon';
                noteIcon.textContent = 'Notes';
                noteIcon.addEventListener('click', function() {
                    toggleNoteSection(index);
                });

                const noteSection = document.createElement('div');
                noteSection.className = 'note-section';
                noteSection.style.display = 'none';

                const noteTextarea = document.createElement('textarea');
                noteTextarea.rows = '4';
                noteTextarea.cols = '20';
                noteTextarea.value = data.note; // Set the note content
                noteTextarea.addEventListener('input', function() {
                    savedUrls[index].note = noteTextarea.value;
                    chrome.storage.sync.set({ savedUrls: savedUrls });
                });

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
                listItem.appendChild(noteIcon);
                listItem.appendChild(noteSection);
                noteSection.appendChild(noteTextarea);
                listItem.appendChild(deleteButton);

                urlContainer.appendChild(listItem);
            });
        });
    }

    function toggleNoteSection(index) {
        const noteSections = document.querySelectorAll('.note-section');
        const noteSection = noteSections[index];
        noteSection.style.display = noteSection.style.display === 'none' ? 'block' : 'none';
    }
});