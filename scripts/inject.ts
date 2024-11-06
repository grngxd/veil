import axios from 'axios';
import fs from 'node:fs';
import WebSocket from 'ws';

export const inject = async () => {
    const res = await axios.get("http://127.0.0.1:4444/json");
    const wsURL = res.data[0].webSocketDebuggerUrl;
    console.log("WebSocket Address:", wsURL);

    const ws = new WebSocket(wsURL);
    const code = fs.readFileSync('./out/veil.js', 'utf-8');
    console.log(code);
    
    const timeout = setTimeout(() => {
        console.error("WebSocket connection timed out.");
        ws.terminate();
        process.exit(1);
    }, 60000); // 1 minute timeout

    ws.on('open', () => {
        clearTimeout(timeout);
        console.log('Connected to Discord WebSocket');
        const payload = {
            id: 1,
            method: "Runtime.evaluate",
            params: {
                expression: `${code}`
            }
        };
        console.log(code);

        ws.send(JSON.stringify(payload));
        console.log("Payload sent.");
    });

    ws.on('message', (data) => {
        console.log("Message from Discord WebSocket:", data.toString());

        if (data.method === "Runtime.exceptionThrown") {
            console.error("An exception was thrown while evaluating the payload:", data.params.exceptionDetails);
            process.exit(1);
        }

        if (data.method === "Inspector.detached") {
            console.error("The inspector was detached while evaluating the payload.");
            process.exit(1);
        }
    });

    ws.on('error', (error) => {
        clearTimeout(timeout);
        console.error("WebSocket error:", error);
        process.exit(1);
    });

    ws.on('close', () => {
        clearTimeout(timeout);
        console.log("WebSocket connection closed.");
    });
}