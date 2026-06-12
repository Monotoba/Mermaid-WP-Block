(function () {
	'use strict';

	var renderCounter = 0;
	var supportedThemes = ['default', 'neutral', 'dark', 'forest', 'base'];

	function getBaseConfig() {
		var globalConfig = window.MermaidContentBlocksConfig || {};
		return Object.assign(
			{
				startOnLoad: false,
				securityLevel: 'strict',
				htmlLabels: false,
				secure: [
					'secure',
					'securityLevel',
					'startOnLoad',
					'maxTextSize',
					'theme',
					'themeCSS',
					'themeVariables',
					'fontFamily',
					'altFontFamily'
				]
			},
			globalConfig
		);
	}

	function normalizeTheme(theme) {
		return supportedThemes.indexOf(theme) !== -1 ? theme : 'default';
	}

	function buildConfig(theme) {
		var config = getBaseConfig();
		config.theme = normalizeTheme(theme);
		config.startOnLoad = false;
		config.securityLevel = 'strict';
		config.htmlLabels = false;
		return config;
	}

	function setError(block, message) {
		var error = block.querySelector('.mcb-mermaid-error');
		if (!error) {
			return;
		}
		error.textContent = message;
		error.hidden = false;
		block.setAttribute('data-mcb-rendered', 'error');
	}

	function clearError(block) {
		var error = block.querySelector('.mcb-mermaid-error');
		if (!error) {
			return;
		}
		error.textContent = '';
		error.hidden = true;
	}

	function getSourceText(sourceElement) {
		if (!sourceElement) {
			return '';
		}

		return (sourceElement.textContent || '').trim();
	}

	function renderOne(block) {
		var sourceElement = block.querySelector('.mcb-mermaid-source');
		var outputElement = block.querySelector('.mcb-mermaid-output');
		var source = getSourceText(sourceElement);
		var theme = normalizeTheme(block.getAttribute('data-mcb-theme') || 'default');
		var showSource = block.getAttribute('data-mcb-show-source') === 'true';
		var renderId = 'mcb-mermaid-svg-' + Date.now() + '-' + String(++renderCounter);

		if (block.getAttribute('data-mcb-rendered') === 'true') {
			return Promise.resolve();
		}

		if (!source || !outputElement) {
			return Promise.resolve();
		}

		if (!window.mermaid || typeof window.mermaid.render !== 'function') {
			setError(block, 'Mermaid could not be loaded. Check the browser console and the site Content Security Policy.');
			return Promise.resolve();
		}

		clearError(block);
		block.setAttribute('data-mcb-rendered', 'pending');

		try {
			window.mermaid.initialize(buildConfig(theme));
		} catch (initializeError) {
			setError(block, 'Mermaid initialization failed: ' + initializeError.message);
			return Promise.resolve();
		}

		return window.mermaid
			.render(renderId, source)
			.then(function (result) {
				outputElement.innerHTML = result.svg;
				outputElement.hidden = false;
				if (sourceElement) {
					sourceElement.hidden = !showSource;
				}
				block.setAttribute('data-mcb-rendered', 'true');
			})
			.catch(function (renderError) {
				if (sourceElement) {
					sourceElement.hidden = false;
				}
				outputElement.hidden = true;
				setError(block, 'Mermaid render error: ' + renderError.message);
			});
	}

	function renderAll(root) {
		var scope = root || document;
		var blocks = Array.prototype.slice.call(scope.querySelectorAll('.mcb-mermaid-block'));
		var chain = Promise.resolve();

		blocks.forEach(function (block) {
			chain = chain.then(function () {
				return renderOne(block);
			});
		});

		return chain;
	}

	function ready(callback) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', callback);
			return;
		}

		callback();
	}

	ready(function () {
		renderAll(document);

		if ('MutationObserver' in window) {
			var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					mutation.addedNodes.forEach(function (node) {
						if (node.nodeType === 1) {
							renderAll(node);
						}
					});
				});
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		}
	});

	window.MermaidContentBlocks = window.MermaidContentBlocks || {};
	window.MermaidContentBlocks.renderAll = renderAll;
})();
