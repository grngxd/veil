import { type Atom, atom } from 'nanostores';
import { localStorage } from '../core/electron';

interface StoreConfig<T> {
    friendlyName: string;
    description: string;
    store: Atom<T>;
}

interface Stores {
    $logFluxDispatches: StoreConfig<boolean>;
    $anotherStore: StoreConfig<string>;
}

const stores: Stores = {
    $logFluxDispatches: {
        friendlyName: "Log Flux Dispatches",
        description: "Logs all flux dispatches to the console (will flood your console)",
        store: atom<boolean>(false),
    },
    $anotherStore: {
        friendlyName: "Another Store",
        description: "another store",
        store: atom<string>(""),
    },
};

const defaultStores = Object.fromEntries(
    Object.entries(stores).map(([key, config]) => [key, config.store.get()])
);

export default stores;

const LOCAL_KEY = "VEIL_SETTINGS";

export const load = () => {
    let settings = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");

    if (Object.keys(settings).length === 0) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(defaultStores));
        settings = defaultStores;
    }

    for (const [key, config] of Object.entries(stores)) {
        if (settings[key] !== undefined) {
            config.store.set(settings[key] as never);
        }
    }
}

export const save = () => {
    const settings = Object.fromEntries(
        Object.entries(stores).map(([key, config]) => [key, config.store.get()])
    );

    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
}

// Load settings initially
load();

// Subscribe to changes and save them to localStorage
for (const config of Object.values(stores)) {
    config.store.subscribe(() => {
        save();
    });
}