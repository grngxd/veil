
let settingsContainer: HTMLElement | null;
let settingsSidebar: HTMLElement | null;
let settingsBody: HTMLElement | null;

let observer: MutationObserver;

export const init = () => {
    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                settingsContainer = document.querySelector("[class^='standardSidebarView_']");
                
                if (settingsContainer) {
                    settingsSidebar = (settingsContainer?.firstElementChild as Element).querySelector("nav")?.firstElementChild as HTMLElement | null;
                    settingsBody = (settingsContainer?.lastElementChild as Element).querySelector("[class^='contentColumn_']") as HTMLElement | null;
                    return;
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
}