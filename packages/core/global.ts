import type { Veil } from "+core";

// just to make typescript happy
interface Window {
    veil: Veil;
    webpackChunkdiscord_app: any;
}

interface Object {
    _dispatcher: undefined;
}

declare global {
    interface Window {
        veil: Veil;
        webpackChunkdiscord_app: any;
        DiscordNative: any;
    }

    const veil: Veil;
    const DiscordNative: any;

    interface Object {
        _dispatcher: undefined;
    }
}