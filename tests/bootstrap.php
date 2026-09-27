<?php
/**
 * Minimal WordPress function stubs for plugin behavior tests.
 *
 * @package MermaidContentBlocks
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['mcb_test_actions']        = array();
$GLOBALS['mcb_test_scripts']        = array();
$GLOBALS['mcb_test_inline_scripts'] = array();
$GLOBALS['mcb_test_styles']         = array();
$GLOBALS['mcb_test_blocks']         = array();
$GLOBALS['mcb_test_enqueued']       = array(
	'scripts' => array(),
	'styles'  => array(),
);

function plugin_dir_path( $file ) {
	return dirname( $file ) . '/';
}

function plugin_dir_url( $file ) {
	unset( $file );
	return 'https://example.test/wp-content/plugins/mermaid-content-blocks/';
}

function sanitize_key( $key ) {
	$key = strtolower( (string) $key );
	return preg_replace( '/[^a-z0-9_\-]/', '', $key );
}

function wp_json_encode( $value ) {
	return json_encode( $value );
}

function wp_register_script( $handle, $src, $deps = array(), $version = false, $args = array() ) {
	$GLOBALS['mcb_test_scripts'][ $handle ] = compact( 'src', 'deps', 'version', 'args' );
	return true;
}

function wp_add_inline_script( $handle, $data, $position = 'after' ) {
	$GLOBALS['mcb_test_inline_scripts'][ $handle ] = compact( 'data', 'position' );
	return true;
}

function wp_register_style( $handle, $src, $deps = array(), $version = false ) {
	$GLOBALS['mcb_test_styles'][ $handle ] = compact( 'src', 'deps', 'version' );
	return true;
}

function register_block_type( $path, $args = array() ) {
	$GLOBALS['mcb_test_blocks'][ $path ] = $args;
	return true;
}

function add_action( $hook, $callback ) {
	$GLOBALS['mcb_test_actions'][ $hook ][] = $callback;
	return true;
}

function wp_strip_all_tags( $text ) {
	return strip_tags( $text );
}

function wp_enqueue_style( $handle ) {
	$GLOBALS['mcb_test_enqueued']['styles'][] = $handle;
	return true;
}

function wp_enqueue_script( $handle ) {
	$GLOBALS['mcb_test_enqueued']['scripts'][] = $handle;
	return true;
}

function __( $text, $domain = 'default' ) {
	unset( $domain );
	return $text;
}

function esc_attr( $text ) {
	return htmlspecialchars( (string) $text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' );
}

function esc_html( $text ) {
	return htmlspecialchars( (string) $text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' );
}

function get_block_wrapper_attributes( $attributes = array() ) {
	$rendered = array();
	foreach ( $attributes as $name => $value ) {
		$rendered[] = esc_attr( $name ) . '="' . esc_attr( $value ) . '"';
	}
	return implode( ' ', $rendered );
}
