import { generate } from "short-uuid";

const version = "1.3-A5";
const semver = "1.3.5";

const context = generate();
const proxyPort = 4443;
export {
    context, proxyPort, semver, version
};

