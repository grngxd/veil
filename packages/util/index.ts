import * as veil from "+veil";

function log(text: any): void;
function log(text: any, func: "log" | "warn" | "error"): void;
function log(text: any | any[], func: "log" | "warn" | "error" = "log") {
    const base = "padding: 4px 8px; border-radius: 4px; font-size: 14px;";
    const styles: Record<"log" | "warn" | "error", string> = {
        log: `${base} background: #222; color: #fff;`,
        warn: `${base} background: #f39c12; color: #fff;`,
        error: `${base} background: #e74c3c; color: #fff;`,
    };

    // Validate that 'func' is one of the allowed methods
    const validFuncs: Array<"log" | "warn" | "error"> = ["log", "warn", "error"];
    if (!validFuncs.includes(func)) {
        console.warn(`Invalid console function "${func}" provided. Falling back to "log".`);
        func = "log";
    }

    // Ensure console[func] exists and is a function
    if (console && typeof console[func] === 'function') {
        console[func](
            "%cveil%c",
            styles[func],
            "",
            ...(Array.isArray(text) ? text : [text]),
        );
    } else {
        // Fallback to console.log if console[func] is not a function
        console.log(
            "%cveil%c",
            styles.log,
            "",
            ...(Array.isArray(text) ? text : [text]),
        );
        console.warn(`console["${func}"] is not a function. Used console.log instead.`);
    }
}

function warn(text: any): void;
function warn(text: any, func: "log" | "warn" | "error"): void;
function warn(text: any | any[], func: "log" | "warn" | "error" = "warn") {
    log(text, func);
}

function error(text: any): void;
function error(text: any, func: "log" | "warn" | "error"): void;
function error(text: any | any[], func: "log" | "warn" | "error" = "error") {
    log(text, func);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {
    error, fetch, log, sleep, warn
};

async function fetch(url: string, init?: RequestInit): Promise<Response> {
    return await window.fetch(`http://127.0.0.1:${veil.proxyPort}/${url}`, init);
}

// thanks again @yellowsink :3
let devtoolsDisabled = false;
let devtoolsUnload: (() => void) | null = null;
export function disableDevtoolsCheck() {
    if (devtoolsDisabled) return devtoolsUnload;
    devtoolsDisabled = true;

    if (window.DiscordNative) {
        // Desktop client
        DiscordNative.window.setDevtoolsCallbacks(
            () => {}, 
            () => {}
        );
        return () => {
            // No unload function needed for DiscordNative
        };
    }  
    // Web client
    const realDescriptor = Reflect.getOwnPropertyDescriptor(window, "outerWidth");

    // Prevent the website from detecting devtools
    const success = Reflect.defineProperty(window, "outerWidth", {
        enumerable: true,
        configurable: true,
        get() {
            throw new Error(":3");
        },
    });

    if (success) {
        const unload = () => {
            Reflect.defineProperty(window, "outerWidth", realDescriptor as PropertyDescriptor);
        };
        devtoolsUnload = unload;
        return unload;
    }

    error("failed to prevent devtools detection; you might get logged out");

    return () => {
        // No unload function needed if prevention failed
    };
}