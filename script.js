document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const loadingArea = document.getElementById('loading-area');
    const systemPrompt = '你是Pineapple Intelligent，你是PineApple开发的AI机器人，Pineapple的创始人叫屹涵';
    const encodedApiKey = 'c2stamRidHpURVV6NE4xemM0YTI2NWM0Y0M5M2E5YjQ2MmQ4YUQzNTMxZkJjN2Y2ZkFk';
    const apiUrl = 'https://free.v36.cm/v1/';
    const model = 'gpt-3.5-turbo';

    function addMessage(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isUser ? 'user-message' : 'ai-message');
        messageDiv.textContent = message;
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        messageInput.value = '';
        loadingArea.style.display = 'flex';

        try {
            const response = await fetch(apiUrl + 'chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${decodeApiKey()}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    stream: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                addMessage(`Error: ${errorData.error.message}`, false);
                loadingArea.style.display = 'none';
                return;
            }

            const reader = response.body.getReader();
            let aiMessage = '';
            let tempMessageDiv = document.createElement('div');
            tempMessageDiv.classList.add('message', 'ai-message');
            chatArea.appendChild(tempMessageDiv);

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    tempMessageDiv.textContent = aiMessage;
                    chatArea.scrollTop = chatArea.scrollHeight;
                    loadingArea.style.display = 'none';
                    break;
                }

                const text = new TextDecoder().decode(value);
                const lines = text.split('data: ').filter(line => line.trim() !== '');

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                            aiMessage += json.choices[0].delta.content;
                            tempMessageDiv.textContent = aiMessage;
                            chatArea.scrollTop = chatArea.scrollHeight;
                        }
                    } catch (e) {
                        console.error("Error parsing JSON:", e, line);
                    }
                }
            }
        } catch (error) {
            addMessage(`Error: ${error.message}`, false);
            loadingArea.style.display = 'none';
        }
    }

    function decodeApiKey() {
        try {
            return atob(encodedApiKey);
        } catch (e) {
            console.error("Error decoding API key:", e);
            return "";
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
}); 