document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-button');
    const urlContainer = document.getElementById('url-container');

    saveButton.addEventListener('click', saveCurrentUrl);

    loadSavedUrls();

    async function saveCurrentUrl() {
        chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;
            const currentTitle = currentTab.title;

            let description = '';
            if (currentUrl.includes('youtube.com')) {
                description = await extractDescriptionFromYouTube();
            } else {
                description = await extractRelevantInfo(currentUrl);
            }

            const timestamp = new Date().toISOString();
            const domainWithoutWWW = new URL(currentUrl).hostname.replace("www.", "");

            chrome.storage.sync.get({ savedUrls: [] }, function(result) {
                const savedUrls = result.savedUrls;
                savedUrls.push({
                    url: currentUrl,
                    title: currentTitle,
                    description: description,
                    timestamp: timestamp,
                    thumbnail: `https://www.google.com/s2/favicons?domain=${domainWithoutWWW}`,
                    notes: '',
                });

                chrome.storage.sync.set({ savedUrls: savedUrls }, function() {
                    urlContainer.innerHTML = '';
                    loadSavedUrls();
                });
            });
        });
    }

    async function extractRelevantInfo(url) {
        const pageContent = await fetchPageContent(url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(pageContent, "text/html");

        const metaDescription = doc.querySelector("meta[name='description']");
        const description = metaDescription ? metaDescription.getAttribute("content") : '';

        return description;
    }

    async function extractDescriptionFromYouTube() {
        return new Promise((resolve, reject) => {
            chrome.tabs.executeScript({ code: 'document.querySelector("meta[name=\'description\']").getAttribute("content")' }, (results) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(results[0]);
                }
            });
        });
    }

    function loadSavedUrls() {
        chrome.storage.sync.get({ savedUrls: [] }, function(result) {
            const savedUrls = result.savedUrls;

            savedUrls.forEach(function(data, index) {
                const listItem = document.createElement('li');
                listItem.classList.add('url-list-item');

                const url = new URL(data.url);
                const urlObject = new URL(url);

                const domainWithoutWWW = urlObject.hostname.replace("www.", "");



                const urlLink = document.createElement('a');
                urlLink.href = data.url;
                urlLink.target = '_blank';
                urlLink.textContent = domainWithoutWWW;

                const noteIcon = document.createElement('span');
                noteIcon.className = 'note-icon';
                noteIcon.addEventListener('click', function() {
                    toggleNoteSection(index);
                });

                const noteSection = document.createElement('div');
                noteSection.className = 'note-section';
                noteSection.style.display = 'none';

                const iconImg = document.createElement('img');
                iconImg.src = 'Images/icons8-write-48.png';
                iconImg.alt = 'Notes Icon';
                iconImg.style.width = '28px';
                iconImg.style.height = '28px';


                noteIcon.appendChild(iconImg);

                const noteTextarea = document.createElement('textarea');
                noteTextarea.rows = '4';
                noteTextarea.cols = '20';
                noteTextarea.value = data.note;
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

                const descriptionPara = document.createElement('p');
                descriptionPara.textContent = data.description;

                const timestampSpan = document.createElement('span');
                timestampSpan.className = 'timestamp';
                timestampSpan.textContent = new Date(data.timestamp).toLocaleString();

                const thumbnailImg = document.createElement('img');
                thumbnailImg.src = data.thumbnail;
                thumbnailImg.alt = 'Thumbnail';

                listItem.appendChild(urlLink);
                listItem.appendChild(descriptionPara);
                listItem.appendChild(timestampSpan);
                listItem.appendChild(thumbnailImg);
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
    async function fetchPageContent(url) {
        const response = await fetch(url);
        const text = await response.text();
        return text;
    }

    async function extractRelevantInfo(url) {
        const pageContent = await fetchPageContent(url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(pageContent, "text/html");

        const pageTitle = doc.querySelector("title").textContent;

        return pageTitle;
    }
});