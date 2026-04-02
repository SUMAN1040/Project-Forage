// --- AI-Mate Chatbot Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const mateToggle = document.getElementById('ai-mate-toggle');
    const mateWindow = document.getElementById('ai-mate-window');
    const mateClose = document.getElementById('ai-mate-close');
    const mateInput = document.getElementById('ai-mate-input');
    const mateSend = document.getElementById('ai-mate-send');
    const mateMessages = document.getElementById('ai-mate-messages');

    if (!mateToggle || !mateWindow) return;

    const toggleChat = () => {
        console.log('AI-Mate toggle clicked');
        const isHidden = mateWindow.style.display === 'none' || mateWindow.style.display === '';
        mateWindow.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
            mateInput.focus();
            mateMessages.scrollTop = mateMessages.scrollHeight;
        }
    };

    mateToggle.addEventListener('click', toggleChat);
    if (mateClose) mateClose.addEventListener('click', toggleChat);

    const addMessage = (text, sender = 'bot') => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        
        let content = text;
        if (sender === 'bot') {
            // Use marked.js for professional rendering if available
            content = (typeof marked !== 'undefined') ? marked.parse(text) : text;
        } else {
            // Escape user input for safety
            const div = document.createElement('div');
            div.textContent = text;
            content = div.innerHTML;
        }

        msgDiv.innerHTML = `<div class="message-bubble">${content}</div>`;
        mateMessages.appendChild(msgDiv);
        mateMessages.scrollTop = mateMessages.scrollHeight;
    };

    const addTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'chat-message bot typing-indicator-container';
        indicator.id = 'mate-typing';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `;
        mateMessages.appendChild(indicator);
        mateMessages.scrollTop = mateMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('mate-typing');
        if (indicator) indicator.remove();
    };

    const handleChatSubmit = async () => {
        const message = mateInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        mateInput.value = '';
        mateInput.style.height = 'auto'; 
        addTypingIndicator();

        try {
            const response = await fetch('/chat/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            removeTypingIndicator();

            if (data.success) {
                addMessage(data.response, 'bot');
            } else {
                addMessage(`Error: ${data.error || 'Failed to get response'}`, 'bot');
            }
        } catch (err) {
            removeTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting to the AI server.", 'bot');
        }
    };

    mateInput.addEventListener('input', () => {
        mateInput.style.height = 'auto';
        mateInput.style.height = (mateInput.scrollHeight) + 'px';
    });

    mateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit();
        }
    });

    mateSend.addEventListener('click', handleChatSubmit);

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
