module.exports = {
    name: 'srpc',
    description: 'Samsung RPC Generator',
    category: 'Misc',
    execute(message, args, client) {
        let type = args[0];
        let appID = args[1];
        if (!appID) {
            return message.channel.send('Please provide an appID');
            //appID = 'com.YostarJP.BlueArchive'; // I love Blue Archive
        }
        if (type === 'stop') {
            message.channel.send(`Stopping \`${appID}\` RPC`);
            client.user.setSamsungActivity(appID, 'STOP');
        } else if (type === 'start') {
            message.channel.send(`Starting \`${appID}\` RPC`);
            client.user.setSamsungActivity(appID, 'START');
        } else if (type === "update") {
            message.channel.send(`Updating \`${appID}\` RPC`);
            client.user.setSamsungActivity(appID, 'UPDATE');
        } else {
            return message.channel.send('Please provide a valid type (start, stop, update)');
        }

    },
};