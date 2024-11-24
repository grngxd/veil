import { log, warn } from "+util";
import store from "../../store";
import { abuseWebpack } from "../webpack/webpack";

let dispatcher: Dispatcher | null = null;
let dispatchBackup: Dispatcher["dispatch"] | null = null;

type Dispatcher = {
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

export enum DispatcherEvent {
    ACTIVITY_CREATE = "ACTIVITY_CREATE",
    ACTIVITY_DELETE = "ACTIVITY_DELETE",
    ACTIVITY_EMBED_COMPLETE = "ACTIVITY_EMBED_COMPLETE",
    ACTIVITY_FETCH_INVITE = "ACTIVITY_FETCH_INVITE",
    ACTIVITY_FETCH_JOIN_TICKET = "ACTIVITY_FETCH_JOIN_TICKET",
    ACTIVITY_INVITE_BROWSER_CLOSED = "ACTIVITY_INVITE_BROWSER_CLOSED",
    ACTIVITY_INVITE_BROWSER_UPDATED = "ACTIVITY_INVITE_BROWSER_UPDATED",
    ACTIVITY_INVITE_VIEW_HOVER = "ACTIVITY_INVITE_VIEW_HOVER",
    ACTIVITY_JOIN = "ACTIVITY_JOIN",
    ACTIVITY_JOIN_INVITE = "ACTIVITY_JOIN_INVITE",
    ACTIVITY_JOIN_REQUEST_APPROVE = "ACTIVITY_JOIN_REQUEST_APPROVE",
    ACTIVITY_JOIN_REQUEST_REJECT = "ACTIVITY_JOIN_REQUEST_REJECT",
    ACTIVITY_JOIN_REQUEST_UPDATE = "ACTIVITY_JOIN_REQUEST_UPDATE",
    ACTIVITY_JOIN_WITH_TICKET = "ACTIVITY_JOIN_WITH_TICKET",
    ACTIVITY_LEAVE = "ACTIVITY_LEAVE",
    ACTIVITY_MODAL_HIDE = "ACTIVITY_MODAL_HIDE",
    ACTIVITY_MODAL_SHOW = "ACTIVITY_MODAL_SHOW",
    ACTIVITY_REQUEST_TO_JOIN = "ACTIVITY_REQUEST_TO_JOIN",
    ACTIVITY_SET = "ACTIVITY_SET",
    ACTIVITY_USER_ACTION = "ACTIVITY_USER_ACTION",
    ACTIVITY_USER_ACTION_DISMISS = "ACTIVITY_USER_ACTION_DISMISS",
    APPLICATION_COMMAND_AUTO_COMPLETE = "APPLICATION_COMMAND_AUTO_COMPLETE",
    APPLICATION_COMMAND_SELECT = "APPLICATION_COMMAND_SELECT",
    APPLICATION_CREATE = "APPLICATION_CREATE",
    APPLICATION_DELETE = "APPLICATION_DELETE",
    APPLICATION_FAVORITE = "APPLICATION_FAVORITE",
    APPLICATION_SEARCH_RESULT = "APPLICATION_SEARCH_RESULT",
    APPLICATION_SELECT = "APPLICATION_SELECT",
    APPLICATION_UPDATE = "APPLICATION_UPDATE",
    APPLICATION_UPDATE_FAVORITE = "APPLICATION_UPDATE_FAVORITE",
    APPLICATIONS_ALL_FETCH = "APPLICATIONS_ALL_FETCH",
    APPLICATIONS_FETCH = "APPLICATIONS_FETCH",
    APPLICATIONS_SET_INITIAL_STATE = "APPLICATIONS_SET_INITIAL_STATE",
    AUDIT_LOG_ENTRY_CREATE = "AUDIT_LOG_ENTRY_CREATE",
    AUTO_PLAY_VIDEO_SET = "AUTO_PLAY_VIDEO_SET",
    AVATAR_UPDATE = "AVATAR_UPDATE",
    BANNER_UPDATE = "BANNER_UPDATE",
    BILLING_SETTINGS_FETCH = "BILLING_SETTINGS_FETCH",
    BILLING_SETTINGS_UPDATE = "BILLING_SETTINGS_UPDATE",
    BROWSER_WINDOW_FOCUS = "BROWSER_WINDOW_FOCUS",
    BROWSER_WINDOW_FOCUS_UPDATE = "BROWSER_WINDOW_FOCUS_UPDATE",
    CHANNEL_CREATE = "CHANNEL_CREATE",
    CHANNEL_DELETE = "CHANNEL_DELETE",
    CHANNEL_FEATURES_UPDATE = "CHANNEL_FEATURES_UPDATE",
    CHANNEL_INIT = "CHANNEL_INIT",
    CHANNEL_MEMBERSHIP_GATED_ACCESS_BLOCK = "CHANNEL_MEMBERSHIP_GATED_ACCESS_BLOCK",
    CHANNEL_MEMBERSHIP_GATED_ACCESS_GRANT = "CHANNEL_MEMBERSHIP_GATED_ACCESS_GRANT",
    CHANNEL_MEMBERSHIP_GATED_ACCESS_REQUEST = "CHANNEL_MEMBERSHIP_GATED_ACCESS_REQUEST",
    CHANNEL_MEMBERSHIP_GATED_ACCESS_REVOKE = "CHANNEL_MEMBERSHIP_GATED_ACCESS_REVOKE",
    CHANNEL_MESSAGE_CREATE = "CHANNEL_MESSAGE_CREATE",
    CHANNEL_MESSAGE_DELETE = "CHANNEL_MESSAGE_DELETE",
    CHANNEL_MESSAGE_EDIT = "CHANNEL_MESSAGE_EDIT",
    CHANNEL_UPDATE = "CHANNEL_UPDATE",
    CHAT_INPUT_PLACEHOLDER_UPDATE = "CHAT_INPUT_PLACEHOLDER_UPDATE",
    CHAT_INPUT_TYPING_START = "CHAT_INPUT_TYPING_START",
    CHAT_INPUT_TYPING_STOP = "CHAT_INPUT_TYPING_STOP",
    COLOR_SCHEME_SET = "COLOR_SCHEME_SET",
    CONNECTION_REMOVE = "CONNECTION_REMOVE",
    CONNECTION_UPDATE = "CONNECTION_UPDATE",
    CONNECTED_ACCOUNT_ADDED = "CONNECTED_ACCOUNT_ADDED",
    CONNECTED_ACCOUNT_REMOVE = "CONNECTED_ACCOUNT_REMOVE",
    CONNECTED_ACCOUNT_UPDATE = "CONNECTED_ACCOUNT_UPDATE",
    DISPATCHER_ACTION = "DISPATCHER_ACTION",
    DISPATCHER_ACTION_CREATE = "DISPATCHER_ACTION_CREATE",
    DISPATCHER_ACTION_DELETE = "DISPATCHER_ACTION_DELETE",
    DISPATCHER_ACTION_UPDATE = "DISPATCHER_ACTION_UPDATE",
    DISPATCHER_DELEGATE = "DISPATCHER_DELEGATE",
    DISPATCHER_DELEGATE_CREATE = "DISPATCHER_DELEGATE_CREATE",
    DISPATCHER_DELEGATE_DELETE = "DISPATCHER_DELEGATE_DELETE",
    DISPATCHER_DELEGATE_UPDATE = "DISPATCHER_DELEGATE_UPDATE",
    DISPATCHER_EVENT = "DISPATCHER_EVENT",
    DISPATCHER_EVENT_CREATE = "DISPATCHER_EVENT_CREATE",
    DISPATCHER_EVENT_DELETE = "DISPATCHER_EVENT_DELETE",
    DISPATCHER_EVENT_UPDATE = "DISPATCHER_EVENT_UPDATE",
    DISPATCHER_LISTENER_ADD = "DISPATCHER_LISTENER_ADD",
    DISPATCHER_LISTENER_REMOVE = "DISPATCHER_LISTENER_REMOVE",
    DISPATCHER_REQUEST = "DISPATCHER_REQUEST",
    DISPATCHER_REQUEST_CREATE = "DISPATCHER_REQUEST_CREATE",
    DISPATCHER_REQUEST_DELETE = "DISPATCHER_REQUEST_DELETE",
    DISPATCHER_REQUEST_UPDATE = "DISPATCHER_REQUEST_UPDATE",
    GUILD_AUDIT_LOG_FETCH = "GUILD_AUDIT_LOG_FETCH",
    GUILD_BAN_ADD = "GUILD_BAN_ADD",
    GUILD_BAN_REMOVE = "GUILD_BAN_REMOVE",
    GUILD_CREATE = "GUILD_CREATE",
    GUILD_DELETE = "GUILD_DELETE",
    GUILD_FEATURES_UPDATE = "GUILD_FEATURES_UPDATE",
    GUILD_INIT = "GUILD_INIT",
    GUILD_INTEGRATION_CREATE = "GUILD_INTEGRATION_CREATE",
    GUILD_INTEGRATION_DELETE = "GUILD_INTEGRATION_DELETE",
    GUILD_INTEGRATION_UPDATE = "GUILD_INTEGRATION_UPDATE",
    GUILD_INVITE_CREATE = "GUILD_INVITE_CREATE",
    GUILD_INVITE_DELETE = "GUILD_INVITE_DELETE",
    GUILD_JOIN_REQUEST_UPDATE = "GUILD_JOIN_REQUEST_UPDATE",
    GUILD_ROLE_CREATE = "GUILD_ROLE_CREATE",
    GUILD_ROLE_DELETE = "GUILD_ROLE_DELETE",
    GUILD_ROLE_UPDATE = "GUILD_ROLE_UPDATE",
    GUILD_SCHEDULED_EVENT_CREATE = "GUILD_SCHEDULED_EVENT_CREATE",
    GUILD_SCHEDULED_EVENT_DELETE = "GUILD_SCHEDULED_EVENT_DELETE",
    GUILD_SCHEDULED_EVENT_UPDATE = "GUILD_SCHEDULED_EVENT_UPDATE",
    GUILD_UPDATE = "GUILD_UPDATE",
    MESSAGE_ACK = "MESSAGE_ACK",
    MESSAGE_CREATE = "MESSAGE_CREATE",
    MESSAGE_DELETE = "MESSAGE_DELETE",
    MESSAGE_REACTION_ADD = "MESSAGE_REACTION_ADD",
    MESSAGE_REACTION_REMOVE = "MESSAGE_REACTION_REMOVE",
    MESSAGE_UPDATE = "MESSAGE_UPDATE",
    PRESENCE_UPDATE = "PRESENCE_UPDATE",
    REACTION_ADD = "REACTION_ADD",
    REACTION_REMOVE = "REACTION_REMOVE",
    READY = "READY",
    RELATIONSHIP_ADD = "RELATIONSHIP_ADD",
    RELATIONSHIP_REMOVE = "RELATIONSHIP_REMOVE",
    RELATIONSHIP_UPDATE = "RELATIONSHIP_UPDATE",
    TYPING_START = "TYPING_START",
    USER_BAN = "USER_BAN",
    USER_UPDATE = "USER_UPDATE",
    WINDOW_BLUR = "WINDOW_BLUR",
    WINDOW_FOCUS = "WINDOW_FOCUS",
    WINDOW_MINIMIZE = "WINDOW_MINIMIZE",
    WINDOW_UNFOCUS = "WINDOW_UNFOCUS"
}