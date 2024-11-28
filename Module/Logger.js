const fs = require('fs');
const path = require('path');

class Logger {
    static instance = null;
    #logFile = null;
    #savingLogs = true;
    
    constructor() {
        this.colors = {
            reset: "\x1b[0m",
            cyan: "\x1b[36m",    // INFO
            yellow: "\x1b[33m",  // WARNING
            red: "\x1b[31m",     // EXPECTION
            green: "\x1b[32m",   // DEBUG
            magenta: "\x1b[35m"  // LOAD
        };
        
        if (this.#savingLogs) {
            this.initializeLogFile();
        }
    }

    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    initializeLogFile() {
        // Create Logs directory if it doesn't exist
        if (!fs.existsSync('Logs')) {
            fs.mkdirSync('Logs');
        }

        const now = new Date();
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const filename = path.join('Logs', `Log_${now.getDate()}-${months[now.getMonth()]}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}.kukuri`);
        this.#logFile = fs.createWriteStream(filename, { flags: 'a' });
    }

    getLevelString(level) {
        return {
            'INFO': 'INFO',
            'WARNING': 'WARNING',
            'EXPECTION': 'EXPECTION',
            'DEBUG': 'DEBUG',
            'LOAD': 'LOAD'
        }[level] || 'UNKNOWN';
    }

    getConsoleColor(level) {
        return {
            'INFO': this.colors.cyan,
            'WARNING': this.colors.yellow,
            'EXPECTION': this.colors.red,
            'DEBUG': this.colors.green,
            'LOAD': this.colors.magenta
        }[level] || this.colors.reset;
    }

    getCurrentDateTime() {
        const now = new Date();
        return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    }

    log(level, message) {
        const levelStr = this.getLevelString(level);
        const timeStr = this.getCurrentDateTime();
        const logMessage = `[${levelStr}] (${timeStr}): ${message}\n`;

        // Console output with color
        const color = this.getConsoleColor(level);
        process.stdout.write(`${color}[${levelStr}]${this.colors.reset} (${timeStr}): ${message}\n`);

        // Save to file if enabled
        if (this.#savingLogs && this.#logFile) {
            this.#logFile.write(logMessage);
        }
    }

    static info(message) {
        Logger.getInstance().log('INFO', message);
    }

    static warning(message) {
        Logger.getInstance().log('WARNING', message);
    }

    static expection(message) {
        Logger.getInstance().log('EXPECTION', message);
    }

    static debug(message) {
        Logger.getInstance().log('DEBUG', message);
    }

    static load(message) {
        Logger.getInstance().log('LOAD', message);
    }
}

// Export the class directly
module.exports = Logger;