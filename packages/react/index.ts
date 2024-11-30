import { log } from '+util';
import { abuseWebpack } from "../core/webpack/webpack";

// Basic React types
export type ReactRef<T> = { current: T | null };
export type ReactElement = { type: any, props: any, key: any | null };

export interface ReactType {
    useRef<T>(initialValue: T | null): ReactRef<T>;
    useEffect(effect: () => void | (() => void), deps?: any[]): void;
    createElement(type: any, props?: any, ...children: any[]): ReactElement;
    version: string;
}

export interface ReactDOMType {
    findDOMNode(element: any): Element | null;
    createPortal(children: any, container: Element): ReactElement;
    render(element: ReactElement, container: Element): void;
    unmountComponentAtNode(container: Element): boolean;
}

export let React: ReactType | undefined = undefined;
export let ReactDOM: ReactDOMType | undefined = undefined;

const findReact = () => {
    abuseWebpack((c) => {
        for (const chunk of Object.values(c)) {
            if (
                chunk.exports?.useId &&
                chunk.exports?.createElement &&
                chunk.exports?.useState &&
                chunk.exports?.useEffect &&
                chunk.exports?.version
            ) {
                React = chunk.exports as ReactType;
                return true;
            }
        } 
    });
};

const findReactDOM = () => {
    abuseWebpack((c) => {
        for (const chunk of Object.values(c)) {
            if (
                chunk.exports?.findDOMNode &&
                chunk.exports?.createPortal &&
                chunk.exports?.render &&
                chunk.exports?.unmountComponentAtNode
            ) {
                ReactDOM = chunk.exports as ReactDOMType;
                return true;
            }
        }
    });
};

export const init = () => {
    try {
        findReact();
        findReactDOM();
    
        if (!React && !ReactDOM) {
            throw new Error("Failed to find React and ReactDOM");
        } 
    
        if (!React) {
            throw new Error("Failed to find React");
        }
    
        if (!ReactDOM) {
            throw new Error("Failed to find ReactDOM");
        }
    
    } catch (err) {
        log(["Error initializing React:", err]);
        throw err;
    }
}

export default { React, ReactDOM };