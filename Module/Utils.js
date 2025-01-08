const Logger = require('./Logger');

class Utils {
    /**
     * Clear the console screen
     */
    static clear() {
        // Clear screen for different operating systems
        process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
        console.clear();
    }

    /**
     * Sleep for the specified duration
     * @param {number} ms - Duration in milliseconds
     * @returns {Promise<void>}
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Sleep for the specified duration with a countdown
     * @param {number} seconds - Duration in seconds
     * @param {string} message - Message to display during countdown
     */
    static async sleepWithLog(seconds, message = 'Sleeping') {
        const startTime = Date.now();
        const endTime = startTime + (seconds * 1000);

        while (Date.now() < endTime) {
            const remainingSeconds = Math.ceil((endTime - Date.now()) / 1000);
            Logger.load(`${message}... ${remainingSeconds}s`);
            await this.sleep(1000);
            Utils.clear();
        }
    }

    /**
     * Format milliseconds to human readable time
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time string
     */
    static formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (remainingHours > 0) parts.push(`${remainingHours}h`);
        if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
        if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

        return parts.join(' ') || '0s';
    }

    /**
     * Generate a random delay
     * @param {number} min - Minimum delay in milliseconds
     * @param {number} max - Maximum delay in milliseconds
     * @returns {number} Random delay in milliseconds
     */
    static randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Create ASCII chart from price data
     * @param {Array} data - Array of price points
     * @param {Object} options - Chart options
     * @returns {string} ASCII chart
     */
    static createPriceChart(data, options = {}) {
        const {
            height = 10,
            width = 40,
            title = 'Price Chart'
        } = options;

        // Find min and max values
        const values = data.map(d => d.price);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        // Create empty chart array
        const chart = Array(height).fill().map(() => Array(width).fill(' '));

        // Plot points
        data.forEach((point, i) => {
            const x = Math.floor((i / (data.length - 1)) * (width - 1));
            const y = Math.floor(((point.price - min) / range) * (height - 1));
            chart[height - 1 - y][x] = '•';
        });

        // Add axes
        for (let i = 0; i < width; i++) chart[height-1][i] = '─';
        for (let i = 0; i < height; i++) chart[i][0] = '│';
        chart[height-1][0] = '└';

        // Add price labels
        const maxLabel = `$${max.toLocaleString()}`;
        const minLabel = `$${min.toLocaleString()}`;
        chart[0][1] = maxLabel;
        chart[height-1][1] = minLabel;

        // Convert to string
        const chartStr = [
            title,
            ...chart.map(row => row.join(''))
        ].join('\n');

        return `\`\`\`\n${chartStr}\n\`\`\``;
    }

    /**
     * Create portfolio distribution pie chart
     * @param {Array} data - Array of {name, value} objects
     * @returns {string} ASCII pie chart
     */
    static createPortfolioChart(data) {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const chart = [`Portfolio Distribution (Total: $${total.toLocaleString()})`];

        data.forEach(item => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const bars = '█'.repeat(Math.floor(percentage / 5));
            chart.push(`${item.name.padEnd(10)} ${bars} ${percentage}%`);
        });

        return '```\n' + chart.join('\n') + '\n```';
    }
}

module.exports = Utils;