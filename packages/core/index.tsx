import * as util from "../util";
import { log } from "../util";
import * as veil from "../veil";
import * as flux from "./flux";

const initial = performance.now();

flux.stores.init();

window.veil = {
    util: util,
    veil: veil,
    flux: flux,
};

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);