const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


const server = http.createServer(app);  
const wss = new WebSocket.Server({ server });

// Store all connected clients and drawing data
const clients = new Set();
const drawingHistory = [];

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);
    ws.send(JSON.stringify({
        type: 'users',
        count: clients.size
    }));
    // Send existing drawing history to new client
    if (drawingHistory.length > 0) {
        ws.send(JSON.stringify({
            type: 'history',
            data: drawingHistory
        }));
    }

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Broadcast to all other clients
            clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });

            // Store in history (for new connections)
            if (data.type === 'draw') {
                drawingHistory.push(data.data);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        // Broadcast to all other clients
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({type: 'users', count: clients.size}));
            }
        });
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});