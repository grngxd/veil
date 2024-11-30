import * as veil from "+veil";

function log(...args: any[]): void {
    let func: "log" | "warn" | "error" = "log";
    const text: any[] = args;

    // Check if the last argument is a valid log level
    if (typeof args[args.length - 1] === "string" && ["log", "warn", "error"].includes(args[args.length - 1])) {
        func = args.pop();
    }

    const base = "padding: 4px 8px; border-radius: 4px; font-size: 14px;";
    const styles: Record<"log" | "warn" | "error", string> = {
        log: `${base} background: #222; color: #fff;`,
        warn: `${base} background: #f39c12; color: #fff;`,
        error: `${base} background: #e74c3c; color: #fff;`,
    };

    // Ensure console[func] exists and is a function
    if (console && typeof console[func] === 'function') {
        console[func](
            "%cveil%c",
            styles[func],
            "",
            ...text,
        );
    } else {
        // Fallback to console.log if console[func] is not a function
        log(
            ...args,
            "log",
        )
    }
}

function warn(...args: any[]): void {
    log(...args, "warn");
}

function error(...args: any[]): void {
    log(...args, "error");
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