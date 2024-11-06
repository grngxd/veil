import * as util from "../util";
import { log } from "../util";
import * as veil from "../veil";
import * as flux from "./flux";

if (window?.veil?.unload) {
    // unload any previous instance(s) of veil that may still be running
    window.veil.unload();
} 

const initial = performance.now();

flux.stores.init();

// without this seemingly useless line, the dispatcher doesn't work, because the webpack chunk isnt overwritten with our proxy of the dispatcher
flux.dispatcher.getDispatcher();

window.veil = {
    util: util,
    veil: veil,
    flux: flux,
    unload: () => {
        window.veil = null;
        Promise.all([
            flux.dispatcher.unload(),
        ]).then(() => {
            log("veil unloaded.");
        });
    }
};

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);