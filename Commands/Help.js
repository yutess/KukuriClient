const { createCanvas } = require('canvas');
const { MessageAttachment } = require('discord.js-selfbot-v13');
const Settings = require("../Config/Settings.json");

module.exports = {
    name: 'help',
    description: 'Show this help message',
    async execute(message, args, client) {
        const prefix = Settings.prefix;
        const commandList = [];

        message.delete()
        // Collect commands
        client.commands.forEach((command) => {
            commandList.push(`${prefix}${command.name} - ${command.description}`);
        });

        // Check if bot has permission to send attachments
        const permissions = message.channel.permissionsFor(client.user);
        if (permissions && permissions.has('ATTACH_FILES')) {
            // Calculate canvas dimensions
            const lineHeight = 35;
            const padding = 40;
            const canvasWidth = 900;
            const canvasHeight = 120 + lineHeight * (commandList.length + 1) + 60;
        
            // Create Canvas
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');
        
            // Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient.addColorStop(0, '#1a2a3a');   // Dark navy at top
            gradient.addColorStop(1, '#2c3e50');   // Lighter navy at bottom
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
            // Add decorative header bar
            ctx.fillStyle = '#3498db';  // Bright blue
            ctx.fillRect(0, 0, canvasWidth, 80);
            
            // Add subtle grid pattern
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvasWidth; i += 30) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvasHeight);
                ctx.stroke();
            }
        
            // Title with shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px "Arial"';
            ctx.fillText('Kukuri Client Commands', padding, 50);
        
            // Reset shadow
            ctx.shadowColor = 'transparent';
        
            // Commands Container
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(padding - 20, 90, canvasWidth - (padding * 2) + 40, lineHeight * commandList.length + 40);
            
            // Draw Commands List
            let yPosition = 120;
            ctx.font = '22px "Arial"';
            commandList.forEach((command, index) => {
                // Command background highlight (alternating)
                if (index % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                    ctx.fillRect(padding - 20, yPosition - 25, canvasWidth - (padding * 2) + 40, lineHeight);
                }
        
                // Command prefix
                ctx.fillStyle = '#3498db';  // Bright blue
                ctx.fillText('>', padding, yPosition);
                
                // Command text
                ctx.fillStyle = '#ecf0f1';  // Light gray
                ctx.fillText(command, padding + 25, yPosition);
                
                yPosition += lineHeight;
            });
        
            // Footer decoration
            ctx.fillStyle = '#3498db';
            ctx.fillRect(0, canvasHeight - 60, canvasWidth, 60);
        
            // Footer text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'italic 18px Arial';
            ctx.fillText('Use these commands wisely! | Kukuri Client', padding, canvasHeight - 25);
        
            // Add corner decorations
            function drawCorner(x, y, rotationDeg) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotationDeg * Math.PI / 180);
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(20, 0);
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 20);
                ctx.stroke();
                ctx.restore();
            }
        
            // Draw corners
            drawCorner(padding - 20, 90, 0);                    // Top left
            drawCorner(canvasWidth - padding + 20, 90, 90);     // Top right
            drawCorner(padding - 20, yPosition + 20, 270);      // Bottom left
            drawCorner(canvasWidth - padding + 20, yPosition + 20, 180); // Bottom right
        
            // Export and send
            const buffer = canvas.toBuffer();
            const attachment = new MessageAttachment(buffer, 'kukuri-commands.png');
            message.channel.send({
                content: 'Kukuri Client v1.0.3',
                files: [attachment],
            });
        } else {
            // Send Text if no permission to attach files
            const textResponse = `Kukuri Client Commands:\n\`\`\`\n${commandList.join('\n')}\n\`\`\`\nUse the commands wisely!`;
            message.channel.send(textResponse);
        }        
    },
};
