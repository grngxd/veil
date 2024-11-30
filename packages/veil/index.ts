import { generate } from "short-uuid";

const version = "1.3-A6";
const semver = "1.3.6";

const context = generate();
const proxyPort = 4443;
export {
    context, proxyPort, semver, version
};

