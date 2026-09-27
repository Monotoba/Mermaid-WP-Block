<?php
/**
 * Behavioral tests for Mermaid Content Blocks.
 *
 * Run with: php tests/test-plugin.php
 *
 * @package MermaidContentBlocks
 */

require_once __DIR__ . '/bootstrap.php';
require_once dirname( __DIR__ ) . '/mermaid-content-blocks.php';

$tests_run = 0;

function mcb_test_assert_true( $condition, $message ) {
	global $tests_run;
	++$tests_run;
	if ( ! $condition ) {
		fwrite( STDERR, "FAIL: {$message}\n" );
		exit( 1 );
	}
}

function mcb_test_assert_same( $expected, $actual, $message ) {
	mcb_test_assert_true(
		$expected === $actual,
		$message . '\nExpected: ' . var_export( $expected, true ) . '\nActual: ' . var_export( $actual, true )
	);
}

function mcb_test_assert_contains( $needle, $haystack, $message ) {
	mcb_test_assert_true( false !== strpos( $haystack, $needle ), $message );
}

function mcb_test_assert_not_contains( $needle, $haystack, $message ) {
	mcb_test_assert_true( false === strpos( $haystack, $needle ), $message );
}

// Plugin bootstrap registers its initialization callback.
mcb_test_assert_same( array( 'mcb_register_block' ), $GLOBALS['mcb_test_actions']['init'], 'The init callback must be registered.' );

// Security-sensitive Mermaid configuration remains locked down.
$config = mcb_mermaid_config();
mcb_test_assert_same( false, $config['startOnLoad'], 'Automatic Mermaid rendering must remain disabled.' );
mcb_test_assert_same( 'strict', $config['securityLevel'], 'Mermaid must use strict security mode.' );
mcb_test_assert_same( false, $config['htmlLabels'], 'HTML labels must remain disabled.' );
foreach ( array( 'secure', 'securityLevel', 'theme', 'themeCSS', 'themeVariables' ) as $protected_key ) {
	mcb_test_assert_true( in_array( $protected_key, $config['secure'], true ), "Protected key missing: {$protected_key}" );
}

// Theme normalization accepts only Mermaid's built-in themes.
foreach ( array( 'default', 'neutral', 'dark', 'forest', 'base' ) as $theme ) {
	mcb_test_assert_same( $theme, mcb_normalize_mermaid_theme( $theme ), "Theme should be accepted: {$theme}" );
}
mcb_test_assert_same( 'dark', mcb_normalize_mermaid_theme( 'DARK' ), 'Theme normalization should be case-insensitive.' );
mcb_test_assert_same( 'default', mcb_normalize_mermaid_theme( 'custom<script>' ), 'Unknown themes must fall back safely.' );
mcb_test_assert_same( 'default', mcb_normalize_mermaid_theme( array( 'dark' ) ), 'Non-string themes must fall back safely.' );

// Registration uses pinned, deferred scripts and the dynamic render callback.
mcb_register_block();
mcb_test_assert_contains( '@11.15.0/', $GLOBALS['mcb_test_scripts']['mcb-mermaid-lib']['src'], 'Mermaid CDN version must remain pinned.' );
mcb_test_assert_same( 'defer', $GLOBALS['mcb_test_scripts']['mcb-mermaid-lib']['args']['strategy'], 'Mermaid must load with defer.' );
mcb_test_assert_same( 'defer', $GLOBALS['mcb_test_scripts']['mcb-mermaid-loader']['args']['strategy'], 'The loader must load with defer.' );
mcb_test_assert_same( 'before', $GLOBALS['mcb_test_inline_scripts']['mcb-mermaid-loader']['position'], 'Configuration must precede the loader.' );
$block = reset( $GLOBALS['mcb_test_blocks'] );
mcb_test_assert_same( 'mcb_render_mermaid_block', $block['render_callback'], 'The block must use the secure server renderer.' );

// Empty source renders nothing and enqueues no front-end assets.
$GLOBALS['mcb_test_enqueued'] = array( 'scripts' => array(), 'styles' => array() );
mcb_test_assert_same( '', mcb_render_mermaid_block( array( 'source' => " \n\t " ) ), 'Whitespace-only source should render nothing.' );
mcb_test_assert_same( array(), $GLOBALS['mcb_test_enqueued']['scripts'], 'Empty blocks must not enqueue scripts.' );
mcb_test_assert_same( array(), $GLOBALS['mcb_test_enqueued']['styles'], 'Empty blocks must not enqueue styles.' );

// Rendering escapes source and captions, normalizes themes, and enqueues required assets.
$GLOBALS['mcb_test_enqueued'] = array( 'scripts' => array(), 'styles' => array() );
$output = mcb_render_mermaid_block(
	array(
		'source'     => 'flowchart TD; A["<script>alert(1)</script>"]',
		'theme'      => 'DARK',
		'caption'    => '<b>Safe caption</b><script>ignored markup</script>',
		'showSource' => true,
	)
);
mcb_test_assert_contains( 'data-mcb-theme="dark"', $output, 'The normalized theme must be rendered.' );
mcb_test_assert_contains( 'data-mcb-show-source="true"', $output, 'The source visibility flag must be rendered.' );
mcb_test_assert_contains( '&lt;script&gt;alert(1)&lt;/script&gt;', $output, 'Diagram source must be HTML-escaped.' );
mcb_test_assert_not_contains( '<script>', $output, 'Raw script elements must never be rendered.' );
mcb_test_assert_contains( '<figcaption class="mcb-mermaid-caption">Safe captionignored markup</figcaption>', $output, 'Caption markup must be stripped.' );
mcb_test_assert_contains( 'aria-label="Safe captionignored markup"', $output, 'The sanitized caption must label the diagram.' );
mcb_test_assert_same( array( 'mcb-mermaid-lib', 'mcb-mermaid-loader' ), $GLOBALS['mcb_test_enqueued']['scripts'], 'Required scripts must be enqueued.' );
mcb_test_assert_same( array( 'mcb-mermaid-style' ), $GLOBALS['mcb_test_enqueued']['styles'], 'The block stylesheet must be enqueued.' );

// Invalid theme and missing caption use safe defaults.
$output = mcb_render_mermaid_block( array( 'source' => 'flowchart LR; A-->B', 'theme' => 'unknown' ) );
mcb_test_assert_contains( 'data-mcb-theme="default"', $output, 'Invalid themes must render as default.' );
mcb_test_assert_contains( 'aria-label="Mermaid diagram"', $output, 'Uncaptioned diagrams need an accessible label.' );
mcb_test_assert_not_contains( '<figcaption', $output, 'An empty caption must not emit a figcaption.' );

echo "PHP behavioral tests passed ({$tests_run} assertions).\n";
