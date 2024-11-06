import * as store from "../store";
import * as util from "../util";
import { log, warn } from "../util";
import * as veil from "../veil";
import * as electron from "./electron";
import * as flux from "./flux";

if (window?.veil?.unload) {
    // unload any previous instance(s) of veil that may still be running
    window.veil.unload();
}

electron.handleStorage();
store.load();

const initial = performance.now();

flux.stores.init();

// IMPORTANT!!!: this MUST be called at least once
flux.dispatcher.getDispatcher();

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
        ]).then(() => {
            warn("veil unloaded.");
        });
    }
};

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);