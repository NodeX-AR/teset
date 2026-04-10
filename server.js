const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

// Create HTTP server
const server = http.createServer((req, res) => {
    // Serve HTML page for normal HTTPS requests
    if (req.url === '/' || req.url === '') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Z&X Server</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: white; }
                    h1 { color: #ff6b35; }
                    .status { color: #4CAF50; margin: 20px; }
                </style>
            </head>
            <body>
                <h1>🎮 Z&X Eaglercraft Server</h1>
                <p class="status">✅ Server is running!</p>
                <p>To connect, use your Eaglercraft client with:</p>
                <code style="background: #333; padding: 10px; display: inline-block; margin: 20px;">
                    wss://z-x.duckdns.org
                </code>
                <p>Server Version: 1.12.2 | Powered by EaglercraftX</p>
            </body>
            </html>
        `);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Create WebSocket server for Eaglercraft connections
const wss = new WebSocket.Server({ server });

wss.on('connection', (clientWs, req) => {
    console.log('🎮 Eaglercraft client connected via wss://');
    
    // Connect to your Hugging Face Space
    const targetWs = new WebSocket('wss://z-x-25-x.hf.space/ws');
    
    // Forward messages both ways
    clientWs.on('message', (data) => {
        if (targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(data);
        }
    });
    
    targetWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data);
        }
    });
    
    // Handle disconnections
    clientWs.on('close', () => {
        console.log('Client disconnected');
        if (targetWs.readyState === WebSocket.OPEN) targetWs.close();
    });
    
    targetWs.on('close', () => {
        if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
    });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📄 Website: https://z-x.duckdns.org`);
    console.log(`🔌 WebSocket: wss://z-x.duckdns.org`);
});
