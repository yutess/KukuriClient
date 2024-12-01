let ws = null;

function connectWebSocket() {
    ws = new WebSocket(`ws://${window.location.host}`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
            addMessageToContainer(data.message);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected. Trying to reconnect...');
        setTimeout(connectWebSocket, 1000);
    };
}

function sendWebSocketMessage(type, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: type,
            ...data
        }));
    }
}

// Export functions
window.connectWebSocket = connectWebSocket;
window.sendWebSocketMessage = sendWebSocketMessage;
window.ws = ws;