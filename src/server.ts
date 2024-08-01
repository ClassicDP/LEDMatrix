import { webkit } from 'playwright';
import fs from 'fs';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

interface Frame {
    timeStamp: number;
    imageBuffer: string;
}

interface FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    speed: number;
    textArray: string[];
    totalHeight: number;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
let clients: WebSocket[] = [];
let page: any;

wss.on('connection', (ws: WebSocket) => {
    clients.push(ws);
    console.log('Client connected');

    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
    });

    ws.on('message', async (message: string) => {
        const frameGroup: FrameGroup = JSON.parse(message);

        if (frameGroup.startTime) {
            await captureAndSendScreenshot(frameGroup);
            ws.send('screenshot_done');
        }
    });
});

(async () => {
    const browser = await webkit.launch();
    page = await browser.newPage();
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    await page.setContent(htmlContent, { waitUntil: 'load' });

    process.on('exit', async () => {
        await browser.close();
    });
})();

async function captureAndSendScreenshot(frameGroup: FrameGroup) {
    try {
        const { totalHeight, frameCount } = frameGroup;

        // Настройка размера окна в зависимости от общей высоты всех кадров
        await page.setViewportSize({ width: 96, height: totalHeight });

        const elementHandle = await page.waitForSelector('#animation-container');
        const boundingBox = await elementHandle.boundingBox();

        const screenshotBuffer = await page.screenshot({
            encoding: 'base64',
            clip: boundingBox,
            timeout: 100,
        });

        const imageBuffer = Buffer.from(screenshotBuffer, 'base64');
        const frame = {
            timeStamp: frameGroup.startTime,
            imageBuffer: imageBuffer.toString('base64'),
        };

        // Рассылка скриншотов клиентам
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(frame));
            }
        });
    } catch (error) {
        console.error(`Error capturing screenshot:`, error);
    }
}

server.listen(8081, () => {
    console.log('WebSocket server running on port 8081');
});
