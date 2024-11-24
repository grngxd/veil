import { exec, spawn } from 'node:child_process';
import { platform } from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import * as core from '../core';

/**
 * Find Discord executable
 */
const EXECUTABLE = await core.findDiscordExe();
const DEBUGGING_PORT = 4444;
const WEB_PORT = 4443;

if (!EXECUTABLE) {
    console.error('Discord executable not found.');
    process.exit(1);
}

// Extract process name for Windows
const processName = platform() === 'win32' ? path.basename(EXECUTABLE) : EXECUTABLE;

// Kill Discord process
exec(
    platform() === 'win32'
        ? `taskkill /IM "${processName}" /F`
        : `pkill -f "${processName}"`,
    (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing process: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error killing process: ${stderr}`);
            return;
        }
        console.log(`Successfully killed ${processName}`);
    }
);

// Start the proxy server
await core.startProxy(WEB_PORT);

// Launch Discord with remote debugging
const discordProcess = spawn(EXECUTABLE, [`--remote-debugging-port=${DEBUGGING_PORT}`], {
    detached: true,
    stdio: 'ignore',
});

// Detach the child process
discordProcess.unref();

// Fetch the Veil script
const script = await core.getVeilScript();

// Wait for Discord to initialize
await new Promise(resolve => setTimeout(resolve, 5000));

// Connect to the WebSocket for injection
const ws = new WebSocket(`ws://localhost:${DEBUGGING_PORT}/devtools/browser`);

ws.on('open', () => {
    ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
            expression: script,
            awaitPromise: true,
        },
    }));
    console.log('Veil script injected.');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('WebSocket connection closed.');
});