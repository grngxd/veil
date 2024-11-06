import { log } from "../../util";
import { abuseWebpack } from "../webpack/webpack";

// @ts-ignore
let dispatcher: Dispatcher;
let dispatcherBackup: Dispatcher;

export enum DispatcherEvent {
  MESSAGE_CREATE = "MESSAGE_CREATE",
  MESSAGE_DELETE = "MESSAGE_DELETE",
  MESSAGE_UPDATE = "MESSAGE_UPDATE",
  WINDOW_FOCUS = "WINDOW_FOCUS"
}

type Dispatcher = {
  subscribe: (event: DispatcherEvent | `${DispatcherEvent}` | (string & {}), callback: (data: unknown) => void) => void;
  dispatch: (action: { type: DispatcherEvent | `${DispatcherEvent}` | (string & {}) } & Record<string, unknown>) => void;
}

const logAllDispatches = true;

export const getDispatcher = () => {
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

  dispatcherBackup = foundDispatcher;

  const dispatcherProxy = new Proxy(foundDispatcher, {
    get(target, prop, receiver) {
      if (prop === "dispatch" && logAllDispatches) {
        return (action: { type: DispatcherEvent | `${DispatcherEvent}` | (string & {}) } & Record<string, unknown>) => {
          log(action);
          return Reflect.get(target, prop, receiver).call(target, action);
        };
      }

      return Reflect.get(target, prop, receiver);
    }
  });

  abuseWebpack((c) => {
    for (const chunk of Object.values(c)) {
      if (chunk.exports?.Z?.flushWaitQueue) {
        chunk.exports.Z = dispatcherProxy;
        break;
      }
    }
  });

  dispatcher = dispatcherProxy;
  return dispatcherProxy;
}

export const unload = () => {
  if (dispatcherBackup) {
    abuseWebpack((c) => {
      for (const chunk of Object.values(c)) {
        if (chunk.exports?.Z?.flushWaitQueue) {
          chunk.exports.Z = dispatcherBackup;
          break;
        }
      }
    });

    dispatcher = dispatcherBackup;
  }
};