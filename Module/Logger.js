const fs = require('fs').promises;
const path = require('path');

class Logger {
    static instance = null;
    
    constructor() {
        this.logDir = path.join(__dirname, '..', 'logs');
        this.currentLogFile = null;
        this.colors = {
            reset: "\x1b[0m",
            info: "\x1b[36m",     // Cyan
            warning: "\x1b[33m",   // Yellow  
            error: "\x1b[31m",    // Red
            debug: "\x1b[32m",    // Green
            system: "\x1b[35m"    // Magenta
        };

        this.initializeLogger();
    }

    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    async initializeLogger() {
        try {
            await fs.access(this.logDir);
        } catch {
            await fs.mkdir(this.logDir, { recursive: true });
        }

        const date = new Date();
        const fileName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
        this.currentLogFile = path.join(this.logDir, fileName);
    }

    getFormattedTime() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    async writeToFile(level, message) {
        const logEntry = `[${this.getFormattedTime()}] [${level.toUpperCase()}] ${message}\n`;
        try {
            await fs.appendFile(this.currentLogFile, logEntry);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    log(level, message, color) {
        const timeStr = this.getFormattedTime();
        const logMessage = `${color}[${level}]${this.colors.reset} (${timeStr}): ${message}`;
        
        console.log(logMessage);
        this.writeToFile(level, message);
    }

    info(message) {
        this.log('INFO', message, this.colors.info);
    }

    warning(message) {
        this.log('WARNING', message, this.colors.warning);
    }

    error(message, error = null) {
        const errorMsg = error ? `${message} - ${error.stack || error.message}` : message;
        this.log('ERROR', errorMsg, this.colors.error);
    }

    debug(message) {
        this.log('DEBUG', message, this.colors.debug);
    }

    system(message) {
        this.log('SYSTEM', message, this.colors.system);
    }
}

module.exports = Logger.getInstance();