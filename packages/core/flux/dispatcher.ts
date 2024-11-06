// stolen from shelter (im)

import { abuseWebpack } from "../webpack/webpack";

// @ts-ignore
let dispatcher: Dispatcher;

export enum DispatcherEvent {
  MESSAGE_CREATE = "MESSAGE_CREATE",
  MESSAGE_DELETE = "MESSAGE_DELETE"
}


// dispatcher.dispatch({ type: "SAY_HI", name: "shelter user" }); // Hello, shelter user
// dispatcher.dispatch({ type: "SAY_HI", name: "Rin" });          // Hello, Rin

type Dispatcher = {
  subscribe: (event: DispatcherEvent | `${DispatcherEvent}`, callback: (data: unknown) => void) => void;
  dispatch: (action: { type: DispatcherEvent | `${DispatcherEvent}` } & Record<string, unknown>) => void;
}

export const getDispatcher = () => {
  if (dispatcher) return dispatcher

  dispatcher = abuseWebpack((c) => {
    for (const [_, chunk] of Object.entries(c)) {
        if (chunk.exports?.Z?.flushWaitQueue) {
            return chunk.exports.Z;
        }
    }
  });

  return dispatcher;
}