import { localStorage } from "+core/electron";
import * as util from "+util";
import { error } from "+util";
import { atom, computed } from "nanostores";

export type Plugin = {
    init: () => void;
    unload: () => void;
    metadata: PluginMetadata;
};

type PluginMetadata = {
    name: string;
    description: string;
    id: string;
    enabled: boolean;
    url: string;
    hash: string;
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

        const pluginPromises = Object.entries(storedPlugins).map(async ([id, metadata]) => {
            const plugin = await add(metadata.url, false);
            if (plugin) {
                plugin.metadata.enabled = metadata.enabled;
                if (metadata.enabled) {
                    plugin.init();
                }
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

const hashCode = async (code: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export const add = async (url: string, alsoInit = true): Promise<Plugin | null> => {
    const trimmedUrl = url.trim().replace(/\/$/, '');
    try { 
        const scriptRes = await util.fetch(`${trimmedUrl}/index.js`);
        const metadataRes = await util.fetch(`${trimmedUrl}/meta.json`);

        if (!scriptRes.ok || !metadataRes.ok) throw new Error(`Failed to fetch plugin from ${trimmedUrl}`);
        
        const code = await scriptRes.text();
        const meta = await metadataRes.json();
        const newHash = await hashCode(code);

        const existingPlugin = plugins.get().get(meta.id);
        if (existingPlugin) {
            if (existingPlugin.metadata.hash !== newHash) {
                const confirmUpdate = confirm(`The plugin at ${trimmedUrl} has been updated. Do you want to allow the updated code?`);
                if (!confirmUpdate) {
                    meta.enabled = false;
                    return null;
                }
            } else {
                return existingPlugin;
            }
        }  

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
            metadata: { ...meta, enabled: meta.enabled ?? true, url: trimmedUrl, hash: newHash },
        };

        plugins.set(new Map(plugins.get()).set(meta.id, newPlugin));

        if (alsoInit && newPlugin.metadata.enabled) newPlugin.init();

        return newPlugin;
    } catch (e) {
        error(['Error loading plugin:', e]);
        return null;
    }
};

export const remove = (id: string) => {
    const currentPlugins = plugins.get();
    const plugin = currentPlugins.get(id);
    if (plugin) {
        plugin.unload();
        currentPlugins.delete(id);
        plugins.set(new Map(currentPlugins));
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

export const setPluginEnabled = (id: string, enabled: boolean) => {
    const currentPlugins = plugins.get();
    const plugin = currentPlugins.get(id);
    if (plugin) {
        plugin.metadata.enabled = enabled;
        currentPlugins.set(id, plugin);
        plugins.set(new Map(currentPlugins));

        if (enabled) plugin.init();
        else plugin.unload();
    }
};

const togglePluginEnabled = (id: string) => {
    const currentPlugins = plugins.get();
    const plugin = currentPlugins.get(id);
    if (plugin) setPluginEnabled(id, !plugin.metadata.enabled);
};