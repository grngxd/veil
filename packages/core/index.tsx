import * as util from "../util";
import { log } from "../util";
import * as veil from "../veil";
import * as flux from "./flux";

const initial = performance.now();

// const veilRoot = document.createElement('div');

// veilRoot.id = 'veil-root';
// document.body.appendChild(veilRoot);

// const Foo = () => <div>foo</div>;
// render(<Foo />, veilRoot);

// flux.dispatcher.getDispatcher().subscribe("MESSAGE_DELETE", (data) => {
//     log(data);
// });

flux.stores.init();

log(flux.dispatcher.getDispatcher());
log(flux.stores.getStoreSync("LanguageStore").getLanguages());

window.veil = {
    util: util,
    veil: veil,
    flux: flux,
};

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);