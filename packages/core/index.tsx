import { h, render } from 'preact';
import * as util from "../util";
import { log } from "../util";
import * as veil from "../veil";

const initial = performance.now();
const veilRoot = document.createElement('div');

veilRoot.id = 'veil-root';
document.body.appendChild(veilRoot);


const Foo = () => <div>foo</div>;
render(<Foo />, veilRoot);


window.veil = {
    "util": util,
    "veil": veil
}

log(`veil loaded in ${(performance.now() - initial).toFixed(1)}ms!`);

document.addEventListener("DOMContentLoaded", () => {
    log("DOMContentLoaded fired!");
})