import { Fragment, h, hydrate } from 'preact';
import { log } from '../../util';

let settingsContainer: HTMLElement | null;
let settingsSidebar: HTMLElement | null;
let settingsBody: HTMLElement | null;

let observer: MutationObserver;

let render = false;
let dummyElement: HTMLElement;

let tabSelected: string | null = null;

const CustomSettingsTab = () => (
    <>
        <div className="header_a0" tabIndex={-1} role="button">
            <div className="eyebrow_dc00ef headerText_a0" data-text-variant="eyebrow">Veil Settings</div>
        </div>  
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div className="item_a0 themed_a0" role="tab" aria-selected="false" aria-disabled="false" tabIndex={-1} aria-label="Veil Settings" onClick={() => {
        }}>
            Settings
        </div>
        <div className="separator_a0" />
    </>
);

export const init = () => {
    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                
                settingsContainer = document.querySelector("[class^='standardSidebarView_']");
                
                if (settingsContainer) {
                    settingsSidebar = (settingsContainer?.firstElementChild as Element).querySelector("nav")?.firstElementChild as HTMLElement | null;
                    settingsBody = (settingsContainer?.lastElementChild as Element).querySelector("[class^='contentColumn_']") as HTMLElement | null;

                    if (!settingsSidebar || !settingsBody) {
                        return;
                    }

                    // of all the children of the settingsSidebar, find the one that is selected (has class selected_a0)
                    tabSelected = null;
                    for (const child of settingsSidebar.children) {
                        if (child.classList.contains("selected_a0")) {
                            tabSelected = child.getAttribute("aria-label");
                            break;
                        }
                    }

                    log(tabSelected);

                    if (!render) {
                        dummyElement = document.createElement("div");
                        dummyElement.className = "veil-settings-tab";
                        
                        // Find the "Billing" item and the separator after it
                        const billingItem = settingsSidebar.querySelector("[aria-label='Billing']");
                        const separatorAfterBilling = billingItem?.nextElementSibling;

                        if (separatorAfterBilling?.classList.contains("separator_a0")) {
                            settingsSidebar.insertBefore(dummyElement, separatorAfterBilling.nextElementSibling);
                        } else {
                            settingsSidebar.appendChild(dummyElement);
                        }

                        // Hydrate the custom settings tab using Preact
                        hydrate(<CustomSettingsTab />, dummyElement); 

                        render = true;
                    }
                    return;
                }

                render = false;

                if (settingsSidebar?.contains(dummyElement)) {
                    settingsSidebar?.removeChild(dummyElement);
                }

                settingsContainer = null;
                settingsSidebar = null;
                settingsBody = null;
            }
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
};

export const unload = () => {
    observer?.disconnect();
    if (settingsSidebar?.contains(dummyElement)) {
        settingsSidebar?.removeChild(dummyElement);
    }
    settingsContainer = null;
    settingsSidebar = null;
    settingsBody = null;
    render = false; // Reset render to false when unloading
}