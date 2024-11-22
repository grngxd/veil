import React from 'react';
import { log } from '../../util';
import { abuseWebpack } from '../webpack/webpack';
let originalGetPredicateSections: any;

export const init = () => {
    log("settings init");
    abuseWebpack((c) => {
        for (const chunk of Object.values(c)) {
            if (chunk.exports?.ZP?.prototype?.getPredicateSections) {
                // Store the original function
                originalGetPredicateSections = chunk.exports.ZP.prototype.getPredicateSections;

                // Override the function
                chunk.exports.ZP.prototype.getPredicateSections = new Proxy(chunk.exports.ZP.prototype.getPredicateSections, {
                    apply: (target, thisArg, args) => {
                        const result: any = target.apply(thisArg, args);

                        // Find the index after the second { section: "DIVIDER" }
                        let dividerCount = 0;
                        let insertIndex = result.length; // Default to end of array
                        for (let i = 0; i < result.length; i++) {
                            const item = result[i];
                            if (item.section === "DIVIDER") {
                                dividerCount++;
                                if (dividerCount === 2) {
                                    insertIndex = i + 1; // Insert after the second DIVIDER
                                    break;
                                }
                            }
                        }

                        const customElements = [  
                            {
                                section: 'HEADER',
                                searchableTitles: ['veil!!!'],
                                label: 'veil!!!',
                                ariaLabel: "veil!!!",
                            },
                            {
                                element: () => (
                                    <div>veil!!!</div>
                                ),
                                section: "CUSTOM_SECTION",
                                searchableTitles: ["veil"],
                                label: "veil",
                            },
                            { section: "DIVIDER" },
                        ];

                        // Insert custom elements at the calculated position
                        result.splice(insertIndex, 0, ...customElements);

                        log(result);
                        return result;
                    }
                });
            }
        }
    });
};

export const unload = () => {
    // Reset the prototype to the original function
    abuseWebpack((c) => {
        for (const chunk of Object.values(c)) {
            if (chunk.exports?.ZP?.prototype?.getPredicateSections) {
                if (originalGetPredicateSections) {
                    chunk.exports.ZP.prototype.getPredicateSections = originalGetPredicateSections;
                }
            }
        }
    });
};