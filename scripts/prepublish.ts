import { mkdirSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function prepublish() {
    rmSync("./out", { recursive: true });
    mkdirSync("./out");
}

if (pathToFileURL(process.argv[1]).href === import.meta.url) {
    prepublish();
}