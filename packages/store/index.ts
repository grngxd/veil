import { type Atom, atom } from 'nanostores';
import { localStorage } from '../core/electron';

interface Stores {
    $logFluxDispatches: Atom<boolean>;
    $anotherStore: Atom<string>;
}

const stores: Stores = {
    $logFluxDispatches: atom<boolean>(false),
    $anotherStore: atom<string>(""),
};

const defaultStores = Object.fromEntries(
    Object.entries(stores).map(([key, store]) => [key, store.get()])
);

export default stores;

const LOCAL_KEY = "VEIL_SETTINGS";

export const load = () => {
    let settings = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");

    if (Object.keys(settings).length === 0) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(defaultStores));
        settings = defaultStores;
    }

    for (const [key, store] of Object.entries(stores)) {
        if (settings[key] !== undefined) {
            store.set(settings[key] as never);
        }
    }
}

export const save = () => {
    const settings = Object.fromEntries(
        Object.entries(stores).map(([key, store]) => [key, store.get()])
    );

    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
}

// Load settings initially
load();

// Subscribe to changes and save them to localStorage
for (const store of Object.values(stores)) {
    store.subscribe(() => {
        save();
    });
}