const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Z&X Server</title></head>
        <body>
            <h1>🎮 Z&X Eaglercraft Server</h1>
            <p>✅ Server is running!</p>
            <code>wss://z-x.duckdns.org</code>
        </body>
        </html>
    `);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (clientWs, req) => {
    console.log('Client connected');
    
    const targetWs = new WebSocket('wss://z-x-25-x.hf.space', {
        handshakeTimeout: 30000,
        timeout: 60000  // 60 second timeout
    });
    
    // Send ping every 10 seconds to keep connection alive
    const pingInterval = setInterval(() => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.ping();
        }
        if (targetWs.readyState === WebSocket.OPEN) {
            targetWs.ping();
        }
    }, 10000);
    
    targetWs.on('open', () => {
        console.log('Connected to HF Space');
    });
    
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
    
    clientWs.on('close', () => {
        clearInterval(pingInterval);
        if (targetWs.readyState === WebSocket.OPEN) targetWs.close();
    });
    
    targetWs.on('close', () => {
        clearInterval(pingInterval);
        if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
    });
    
    targetWs.on('error', (err) => {
        console.log('HF error:', err.message);
    });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Proxy running on port ${port}`);
});
