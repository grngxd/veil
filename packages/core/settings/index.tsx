import { getFiberOwner } from "+core/fiber";
import { renderPreactInReact } from "+react/bridge";
import SettingsPage from "+react/components/pages/SettingsPage";
import { sleep } from "+util";
import * as veil from "+veil";
import type { VNode } from "preact";
import { generate } from "short-uuid";
import { getDispatcher } from "../flux/dispatcher";
import { abuseWebpack } from "../webpack/webpack";
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
    customElements.push({
        ...element,
        section: element.section === "HEADER" ? element.section : `${element.section}-${generate()}`,
    });
    rerenderSidebar();
};

export const removeCustomElement = (element: Partial<CustomElement>) => {
    const index = customElements.findIndex((e) => {
        for (const k in element) {
            const key = k as keyof CustomElement; 
            if (key === "section") {
                if (e.section.startsWith(element.section as string)) {
                    return true;
                }
            } else if (e[key] === element[key]) {
                return true;
            }
        } 
        return false;
    });

    if (index !== -1) {
        customElements.splice(index, 1);
        rerenderSidebar();
    }
};

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
                label: `veil (${veil.version})`,
            }); 

            addCustomElement({
                element: () => renderPreactInReact(SettingsPage),
                section: "veil_settings",
                searchableTitles: ["veil settings", "veil"],
                label: "Settings", 
            }); 

            rerenderSidebar();
        });
};  

function rerenderSidebar() {
    const sidebarParent = document.querySelector(`nav[class^="sidebar"]`);
    getFiberOwner(sidebarParent as Element, true)?.forceUpdate(); 
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
    removeCustomElement,
};   