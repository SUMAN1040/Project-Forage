document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let activeTab = 'create';
    let inputType = 'text';
    let selectedFile = null;
    let createTimer = null;
    let retrieveTimer = null;
    let historyInterval = null;

    // --- DOM Elements ---
    const tabCreate = document.getElementById('tab-create');
    const tabRetrieve = document.getElementById('tab-retrieve');
    const tabHistory = document.getElementById('tab-history');
    const sectionCreate = document.getElementById('section-create');
    const sectionRetrieve = document.getElementById('section-retrieve');
    const sectionHistory = document.getElementById('section-history');

    const typeText = document.getElementById('type-text');
    const typeFile = document.getElementById('type-file');
    const inputTextContainer = document.getElementById('input-text-container');
    const inputFileContainer = document.getElementById('input-file-container');

    const textValue = document.getElementById('text-value');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const fileName = document.getElementById('file-name');
    const dropIcon = document.getElementById('drop-icon');

    const btnGenerate = document.getElementById('btn-generate');
    const createError = document.getElementById('create-error');
    const createResult = document.getElementById('create-result');
    const resultLink = document.getElementById('result-link');
    const resultCode = document.getElementById('result-code');
    const createCountdown = document.getElementById('create-countdown');

    const retrieveCodeInput = document.getElementById('retrieve-code');
    const btnRetrieve = document.getElementById('btn-retrieve');
    const retrieveError = document.getElementById('retrieve-error');
    const retrieveResult = document.getElementById('retrieve-result');
    const retrieveCountdown = document.getElementById('retrieve-countdown');
    const retrieveContentText = document.getElementById('retrieve-content-text');
    const retrieveContentFile = document.getElementById('retrieve-content-file');
    const displayText = document.getElementById('display-text');
    const displayFileName = document.getElementById('display-file-name');
    const displayFileSize = document.getElementById('display-file-size');
    const historyList = document.getElementById('history-list');

    // --- Tab Switching with Animation ---
    const switchTab = (tab) => {
        if (activeTab === tab) return;
        
        const prevTab = activeTab;
        activeTab = tab;
        
        // Update Buttons
        tabCreate.className = `tab-button ${tab === 'create' ? 'active' : 'inactive'}`;
        tabRetrieve.className = `tab-button ${tab === 'retrieve' ? 'active' : 'inactive'}`;
        tabHistory.className = `tab-button ${tab === 'history' ? 'active' : 'inactive'}`;

        // Sections Mapping
        const sections = {
            'create': sectionCreate,
            'retrieve': sectionRetrieve,
            'history': sectionHistory
        };

        const currentSection = sections[prevTab];
        const nextSection = sections[tab];

        currentSection.style.opacity = '0';
        currentSection.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            currentSection.style.display = 'none';
            nextSection.style.display = 'flex';
            nextSection.style.opacity = '0';
            nextSection.style.transform = 'translateY(10px)';
            
            nextSection.offsetHeight; // trigger reflow
            
            nextSection.style.opacity = '1';
            nextSection.style.transform = 'translateY(0)';
        }, 200);

        // History interval management
        if (historyInterval) clearInterval(historyInterval);
        if (tab === 'history') {
            renderHistory();
            historyInterval = setInterval(updateHistoryTimers, 1000);
        }
    };

    tabCreate.addEventListener('click', () => switchTab('create'));
    tabRetrieve.addEventListener('click', () => switchTab('retrieve'));
    tabHistory.addEventListener('click', () => switchTab('history'));

    // --- History Logic ---
    const saveToHistory = (clip) => {
        const history = JSON.parse(localStorage.getItem('forage_history') || '[]');
        const newHistory = [clip, ...history].filter(item => item.expiresAt > Date.now());
        localStorage.setItem('forage_history', JSON.stringify(newHistory.slice(0, 10)));
    };

    const deleteFromHistory = (id) => {
        const history = JSON.parse(localStorage.getItem('forage_history') || '[]');
        const newHistory = history.filter(item => item.id !== id);
        localStorage.setItem('forage_history', JSON.stringify(newHistory));
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

    const renderHistory = () => {
        const history = JSON.parse(localStorage.getItem('forage_history') || '[]');
        const now = Date.now();
        const activeHistory = history.filter(item => item.expiresAt > now);
        
        if (activeHistory.length !== history.length) {
            localStorage.setItem('forage_history', JSON.stringify(activeHistory));
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
                <div class="history-actions" style="display: flex; gap: 12px;">
                    <button class="btn-icon btn-copy" title="Copy Link">🔗</button>
                    <button class="btn-icon btn-delete" title="Delete" style="background: rgba(0, 0, 0, 0.03); border: 1px solid var(--border); padding: 10px;">
                        <img src="/static/media/trash.png" style="width: 20px; height: 20px; display: block; opacity: 0.8;">
                    </button>
                </div>
            `;
            
            const copyBtn = itemDiv.querySelector('.btn-copy');
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                copyToClipboard(`${window.location.origin}/clip/${item.id}/`, copyBtn);
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

    // --- Input Type Switching ---
    const switchInputType = (type) => {
        inputType = type;
        if (type === 'text') {
            typeText.classList.replace('inactive', 'active');
            typeFile.classList.replace('active', 'inactive');
            inputTextContainer.style.display = 'block';
            inputFileContainer.style.display = 'none';
        } else {
            typeText.classList.replace('active', 'inactive');
            typeFile.classList.replace('inactive', 'active');
            inputTextContainer.style.display = 'none';
            inputFileContainer.style.display = 'block';
        }
    };

    typeText.addEventListener('click', () => switchInputType('text'));
    typeFile.addEventListener('click', () => switchInputType('file'));

    // --- File Handling ---
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    const handleFileSelect = (file) => {
        selectedFile = file;
        fileName.textContent = file.name;
        dropIcon.textContent = '✅';
        createError.style.display = 'none';
    };

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, () => dropZone.classList.remove('active'));
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    // --- Helpers ---
    const formatTime = (ms) => {
        if (ms <= 0) return "0:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const startTimer = (endMs, element, timerRef) => {
        if (timerRef) clearInterval(timerRef);
        const update = () => {
            const remaining = endMs - Date.now();
            if (remaining <= 0) {
                element.textContent = "EXPIRED";
                clearInterval(timerRef);
                return;
            }
            element.textContent = formatTime(remaining);
        };
        update();
        return setInterval(update, 1000);
    };

    const copyToClipboard = (text, btn) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.textContent;
            btn.textContent = '✅';
            if (btn.classList.contains('btn-secondary')) btn.textContent = '✅ Copied!';
            
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    };

    // --- API Calls ---
    btnGenerate.addEventListener('click', async () => {
        btnGenerate.disabled = true;
        btnGenerate.textContent = '🔄 Processing...';
        createError.style.display = 'none';
        createResult.style.display = 'none';

        const formData = new FormData();
        formData.append('type', inputType);
        if (inputType === 'text') {
            if (!textValue.value.trim()) {
                createError.textContent = 'Please enter some text';
                createError.style.display = 'block';
                btnGenerate.disabled = false;
                btnGenerate.textContent = '🚀 Generate Link';
                return;
            }
            formData.append('content', textValue.value);
        } else {
            if (!selectedFile) {
                createError.textContent = 'Please select a file';
                createError.style.display = 'block';
                btnGenerate.disabled = false;
                btnGenerate.textContent = '🚀 Generate Link';
                return;
            }
            formData.append('file', selectedFile);
        }

        try {
            const response = await fetch('/api/clip/', {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            resultLink.value = `${window.location.origin}/clip/${data.id}/`;
            resultCode.value = data.code;
            createResult.style.display = 'flex';
            createTimer = startTimer(data.expiresAt, createCountdown, createTimer);
            
            saveToHistory({ id: data.id, code: data.code, expiresAt: data.expiresAt });
            
            textValue.value = '';
            selectedFile = null;
            fileName.textContent = 'Click to upload or drag & drop';
            dropIcon.textContent = '📁';
        } catch (err) {
            createError.textContent = err.message;
            createError.style.display = 'block';
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.textContent = '🚀 Generate Secure Link';
        }
    });

    btnRetrieve.addEventListener('click', async () => {
        const code = retrieveCodeInput.value.trim();
        if (!code) return;

        btnRetrieve.disabled = true;
        btnRetrieve.textContent = '🔄 Fetching...';
        retrieveError.style.display = 'none';
        retrieveResult.style.display = 'none';

        try {
            const response = await fetch('/api/retrieve/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ code })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Invalid or expired code');

            retrieveResult.style.display = 'flex';
            retrieveTimer = startTimer(Date.now() + data.remainingMs, retrieveCountdown, retrieveTimer);

            if (data.clip.type === 'text') {
                retrieveContentText.style.display = 'block';
                retrieveContentFile.style.display = 'none';
                displayText.value = data.clip.content;
            } else {
                retrieveContentText.style.display = 'none';
                retrieveContentFile.style.display = 'block';
                displayFileName.textContent = data.clip.fileName;
                displayFileSize.textContent = `${(data.clip.fileSize / 1024).toFixed(1)} KB`;
                window.lastRetrieveData = data.clip;
            }
        } catch (err) {
            retrieveError.textContent = err.message;
            retrieveError.style.display = 'block';
        } finally {
            btnRetrieve.disabled = false;
            btnRetrieve.textContent = '🔍 Retrieve Content';
        }
    });

    // --- Button Bindings ---
    document.getElementById('btn-copy-link').addEventListener('click', function() { copyToClipboard(resultLink.value, this); });
    document.getElementById('btn-copy-code').addEventListener('click', function() { copyToClipboard(resultCode.value, this); });
    document.getElementById('btn-copy-content').addEventListener('click', function() { copyToClipboard(displayText.value, this); });
    
    document.getElementById('btn-download').addEventListener('click', () => {
        if (!window.lastRetrieveData) return;
        const { content, fileName, fileType } = window.lastRetrieveData;
        const link = document.createElement('a');
        link.href = `data:${fileType};base64,${content}`;
        link.download = fileName;
        link.click();
    });

    // Initial State Check
    renderHistory();

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
