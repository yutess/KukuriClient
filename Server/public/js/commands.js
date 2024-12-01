async function openCommands() {
    const modal = document.getElementById('commandsModal');
    if (!modal) return;

    try {
        const response = await fetch('/api/commands');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const commands = await response.json();
        const container = document.getElementById('commandsList');
        if (!container) return;
        
        container.innerHTML = ''; // Clear existing content

        // Commands Group
        const commandGroups = commands.reduce((groups, command) => {
            let category = 'Other';
            if (command.name.match(/^(help|ping|info)/)) category = 'General';
            else if (command.name.match(/^(clean|purge)/)) category = 'Moderation';
            else if (command.name.match(/^(avatar|userinfo|serverinfo)/)) category = 'Utility';
            else if (command.name.match(/^(poll|rpc|fakeyt)/)) category = 'Fun';

            if (!groups[category]) groups[category] = [];
            groups[category].push(command);
            return groups;
        }, {});

        Object.entries(commandGroups).forEach(([category, cmds]) => {
            if (cmds.length === 0) return;

            const section = document.createElement('div');
            section.className = 'mb-6';
            section.innerHTML = `
                <h3 class="text-lg font-semibold mb-3">${category}</h3>
                <div class="space-y-3">
                    ${cmds.map(cmd => `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="font-medium text-blue-600">${cmd.name}</div>
                            <div class="text-sm text-gray-600 mt-1">${cmd.description}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(section);
        });

        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading commands:', error);
        showNotification('Failed to load commands', 'error');
    }
}

function closeCommands() {
    document.getElementById('commandsModal').classList.add('hidden');
}

// Search commands function
function searchCommands(query) {
    const commandElements = document.querySelectorAll('.command-item');
    query = query.toLowerCase();

    commandElements.forEach(element => {
        const name = element.querySelector('.command-name').textContent.toLowerCase();
        const description = element.querySelector('.command-description').textContent.toLowerCase();

        if (name.includes(query) || description.includes(query)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
}

// Copy command to clipboard
function copyCommand(commandName) {
    const prefix = document.getElementById('prefix')?.value || '.';
    navigator.clipboard.writeText(prefix + commandName)
        .then(() => {
            // Show feedback
            const feedback = document.createElement('div');
            feedback.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
            feedback.textContent = 'Command copied!';
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
        })
        .catch(err => Logger.expection('Failed to copy command:', err));
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('commandsModal');
    closeCommands();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCommands();
    }
});

// Export functions
window.openCommands = openCommands;
window.closeCommands = closeCommands;
window.searchCommands = searchCommands;
window.copyCommand = copyCommand;