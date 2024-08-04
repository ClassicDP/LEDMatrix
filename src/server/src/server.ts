
import path from 'path';
import { Page, webkit } from 'playwright';
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

let clientCounter = 0;

wss.on('connection', (ws: WebSocket) => {
    const clientId = ++clientCounter;
    clients.push(ws);
    console.log(`Client connected: ${clientId}`);

    ws.send(JSON.stringify({ command: 'generateNextGroup' }));

    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log(`Client disconnected: ${clientId}`);
    });

    ws.on('message', async (message: string) => {
        const request = JSON.parse(message);

        if (request.frameGroup) {
            clients = clients.filter(client => client !== ws);
            const frameGroup: FrameGroup = request.frameGroup;

            await page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });

            await captureAndSendScreenshot(frameGroup);

            let deltaT = frameGroup.startTime - Date.now();
            // Calculate the delay based on the inter-frame period
            const delay = Math.max(0, deltaT);

            // Schedule the next frame group request after the calculated delay
            setTimeout(() => {
                ws.send(JSON.stringify({ command: 'generateNextGroup' }));
            }, delay / 2);
        } else {
            console.log('Unknown message received:', message);
        }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error with client ${clientId}:`, error);
    });
});

(async () => {
    const browser = await webkit.launch();
    const context = await browser.newContext();

    // Очистка кэша и куки
    await context.clearCookies();
    console.log('Browser cache and cookies cleared');

    page = await context.newPage();

    const filePath = path.join(__dirname, '../../../src/render/dist/index.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'load' });

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
            document.getElementById('matrix-container')!.style.height = `${totalHeight}px`;
        }, totalHeight);

        const elementHandle = await page.waitForSelector('#matrix-container', { state: 'visible' });
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
