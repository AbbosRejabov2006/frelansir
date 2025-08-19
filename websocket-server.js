// websocket-server.js

const WebSocket = require('ws');

// WebSocket serverini 8080 portda ishga tushiramiz
const wss = new WebSocket.Server({ port: 8080 }, () => {
    console.log('WebSocket server is running on port 8080');
});

// Klient ulanishini kutib turamiz
wss.on('connection', ws => {
    console.log('New client connected!');

    // Klientdan kelgan xabarlarni qabul qilish
    ws.on('message', message => {
        console.log(`Received message from client: ${message}`);
        const data = JSON.parse(message);
        
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`Server: ${data}`);
            }
        });
    });

    // Klient ulanishi uzilganda
    ws.on('close', () => {
        console.log('Client has disconnected.');
    });

    // Yangi ulangan klientga xush kelibsiz xabarini yuborish
    ws.send('Welcome to the WebSocket server!');
});