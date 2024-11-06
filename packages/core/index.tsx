import * as store from "../store";
import * as util from "../util";
import { log, warn } from "../util";
import * as veil from "../veil";
import * as electron from "./electron";
import * as flux from "./flux";
import * as settings from "./settings";

if (window?.veil?.unload) {
    // unload any previous instance(s) of veil that may still be running
    window.veil.unload();
}

const initial = performance.now();

// IMPORTANT!!!: this MUST be called at least once
flux.dispatcher.getDispatcher();

electron.handleStorage();
store.load();

flux.stores.init();

settings.init();

window.veil = {
    util: util,
    veil: veil,
    flux: flux,
    // electron: {
    //     localStorage: localStorage,
    //     sessionStorage: sessionStorage
    // },
    unload: () => {
        // @ts-ignore
        window.veil = null;
        Promise.all([
            flux.dispatcher.unload(),
            settings.unload(),
        ]).then(() => {
            warn("veil unloaded.");
        });
    }
};

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);

flux.dispatcher.getDispatcher().subscribe("VEIL_SETTINGS", (data) => {
    log(["Settings:", data]);
});