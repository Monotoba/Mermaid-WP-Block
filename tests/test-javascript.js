'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

function makePart() {
	return {
		hidden: true,
		innerHTML: '',
		textContent: ''
	};
}

function makeBlock(attributes = {}) {
	const parts = {
		'.mcb-mermaid-source': makePart(),
		'.mcb-mermaid-output': makePart(),
		'.mcb-mermaid-error': makePart()
	};
	parts['.mcb-mermaid-source'].textContent = attributes.source || 'flowchart TD; A-->B';

	return {
		nodeType: 1,
		attributes: {
			'data-mcb-theme': attributes.theme || 'default',
			'data-mcb-show-source': attributes.showSource ? 'true' : 'false'
		},
		parts,
		matches(selector) {
			return selector === '.mcb-mermaid-block';
		},
		querySelector(selector) {
			return parts[selector] || null;
		},
		querySelectorAll() {
			return [];
		},
		getAttribute(name) {
			return this.attributes[name] || null;
		},
		setAttribute(name, value) {
			this.attributes[name] = value;
		}
	};
}

async function testLoader() {
	const loader = fs.readFileSync(path.join(root, 'assets/mermaid-loader.js'), 'utf8');
	const initialized = [];
	const rendered = [];
	const document = {
		nodeType: 9,
		readyState: 'complete',
		body: {},
		querySelectorAll() {
			return [];
		},
		addEventListener() {
			throw new Error('DOMContentLoaded listener should not be needed');
		}
	};
	const window = {
		MermaidContentBlocksConfig: {
			securityLevel: 'loose',
			htmlLabels: true,
			startOnLoad: true
		},
		mermaid: {
			initialize(config) {
				initialized.push(config);
			},
			render(id, source) {
				rendered.push({ id, source });
				return Promise.resolve({ svg: '<svg data-test="diagram"></svg>' });
			}
		}
	};
	vm.runInNewContext(loader, { window, document, Promise, Date, MutationObserver: undefined });

	const block = makeBlock({ theme: 'not-allowed', showSource: false });
	await window.MermaidContentBlocks.renderAll(block);

	assert.equal(rendered.length, 1, 'an inserted block root should render');
	assert.equal(block.attributes['data-mcb-rendered'], 'true');
	assert.equal(block.parts['.mcb-mermaid-output'].hidden, false);
	assert.equal(block.parts['.mcb-mermaid-source'].hidden, true);
	assert.equal(initialized[0].theme, 'default');
	assert.equal(initialized[0].securityLevel, 'strict');
	assert.equal(initialized[0].htmlLabels, false);
	assert.equal(initialized[0].startOnLoad, false);

	await window.MermaidContentBlocks.renderAll(block);
	assert.equal(rendered.length, 1, 'a completed block should not render twice');

	const pendingBlock = makeBlock();
	pendingBlock.attributes['data-mcb-rendered'] = 'pending';
	await window.MermaidContentBlocks.renderAll(pendingBlock);
	assert.equal(rendered.length, 1, 'a pending block should not start a duplicate render');

	delete window.mermaid;
	const errorBlock = makeBlock();
	await window.MermaidContentBlocks.renderAll(errorBlock);
	assert.equal(errorBlock.attributes['data-mcb-rendered'], 'error');
	assert.equal(errorBlock.parts['.mcb-mermaid-error'].hidden, false);
	assert.match(errorBlock.parts['.mcb-mermaid-error'].textContent, /could not be loaded/);
}

async function testEditor() {
	const editor = fs.readFileSync(path.join(root, 'blocks/mermaid/editor.js'), 'utf8');
	const effects = [];
	const output = makePart();
	const registered = {};
	const renders = [];
	const renderA = deferred();
	const renderB = deferred();

	function createElement(type, props, ...children) {
		const elementProps = Object.assign({}, props || {}, { children });
		if (typeof type === 'function') {
			return type(elementProps);
		}
		return { type, props: elementProps };
	}

	const components = {
		PanelBody: 'PanelBody',
		SelectControl: 'SelectControl',
		TextControl: 'TextControl',
		TextareaControl: 'TextareaControl',
		ToggleControl: 'ToggleControl',
		Notice: 'Notice'
	};
	const window = {
		MermaidContentBlocksConfig: {
			securityLevel: 'loose',
			htmlLabels: true
		},
		mermaid: {
			initialize(config) {
				assert.equal(config.securityLevel, 'strict');
				assert.equal(config.htmlLabels, false);
			},
			render(id, source) {
				renders.push({ id, source });
				return source === 'A' ? renderA.promise : renderB.promise;
			}
		},
		wp: {
			blocks: {
				registerBlockType(name, settings) {
					registered.name = name;
					registered.settings = settings;
				}
			},
			i18n: { __: (text) => text },
			element: {
				createElement,
				Fragment: 'Fragment',
				useEffect(effect) {
					effects.push(effect);
				},
				useRef() {
					return { current: output };
				}
			},
			blockEditor: {
				useBlockProps: (props) => props,
				InspectorControls: 'InspectorControls'
			},
			components
		}
	};

	vm.runInNewContext(editor, { window, Promise, Date, Math });
	assert.equal(registered.name, 'mcb/mermaid');
	assert.equal(registered.settings.save(), null);

	const updates = [];
	registered.settings.edit({
		attributes: { source: 'A', theme: 'dark', caption: '', showSource: false },
		setAttributes(value) {
			updates.push(value);
		}
	});
	const cleanupA = effects.shift()();

	registered.settings.edit({
		attributes: { source: 'B', theme: 'forest', caption: '', showSource: false },
		setAttributes(value) {
			updates.push(value);
		}
	});
	cleanupA();
	effects.shift()();

	renderB.resolve({ svg: '<svg>B</svg>' });
	await renderB.promise;
	await Promise.resolve();
	assert.equal(output.innerHTML, '<svg>B</svg>');

	renderA.resolve({ svg: '<svg>A</svg>' });
	await renderA.promise;
	await Promise.resolve();
	assert.equal(output.innerHTML, '<svg>B</svg>', 'a stale preview must not overwrite the current preview');
	assert.deepEqual(renders.map((item) => item.source), ['A', 'B']);
}

(async () => {
	await testLoader();
	await testEditor();
	console.log('JavaScript behavioral tests passed.');
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
