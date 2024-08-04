import fs from 'fs';
import path from 'path';
import {Page, firefox } from 'playwright';
import { fileURLToPath } from 'url';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import sharp from 'sharp';

interface Frame {
    timeStamp: number;
    imageBuffer: string;
}

interface FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    speed: number;
    framePositions: number[];
    totalHeight: number;
    width: number;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
let clients: WebSocket[] = [];
let page: Page;

// __dirname equivalent setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clear browser cache directory (example path, adjust as needed)
const cacheDir = path.resolve(__dirname, 'path_to_browser_cache');
if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('Browser cache cleared');
}

wss.on('connection', (ws: WebSocket) => {
    clients.push(ws);
    console.log('Client connected');

    ws.send(JSON.stringify({ command: 'generateNextGroup' }));

    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log('Client disconnected');
    });

    ws.on('message', async (message: string) => {

        const request = JSON.parse(message);

        if (request.frameGroup) {
            clients = clients.filter(client => client !== ws);
            const frameGroup: FrameGroup = request.frameGroup;

            await page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });

            await captureAndSendScreenshot(frameGroup);

            ws.send('screenshot_done');

            // Calculate the delay based on the inter-frame period
            const delay = Math.max(0, frameGroup.startTime - Date.now());


            // Schedule the next frame group request after the calculated delay
            setTimeout(() => {
                ws.send(JSON.stringify({ command: 'generateNextGroup' }));
            }, delay/2);
        } else {
            console.log('Unknown message received:', message);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

(async () => {
    const browser = await firefox.launch();
    const context = await browser.newContext({
        extraHTTPHeaders: {
            'Cache-Control': 'no-store', // Disable caching
        },

    });
    page = await context.newPage();




    const filePath = path.join(__dirname, '../../../src/client/dist/index.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });

    console.log('Browser and page loaded');

    page.on('console', async (msg: { args: () => any; }) => {
        const msgArgs = msg.args();
        const logValues = await Promise.all(msgArgs.map(async (arg: { jsonValue: () => any; }) => await arg.jsonValue()));
        console.log("::", ...logValues);
    });

    process.on('exit', async () => {
        await browser.close();
        console.log('Browser closed');
    });
})();


async function captureAndSendScreenshot(frameGroup: FrameGroup) {
    try {
        const { totalHeight, frameCount } = frameGroup;

        await page.evaluate((totalHeight: any) => {
            document.getElementById('animation-container')!.style.height = `${totalHeight}px`;
        }, totalHeight);

        const elementHandle = await page.waitForSelector('#animation-container', { state: 'visible' });
        const boundingBox = await elementHandle.boundingBox();

        const screenshotBuffer = await page.screenshot({
            clip: boundingBox!,
            timeout: 100,
        });

        const imageBuffer = Buffer.from(screenshotBuffer);

        const frameHeight = Math.floor(totalHeight / frameCount);
        const frames: Frame[] = [];

        for (let i = 0; i < frameCount; i++) {
            const yPosition = i * frameHeight;

            const croppedBuffer = await sharp(imageBuffer)
                .extract({ width: boundingBox!.width, height: frameHeight, left: 0, top: yPosition })
                .toBuffer();

            frames.push({
                timeStamp: frameGroup.startTime + i * frameGroup.frameInterval,
                imageBuffer: croppedBuffer.toString('base64'),
            });
        }

        frames.forEach((frame) => {
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(frame));
                }
            });
        });

    } catch (error) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        const timeWithMilliseconds = `${hours}:${minutes}:${seconds}.${milliseconds}`;
        console.error(timeWithMilliseconds, `Error capturing screenshot:`, error);
    }
}

server.listen(8081, () => {
    console.log('WebSocket server running on port 8081');
});
