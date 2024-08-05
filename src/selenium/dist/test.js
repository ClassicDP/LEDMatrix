import { exec } from 'child_process';
import CDP from 'chrome-remote-interface';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Define __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlFilePath = path.join(__dirname, 'time.html'); // Path to your HTML file
const outputDir = path.join(__dirname, 'screenshots'); // Directory to save screenshots
const chromePath = '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"'; // Adjusted path for Chrome
const windowSize = '1280x1024';
const interval = 1000; // Interval between screenshots in milliseconds
const remoteDebuggingPort = 9222; // Port for remote debugging

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

let screenshotCount = 0;

// Launch Chrome with remote debugging
function launchChrome() {
    return new Promise((resolve, reject) => {
        const command = `${chromePath} --remote-debugging-port=${remoteDebuggingPort} --no-sandbox --new-window --disable-extensions "file://${htmlFilePath}"`;
        console.log('Launching Chrome...');
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error launching Chrome: ${error}`);
                console.error(`Chrome stderr: ${stderr}`);
                reject(error);
            } else {
                console.log('Chrome launched successfully');
                resolve();
            }
        });
    });
}

// Poll to check if DevTools is ready
async function waitForDevTools() {
    const url = `http://localhost:${remoteDebuggingPort}/json/list`;
    while (true) {
        try {
            const response = await fetch(url);
            const targets = await response.json();
            console.log('Targets:', targets); // Log targets
            if (targets.length > 0) {
                console.log('DevTools is ready.');
                return targets[0].id; // Return the target ID
            } else {
                console.log('No inspectable targets found, retrying...');
            }
        } catch (error) {
            console.log('Waiting for DevTools to be ready...');
            console.error('Error:', error); // Log the error
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Connect to the running Chrome instance
async function connectToChrome(targetId) {
    try {
        const client = await CDP({ port: remoteDebuggingPort, target: targetId });
        const { Page, Runtime } = client;
        await Page.enable();
        await Runtime.enable();

        console.log('Connected to Chrome');
        await Page.navigate({ url: `file://${htmlFilePath}` });
        await Page.loadEventFired();

        // Start taking screenshots in a loop
        setInterval(async () => {
            await takeScreenshot(client);
        }, interval);

    } catch (error) {
        console.error('Error connecting to Chrome:', error);
    }
}

// Take a screenshot using the connected Chrome instance
async function takeScreenshot(client) {
    try {
        const { Page } = client;
        const screenshot = await Page.captureScreenshot({ format: 'png' });
        const buffer = Buffer.from(screenshot.data, 'base64');
        const screenshotPath = path.join(outputDir, `screenshot_${screenshotCount++}.png`);

        // Save the screenshot
        fs.writeFileSync(screenshotPath, buffer);
        console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
        console.error('Error taking screenshot:', error);
    }
}

// Start the process
(async () => {
    try {
        await launchChrome();
        const targetId = await waitForDevTools();
        await connectToChrome(targetId);
    } catch (error) {
        console.error('Error in the main process:', error);
    }
})();
