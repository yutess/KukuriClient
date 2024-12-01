/*
To be honest, This is the mess part. Sorry if it bug
*/
let currentConfig = null;

async function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;

    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        const settingsContent = modal.querySelector('.bg-white');
        if (!settingsContent) return;

        settingsContent.innerHTML = `
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-6 border-b">
                <h2 class="text-xl font-semibold">Settings</h2>
                <button onclick="closeSettings()" class="text-gray-500 hover:text-gray-700">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto p-6">
                <!-- Tabs Navigation -->
                <div class="border-b mb-6 sticky top-0 bg-white pb-4">
                    <nav class="flex justify-center gap-8" role="tablist">
                        <button onclick="switchTab('client')" id="clientTab" role="tab"
                                class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 relative">
                            <i data-lucide="cpu" class="w-4 h-4 inline-block mr-2"></i>Client
                            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 opacity-0 transition-all duration-200"></div>
                        </button>
                        <button onclick="switchTab('rpc')" id="rpcTab" role="tab"
                                class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 relative">
                            <i data-lucide="activity" class="w-4 h-4 inline-block mr-2"></i>Rich Presence
                            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 opacity-0 transition-all duration-200"></div>
                        </button>
                        <button onclick="switchTab('settings')" id="settingsTab" role="tab"
                                class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 relative">
                            <i data-lucide="settings" class="w-4 h-4 inline-block mr-2"></i>Settings
                            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 opacity-0 transition-all duration-200"></div>
                        </button>
                        <button onclick="switchTab('token')" id="tokenTab" role="tab"
                                class="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 relative">
                            <i data-lucide="key" class="w-4 h-4 inline-block mr-2"></i>Token
                            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 opacity-0 transition-all duration-200"></div>
                        </button>
                    </nav>
                </div>

                <!-- Tab Contents -->
                <div class="space-y-6">
                    <!-- Client Tab -->
                    <div id="clientContent" class="tab-content hidden space-y-6">
                        <div>
                            <h3 class="text-lg font-medium mb-2">AFK Settings</h3>
                            <label class="flex items-center gap-2 mb-4">
                                <input type="checkbox" id="afkEnabled" class="rounded"
                                    ${config.client?.afk ? 'checked' : ''}>
                                <span>Enable AFK Mode</span>
                            </label>
                            <div id="afkMessages" class="space-y-3 mb-4">
                                <!-- AFK messages will be populated here -->
                            </div>
                            <button onclick="addAfkMessage()" 
                                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                Add Message
                            </button>
                        </div>
                    </div>

                    <!-- Rich Presence Tab -->
                    <div id="rpcContent" class="modal-body tab-content hidden space-y-6">
                        <div>
                            <h3 class="text-lg font-medium mb-2">Rich Presence Settings</h3>
                            <label class="flex items-center gap-2 mb-4">
                                <input type="checkbox" id="rpcEnabled" class="rounded"
                                    ${config.client?.rpc?.enabled ? 'checked' : ''}>
                                <span>Enable Rich Presence</span>
                            </label>
                            
                            <div id="rpcSettings" class="space-y-4 ${config.client?.rpc?.enabled ? '' : 'hidden'}">
                                <div>
                                    <label class="block text-sm font-medium mb-1">Application ID</label>
                                    <input type="text" id="rpcApplicationId" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.applicationId || ''}"
                                        placeholder="Discord Application ID">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" id="rpcName" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.name || ''}"
                                        placeholder="Activity name">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-1">Type</label>
                                    <select id="rpcType" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        <option value="PLAYING" ${config.client?.rpc?.type === 'PLAYING' ? 'selected' : ''}>Playing</option>
                                        <option value="STREAMING" ${config.client?.rpc?.type === 'STREAMING' ? 'selected' : ''}>Streaming</option>
                                        <option value="LISTENING" ${config.client?.rpc?.type === 'LISTENING' ? 'selected' : ''}>Listening</option>
                                        <option value="WATCHING" ${config.client?.rpc?.type === 'WATCHING' ? 'selected' : ''}>Watching</option>
                                        <option value="COMPETING" ${config.client?.rpc?.type === 'COMPETING' ? 'selected' : ''}>Competing</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium mb-1">URL (Optional - For Streaming)</label>
                                    <input type="text" id="rpcURL" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.url || ''}"
                                        placeholder="https://www.youtube.com/...">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-1">Details</label>
                                    <input type="text" id="rpcDetails" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.details || ''}"
                                        placeholder="What are you doing?">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-1">State</label>
                                    <input type="text" id="rpcState" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.state || ''}"
                                        placeholder="Additional details">
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Party Size</label>
                                        <input type="number" id="rpcPartyCurrent" 
                                            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                            value="${config.client?.rpc?.partyCurrent || ''}"
                                            placeholder="Current">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Party Max</label>
                                        <input type="number" id="rpcPartyMax" 
                                            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                            value="${config.client?.rpc?.partyMax || ''}"
                                            placeholder="Maximum">
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-1">Large Image URL</label>
                                    <input type="text" id="rpcLargeImage" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.largeImageURL || ''}"
                                        placeholder="URL for large image">
                                </div>

                                <div>
                                    <label class="block text-sm font-medium mb-1">Large Image Text</label>
                                    <input type="text" id="rpcLargeImageText" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.largeImageText || ''}"
                                        placeholder="Hover text for large image">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-1">Small Image ID</label>
                                    <input type="text" id="rpcSmallImage" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.smallImageId || ''}"
                                        placeholder="Small image asset ID">
                                </div>

                                <div>
                                    <label class="block text-sm font-medium mb-1">Small Image Text</label>
                                    <input type="text" id="rpcSmallImageText" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.smallImageText || ''}"
                                        placeholder="Hover text for small image">
                                </div>

                                <div>
                                    <label class="block text-sm font-medium mb-1">Button Label</label>
                                    <input type="text" id="rpcButtonLabel" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.buttonLabel || ''}"
                                        placeholder="Button text">
                                </div>

                                <div>
                                    <label class="block text-sm font-medium mb-1">Button URL</label>
                                    <input type="text" id="rpcButtonURL" 
                                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value="${config.client?.rpc?.buttonURL || ''}"
                                        placeholder="Button link URL">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Tab -->
                    <div id="settingsContent" class="tab-content hidden space-y-6">
                        <div>
                            <h3 class="text-lg font-medium mb-2">Notification Settings</h3>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="notificationEnabled" class="rounded"
                                    ${config.settings?.notification ? 'checked' : ''}>
                                <span>Enable Desktop Notifications</span>
                            </label>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-medium mb-2">Command Prefix</h3>
                            <input type="text" id="prefixInput" 
                                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                value="${config.settings?.prefix || '.'}"
                                placeholder="Enter prefix">
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-medium mb-2">Webhook URL</h3>
                            <input type="text" id="webhookInput" 
                                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                value="${config.settings?.webhook || ''}"
                                placeholder="Discord Webhook URL">
                        </div>
                    </div>

                    <!-- Token Tab -->
                    <div id="tokenContent" class="tab-content hidden space-y-6">
                        <div>
                            <h3 class="text-lg font-medium mb-2">Discord Token</h3>
                            <div class="relative">
                                <input type="password" id="discordToken" 
                                    class="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                    value="${config.token?.token || ''}"
                                    placeholder="Enter Discord token">
                                <button onclick="toggleTokenVisibility()" 
                                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">Be careful when sharing your token!</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="border-t p-6 bg-gray-50">
            <div class="flex justify-center gap-4">
                <button onclick="closeSettings()" 
                        class="px-6 py-2 border text-gray-600 rounded hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button onclick="saveSettings()"
                        class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
        `;

        // Show modal and initialize
        modal.classList.remove('hidden');
        switchTab('client');
        
        if (window.lucide) {
            lucide.createIcons();
        }

        if (config.client?.rpc?.type) {
            document.getElementById('rpcType').value = config.client.rpc.type;
        }

        // Initialize RPC toggle after content is added
        const rpcEnabled = document.getElementById('rpcEnabled');
        if (rpcEnabled) {
            rpcEnabled.addEventListener('change', function() {
                const rpcSettings = document.getElementById('rpcSettings');
                if (rpcSettings) {
                    rpcSettings.classList.toggle('hidden', !this.checked);
                }
            });
        }

        // Load initial data
        loadAfkMessages(config.client?.afkKeywords || []);

    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Failed to load settings', 'error');
    }
}


function loadAllSettings() {
    // Load settings values
    const notificationEnabled = document.getElementById('notificationEnabled');
    if (notificationEnabled) {
        notificationEnabled.checked = currentConfig.settings.notification || false;
    }

    const prefix = document.getElementById('prefix');
    if (prefix) {
        prefix.value = currentConfig.settings.prefix || '.';
    }

    const webhook = document.getElementById('webhook');
    if (webhook) {
        webhook.value = currentConfig.settings.webhook || '';
    }

    // Load client values
    const afkEnabled = document.getElementById('afkEnabled');
    if (afkEnabled) {
        afkEnabled.checked = currentConfig.client.afk || false;
    }

    loadAfkMessages(currentConfig.client.afkKeywords || []);

    // Load token
    const discordToken = document.getElementById('discordToken');
    if (discordToken) {
        discordToken.value = currentConfig.token.token || '';
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    document.querySelectorAll('[role="tab"]').forEach(el => {
        el.classList.remove('text-blue-600');
        const indicator = el.querySelector('.absolute');
        if (indicator) {
            indicator.classList.add('opacity-0');
        }
    });
    
    const content = document.getElementById(`${tab}Content`);
    const tabBtn = document.querySelector(`#${tab}Tab`);
    
    if (content) {
        content.classList.remove('hidden');
    }
    if (tabBtn) {
        tabBtn.classList.add('text-blue-600');
        const indicator = tabBtn.querySelector('.absolute');
        if (indicator) {
            indicator.classList.remove('opacity-0');
        }
    }
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function saveSettings() {
    try {
        // Get elements and check if they exist
        const elements = {
            notification: document.getElementById('notificationEnabled'),
            prefix: document.getElementById('prefixInput'),
            webhook: document.getElementById('webhookInput'),
            afk: document.getElementById('afkEnabled'),
            token: document.getElementById('discordToken'),
            rpc: {
                enabled: document.getElementById('rpcEnabled'),
                applicationId: document.getElementById('rpcApplicationId'),
                name: document.getElementById('rpcName'),
                type: document.getElementById('rpcType'),
                url: document.getElementById('rpcURL'),
                details: document.getElementById('rpcDetails'),
                state: document.getElementById('rpcState'),
                partyCurrent: document.getElementById('rpcPartyCurrent'),
                partyMax: document.getElementById('rpcPartyMax'),
                largeImageURL: document.getElementById('rpcLargeImage'),
                largeImageText: document.getElementById('rpcLargeImageText'),
                smallImageId: document.getElementById('rpcSmallImage'),
                smallImageText: document.getElementById('rpcSmallImageText'),
                buttonLabel: document.getElementById('rpcButtonLabel'),
                buttonURL: document.getElementById('rpcButtonURL')
            }
        };

        // Create config object
        const newConfig = {
            settings: {
                notification: elements.notification ? elements.notification.checked : false,
                prefix: elements.prefix ? elements.prefix.value : '.',
                webhook: elements.webhook ? elements.webhook.value : ''
            },
            client: {
                afk: elements.afk ? elements.afk.checked : false,
                afkKeywords: Array.from(document.querySelectorAll('.afk-message'))
                    .map(input => input.value)
                    .filter(msg => msg.trim() !== ''),
                rpc: {
                    enabled: elements.rpc.enabled ? elements.rpc.enabled.checked : false,
                    applicationId: elements.rpc.applicationId ? elements.rpc.applicationId.value : '',
                    name: elements.rpc.name ? elements.rpc.name.value : '',
                    type: elements.rpc.type ? elements.rpc.type.value : 'PLAYING',
                    url: elements.rpc.url ? elements.rpc.url.value : '',
                    details: elements.rpc.details ? elements.rpc.details.value : '',
                    state: elements.rpc.state ? elements.rpc.state.value : '',
                    partyCurrent: elements.rpc.partyCurrent ? parseInt(elements.rpc.partyCurrent.value) : null,
                    partyMax: elements.rpc.partyMax ? parseInt(elements.rpc.partyMax.value) : null,
                    largeImageURL: elements.rpc.largeImageURL ? elements.rpc.largeImageURL.value : '',
                    largeImageText: elements.rpc.largeImageText ? elements.rpc.largeImageText.value : '',
                    smallImageId: elements.rpc.smallImageId ? elements.rpc.smallImageId.value : '',
                    smallImageText: elements.rpc.smallImageText ? elements.rpc.smallImageText.value : '',
                    buttonLabel: elements.rpc.buttonLabel ? elements.rpc.buttonLabel.value : '',
                    buttonURL: elements.rpc.buttonURL ? elements.rpc.buttonURL.value : ''
                }
            },
            token: {
                token: elements.token ? elements.token.value : ''
            }
        };

        // Send to server
        const response = await fetch('/api/config/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });

        if (!response.ok) {
            throw new Error('Failed to save settings');
        }

        showNotification('Settings saved successfully', 'success');
        currentConfig = newConfig;
        closeSettings();

        if (currentConfig?.token?.token !== newConfig.token.token) {
            setTimeout(() => {
                location.reload();
            }, 1000);
        }

        // Update RPC if settings changed
        if (JSON.stringify(currentConfig?.client?.rpc) !== JSON.stringify(newConfig.client.rpc)) {
            try {
                await updateRichPresence(client, newConfig.client);
            } catch (error) {
                console.error('Error updating RPC:', error);
            }
        }

    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Failed to save settings: ' + error.message, 'error');
    }
}

function loadAfkMessages(messages = []) {
    const container = document.getElementById('afkMessages');
    if (!container) return;

    container.innerHTML = '';
    messages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-2';
        messageDiv.innerHTML = `
            <input type="text" value="${msg}" 
                class="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500 afk-message">
            <button onclick="removeAfkMessage(${index})" 
                class="px-3 py-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                Delete
            </button>
        `;
        container.appendChild(messageDiv);
    });
}

function addAfkMessage() {
    const container = document.getElementById('afkMessages');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex gap-2';
    messageDiv.innerHTML = `
        <input type="text" 
            class="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500 afk-message"
            placeholder="Enter AFK message">
        <button onclick="this.parentElement.remove()" 
            class="px-3 py-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            Delete
        </button>
    `;
    container.appendChild(messageDiv);
}

function removeAfkMessage(index) {
    const messages = document.querySelectorAll('.afk-message');
    if (messages[index]) {
        messages[index].parentElement.remove();
    }
}

function toggleTokenVisibility() {
    const tokenInput = document.getElementById('discordToken');
    const eyeIcon = document.querySelector('#tokenContent i[data-lucide]');
    
    if (tokenInput.type === 'password') {
        tokenInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        tokenInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

document.getElementById('rpcEnabled').addEventListener('change', function() {
    document.getElementById('rpcSettings').classList.toggle('hidden', !this.checked);
});

// Export functions
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.switchSettingsTab = switchSettingsTab;
window.addAfkMessage = addAfkMessage;
window.removeAfkMessage = removeAfkMessage;
window.toggleTokenVisibility = toggleTokenVisibility;
window.saveSettings = saveSettings;