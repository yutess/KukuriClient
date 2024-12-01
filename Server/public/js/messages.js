let isSending = false;

async function loadDirectMessages(userId) {
    try {
        console.log('Loading DMs for user ID:', userId);
        
        const response = await fetch(`/api/messages/dm/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const messages = await response.json();
        console.log('DM Messages loaded:', messages.length);
        
        if (messages.length === 0) {
            const container = document.getElementById('messageContainer');
            container.innerHTML = '<div class="text-gray-500 text-center p-4">No messages found.</div>';
        } else {
            displayMessages(messages);
        }
    } catch (error) {
        console.error('Error loading DMs:', error);
        showNotification('Failed to load messages', 'error');
    }
}


function displayMessages(messages) {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    container.innerHTML = '';
    
    // Sort new to old
    messages.sort((a, b) => b.timestamp - a.timestamp);
    
    messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = 'message p-4 border-b border-gray-200';
        
        const time = new Date(message.timestamp).toLocaleTimeString();
        
        messageEl.innerHTML = `
            <div class="flex gap-3">
                <img src="${message.author.avatar}" 
                     class="w-10 h-10 rounded-full" 
                     alt="${message.author.username}"
                     onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                <div class="flex-1">
                    <div class="flex items-baseline gap-2">
                        <span class="font-semibold">${message.author.username}</span>
                        <span class="text-xs text-gray-500">${time}</span>
                    </div>
                    <div class="mt-1">${formatMessageContent(message.content)}</div>
                </div>
            </div>
        `;
        
        container.appendChild(messageEl);
    });
}

// Load messages for a channel
async function loadMessages(channelId) {
    if (!channelId) return;
    
    try {
        const response = await fetch(`/api/messages/${channelId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const messages = await response.json();
        const container = document.getElementById('messageContainer');
        
        container.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            
            const timestamp = new Date(message.timestamp);
            const timeString = formatMessageTime(timestamp);

            messageElement.innerHTML = `
                <div class="flex gap-3">
                    <img src="${message.author.avatar}" 
                         class="w-10 h-10 rounded-full" 
                         alt="${message.author.username}"
                         onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                    <div class="flex-1">
                        <div class="flex items-baseline gap-2">
                            <span class="font-semibold">${message.author.username}</span>
                            <span class="text-xs text-gray-500">${timeString}</span>
                        </div>
                        <div class="mt-1">${formatMessageContent(message.content || '')}</div>
                    </div>
                </div>
            `;

            container.appendChild(messageElement);
        });

        // Scroll to buttom
        //container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Failed to load messages', 'error');
    }
}

function initializeMessageInput() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    try {
        let endpoint, targetId;
        
        if (currentMode === 'server') {
            endpoint = '/api/messages/channel';
            targetId = document.getElementById('channelSelect').value;
        } else {
            endpoint = '/api/messages/dm';
            targetId = document.getElementById('userSearch').getAttribute('data-user-id');
        }
        
        if (!targetId) {
            showNotification('Please select a recipient', 'error');
            return;
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                targetId,
                content: message 
            })
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        
        messageInput.value = '';
        
        // Reload messages
        if (currentMode === 'server') {
            await loadMessages(targetId);
        } else {
            await loadDirectMessages(targetId);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message', 'error');
    }
}

// Add a single message to container
function addMessageToContainer(message) {
    const container = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    // Format timestamp
    const timestamp = new Date(message.timestamp);
    const timeString = formatMessageTime(timestamp);

    const hasContent = message.content && message.content.trim().length > 0;
    const hasAttachments = message.attachments && message.attachments.length > 0;

    messageElement.innerHTML = `
        <div class="flex gap-3">
            <img src="${message.author.avatar}" 
                 class="w-10 h-10 rounded-full" 
                 alt="${message.author.username}"
                 onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
            <div class="flex-1">
                <div class="flex items-baseline gap-2">
                    <span class="font-semibold">${message.author.username}</span>
                    <span class="text-xs text-gray-500">${timeString}</span>
                </div>
                ${hasContent ? `<div class="mt-1">${formatMessageContent(message.content)}</div>` : ''}
                ${hasAttachments ? formatAttachments(message.attachments) : ''}
            </div>
        </div>
    `;

    container.insertBefore(messageElement, container.firstChild);
    lucide.createIcons();
}

function formatAttachments(attachments) {
    if (!attachments || attachments.length === 0) return '';

    return `<div class="mt-2 space-y-2">
        ${attachments.map(attachment => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.url);
            
            if (isImage) {
                return `
                    <div>
                        <img src="${attachment.url}" 
                             alt="Image attachment" 
                             class="max-w-full rounded cursor-pointer hover:opacity-90"
                             style="max-height: 350px;"
                             onclick="openImagePreview('${attachment.url}')"
                        >
                    </div>
                `;
            } else {
                return `
                    <div class="flex items-center gap-2 text-blue-500 hover:text-blue-600">
                        <i data-lucide="paperclip" class="w-4 h-4"></i>
                        <a href="${attachment.url}" target="_blank" class="hover:underline">
                            ${attachment.name}
                        </a>
                    </div>
                `;
            }
        }).join('')}
    </div>`;
}

function openImagePreview(url) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    modal.onclick = () => modal.remove();

    modal.innerHTML = `
        <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <button class="absolute top-4 right-4 text-white hover:text-gray-300">
                <i data-lucide="x" class="w-8 h-8"></i>
            </button>
            <img src="${url}" 
                 class="max-w-full max-h-[90vh] object-contain"
                 alt="Full size preview"
            >
        </div>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();
}

function formatMessageContent(content) {
    return content
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, '<a href="$1" target="_blank" class="text-blue-500 hover:underline">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([^`]+)```/g, '<code class="block bg-gray-100 p-2 rounded my-2">$1</code>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
}

// Format time string
function formatMessageTime(date) {
    return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

// Format date string
function formatMessageDate(date) {
    return date.toLocaleDateString([], { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Send a message
async function sendMessage() {
    const channelId = document.getElementById('channelSelect').value;
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!channelId || !message) {
        showNotification('Please select a channel and enter a message', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId, message })
        });

        if (response.ok) {
            messageInput.value = '';
        } else {
            showNotification('Failed to send message', 'error');
        }
    } catch (error) {
        Logger.expection('Error sending message:', error);
        showNotification('Failed to send message', 'error');
    }
}

// Handle message input shortcuts (e.g., Enter to send)
function handleMessageInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Export functions
window.loadMessages = loadMessages;
window.addMessageToContainer = addMessageToContainer;
window.sendMessage = sendMessage;
window.handleMessageInput = handleMessageInput;
window.openImagePreview = openImagePreview;

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeMessageInput();
});
document.getElementById('messageInput')?.addEventListener('keydown', handleMessageInput);