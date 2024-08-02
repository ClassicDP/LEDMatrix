import { webkit } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
let clients: WebSocket[] = [];
let page: any;

// __dirname equivalent setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

wss.on('connection', (ws: WebSocket) => {
    clients.push(ws);
    console.log('Client connected');

    ws.send(JSON.stringify({ command: 'generateNextGroup' }));

    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log('Client disconnected');
    });

    ws.on('message', async (message: string) => {
        console.log('Received message from client:', message);
        const request = JSON.parse(message);

        if (request.frameGroup) {
            clients = clients.filter(client => client !== ws);
            console.log('Processing frame group');
            const frameGroup: FrameGroup = request.frameGroup;
            await captureAndSendScreenshot(frameGroup);

            ws.send('screenshot_done');

            // Calculate the delay based on the inter-frame period
            const delay = Date.now() - frameGroup.startTime;



            // Schedule the next frame group request after the calculated delay
            setTimeout(() => {
                ws.send(JSON.stringify({ command: 'generateNextGroup' }));
            }, 1000);
        } else {
            console.log('Unknown message received:', message);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

(async () => {
    const browser = await webkit.launch();
    page = await browser.newPage();

    const filePath = path.join(__dirname, '../../../src/client/dist/index.html');
    await page.goto(`file://${filePath}`);

    console.log('Browser and page loaded');
    page.on('console', async (msg: { args: () => any; }) => {
        const msgArgs = msg.args();
        const logValues = await Promise.all(msgArgs.map(async (arg: { jsonValue: () => any; }) => await arg.jsonValue()));
        console.log("::",...logValues);
    });


    process.on('exit', async () => {
        await browser.close();
        console.log('Browser closed');
    });
})();

async function captureAndSendScreenshot(frameGroup: FrameGroup) {
    try {
        console.log('Capturing screenshot for frame group');
        const { totalHeight, frameCount } = frameGroup;

        await page.evaluate((totalHeight: any) => {
            document.getElementById('animation-container')!.style.height = `${totalHeight}px`;
        }, totalHeight);

        const elementHandle = await page.waitForSelector('#animation-container', { state: 'visible' });
        const boundingBox = await elementHandle.boundingBox();

        const screenshotBuffer = await page.screenshot({
            encoding: 'base64',
            clip: boundingBox!,
            timeout: 100,
        });

        const imageBuffer = Buffer.from(screenshotBuffer, 'base64');

        const frameHeight = Math.floor(totalHeight / frameCount);
        const frames: Frame[] = [];

        for (let i = 0; i < frameCount; i++) {
            const yPosition = i * frameHeight;

            const croppedBuffer = await sharp(imageBuffer)
                .extract({ width: 96, height: frameHeight, left: 0, top: yPosition })
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
        console.error(`Error capturing screenshot:`, error);
    }
}

server.listen(8081, () => {
    console.log('WebSocket server running on port 8081');
});
