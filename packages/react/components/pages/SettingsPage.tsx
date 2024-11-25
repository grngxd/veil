import type { Plugin } from "+core/plugins";
import * as plugins from "+core/plugins";
import settings from "+core/settings";
import { renderPreactInReact } from "+react/bridge";
import stores from "+store";
import { css } from "@emotion/css";
import { useStore } from '@nanostores/preact';
import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { generate } from "short-uuid";
import Button from "../Button";
import Text from "../Text";
import TextBox from "../TextBox";
import Toggle from "../Toggle";

const PluginItem = ({ plugin }: { plugin: Plugin }) => {
    return (
        <div
            class={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                border: "1px solid var(--background-modifier-accent)",
                borderRadius: "0.5rem",
            })}
        >
            <div
                class={css({
                    display: "flex",
                    flexDirection: "column",
                })}
            >
                <Text type="h3">{plugin.metadata.name}</Text>
                <Text
                    className={css({
                        color: "var(--text-muted)",
                    })}
                >
                    {plugin.metadata.id}
                </Text>
                <Text
                    className={css({
                        color: "var(--text-muted)",
                    })}
                >
                    {plugin.metadata.description}
                </Text>
            </div>
            <div
                class={css({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "0.375rem",
                })}
            >
                <Toggle
                    checked={plugin.metadata.enabled}
                    onChange={(value) => {
                        plugins.setPluginEnabled(plugin.metadata.id, value);
                        plugins.plugins.set(new Map(plugins.plugins.get()));
                    }}
                />
                <Button
                    colour="red"
                    onClick={() => {
                        plugins.remove(plugin.metadata.id);
                    }}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
};

const PluginList = ({ plugins }: { plugins: Plugin[] }) => {
    return (
        <div
            class={css({
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
            })}
        >
            <Text type="h2">Plugins</Text>
            {plugins.length === 0 && (
                <>
                    <Text type="h3">No plugins installed...</Text>
                    <Text
                        className={css({
                            color: "var(--text-muted)",
                        })}
                    >
                        Add a plugin by providing the URL to the plugin's JavaScript file. The plugin will be loaded and
                        executed in the client.
                    </Text>
                </>
            )}
            {plugins.map((plugin) => (
                <PluginItem key={plugin.metadata.id} plugin={plugin} />
            ))}
        </div>
    );
};

const SettingsPage = () => {
    const [link, setLink] = useState("");
    const pluginStore = useStore(plugins.plugins);

    return (
        <div
            class={css({
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            })}
        >
            <Text type="h1">Settings</Text>

            <div
                class={css({
                    display: "flex",
                    gap: "0.75rem",
                    flexDirection: "column",
                })}
            >
                {Object.entries(stores).map(([key, { friendlyName, description, store }]) => (
                    <div
                        key={key}
                        class={css({
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                        })}
                    >
                        <div
                            class={css({
                                display: "flex",
                                flexDirection: "column",
                            })}
                        >
                            <Text type="h2">{friendlyName}</Text>
                            <Text
                                className={css({
                                    color: "var(--text-muted)",
                                })}
                            >
                                {description}
                            </Text>
                        </div>

                        {typeof store.get() === "boolean" ? (
                            <Toggle
                                checked={store.get()}
                                onChange={(value) => store.set(value)}
                            />
                        ) : (
                            <TextBox
                                value={String(store.get())}
                                onChange={(v) => setLink(v)}
                            />
                        )}
                    </div>
                ))}

                <Button
                    onClick={() => {
                        settings.addCustomElement({
                            element: () =>
                                renderPreactInReact(() => <Text type="h1">skibidi id: {generate()}</Text>),
                            section: "skibidi",
                            searchableTitles: ["skibidi"],
                            label: "skibidi",
                        });
                    }}
                >
                    Test
                </Button>

                <Button
                    onClick={() => {
                        settings.removeCustomElement({
                            label: "skibidi",
                        });
                    }}
                    colour={"red"}
                >
                    Remove
                </Button>

                <div
                    class={css({
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                    })}
                >
                    <Text type="h2">Add Plugin</Text>
                    <Text
                        className={css({
                            color: "var(--text-muted)",
                        })}
                    >
                        Add a plugin by providing the URL to the plugin's JavaScript file. The plugin will be loaded and
                        executed in the client.
                    </Text>
                </div>

                <div
                    class={css({
                        display: "flex",
                        gap: "1rem",
                    })}
                >
                    <TextBox
                        placeholder="https://grngxd.github.io/veil-plugins/example"
                        className={css({
                            flex: 0.9,
                        })}
                        value={link}
                        onChange={(v) => setLink(v)}
                    />

                    <Button
                        onClick={() => {
                            if (link.trim() === "") return;
                            plugins.add(link.trim());
                            setLink("");
                        }}
                        className={css({
                            flex: 0.1,
                        })}
                    >
                        Add
                    </Button>
                </div>

                <PluginList plugins={Array.from(pluginStore.values())} />
            </div>
        </div>
    );
};

export default SettingsPage;