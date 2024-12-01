// Global state
let currentMode = 'server';
let users = [];

let botStatus = 'offline';

async function refreshInfo() {
    try {
        const response = await fetch('/api/info');
        const info = await response.json();
        
        document.getElementById('serverCount').textContent = info.servers;
        document.getElementById('commandCount').textContent = info.commands;
        document.getElementById('channelCount').textContent = info.channels;
        document.getElementById('uptime').textContent = info.uptime;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error fetching info:', error);
        showNotification('Failed to load information', 'error');
    }
}

async function getCurrentUserId() {
    const response = await fetch('/api/me');
    const data = await response.json();
    return data.id;
}

async function switchMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-500', 'text-white');
    });
    
    const activeBtn = mode === 'server' ? 'serverModeBtn' : 'dmModeBtn';
    document.getElementById(activeBtn).classList.add('active', 'bg-blue-500', 'text-white');
    
    document.getElementById('serverSection').classList.toggle('hidden', mode === 'dm');
    document.getElementById('dmSection').classList.toggle('hidden', mode === 'server');
    
    document.getElementById('messageContainer').innerHTML = '';
    
    if (mode === 'dm') {
        loadUsers();
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        users = await response.json();
        setupUserSearch();
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users', 'error');
    }
}

function setupUserSearch() {
    const userSearch = document.getElementById('userSearch');
    const usersList = document.getElementById('usersList');
    
    if (!userSearch || !usersList) {
        console.error('Missing required elements: userSearch or usersList');
        return;
    }
    
    userSearch.addEventListener('input', (e) => {
        const search = e.target.value?.toLowerCase() || '';
        const filtered = users.filter(user => 
            (user.username || '').toLowerCase().includes(search)
        );
        
        usersList.innerHTML = filtered.map(user => `
            <div class="user-item p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                 onclick="selectUser('${user.id}', '${user.username || ''}')">
                <img src="${user.avatar || ''}" class="w-8 h-8 rounded-full">
                <span>${user.username || ''}</span>
            </div>
        `).join('');
        
        usersList.classList.toggle('hidden', !search);
    });
}

async function selectUser(userId, username) {
    const userSearch = document.getElementById('userSearch');
    userSearch.value = username;
    userSearch.setAttribute('data-user-id', userId);
    document.getElementById('usersList').classList.add('hidden');
    await loadDirectMessages(userId);
}

document.addEventListener('DOMContentLoaded', () => {
    // Set initial mode
    switchMode('server');
    
    // Hide usersList when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#dmSection')) {
            document.getElementById('usersList').classList.add('hidden');
        }
    });

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            if (e.target.textContent.includes('Commands')) {
                openCommands();
            } else if (e.target.textContent.includes('Settings')) {
                openSettings();
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    checkBotStatus();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Start/Stop button
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', toggleBot);
    }

    // Server select
    const serverSelect = document.getElementById('serverSelect');
    if (serverSelect) {
        serverSelect.addEventListener('change', handleServerChange);
    }

    // Message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keydown', handleMessageInput);
    }
}

async function toggleBot() {
    const startButton = document.getElementById('startButton');
    if (!startButton) return;

    try {
        const endpoint = botStatus === 'online' ? '/api/stop' : '/api/start';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            updateStatus(endpoint === '/api/start');
            showNotification(
                endpoint === '/api/start' ? 'Bot started successfully' : 'Bot stopped successfully',
                'success'
            );
            
            if (endpoint === '/api/start') {
                await loadServers();
            } else {
                resetUI();
            }
        } else {
            throw new Error(data.error || 'Failed to toggle bot');
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

function connectWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${wsProtocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected, trying to reconnect...');
        setTimeout(connectWebSocket, 1000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'status':
            updateStatus(data.status === 'online');
            if (data.user) {
                document.getElementById('botUser').textContent = `Logged in as ${data.user.tag}`;
                document.getElementById('botUser').classList.remove('hidden');
            }
            break;
        case 'newMessage':
            addMessageToContainer(data.message);
            break;
        case 'error':
            showNotification(data.message, 'error');
            break;
    }
}

async function checkBotStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        updateStatus(data.status === 'online');
        if (data.status === 'online') {
            document.getElementById('botUser').textContent = `Logged in as ${data.user.tag}`;
            document.getElementById('botUser').classList.remove('hidden');
            loadServers();
        }
    } catch (error) {
        console.error('Error checking bot status:', error);
        showNotification('Failed to check bot status', 'error');
    }
}

function updateStatus(isOnline) {
    botStatus = isOnline ? 'online' : 'offline';
    
    // Update status indicator
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const startButton = document.getElementById('startButton');
    const offlineAlert = document.getElementById('offlineAlert');
    
    if (statusDot) statusDot.className = `w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`;
    if (statusText) statusText.textContent = isOnline ? 'Online' : 'Offline';
    if (startButton) startButton.textContent = isOnline ? 'Stop' : 'Start';
    if (offlineAlert) offlineAlert.style.display = isOnline ? 'none' : 'block';

    // Update UI state
    const inputs = document.querySelectorAll('select, input, button:not(#startButton)');
    inputs.forEach(input => input.disabled = !isOnline);
}

function resetUI() {
    const serverSelect = document.getElementById('serverSelect');
    const channelSelect = document.getElementById('channelSelect');
    const messageContainer = document.getElementById('messageContainer');

    if (serverSelect) serverSelect.innerHTML = '<option value="">Select a server</option>';
    if (channelSelect) channelSelect.innerHTML = '<option value="">Select a channel</option>';
    if (messageContainer) messageContainer.innerHTML = '';
}

async function loadServers() {
    if (botStatus !== 'online') return;

    try {
        const response = await fetch('/api/servers');
        const servers = await response.json();
        const serverSelect = document.getElementById('serverSelect');
        
        serverSelect.innerHTML = '<option value="">Select a server</option>';
        servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = server.name;
            serverSelect.appendChild(option);
        });

        window.serversData = servers;
    } catch (error) {
        showNotification('Failed to load servers', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' :
        type === 'success' ? 'bg-green-500' :
        'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function handleServerChange() {
    const serverSelect = document.getElementById('serverSelect');
    const channelSelect = document.getElementById('channelSelect');
    const selectedServer = window.serversData?.find(s => s.id === serverSelect.value);

    channelSelect.innerHTML = '<option value="">Select a channel</option>';
    channelSelect.disabled = !serverSelect.value;
    
    document.getElementById('messageContainer').innerHTML = '';

    if (selectedServer) {
        const sortedChannels = selectedServer.channels.sort((a, b) => 
            a.name.localeCompare(b.name)
        );

        sortedChannels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = '#' + channel.name;
            channelSelect.appendChild(option);
        });

        channelSelect.onchange = async () => {
            const channelId = channelSelect.value;
            if (channelId) {
                await loadMessages(channelId);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'watchChannel',
                        channelId
                    }));
                }
            }
        };
    }
}

refreshInfo();
setInterval(refreshInfo, 1000);

// Export functions
window.toggleBot = toggleBot;
window.loadServers = loadServers;
window.updateStatus = updateStatus;
window.showNotification = showNotification;