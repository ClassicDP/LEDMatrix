import { exec } from 'child_process';
import axios from 'axios';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

// Get the current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic CSS Animation</title>
    <style>
        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #333;
        }
        .box {
            width: 100px;
            height: 100px;
            background-color: #00f;
            animation: move 2s infinite alternate;
        }
        @keyframes move {
            from { transform: translateY(0); }
            to { transform: translateY(200px); }
        }
    </style>
</head>
<body>
    <div class="box"></div>
</body>
</html>
`;

const startUrl = `data:text/html;base64,${Buffer.from(htmlContent).toString('base64')}`; // Use a data URL for the HTML

async function startChrome() {
    return new Promise((resolve, reject) => {
        const chromeProcess = exec(
            `"${chromePath}" --headless --disable-gpu --remote-debugging-port=9222 ${startUrl}`,
            (error) => {
                if (error) {
                    reject(`Error starting Chrome: ${error.message}`);
                }
            }
        );

        setTimeout(() => {
            resolve(chromeProcess);
        }, 5000); // Wait a few seconds to ensure Chrome is fully started
    });
}

async function getWebSocketDebuggerUrl() {
    const response = await axios.get('http://localhost:9222/json/version');
    return response.data.webSocketDebuggerUrl;
}

async function captureScreenshots() {
    try {
        // Start Chrome
        await startChrome();

        // Get WebSocket URL
        const wsUrl = await getWebSocketDebuggerUrl();
        const ws = new WebSocket(wsUrl);

        let sessionId;

        ws.on('open', () => {
            ws.send(JSON.stringify({ id: 1, method: 'Target.getTargets' }));

            ws.on('message', async (message) => {
                const data = JSON.parse(message);
                if (data.id === 1) {
                    const target = data.result.targetInfos.find(info => info.type === 'page');
                    if (target) {
                        ws.send(JSON.stringify({
                            id: 2,
                            method: 'Target.attachToTarget',
                            params: { targetId: target.targetId, flatten: true }
                        }));
                    } else {
                        ws.close();
                    }
                } else if (data.id === 2 && data.result) {
                    sessionId = data.result.sessionId;
                    let startTime = performance.now();

                    for (let i = 0; i < 100; i++) {
                        ws.send(JSON.stringify({
                            id: 3 + i,
                            method: 'Page.captureScreenshot',
                            sessionId: sessionId,
                            params: { format: 'png' }
                        }));
                    }

                    ws.on('message', (msg) => {
                        const result = JSON.parse(msg);
                        if (result.result) {
                            const buffer = Buffer.from(result.result.data, 'base64');
                            const screenshotPath = path.join(__dirname, `screenshot_${result.id - 3}.png`);
                            fs.writeFileSync(screenshotPath, buffer);
                        }

                        if (result.id === 102) { // Last screenshot ID will be 102
                            let endTime = performance.now();
                            console.log(`Captured 100 screenshots in ${(endTime - startTime) / 1000} seconds`);
                            ws.close();
                        }
                    });
                } else if (data.error) {
                    ws.close();
                }
            });
        });

        ws.on('error', () => {});
        ws.on('close', () => {});
    } catch (error) {
        console.error('Error:', error);
    }
}

captureScreenshots();
