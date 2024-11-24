import { localStorage } from "+core/electron";
import * as util from "+util";
import { error, warn } from "+util";

type PluginMetadata = {
    link: string;
    enabled: boolean;
};

type Plugin = {
    init: () => void;
    unload: () => void;
};

const pluginManager: PluginMetadata[] = [];
export const loadedPlugins: Map<string, Plugin> = new Map();
const enabledPlugins: Map<string, Plugin> = new Proxy(new Map(), {
    get() {
        const plugins = new Map();
        for (const [link, plugin] of loadedPlugins) {
            if (pluginManager.find(p => p.link === link)?.enabled) {
                plugins.set(link, plugin);
            }
        }
        return plugins;
    }
});

export const init = async () => {
    const raw = localStorage.getItem("VEIL_PLUGINS") || "[]";
    const plugins = JSON.parse(raw) as PluginMetadata[];
    pluginManager.push(...plugins);

    for (const plugin of pluginManager) {
        if (plugin.enabled) {
            try {
                const pluginModule = await loadPlugin(plugin.link);
                if (pluginModule) {
                    pluginModule.init();
                    loadedPlugins.set(plugin.link, pluginModule);
                } else {
                    warn(`Plugin at ${plugin.link} does not export init and unload functions.`);
                }
            } catch (e) {
                error([`Failed to load plugin at ${plugin.link}:`, e]);
            }
        }
    }
};


export const loadPlugin = async (url: string): Promise<Plugin | null> => {
    const trimmed = url.trim();
    try {
        const res = await util.fetch(trimmed);
        const code = await res.text();

        const blob = new Blob([code], { type: 'application/javascript' });
        const blobURL = URL.createObjectURL(blob);

        const module = await import(/* @vite-ignore */ blobURL);

        URL.revokeObjectURL(blobURL);

        if (!module.init || !module.unload) {
            return null;
        }

        module.init();

        loadedPlugins.set(trimmed, module);

        return {
            init: module.init,
            unload: module.unload
        };
    } catch (e) {
        console.error('Error loading plugin module:', e);
        return null;
    }
};

// Example Plugin

// export const init = () => {
//     console.log("Example Plugin Initialized");
// };

// export const unload = () => {
//     console.log("Example Plugin Unloaded");
// };