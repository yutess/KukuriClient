const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'schedule',
    description: 'Schedule a direct message (DM) to be sent at a specific date and time',
    category: 'Misc',

    initialize(client) {
        setInterval(() => this.checkSchedules(client), 10000);
    },

    async checkSchedules(client) {
        const dataDir = path.join(__dirname, '..', '..', 'data');
        const schedulePath = path.join(dataDir, 'schedules.json');

        try {
            const data = await fs.readFile(schedulePath, 'utf8');
            let schedules = JSON.parse(data);
            const now = new Date();

            now.setSeconds(0, 0);
            const nowTime = now.getTime();
        
            const toSend = schedules.filter(s => {
                const scheduleDate = new Date(s.scheduledTime);
                scheduleDate.setSeconds(0, 0);
                const scheduleTime = scheduleDate.getTime();
                
                return Math.abs(scheduleTime - nowTime) <= 10000;
            });
            schedules = schedules.filter(s => s.scheduledTime > now);

            for (const schedule of toSend) {
                try {
                    const user = await client.users.fetch(schedule.userId);
                    await user.send(schedule.messageContent);
                } catch (err) {
                    console.error('Error sending scheduled DM:', err);
                }
            }

            if (toSend.length > 0) {
                await fs.writeFile(schedulePath, JSON.stringify(schedules, null, 2));
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('Error checking schedules:', err);
            }
        }
    },

    execute: async (message, args, client) => {
        const dataDir = path.join(__dirname, '..', '..', 'data');
        const schedulePath = path.join(dataDir, 'schedules.json');

        // Ensure data directory exists
        await fs.mkdir(dataDir, { recursive: true }).catch(err => {
            console.error('Error creating data directory:', err);
            return message.channel.send('Error setting up scheduling system.');
        });

        const fullText = args.join(' ');
        const idMatch = fullText.match(/(\d+)\s+"([^"]+)"\s+"([^"]+)"\s+"([^"]*)"/) ||
                       fullText.match(/<@!?(\d+)>\s+"([^"]+)"\s+"([^"]+)"\s+"([^"]*)"/);
        
        if (!idMatch) {
            return message.channel.send('Invalid format!\nUse: `schedule <UserID or @mention> "Message" "dd/mm/yy" "HH:MM"`\nExample: `.schedule 123456789 "Hello" "31/12/24" "15:58"`');
        }

        const [, userId, scheduledMessage, dateStr, timeStr] = idMatch;

        const dateParts = dateStr.split('/');
        if (dateParts.length !== 3) {
            return message.channel.send('Invalid date format! Use dd/mm/yy');
        }

        let [day, month, year] = dateParts;
        year = year.length === 2 ? '20' + year : year;

        let scheduleDate = new Date(year, month - 1, day);

        if (timeStr.trim()) {
            const timeParts = timeStr.trim().split(':');
            if (timeParts.length !== 2) {
                return message.channel.send('Invalid time format! Use HH:MM (24-hour format)');
            }
            scheduleDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
        } else {
            scheduleDate.setHours(0, 0, 0);
        }

        if (scheduleDate <= new Date()) {
            return message.channel.send('Schedule date must be in the future!');
        }

        let schedules = [];
        try {
            const data = await fs.readFile(schedulePath, 'utf8');
            schedules = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('Error reading schedules:', err);
                return message.channel.send('Error reading schedules.');
            }
        }

        const schedule = {
            userId,
            messageContent: scheduledMessage,
            scheduledTime: scheduleDate.getTime(),
        };

        schedules.push(schedule);

        try {
            await fs.writeFile(schedulePath, JSON.stringify(schedules, null, 2));
        } catch (err) {
            console.error('Error saving schedule:', err);
            return message.channel.send('Error saving schedule.');
        }

        const timeString = timeStr.trim() 
            ? `on ${dateStr} at ${timeStr}`
            : `on ${dateStr}`;
        return message.channel.send(`✅ Message scheduled to be sent to <@${userId}> ${timeString}`);
    },
};