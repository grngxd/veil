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
                    gap: "0.5rem",
                    flexDirection: "column",
                }
            )}>
                {Object.entries(stores).map(([key, nanostore]) => (
                    <div key={key} class={css({
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    })}>
                        <Text type="h2">{
                            key
                            .replace("$", "")
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, str => str.toUpperCase())
                            .trim()
                        }</Text>
  
                        {nanostore.get() === true || nanostore.get() === false ? (
                            // <input
                            //     type="checkbox"
                            //     checked={nanostore.get()}
                            //     onChange={(e) => nanostore.set(Boolean(e.currentTarget.checked))}
                            // />
                            <Toggle
                                checked={nanostore.get()}
                                onChange={(value) => nanostore.set(value)}
                            /> 
                        ) : (
                            // <input
                            //     type="text"
                            //     value={String(nanostore.get())}
                            //     onChange={(e) => nanostore.set(e.currentTarget.value)}
                            // />
                            <TextBox
                                value={String(nanostore.get())}
                                onChange={(value) => nanostore.set(value)}
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