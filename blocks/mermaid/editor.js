(function (wp) {
	'use strict';

	var registerBlockType = wp.blocks.registerBlockType;
	var __ = wp.i18n.__;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useEffect = wp.element.useEffect;
	var useRef = wp.element.useRef;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var SelectControl = wp.components.SelectControl;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var ToggleControl = wp.components.ToggleControl;
	var Notice = wp.components.Notice;

	var themes = [
		{ label: __('Default', 'mermaid-content-blocks'), value: 'default' },
		{ label: __('Neutral', 'mermaid-content-blocks'), value: 'neutral' },
		{ label: __('Dark', 'mermaid-content-blocks'), value: 'dark' },
		{ label: __('Forest', 'mermaid-content-blocks'), value: 'forest' },
		{ label: __('Base', 'mermaid-content-blocks'), value: 'base' }
	];

	function normalizeTheme(theme) {
		var values = themes.map(function (item) {
			return item.value;
		});
		return values.indexOf(theme) !== -1 ? theme : 'default';
	}

	function buildMermaidConfig(theme) {
		var globalConfig = window.MermaidContentBlocksConfig || {};
		var config = Object.assign(
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

		config.theme = normalizeTheme(theme);
		config.startOnLoad = false;
		config.securityLevel = 'strict';
		config.htmlLabels = false;
		return config;
	}

	function MermaidPreview(props) {
		var source = props.source || '';
		var theme = normalizeTheme(props.theme || 'default');
		var outputRef = useRef(null);

		useEffect(
			function () {
				var output = outputRef.current;
				var renderId = 'mcb-editor-preview-' + Date.now() + '-' + Math.round(Math.random() * 1000000);

				if (!output) {
					return;
				}

				output.textContent = '';

				if (!source.trim()) {
					output.textContent = __('Enter Mermaid source to preview the diagram.', 'mermaid-content-blocks');
					return;
				}

				if (!window.mermaid || typeof window.mermaid.render !== 'function') {
					output.textContent = __('Mermaid has not loaded yet. Save/update and preview the page if this persists.', 'mermaid-content-blocks');
					return;
				}

				try {
					window.mermaid.initialize(buildMermaidConfig(theme));
				} catch (initializeError) {
					output.textContent = __('Mermaid initialization failed: ', 'mermaid-content-blocks') + initializeError.message;
					return;
				}

				window.mermaid
					.render(renderId, source)
					.then(function (result) {
						if (outputRef.current === output) {
							output.innerHTML = result.svg;
						}
					})
					.catch(function (renderError) {
						if (outputRef.current === output) {
							output.textContent = __('Mermaid render error: ', 'mermaid-content-blocks') + renderError.message;
						}
					});
			},
			[source, theme]
		);

		return el('div', { className: 'mcb-mermaid-editor-preview', ref: outputRef });
	}

	registerBlockType('mcb/mermaid', {
		edit: function (props) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var source = attributes.source || '';
			var theme = normalizeTheme(attributes.theme || 'default');
			var caption = attributes.caption || '';
			var showSource = !!attributes.showSource;
			var blockProps = useBlockProps({ className: 'mcb-mermaid-editor-block' });

			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Diagram settings', 'mermaid-content-blocks'), initialOpen: true },
						el(SelectControl, {
							label: __('Mermaid theme', 'mermaid-content-blocks'),
							value: theme,
							options: themes,
							onChange: function (value) {
								setAttributes({ theme: normalizeTheme(value) });
							}
						}),
						el(ToggleControl, {
							label: __('Show source below rendered diagram', 'mermaid-content-blocks'),
							checked: showSource,
							onChange: function (value) {
								setAttributes({ showSource: !!value });
							}
						})
					)
				),
				el(
					'div',
					blockProps,
					el(Notice, { status: 'info', isDismissible: false }, __('Write Mermaid syntax in the editor below. The frontend renders the diagram with Mermaid 11.15.0 using strict security settings.', 'mermaid-content-blocks')),
					el(TextareaControl, {
						label: __('Mermaid source', 'mermaid-content-blocks'),
						help: __('Examples: flowchart TD, sequenceDiagram, classDiagram, stateDiagram-v2, gantt, erDiagram.', 'mermaid-content-blocks'),
						value: source,
						onChange: function (value) {
							setAttributes({ source: value });
						},
						rows: 12,
						className: 'mcb-mermaid-source-control'
					}),
					el(TextControl, {
						label: __('Caption', 'mermaid-content-blocks'),
						value: caption,
						onChange: function (value) {
							setAttributes({ caption: value });
						}
					}),
					el('h3', { className: 'mcb-mermaid-preview-heading' }, __('Preview', 'mermaid-content-blocks')),
					el(MermaidPreview, { source: source, theme: theme })
				)
			);
		},
		save: function () {
			return null;
		}
	});
})(window.wp);
