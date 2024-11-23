import settings from "+core/settings";
import { renderPreactInReact } from "+react/bridge";
import stores from "+store";
import { css } from "@emotion/css";
import { h } from "preact";
import Button from "../Button";
const SettingsPage = () => {
    return (
        <div class={css(
            {
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }
        )}>
            <h1>Settings</h1>

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
                        width: "100%",
                    })}>
                        <h2>{
                            key
                            .replace("$", "")
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, str => str.toUpperCase())
                            .trim()
                        }</h2>
  
                        {nanostore.get() === true || nanostore.get() === false ? (
                            <input
                                type="checkbox"
                                checked={nanostore.get()}
                                onChange={(e) => nanostore.set(Boolean(e.currentTarget.checked))}
                            />
                        ) : (
                            <input
                                type="text"
                                value={String(nanostore.get())}
                                onChange={(e) => nanostore.set(e.currentTarget.value)}
                            />
                        )}
                    </div>
                ))}

                <Button
                    onClick={() => {
                        settings.addCustomElement({
                            element: () => renderPreactInReact(() => <h1>ohio</h1>),
                            section: "skibidi",
                            searchableTitles: ["skibidi"],
                            label: "skibidi",
                        });
                    }}
                >
                    test
                </Button>
            </div>
        </div>
    );
}

export default SettingsPage; 