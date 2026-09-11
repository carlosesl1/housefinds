<?php
/**
 * Housefinds theme bootstrap.
 */

if (!defined('ABSPATH')) {
    exit;
}

function housefinds_setup(): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');

    register_nav_menus([
        'primary' => __('Primary menu', 'housefinds'),
        'footer'  => __('Footer menu', 'housefinds'),
    ]);
}
add_action('after_setup_theme', 'housefinds_setup');

function housefinds_assets(): void {
    $version = wp_get_theme()->get('Version');

    wp_enqueue_style(
        'housefinds-style',
        get_stylesheet_uri(),
        [],
        $version
    );

    wp_enqueue_script(
        'housefinds-theme',
        get_template_directory_uri() . '/assets/js/theme.js',
        [],
        $version,
        true
    );
}
add_action('wp_enqueue_scripts', 'housefinds_assets');

require_once get_template_directory() . '/inc/product-page-router.php';
