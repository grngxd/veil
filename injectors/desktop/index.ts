import axios from 'axios';
import { exec, spawn } from 'node:child_process';
import fs from 'node:fs';
import { platform } from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import * as core from '../core';

/**
 * Find Discord executable
 */
const EXECUTABLE = await core.findDiscordExe();
const DEBUGGING_PORT = 4444;

if (!EXECUTABLE) {
    console.error('Discord executable not found.');
    process.exit(1);
}

// Extract process name for Windows
const processName = platform() === 'win32' ? path.basename(EXECUTABLE) : EXECUTABLE;

// Function to kill Discord process
const killDiscord = () => {
    return new Promise<void>((resolve, reject) => {
        exec(
            platform() === 'win32'
                ? `taskkill /IM "${processName}" /F`
                : `pkill -f "${processName}"`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error killing process: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(`Error killing process: ${stderr}`);
                    reject(new Error(stderr));
                    return;
                }
                console.log(`Successfully killed ${processName}`);
                resolve();
            }
        );
    });
};

// Function to launch Discord with remote debugging
const launchDiscord = () => {
    const discordProcess = spawn(EXECUTABLE, [`--remote-debugging-port=${DEBUGGING_PORT}`], {
        detached: true,
        stdio: 'ignore',
    });

    // Detach the child process
    discordProcess.unref();
};

// Function to inject code into Discord
const injectCode = async () => {
    const res = await axios.get(`http://127.0.0.1:${DEBUGGING_PORT}/json`);
    const wsURL = res.data[0]?.webSocketDebuggerUrl;

    if (!wsURL) {
        await killDiscord();
        launchDiscord();
        return;
    }

    console.log('WebSocket Address:', wsURL);

    const ws: WebSocket = new WebSocket(wsURL);
    const code = fs.readFileSync('./out/veil.js', 'utf-8');

    const timeout = setTimeout(() => {
        console.error('WebSocket connection timed out.');
        ws.terminate();
        process.exit(1);
    }, 60000);

    ws.on('open', () => {
        clearTimeout(timeout);
        const payload = {
            id: 1,
            method: 'Runtime.evaluate',
            params: {
                expression: code,
            },
        };

        ws.send(JSON.stringify(payload));
    });

    ws.on('message', (data) => {
        if (data.method === 'Runtime.exceptionThrown') {
            console.error('An exception was thrown while evaluating the payload:', data.params.exceptionDetails);
            process.exit(1);
        }

        if (data.method === 'Inspector.detached') {
            console.error('The inspector was detached while evaluating the payload.');
            process.exit(1);
        }

        process.exit(0);
    });

    ws.on('error', (error) => {
        clearTimeout(timeout);
        console.error('WebSocket error:', error);
        process.exit(1);
    });

    ws.on('close', () => {
        clearTimeout(timeout);
        console.log('WebSocket connection closed.');
    });
};

// Initial launch of Discord
launchDiscord();

// Check and inject code at intervals
const i = setInterval(async () => {
    try {
        await injectCode();
        clearInterval(i);
    } catch (error) {
        console.error('Error during injection:', error);
    }
}, 5000);