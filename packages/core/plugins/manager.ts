import { localStorage } from "+core/electron";
import * as util from "+util";
import { error } from "+util";
import { atom, computed } from "nanostores";

type Plugin = {
    init: () => void;
    unload: () => void;
    metadata: PluginMetadata;
};

type PluginMetadata = {
    name: string;
    description: string;
    id: string;
    enabled: boolean;
};

export const plugins = atom<Map<string, Plugin>>(new Map());
export const enabledPlugins = computed(plugins, (p) =>
    Array.from(p.values()).filter((plugin) => plugin.metadata.enabled)
);

let unsubscribe: () => void;

export const init = async () => {
    try {
        const raw = localStorage.getItem("VEIL_PLUGINS") || "{}";
        const storedPlugins = JSON.parse(raw) as Record<string, PluginMetadata>;

        const pluginPromises = Object.entries(storedPlugins).map(async ([url, metadata]) => {
            const plugin = await add(url, false);
            if (plugin && metadata.enabled) {
                plugin.init();
                updatePluginMetadata(metadata.id, metadata);
            }
        });

        await Promise.all(pluginPromises);

        unsubscribe = plugins.subscribe((currentPlugins) => {
            const metadata = Object.fromEntries(
                Array.from(currentPlugins.entries()).map(([id, plugin]) => [
                    id,
                    plugin.metadata,
                ])
            );
            localStorage.setItem("VEIL_PLUGINS", JSON.stringify(metadata));
        });
    } catch (e) {
        error(['Initialization error:', e]);
    }
};

export const unload = () => {
    if (unsubscribe) unsubscribe();

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
    const trimmedUrl = url.trim().replace(/\/$/, '');
    try { 
        const scriptRes = await util.fetch(`${trimmedUrl}/index.js`);
        const metadataRes = await util.fetch(`${trimmedUrl}/meta.json`);

        if (!scriptRes.ok || !metadataRes.ok) throw new Error(`Failed to fetch plugin from ${trimmedUrl}`);
        
        const code = await scriptRes.text();
        const meta = await metadataRes.json();

        const blob = new Blob([code], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);

        const module = await import(/* webpackIgnore: true */ blobUrl) as Plugin;
        URL.revokeObjectURL(blobUrl);

        if (!module.init || !module.unload) {
            throw new Error(`Plugin at ${trimmedUrl} is missing required methods.`);
        }

        const newPlugin: Plugin = {
            init: module.init,
            unload: module.unload,
            metadata: { ...meta, enabled: true },
        };

        plugins.set(new Map(plugins.get()).set(meta.id, newPlugin));

        if (alsoInit) newPlugin.init();

        return newPlugin;
    } catch (e) {
        error(['Error loading plugin:', e]);
        return null;
    }
};

const updatePluginMetadata = (id: string, metadata: PluginMetadata) => {
    const currentPlugins = plugins.get();
    const plugin = currentPlugins.get(id);
    if (plugin) {
        currentPlugins.set(id, { ...plugin, metadata });
        plugins.set(new Map(currentPlugins));
    }
};