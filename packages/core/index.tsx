import * as react from "+react";
import * as bridge from "+react/bridge";
import components from "+react/components";
import * as util from "+util";
import { log, warn } from "+util";
import * as preact from "preact";
import * as store from "../store";
import * as veil from "../veil";
import * as electron from "./electron";
import * as flux from "./flux";
import * as plugins from "./plugins";
import * as settings from "./settings";

while (window.veil?.unload) {
    window.veil?.unload();
}
 
const initial = performance.now();

const enableDevtoolsCheck = util.disableDevtoolsCheck();

// render without reactivity <meta http-equiv="Content-Security-Policy" content="connect-src 'self'" />
const meta = document.createElement("meta");
meta.httpEquiv = "Content-Security-Policy";
// allow all connections
meta.content = "connect-src *";
document.head.appendChild(meta); 

// IMPORTANT!!!: this MUST be called at least once
flux.dispatcher.getDispatcher();
 
electron.handleStorage();
store.load();

flux.stores.init();

react.init();

settings.init();      

plugins.init();

const v = {
    util: util, 
    veil: veil,
    flux: flux,
    settings: settings,
    plugins: {
        add: plugins.add,
        plugins: plugins.plugins,
    },
    ui: {
        preact,
        react: react.React,
        bridge,
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

        if (enableDevtoolsCheck) enableDevtoolsCheck();
        
        plugins.unload(); 

        Promise.all([ 
            flux.dispatcher.unload(),
            settings.unload(), 
            electron.unloadStorage()
        ]).then(() => {
            warn("veil unloaded.");
        });
    }
};

window.veil = v;
export type Veil = typeof v;

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);
alert("veil loaded!");