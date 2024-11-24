import settings from "+core/settings";
import { renderPreactInReact } from "+react/bridge";
import stores from "+store";
import { css } from "@emotion/css";
import { h } from "preact";
import { generate } from "short-uuid";
import Button from "../Button";
import Text from "../Text";
import TextBox from "../TextBox";
import Toggle from "../Toggle";
const SettingsPage = () => {
    return (
        <div class={css(
            {
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }
        )}>
            <Text type="h1">Settings</Text>

            <div class={css(
                {
                    display: "flex",
                    gap: "0.75rem",
                    flexDirection: "column",
                }
            )}> 
                {Object.entries(stores).map(([key, { friendlyName, description, store }]) => (
                    <div key={key} class={css({
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    })}>
                        <div
                        class={css({
                            display: "flex",
                            flexDirection: "column",
                        })}
                        >
                            <Text type="h2">
                                {friendlyName}
                            </Text>
                            <Text className={css({
                                color: "var(--text-muted)",
                            })}>
                                {description}
                            </Text>
                        </div>
  
                        {store.get() === true || store.get() === false ? (
                            // <input
                            //     type="checkbox"
                            //     checked={store.get()}
                            //     onChange={(e) => store.set(Boolean(e.currentTarget.checked))}
                            // />
                            <Toggle
                                checked={store.get()}
                                onChange={(value) => store.set(value)}
                            /> 
                        ) : (
                            // <input
                            //     type="text"
                            //     value={String(store.get())}
                            //     onChange={(e) => store.set(e.currentTarget.value)}
                            // />
                            <TextBox
                                value={String(store.get())}
                                onChange={(value) => store.set(value)}
                            /> 
                        )}
                    </div>
                ))}

                <Button
                    onClick={() => {
                        settings.addCustomElement({
                            element: () => renderPreactInReact(() => <Text type="h1">skibidi id: {generate()}</Text>),
                            section: "skibidi",
                            searchableTitles: ["skibidi"],
                            label: "skibidi",
                        }); 
                    }}
                >
                    test
                </Button>

                <Button
                    onClick={() => {
                        settings.removeCustomElement({
                            label: "skibidi",
                        });
                    }}
                    colour={"red"}
                >  
                    remove
                </Button>
            </div>
        </div>
    );
}

export default SettingsPage; 