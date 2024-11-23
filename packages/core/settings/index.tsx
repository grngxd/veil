import * as r from "+react";
import { renderPreactInReact } from "+react/bridge";
import Button from "+react/components/Button";
import { Fragment, type VNode, h } from "preact";
import { useState } from "preact/hooks";
import { getDispatcher } from "../flux/dispatcher";
import { abuseWebpack } from "../webpack/webpack";
r;

type CustomElement = {
	section: string;
	searchableTitles?: string[];
	label?: string;
	ariaLabel?: string;
	element?: () => VNode;
};

let originalGetPredicateSections: any;
let customElements: CustomElement[] = [];

export const addCustomElement = (element: CustomElement) => {
	customElements.push(element);
};

const PreactCounter = () => {
	const [count, setCount] = useState(0);

	return (
		<>
			<h1> skibidi rizz</h1>
			<Button
				onClick={() => setCount((c) => c + 1)}
			>
				Count: {count}
			</Button>
		</>
	);
};

export const init = () => {
	getDispatcher()
		.waitForDispatch("USER_SETTINGS_MODAL_OPEN")
		.then(() => {
			abuseWebpack((c) => {
				for (const chunk of Object.values(c)) {
					if (chunk.exports?.ZP?.prototype?.getPredicateSections) {
						originalGetPredicateSections =
							chunk.exports.ZP.prototype.getPredicateSections;

						chunk.exports.ZP.prototype.getPredicateSections = new Proxy(
							chunk.exports.ZP.prototype.getPredicateSections,
							{
								apply: (target, thisArg, args) => {
									const result: any = target.apply(thisArg, args);

									let dividerCount = 0;
									let insertIndex = result.length;

									for (let i = 0; i < result.length; i++) {
										const item = result[i];
										if (item.section === "DIVIDER") {
											dividerCount++;
											if (dividerCount === 2) {
												insertIndex = i + 1;
												break;
											}
										}
									}

									if (customElements.length > 0) {
										result.splice(insertIndex, 0, ...customElements, {
											section: "DIVIDER",
										});
									}

									return result;
								},
							},
						);
					}
				}
			});
		});
};

export const unload = () => {
	customElements = [];
	abuseWebpack((c) => {
		for (const chunk of Object.values(c)) {
			if (chunk.exports?.ZP?.prototype?.getPredicateSections) {
				if (originalGetPredicateSections) {
					chunk.exports.ZP.prototype.getPredicateSections =
						originalGetPredicateSections;
				}
			}
		}
	});
};

addCustomElement({
	section: "HEADER",
	searchableTitles: ["veil!!!"],
	label: "veil!!!",
	ariaLabel: "veil!!!",
});
addCustomElement({
	element: () => renderPreactInReact(PreactCounter),
	section: "CUSTOM_SECTION",
	searchableTitles: ["veil"],
	label: "veil",
});

export default {
	addCustomElement,
};
