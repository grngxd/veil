import { atom } from 'nanostores';
import { localStorage } from '../core/electron';

const stores = {
    $logFluxDispatches: atom(false),
};

const defaultStores = Object.fromEntries(
    Object.entries(stores).map(([key, store]) => [key, store.get()])
);

export default stores;

export const load = () => {
    let settings = JSON.parse(localStorage.getItem("__veil_settings") || "{}");

    if (Object.keys(settings).length === 0) {
        localStorage.setItem("__veil_settings", JSON.stringify(defaultStores));
        settings = defaultStores;
    }

    for (const [key, store] of Object.entries(stores)) {
        if (settings[key] !== undefined) {
            store.set(settings[key]);
        }
    }
}

export const save = () => {
    const settings = Object.fromEntries(
        Object.entries(stores).map(([key, store]) => [key, store.get()])
    );

    localStorage.setItem("__veil_settings", JSON.stringify(settings));
}

// Load settings initially
load();

// Subscribe to changes and save them to localStorage
for (const [key, store] of Object.entries(stores)) {
    store.subscribe(() => {
        save();
    });
}