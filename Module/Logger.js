const fs = require('fs');
const path = require('path');

class Logger {
    static instance = null;
    #logFile = null;
    #savingLogs = true;
    #logDir = path.join(__dirname, '..', 'Logs');

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
        if (!fs.existsSync(this.#logDir)) {
            fs.mkdirSync(this.#logDir, { recursive: true });
        }

        const now = new Date();
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const filename = path.join(
            this.#logDir, 
            `Log_${now.getDate()}-${months[now.getMonth()]}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}.kukuri`
        );
        this.#logFile = filename;
    }

    async log(level, message) {
        const timeStr = new Date().toLocaleTimeString();
        const color = {
            'INFO': this.colors.cyan,
            'WARNING': this.colors.yellow,
            'EXPECTION': this.colors.red,
            'DEBUG': this.colors.green,
            'LOAD': this.colors.magenta
        }[level] || this.colors.reset;

        console.log(`${color}[${level}]${this.colors.reset} (${timeStr}): ${message}`);

        if (this.#savingLogs && this.#logFile) {
            const logEntry = `[${timeStr}] [${level}] ${message}\n`;
            try {
                fs.appendFileSync(this.#logFile, logEntry);
            } catch (error) {
                console.error('Failed to write to log file:', error);
            }
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

module.exports = Logger;