// index.ts
import axios from "axios";
import { promises } from "node:fs";
import { platform } from "node:os";
import { join } from "node:path";
import * as proxy from "../../scripts/proxy";
/**
 * Finds the Discord executable path based on the operating system.
 * @returns The path to Discord executable or null if not found.
 */
const findDiscordExe = async (): Promise<string | null> => {
    const currentPlatform = platform();
    const possiblePaths: string[] = [];

    if (currentPlatform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA;
        if (localAppData) {
            const discordDir = join(localAppData, 'Discord');
            try {
                const dirs = await promises.readdir(discordDir);
                // Iterate through versioned folders to find Discord.exe
                for (const dir of dirs) {
                    const exePath = join(discordDir, dir, 'Discord.exe');
                    possiblePaths.push(exePath);
                }
            } catch (error) {
            }
        }
    } else if (currentPlatform === 'darwin') {
        // Common Discord installation path on macOS
        possiblePaths.push('/Applications/Discord.app/Contents/MacOS/Discord');
    } else if (currentPlatform === 'linux') {
        // Common Discord installation paths on Linux
        possiblePaths.push('/usr/bin/discord');
        possiblePaths.push('/usr/share/discord/Discord');
        possiblePaths.push(join(process.env.HOME || '', '.discord', 'Discord'));
    }

    // Iterate through possible paths and return the first existing one
    for (const filePath of possiblePaths) {
        try {
            await promises.access(filePath);
            return filePath;
        } catch {}
    }

    console.error('Discord executable not found.');
    return null;
};

const startProxy = async (port: number) => {
    proxy.startProxy(port);
};
// get veil.js from the github grngxd/veil's last release
const veilUrl = "https://github.com/grngxd/veil/releases/latest/download/veil.js";
const getVeilScript = async () => {
    const response = await axios.get(veilUrl);
    const text = response.data;
    return text;
};

export { findDiscordExe, getVeilScript, startProxy };

