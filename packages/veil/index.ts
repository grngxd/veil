import { generate } from "short-uuid";

const version = "1.0-A1";
const context = generate();
const proxyPort = 4443;
export {
    context, proxyPort, version
};

