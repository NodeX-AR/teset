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
    
    const targetWs = new WebSocket('wss://z-x-25-x.hf.space/ws');
    
    // Add ping/pong to keep connection alive
    let pingInterval = setInterval(() => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.ping();
        }
        if (targetWs.readyState === WebSocket.OPEN) {
            targetWs.ping();
        }
    }, 30000);
    
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
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Proxy running on port ${port}`);
});
