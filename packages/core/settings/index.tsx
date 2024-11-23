import { getFiberOwner } from "+core/fiber";
import * as r from "+react";
import { renderPreactInReact } from "+react/bridge";
import SettingsPage from "+react/components/pages/SettingsPage";
import { sleep } from "+util";
import type { VNode } from "preact";
import { getDispatcher } from "../flux/dispatcher";
import { abuseWebpack } from "../webpack/webpack";
r;

type CustomElement = {
    section: string;
    searchableTitles?: string[];
    label?: string;
    ariaLabel?: string;
    element?: () => VNode;
};

let SettingsView: any;
let originalGetPredicateSections: any;
let customElements: CustomElement[] = [];

export const addCustomElement = (element: CustomElement) => {
    customElements.push(element);
    rerenderSidebar();
};

export const removeCustomElement = (element: Partial<CustomElement>) => {
    customElements = customElements.filter((e) => {
        for (const key of Object.keys(element) as (keyof CustomElement)[]) {
            if (element[key] !== e[key]) return true;
        }
        return false;
    });
}

export const init = () => {
    getDispatcher()
        .waitForDispatch("USER_SETTINGS_MODAL_OPEN")
        .then(async () => {
            if (!window?.veil) return;
            await sleep(1000); 
            abuseWebpack((c) => {
                for (const chunk of Object.values(c)) {
                    if (chunk.exports?.ZP?.prototype?.getPredicateSections) {
                        SettingsView = chunk.exports.ZP;

                        originalGetPredicateSections = chunk.exports.ZP.prototype.getPredicateSections;

                        chunk.exports.ZP.prototype.getPredicateSections = new Proxy(
                            chunk.exports.ZP.prototype.getPredicateSections,
                            {
                                apply: (target, thisArg, args) => {
                                    const result: any = [...target.apply(thisArg, args)];

                                    let dividerCount = 0;
                                    let insertIndex = result.length;

                                    for (let i = 0; i < result.length; i++) {
                                        const item = result[i];
                                        if (item.section === "DIVIDER") {
                                            dividerCount++;
                                            if (dividerCount === 2) {
                                                insertIndex = i + 1;
                                                break;
                                            }
                                        }
                                    }

                                    if (customElements.length > 0) {
                                        result.splice(insertIndex, 0, ...customElements, {
                                            section: "DIVIDER",
                                        });
                                    }

                                    return result;
                                },
                            }
                        );
                    }
                }
            });

            addCustomElement({
                section: "HEADER",
                searchableTitles: ["veil!!!"],
                label: "veil!!!",
                ariaLabel: "veil!!!",
            });

            addCustomElement({
                element: () => renderPreactInReact(SettingsPage),
                section: "CUSTOM_SECTION",
                searchableTitles: ["veil"],
                label: "veil",
            }); 
        });
};  

function rerenderSidebar() {
    const sidebarParent = document.querySelector(`nav[class^="sidebar"]`);
    getFiberOwner(sidebarParent as Element)?.forceUpdate();
}

export const unload = () => {
    customElements = [];
    rerenderSidebar();
    if (originalGetPredicateSections) {
        abuseWebpack((c) => {
            for (const chunk of Object.values(c)) {
                if (chunk.exports?.ZP?.prototype?.getPredicateSections) {
                    chunk.exports.ZP.prototype.getPredicateSections = originalGetPredicateSections;
                }
            }
        });
    }
};

export default {
    addCustomElement,
};   