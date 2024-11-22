import type { Attributes, ComponentType, VNode } from 'preact';
import { h, render } from 'preact';
import { abuseWebpack } from "./webpack/webpack";

// Basic React types
type ReactRef<T> = { current: T | null };
type ReactElement = { type: any, props: any, key: any | null };

interface ReactType {
    useRef<T>(initialValue: T | null): ReactRef<T>;
    useEffect(effect: () => void | (() => void), deps?: any[]): void;
    createElement(type: any, props?: any, ...children: any[]): ReactElement;
    version: string;
}

interface ReactDOMType {
    findDOMNode(element: any): Element | null;
    createPortal(children: any, container: Element): ReactElement;
    render(element: ReactElement, container: Element): void;
    unmountComponentAtNode(container: Element): boolean;
}

export let React: ReactType | undefined = undefined;
export let ReactDOM: ReactDOMType | undefined = undefined;

// Rest of your code remains the same
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
                console.log("Found React:", chunk.exports.version);
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
                console.log("Found ReactDOM");
                ReactDOM = chunk.exports as ReactDOMType;
                return true;
            }
        }
    });
};

try {
    findReact();
    findReactDOM();

    if (!React || !ReactDOM) {
        throw new Error("Failed to find React or ReactDOM");
    }
} catch (err) {
    console.log("veil Error initializing React:", err);
    throw err;
}

export default { React, ReactDOM };

// ----


type PreactBridgeProps<P = {}> = {
    component: ComponentType<P>;
    props?: P;
};

export const PreactInReactBridge = <P extends {} = {}>(props: PreactBridgeProps<P>) => {
    if (!React || !ReactDOM) throw new Error("React or ReactDOM not found");

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!containerRef.current) return;
        // Fix: Add proper type casting and null handling for props
        const componentProps = (props.props || {}) as Attributes & P;
        render(h(props.component, componentProps), containerRef.current);
        return () => {
            if (containerRef.current) {
                render(null, containerRef.current);
            }
        };
    }, [props.component, props.props]);

    return React.createElement('div', {
        ref: containerRef,
        style: { display: 'contents' }
    });
};

export const renderPreactInReact = <P extends {} = {}>(
    component: ComponentType<P>,
    props?: P
): VNode => {
    if (!React || !ReactDOM) throw new Error("React or ReactDOM not found");
    
    return React.createElement(PreactInReactBridge, {
        component,
        props
    });
};