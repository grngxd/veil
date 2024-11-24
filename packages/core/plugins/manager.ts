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

let unsubscribe: () => void;

export const init = async () => {
    try {
        const raw = localStorage.getItem("VEIL_PLUGINS") || "{}";
        const storedPlugins = JSON.parse(raw) as Record<string, PluginMetadata>;

        const pluginPromises = Object.entries(storedPlugins).map(async ([url, metadata]) => {
            const plugin = await add(url, false);
            if (plugin && metadata.enabled) {
                plugin.init();
                updatePluginMetadata(url, metadata);
            }
        });

        await Promise.all(pluginPromises);

        unsubscribe = plugins.subscribe((currentPlugins) => {
            const metadata = Object.fromEntries(
                Array.from(currentPlugins.entries()).map(([url, plugin]) => [
                    url,
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
    const trimmedUrl = url.trim();
    try {
        const response = await util.fetch(trimmedUrl);
        if (!response.ok) throw new Error(`Failed to fetch plugin from ${trimmedUrl}`);

        const code = await response.text();
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
            metadata: { link: trimmedUrl, enabled: true },
        };

        plugins.set(new Map(plugins.get()).set(trimmedUrl, newPlugin));

        if (alsoInit) newPlugin.init();

        return newPlugin;
    } catch (e) {
        error(['Error loading plugin:', e]);
        return null;
    }
};

const updatePluginMetadata = (url: string, metadata: PluginMetadata) => {
    const currentPlugins = plugins.get();
    const plugin = currentPlugins.get(url);
    if (plugin) {
        currentPlugins.set(url, { ...plugin, metadata });
        plugins.set(new Map(currentPlugins));
    }
};