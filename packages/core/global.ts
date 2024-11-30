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
    }

    const veil: Veil;

    interface Object {
        _dispatcher: undefined;
    }
}