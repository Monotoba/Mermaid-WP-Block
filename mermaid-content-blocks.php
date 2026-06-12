<?php
/**
 * Plugin Name: Mermaid Content Blocks
 * Description: Adds a Mermaid Diagram block for rendering text-based Mermaid diagrams in WordPress posts and pages.
 * Version: 1.0.0
 * Requires at least: 7.0
 * Requires PHP: 7.4
 * Author: Monotoba
 * License: MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: mermaid-content-blocks
 *
 * @package MermaidContentBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MCB_VERSION', '1.0.0' );
define( 'MCB_MERMAID_VERSION', '11.15.0' );
define( 'MCB_PLUGIN_FILE', __FILE__ );
define( 'MCB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MCB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Returns the front-end and editor Mermaid configuration.
 *
 * Security notes:
 * - securityLevel strict keeps user-authored diagrams from enabling HTML/script behavior.
 * - secure prevents diagram-level Mermaid init directives from overriding the most important
 *   site-level settings.
 * - htmlLabels false avoids Mermaid's HTML label rendering path.
 *
 * @return array<string, mixed>
 */
function mcb_mermaid_config() {
	return array(
		'startOnLoad'   => false,
		'securityLevel' => 'strict',
		'htmlLabels'    => false,
		'secure'        => array(
			'secure',
			'securityLevel',
			'startOnLoad',
			'maxTextSize',
			'theme',
			'themeCSS',
			'themeVariables',
			'fontFamily',
			'altFontFamily',
		),
	);
}

/**
 * Normalizes Mermaid themes to the built-in set supported by Mermaid.
 *
 * @param mixed $theme Raw theme attribute value.
 * @return string
 */
function mcb_normalize_mermaid_theme( $theme ) {
	$allowed = array( 'default', 'neutral', 'dark', 'forest', 'base' );
	$theme   = is_string( $theme ) ? sanitize_key( $theme ) : 'default';

	return in_array( $theme, $allowed, true ) ? $theme : 'default';
}

/**
 * Registers scripts, styles, and the Mermaid block type.
 *
 * @return void
 */
function mcb_register_block() {
	$config_json = wp_json_encode( mcb_mermaid_config() );

	wp_register_script(
		'mcb-mermaid-lib',
		'https://cdn.jsdelivr.net/npm/mermaid@' . MCB_MERMAID_VERSION . '/dist/mermaid.min.js',
		array(),
		MCB_MERMAID_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	wp_register_script(
		'mcb-mermaid-loader',
		MCB_PLUGIN_URL . 'assets/mermaid-loader.js',
		array( 'mcb-mermaid-lib' ),
		MCB_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	wp_add_inline_script(
		'mcb-mermaid-loader',
		'window.MermaidContentBlocksConfig = ' . $config_json . ';',
		'before'
	);

	wp_register_script(
		'mcb-mermaid-editor',
		MCB_PLUGIN_URL . 'blocks/mermaid/editor.js',
		array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-components', 'wp-block-editor', 'mcb-mermaid-lib' ),
		MCB_VERSION,
		true
	);

	wp_add_inline_script(
		'mcb-mermaid-editor',
		'window.MermaidContentBlocksConfig = ' . $config_json . ';',
		'before'
	);

	wp_register_style(
		'mcb-mermaid-style',
		MCB_PLUGIN_URL . 'blocks/mermaid/style.css',
		array(),
		MCB_VERSION
	);

	wp_register_style(
		'mcb-mermaid-editor-style',
		MCB_PLUGIN_URL . 'blocks/mermaid/editor.css',
		array( 'mcb-mermaid-style' ),
		MCB_VERSION
	);

	register_block_type(
		MCB_PLUGIN_DIR . 'blocks/mermaid',
		array(
			'render_callback' => 'mcb_render_mermaid_block',
		)
	);
}
add_action( 'init', 'mcb_register_block' );

/**
 * Renders the dynamic Mermaid block.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @return string
 */
function mcb_render_mermaid_block( $attributes ) {
	$source = isset( $attributes['source'] ) && is_string( $attributes['source'] ) ? $attributes['source'] : '';
	$source = trim( $source );

	if ( '' === $source ) {
		return '';
	}

	$theme       = mcb_normalize_mermaid_theme( isset( $attributes['theme'] ) ? $attributes['theme'] : 'default' );
	$caption     = isset( $attributes['caption'] ) && is_string( $attributes['caption'] ) ? trim( wp_strip_all_tags( $attributes['caption'] ) ) : '';
	$show_source = ! empty( $attributes['showSource'] );

	wp_enqueue_style( 'mcb-mermaid-style' );
	wp_enqueue_script( 'mcb-mermaid-lib' );
	wp_enqueue_script( 'mcb-mermaid-loader' );

	$aria_label = '' !== $caption ? $caption : __( 'Mermaid diagram', 'mermaid-content-blocks' );
	$classes    = array( 'mcb-mermaid-block' );

	$wrapper_attributes = get_block_wrapper_attributes(
		array(
			'class'                => implode( ' ', $classes ),
			'data-mcb-theme'       => $theme,
			'data-mcb-show-source' => $show_source ? 'true' : 'false',
		)
	);

	$output  = '<figure ' . $wrapper_attributes . '>';
	$output .= '<div class="mcb-mermaid-output" role="img" aria-label="' . esc_attr( $aria_label ) . '" hidden></div>';
	$output .= '<pre class="mcb-mermaid-source"><code>' . esc_html( $source ) . '</code></pre>';
	$output .= '<div class="mcb-mermaid-error" role="alert" hidden></div>';

	if ( '' !== $caption ) {
		$output .= '<figcaption class="mcb-mermaid-caption">' . esc_html( $caption ) . '</figcaption>';
	}

	$output .= '</figure>';

	return $output;
}
