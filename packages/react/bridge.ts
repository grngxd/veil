import { React, ReactDOM } from "+react";
import { type Attributes, type ComponentType, type VNode, h, render } from "preact";


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