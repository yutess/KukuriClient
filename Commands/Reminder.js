const { WebhookClient } = require('discord.js-selfbot-v13');
const config = require('../Config/Config.json');
const fs = require('fs').promises;
const path = require('path');
const notifier = require('node-notifier');

const ReminderPath = path.join(__dirname, '../data/reminders.json');

async function checkData() {
    const dirPath = path.join(__dirname, '../data');
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// Load saved reminders
async function loadReminders() {
    try {
        await checkData();
        const data = await fs.readFile(ReminderPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error loading reminders:', error);
        return [];
    }
}

async function saveReminders(reminders) {
    try {
        await checkData();
        await fs.writeFile(ReminderPath, JSON.stringify(reminders, null, 2));
    } catch (error) {
        console.error('Error saving reminders:', error);
    }
}

async function setReminder(reminder, client) {
    const delay = reminder.timestamp - Date.now();
    
    if (delay <= 0) {
        // Remove expired reminder
        const reminders = await loadReminders();
        const updatedReminders = reminders.filter(r => r.id !== reminder.id);
        await saveReminders(updatedReminders);
        return;
    }

    setTimeout(async () => {
        try {
            const webhook = new WebhookClient({ url: config.NotificationSettings.Webhook });

            // Send reminder through webhook
            await webhook.send({
                content: `**Reminder** for <@${reminder.userId}>: ${reminder.message}`,
                allowedMentions: {
                    users: [reminder.userId]
                }
            });
 
            // Keep spamming notification
            notifier.notify({
                title: 'Kukuri Client | Reminder',
                message: `Reminder: ${reminder.message}`,
                sound: true,
                wait: true
            },
            function (err, response) {
                notifier.notify({
                    title: 'Kukuri Client | Reminder',
                    message: `Reminder: ${reminder.message}`,
                    sound: true,
                    wait: true
                });
              }
            );
            notifier.on('timeout', function (notifierObject, options) {
                notifier.notify({
                    title: 'Kukuri Client | Reminder',
                    message: `Reminder: ${reminder.message}`,
                    sound: true
                });
            });

            // Remove completed reminder from storage
            const reminders = await loadReminders();
            const updatedReminders = reminders.filter(r => r.id !== reminder.id);
            await saveReminders(updatedReminders);

        } catch (error) {
            console.error('Error sending reminder webhook:', error);
            const channel = await client.channels.fetch(reminder.channelId);
            if (channel) {
                channel.send(`Failed to send reminder notification to <@${reminder.userId}>`);
            }
        }
    }, delay);
}

// Initialize all saved reminders
async function initializeReminders(client) {
    const reminders = await loadReminders();
    for (const reminder of reminders) {
        await setReminder(reminder, client);
    }
}

module.exports = {
    name: 'reminder',
    description: 'Set a reminder with date, time and message',
    usage: '<dd/mm/yy> <HH:MM> <message>',
    
    // Initialize reminders
    async onReady(client) {
        await initializeReminders(client);
    },
    
    async execute(message, args, client) {
        if (!config.NotificationSettings || !config.NotificationSettings.Enabled || !config.NotificationSettings.Webhook) {
            return message.reply('Reminder notifications are not configured. Please enable webhooks in config.');
        }

        // Check correct number of arguments
        if (args.length < 3) {
            return message.reply('Usage: reminder <dd/mm/yy> <HH:MM> <message>\nExample: reminder 01/01/22 12:00 Hey, remember to do something');
        }

        const dateStr = args[0].trim();
        const timeStr = args[1];
        const reminderMsg = args.slice(2).join(' ');

        // Validate date format
        if (!/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) {
            console.log(`Received dateStr: ${dateStr}`); // Debug
            return message.reply('Invalid date format. Please use dd/mm/yy\nExample: reminder 01/01/22 12:00 Coding tonight');
        }    

        // Validate time format
        if (!/^\d{2}:\d{2}$/.test(timeStr)) {
            console.log(`Received dateStr: ${dateStr}`); // Debug
            return message.reply('Invalid time format. Please use HH:MM (24-hour format)\nExample: reminder 01/01/22 12:00 Playing game tonight');
        }

        try {
            const [day, month, year] = dateStr.split('/');
            const [hours, minutes] = timeStr.split(':');
            
            const reminderDate = new Date(
                2000 + parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours),
                parseInt(minutes)
            );

            if (isNaN(reminderDate.getTime())) {
                return message.reply('Invalid date/time provided.');
            }

            if (reminderDate <= new Date()) {
                return message.reply('Reminder time must be in the future.');
            }

            const reminder = {
                id: Date.now().toString(), 
                userId: message.author.id,
                channelId: message.channel.id,
                message: reminderMsg,
                timestamp: reminderDate.getTime()
            };

            // Load existing reminders
            const reminders = await loadReminders();
            
            reminders.push(reminder);
            await saveReminders(reminders);
            await setReminder(reminder, client);

            // Confirm reminder setup
            await message.reply(`Reminder set for ${dateStr} ${timeStr}: "${reminderMsg}"`);

        } catch (error) {
            console.error('Error setting reminder:', error);
            message.reply('An error occurred while setting the reminder.');
        }
    },
};