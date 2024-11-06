
export type WebpackChunk = {
    [key: number]: WebpackModule;
}

export type WebpackModule = {
    id: number;
    loaded: boolean;
    exports: { [key: string]: any | undefined };
}

export const abuseWebpack = (
    violence?: (
        c: WebpackChunk
    ) => unknown
) => {
    let _return: any = null;

    window.webpackChunkdiscord_app.push([[Date.now()], {}, (req: any) => {
        if (violence) {
            _return = violence(req.c);
        } else {
            _return = req.c;
        }
    }]);

    return _return;
}; 