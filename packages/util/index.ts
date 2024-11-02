function log(text: any, func?: "log" | "warn" | "error"): void;
function log(text: any[], func?: "log" | "warn" | "error"): void;
function log(text: any | any[], func: "log" | "warn" | "error" = "log") {
    const base = "padding: 4px 8px; border-radius: 4px; font-size: 14px;"
    const styles = {
        log: `${base} background: #222; color: #fff;`,
        warn: `${base} background: #f39c12; color: #fff;`,
        error: `${base} background: #e74c3c; color: #fff`,
    }

  console[func](
    "%cveil%c",
    styles[func],
    "",
    ...(Array.isArray(text) ? text : [text]),
  );
}

function warn(text: any, func?: "log" | "warn" | "error"): void;
function warn(text: any[], func?: "log" | "warn" | "error"): void;
function warn(text: any | any[], func: "log" | "warn" | "error" = "warn") {
    log(text, func);
}

function error(text: any, func?: "log" | "warn" | "error"): void;
function error(text: any[], func?: "log" | "warn" | "error"): void;
function error(text: any | any[], func: "log" | "warn" | "error" = "error") {
    log(text, func);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {
    error, log, sleep, warn
};

