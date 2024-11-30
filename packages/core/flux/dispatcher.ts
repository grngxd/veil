import { log, warn } from "+util";
import store from "../../store";
import { abuseWebpack } from "../webpack/webpack";
import type { DispatcherEvent } from "./types";

let dispatcher: Dispatcher | null = null;
let dispatchBackup: Dispatcher["dispatch"] | null = null;

export type Dispatcher = {
    subscribe: (
        event: DispatcherEvent | `${DispatcherEvent}` | string,
        callback: (data: unknown) => void
    ) => void;
    unsubscribe: (
        event: DispatcherEvent | `${DispatcherEvent}` | string,
        callback: (data: unknown) => void
    ) => void;

    dispatch: (
        action: {
            type: DispatcherEvent | `${DispatcherEvent}` | string;
        } & Record<string, unknown>
    ) => void;
    waitForDispatch: (
        event: DispatcherEvent | `${DispatcherEvent}` | string
    ) => Promise<unknown>;
};

export const getDispatcher = (): Dispatcher | null => {
    if (dispatcher) return dispatcher;

    const foundDispatcher = abuseWebpack((c) => {
        for (const chunk of Object.values(c)) {
            if (chunk.exports?.Z?.flushWaitQueue) {
                return chunk.exports.Z;
            }
        }
    });

    if (!foundDispatcher) {
        throw new Error("Dispatcher not found");
    }

    dispatchBackup = foundDispatcher.dispatch;

    const newDispatch = (
        action: {
            type: DispatcherEvent | `${DispatcherEvent}` | string;
        } & Record<string, unknown>
    ) => {
        if (store.$logFluxDispatches.store.get()) {
            log(action);
        }
        return dispatchBackup?.call(foundDispatcher, action);
    };

    const waitForDispatch = (
        event: DispatcherEvent | `${DispatcherEvent}` | string
    ): Promise<unknown> => {
        return new Promise((resolve) => {
            const callback = (data: unknown) => {
                resolve(data);
                foundDispatcher.unsubscribe(event, callback);
            };
            foundDispatcher.subscribe(event, callback);
        });
    };

    abuseWebpack((c) => {
        for (const chunk of Object.values(c)) {
            if (chunk.exports?.Z?.flushWaitQueue) {
                chunk.exports.Z.dispatch = newDispatch;
                chunk.exports.Z.waitForDispatch = waitForDispatch;
                break;
            }
        }
    });

    dispatcher = foundDispatcher;
    return dispatcher;
};

export const unload = () => {
    if (dispatchBackup) {
        abuseWebpack((c) => {
            for (const chunk of Object.values(c)) {
                if (chunk.exports?.Z?.flushWaitQueue) {
                    chunk.exports.Z.dispatch = dispatchBackup;
                    chunk.exports.Z.waitForDispatch = undefined;
                    break;
                }
            }
        });

        dispatcher = null;
        dispatchBackup = null;
    } else {
        warn("Dispatch method not found, couldn't restore");
    }
};