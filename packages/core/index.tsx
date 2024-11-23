import * as react from "+react";
import components from "+react/components";
import * as util from "+util";
import { log, warn } from "+util";
import * as preact from "preact";
import * as store from "../store";
import * as veil from "../veil";
import * as electron from "./electron";
import * as flux from "./flux";
import * as settings from "./settings";
while (window.veil?.unload) {
    window.veil?.unload();
}
 
const initial = performance.now();

// IMPORTANT!!!: this MUST be called at least once
flux.dispatcher.getDispatcher();
 
electron.handleStorage();
store.load();

flux.stores.init();

react.init();

settings.init();                                                             

window.veil = {
    util: util, 
    veil: veil,
    flux: flux,
    settings: settings,
    ui: {
        preact,
        react: react.React,
        reactDOM: react.ReactDOM, 
        components
    },  
    // electron: {
    //     localStorage: localStorage,
    //     sessionStorage: sessionStorage
    // },
    unload: () => { 
        // @ts-ignore
        window.veil = null;
        Promise.all([ 
            settings.unload(), 
            electron.unloadStorage()
        ]).then(() => {
            flux.dispatcher.unload();
            warn("veil unloaded.");
        });
    }
}; 

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);

flux.dispatcher.getDispatcher().subscribe("VEIL_SETTINGS", (data) => {
    log(["Settings:", data]);
});