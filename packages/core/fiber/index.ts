declare global {
    interface Element {
        [f: `__reactFiber$${string}`]: Fiber;
    }
}

type Fiber = {
    type: string;
    stateNode?: any;
    return?: Fiber;
    child?: Fiber;
    sibling?: Fiber;
    pendingProps?: any;
};

type FiberOwner = {
    stateNode: any;
    forceUpdate: () => void;
    props: any;
};

const fiberCache: Map<Element, Fiber> = new Map();

// thanks to yellowsink for most this
export const getFiber = (e: Element, refresh = false): Fiber | undefined => {
    if (fiberCache.has(e) && !refresh) return fiberCache.get(e);

    const fiberEntry = Object.entries(e).find(([key]) => key.startsWith("__reactFiber$"));
    fiberEntry ? fiberCache.set(e, fiberEntry[1]) : undefined;
    
    return fiberEntry ? fiberEntry[1] : undefined;
}

const fiberOwnerCache: Map<Element | Fiber, FiberOwner> = new Map();

export const getFiberOwner = (n: Element | Fiber, refresh = false): FiberOwner | undefined | null => {
    if (fiberOwnerCache.has(n) && !refresh) return fiberOwnerCache.get(n);

    const filter = ({ stateNode }: Fiber) => stateNode && !(stateNode instanceof Element);
    const fiber = n instanceof Element ? getFiber(n, refresh) : n;

    if (!fiber) return undefined;

    const ownerFiber = reactFiberWalker(fiber, filter, true, false, 100);
    const owner = ownerFiber?.stateNode as FiberOwner | undefined | null;

    if (owner) {
        fiberOwnerCache.set(n, owner);
    }

    return owner;
};

export function reactFiberWalker(
    node: Fiber,
    filter: string | symbol | ((node: Fiber) => boolean),
    goUp = false,
    ignoreStringType = false,
    recursionLimit = 100,
): Fiber | undefined | null {
    if (recursionLimit === 0) return undefined;

    if (typeof filter !== "function") {
        const prop = filter;
        filter = (n: Fiber) => n?.pendingProps?.[prop] !== undefined;
    }

    if (!node) return undefined;
    if (filter(node) && (ignoreStringType ? typeof node.type !== "string" : true)) return node;

    const nextNode = goUp ? node.return : node.child;
    if (nextNode) {
        const result = reactFiberWalker(nextNode, filter, goUp, ignoreStringType, recursionLimit - 1);
        if (result) return result;
    }

    if (node.sibling) {
        const result = reactFiberWalker(node.sibling, filter, goUp, ignoreStringType, recursionLimit - 1);
        if (result) return result;
    }

    return undefined;
}