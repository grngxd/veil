import type { WebpackModule } from "../webpack/webpack";
import { abuseWebpack } from "../webpack/webpack";

interface IStore {
    events: unknown;
}

interface IUserStore extends IStore {
    getCurrentUser: () => User;
}

type User = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    email: string;
    verified: boolean;
    bot: boolean;
    mfaEnabled: boolean;
    mobile: boolean;
    desktop: boolean;
    flags: number;
    publicFlags: number;
    phone: string;
    nsfwAllowed: boolean;
    globalName: string;
}

type Language = {
    name: string;
    englishName: string;
    code: string;
    enabled: boolean;
}

interface ILanguageStore extends IStore {
    getLanguages: () => Language[];
}

export type AvailableStore = keyof typeof fluxStores;

let fluxStores: {
    UserStore: IUserStore;
    LanguageStore: ILanguageStore;
}

let storesInitialized = false;
export const init = (refresh = false) => {
    if (storesInitialized && !refresh) return fluxStores;
    const chunks = abuseWebpack();

    let UserStore: IUserStore | undefined;
    let LanguageStore: ILanguageStore | undefined;

    for (const [_, chunk] of Object.entries(chunks) as [string, WebpackModule][]) {
        if (chunk.exports?.Z?.getCurrentUser && !UserStore) {
            UserStore = chunk.exports.Z;
        }
        if (chunk.exports?.Z?.getLanguages && !LanguageStore) {
            LanguageStore = chunk.exports.Z;
        }
    }

    fluxStores = {
        UserStore: UserStore as IUserStore,
        LanguageStore: LanguageStore as ILanguageStore,
    }
    
    storesInitialized = true;
    return fluxStores;
}

export const getStore = async <T extends AvailableStore>(store: T): Promise<typeof fluxStores[T]> => {
    return new Promise((res) => {
        const interval = setInterval(() => {
            // make sure the `store` is not null in fluxStores
            if (fluxStores[store]) {
                clearInterval(interval);
                res(fluxStores[store]);
            }
        }, 100);
    });
}

export const getStoreSync = <T extends AvailableStore>(store: T): typeof fluxStores[T] => {
    return fluxStores[store];
}

export const getStores = () => {
    return fluxStores;
}