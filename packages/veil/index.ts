import { generate } from "short-uuid";

const version = "1.3-A4";
const semver = "1.3.4";

const context = generate();
const proxyPort = 4443;
export {
    context, proxyPort, semver, version
};

