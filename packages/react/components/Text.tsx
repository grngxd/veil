import { css } from "@emotion/css";
// biome-ignore lint/style/useImportType: <explanation>
import { ComponentChildren, h } from "preact";

type TextProps = {
    children: ComponentChildren;
    type: TextType;
    className?: string;
    style?: string | h.JSX.CSSProperties;
}

export type TextType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

const Text = ({ children, type = "h1", style, className }: TextProps) => {
    const Element = type;
    const styling = getStyling(type);
    return (
        <Element className={`${styling} ${className}`} style={style}>
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
                fontSize: "20px",
                lineHeight: "24px",
                fontWeight: 600,
            });
            break;
        case "h2":
            styling = css({
                fontSize: "18px",
                lineHeight: "22px",
                fontWeight: 600,
            });
            break;
        case "h3":
            styling = css({
                fontSize: "16px",
                lineHeight: "20px",
                fontWeight: 600,
            });
            break;
        case "h4":
            styling = css({
                fontSize: "14px",
                lineHeight: "18px",
                fontWeight: 600,
            });
            break;
        case "h5":
            styling = css({
                fontSize: "12px",
                lineHeight: "16px",
                fontWeight: 600,
            });
            break;
        case "h6":
            styling = css({
                fontSize: "10px",
                lineHeight: "14px",
                fontWeight: 600,
            });
            break;
        case "p":
            styling = css({
                fontSize: "14px",
                lineHeight: "18px",
                fontWeight: 400,
            });
            break;
        case "span":
            styling = css({
                fontSize: "14px",
                lineHeight: "18px",
                fontWeight: 400,
            });
            break;
        default:
            throw new Error("Invalid type");
    }
    return `${styling} ${css({
        color: "var(--text-normal)",
    })}`;
}; 