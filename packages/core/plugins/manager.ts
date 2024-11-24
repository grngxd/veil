import { localStorage } from "+core/electron";
import * as util from "+util";
import { error } from "+util";
import { atom, computed } from "nanostores";

type Plugin = {
    init: () => void;
    unload: () => void;
    metadata?: PluginMetadata;
};

type PluginMetadata = {
    link: string;
    enabled: boolean;
};

export const plugins = atom<Map<string, Plugin>>(new Map());
export const enabledPlugins = computed(plugins, (p) =>
    Array.from(p.values()).filter((plugin) => plugin.metadata?.enabled)
);

let cb: () => void;

export const init = async () => {
    const raw = localStorage.getItem("VEIL_PLUGINS") || "{}";
    const storedPlugins = JSON.parse(raw) as Record<string, PluginMetadata>;

    await Promise.all(
        Object.entries(storedPlugins).map(async ([url, metadata]) => {
            const plugin = await add(url, false);
            if (plugin) {
                if (metadata.enabled) {
                    plugin.init();
                }

                const updatedPlugins = new Map(plugins.get());
                updatedPlugins.set(url, {
                    ...plugin,
                    metadata
                });
                plugins.set(updatedPlugins);
            }
        })
    );

    cb = plugins.subscribe((p) => {
        const metadata = Object.fromEntries(
            Array.from(p.entries()).map(([url, plugin]) => [
                url,
                plugin.metadata
            ])
        );
    
        localStorage.setItem("VEIL_PLUGINS", JSON.stringify(metadata));
    });  
};

export const unload = () => {
    cb();
    
    // biome-ignore lint/complexity/noForEach: <explanation>
        enabledPlugins.get().forEach((plugin) => {
        try {
            plugin.unload();
        } catch (e) {
            error(['Error unloading plugin:', e]);
        }  
    });
}; 

export const add = async (url: string, alsoInit = true): Promise<Plugin | null> => {
    const trimmed = url.trim();
    try {
        const res = await util.fetch(trimmed);
        const code = await res.text();

        const blob = new Blob([code], { type: 'application/javascript' });
        const blobURL = URL.createObjectURL(blob);

        const module = await import(blobURL) as Plugin;

        URL.revokeObjectURL(blobURL);

        if (!module.init || !module.unload) {
            return null;
        }

        const updatedPlugins = new Map(plugins.get());
        updatedPlugins.set(url, {
            init: module.init,
            unload: module.unload,
            metadata: {
                link: url,
                enabled: true
            }
        });

        plugins.set(updatedPlugins);

        if (alsoInit) module.init()

        return {
            init: module.init,
            unload: module.unload
        } as Plugin;
    } catch (e) {
        error(['Error loading plugin module:', e]);
        return null;
    }
};