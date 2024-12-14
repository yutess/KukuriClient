const { shell } = require('electron');

function openLocal() {
    shell.openExternal('http://localhost:3000');
}

function openGithub() {
    shell.openExternal('https://github.com/Mikasuru/KukuriClient');
}

// Initialize Lucide icons
lucide.createIcons();