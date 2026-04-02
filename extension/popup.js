const API_BASE = 'http://127.0.0.1:8000'; // Match runserver default

document.addEventListener('DOMContentLoaded', () => {
    const tabCreate = document.getElementById('tab-create');
    const tabRetrieve = document.getElementById('tab-retrieve');
    const tabHistory = document.getElementById('tab-history');
    const sectionCreate = document.getElementById('section-create');
    const sectionRetrieve = document.getElementById('section-retrieve');
    const sectionHistory = document.getElementById('section-history');
    
    const textValue = document.getElementById('text-value');
    const btnGenerate = document.getElementById('btn-generate');
    const createResult = document.getElementById('create-result');
    const resultLink = document.getElementById('result-link');
    const resultCode = document.getElementById('result-code');
    const createCountdown = document.getElementById('create-countdown');
    
    const retrieveCodeInput = document.getElementById('retrieve-code');
    const btnRetrieve = document.getElementById('btn-retrieve');
    const retrieveResult = document.getElementById('retrieve-result');
    const retrieveContentText = document.getElementById('retrieve-content-text');
    const retrieveContentFile = document.getElementById('retrieve-content-file');
    const displayText = document.getElementById('display-text');
    const displayFileName = document.getElementById('display-file-name');
    const displayFileSize = document.getElementById('display-file-size');
    const btnDownload = document.getElementById('btn-download');
    
    const historyList = document.getElementById('history-list');
    const statusError = document.getElementById('status-error');
    const linkWebsite = document.getElementById('link-website');

    let createTimer = null;
    let historyInterval = null;

    // Redirection
    linkWebsite.addEventListener('click', () => {
        chrome.tabs.create({ url: API_BASE });
    });

    // Helpers
    const formatTime = (ms) => {
        if (ms <= 0) return "0:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const startTimer = (endMs, element) => {
        if (createTimer) clearInterval(createTimer);
        const update = () => {
            const remaining = endMs - Date.now();
            if (remaining <= 0) {
                element.textContent = "EXPIRED";
                clearInterval(createTimer);
                return;
            }
            element.textContent = formatTime(remaining);
        };
        update();
        createTimer = setInterval(update, 1000);
    };

    const copyToClipboard = (text, btn) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.value || btn.textContent;
            if (btn.tagName === 'INPUT') {
                btn.value = '✅';
                setTimeout(() => btn.value = originalText, 2000);
            } else {
                const oldHTML = btn.innerHTML;
                btn.textContent = '✅';
                setTimeout(() => btn.innerHTML = oldHTML, 1000);
            }
        });
    };

    // History Logic
    const saveToHistory = async (clip) => {
        const { history = [] } = await chrome.storage.local.get('history');
        const newHistory = [clip, ...history].filter(item => item.expiresAt > Date.now());
        await chrome.storage.local.set({ history: newHistory.slice(0, 10) });
    };

    const deleteFromHistory = async (id) => {
        const { history = [] } = await chrome.storage.local.get('history');
        const newHistory = history.filter(item => item.id !== id);
        await chrome.storage.local.set({ history: newHistory });
        renderHistory();
    };

    const updateHistoryTimers = () => {
        const now = Date.now();
        const timers = document.querySelectorAll('.history-timer');
        let needsFullRefresh = false;

        timers.forEach(timer => {
            const expiresAt = parseInt(timer.dataset.expires);
            const remaining = expiresAt - now;
            if (remaining <= 0) {
                needsFullRefresh = true;
            } else {
                timer.textContent = formatTime(remaining);
            }
        });

        if (needsFullRefresh) renderHistory();
    };

    const renderHistory = async () => {
        const { history = [] } = await chrome.storage.local.get('history');
        const now = Date.now();
        const activeHistory = history.filter(item => item.expiresAt > now);
        
        if (activeHistory.length !== history.length) {
            await chrome.storage.local.set({ history: activeHistory });
        }

        if (activeHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-msg">No active links in history.</p>';
            return;
        }

        historyList.innerHTML = '';
        activeHistory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            itemDiv.innerHTML = `
                <div class="history-info">
                    <span class="history-code">${item.code}</span>
                    <span class="history-timer" data-expires="${item.expiresAt}">${formatTime(item.expiresAt - now)}</span>
                </div>
                <div class="history-actions" style="display: flex; gap: 6px;">
                    <button class="tab-button-small btn-copy" title="Copy Link">🔗</button>
                    <button class="tab-button-small btn-delete" title="Delete" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px;">
                        <img src="icons/trash.png" style="width: 14px; height: 14px; display: block; filter: brightness(1.2);">
                    </button>
                </div>
            `;
            
            const copyBtn = itemDiv.querySelector('.btn-copy');
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                copyToClipboard(`${API_BASE}/clip/${item.id}/`, copyBtn);
            };

            const delBtn = itemDiv.querySelector('.btn-delete');
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteFromHistory(item.id);
            };

            itemDiv.onclick = () => {
                copyToClipboard(item.code, itemDiv.querySelector('.history-code'));
            };

            historyList.appendChild(itemDiv);
        });
    };

    // Tab Switching
    const switchTab = (tab) => {
        const isCreate = tab === 'create';
        const isRetrieve = tab === 'retrieve';
        const isHistory = tab === 'history';

        tabCreate.className = `tab-button ${isCreate ? 'active' : 'inactive'}`;
        tabRetrieve.className = `tab-button ${isRetrieve ? 'active' : 'inactive'}`;
        tabHistory.className = `tab-button ${isHistory ? 'active' : 'inactive'}`;
        
        sectionCreate.style.display = isCreate ? 'flex' : 'none';
        sectionRetrieve.style.display = isRetrieve ? 'flex' : 'none';
        sectionHistory.style.display = isHistory ? 'flex' : 'none';
        
        statusError.style.display = 'none';

        if (historyInterval) clearInterval(historyInterval);

        if (isHistory) {
            renderHistory();
            historyInterval = setInterval(updateHistoryTimers, 1000);
        }
    };

    tabCreate.addEventListener('click', () => switchTab('create'));
    tabRetrieve.addEventListener('click', () => switchTab('retrieve'));
    tabHistory.addEventListener('click', () => switchTab('history'));

    // Create Clip
    btnGenerate.addEventListener('click', async () => {
        const content = textValue.value.trim();
        if (!content) return;

        btnGenerate.disabled = true;
        btnGenerate.textContent = '...';
        statusError.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('type', 'text');
            formData.append('content', content);

            const response = await fetch(`${API_BASE}/api/clip/`, {
                method: 'POST',
                body: formData,
                mode: 'cors'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');

            resultLink.value = `${API_BASE}/clip/${data.id}/`;
            resultCode.value = data.code;
            createResult.style.display = 'flex';
            textValue.value = '';
            
            startTimer(data.expiresAt, createCountdown);
            await saveToHistory({ id: data.id, code: data.code, expiresAt: data.expiresAt });

        } catch (err) {
            statusError.textContent = `Error: ${err.message}`;
            statusError.style.display = 'block';
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.textContent = '🚀 Generate Link';
        }
    });

    // Retrieve Clip
    btnRetrieve.addEventListener('click', async () => {
        const code = retrieveCodeInput.value.trim();
        if (!code) return;

        btnRetrieve.disabled = true;
        btnRetrieve.textContent = '...';
        statusError.style.display = 'none';

        try {
            const response = await fetch(`${API_BASE}/api/retrieve/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
                mode: 'cors'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Invalid or expired code');

            retrieveResult.style.display = 'flex';
            
            if (data.clip.type === 'text') {
                retrieveContentText.style.display = 'block';
                retrieveContentFile.style.display = 'none';
                displayText.value = data.clip.content;
            } else {
                retrieveContentText.style.display = 'none';
                retrieveContentFile.style.display = 'flex';
                displayFileName.textContent = data.clip.fileName;
                displayFileSize.textContent = `${(data.clip.fileSize / 1024).toFixed(1)} KB`;
                window.lastRetrieveData = data.clip;
            }
        } catch (err) {
            statusError.textContent = `Error: ${err.message}`;
            statusError.style.display = 'block';
        } finally {
            btnRetrieve.disabled = false;
            btnRetrieve.textContent = '🔍 Retrieve Content';
        }
    });

    // Download Logic
    btnDownload.addEventListener('click', () => {
        if (!window.lastRetrieveData) return;
        const { content, fileName, fileType } = window.lastRetrieveData;
        const link = document.createElement('a');
        link.href = `data:${fileType};base64,${content}`;
        link.download = fileName;
        link.click();
    });

    // Copying
    resultLink.addEventListener('click', () => copyToClipboard(resultLink.value, resultLink));
    resultCode.addEventListener('click', () => copyToClipboard(resultCode.value, resultCode));

    window.onunload = () => {
        if (createTimer) clearInterval(createTimer);
        if (historyInterval) clearInterval(historyInterval);
    };
});
