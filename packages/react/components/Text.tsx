import { css, cx } from "@emotion/css";
// biome-ignore lint/style/useImportType: <explanation>
import { ComponentChildren, h } from "preact";

type TextProps = {
    children: ComponentChildren;
    type?: TextType;
    className?: string;
    style?: string | h.JSX.CSSProperties;
};

export type TextType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

const Text = ({ children, type = "p", style, className }: TextProps) => {
    const Element = type;
    const styling = getStyling(type);
    return (
        <Element className={cx(styling, className)} style={style}>
            {children}
        </Element>
    );
};

export default Text;

const getStyling = (type: TextType) => {
    let styling;
    switch (type) {
        case "h1":
            styling = css({
                fontSize: "1.25rem",
                lineHeight: "1.75rem",
                fontWeight: 600,
            });
            break;
        case "h2":
            styling = css({
                fontSize: "1.125rem",      // 18px
                lineHeight: "1.4rem",
                fontWeight: 500,
            });
            break;
        case "h3":
            styling = css({
                fontSize: "1rem",
                lineHeight: "1.35rem",
                fontWeight: 500,
            });
            break;
        case "h4":
            styling = css({
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
                fontWeight: 500,
            });
            break;
        case "h5":
            styling = css({
                fontSize: "0.75rem",
                lineHeight: "1rem",
                fontWeight: 500,
            });
            break;
        case "h6":
            styling = css({
                fontSize: "0.75rem",
                lineHeight: "1rem",
                fontWeight: 500,
            });
            break;
        case "p":
            styling = css({
                fontSize: "1rem",
                lineHeight: "1.75rem",
                fontWeight: 400,
            });
            break;
        case "span":
            styling = css({
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
                fontWeight: 400,
            });
            break;
        default:
            throw new Error("Invalid type");
    }
    return cx(
        styling,
        css({
            color: "var(--text-normal)",
            margin: "0",
            padding: "0",
        })
    );
};