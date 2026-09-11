<?php
/**
 * Product page router.
 *
 * If a file exists at product-pages/{product-slug}.php, WooCommerce will render
 * that file for the matching product. Otherwise WooCommerce uses its normal
 * single-product template.
 */

if (!defined('ABSPATH')) {
    exit;
}

function housefinds_custom_product_template(string $template): string {
    if (!is_singular('product')) {
        return $template;
    }

    $product_id = get_queried_object_id();
    if (!$product_id) {
        return $template;
    }

    $slug = get_post_field('post_name', $product_id);
    if (!$slug) {
        return $template;
    }

    $custom_template = get_template_directory() . '/product-pages/' . sanitize_file_name($slug) . '.php';

    if (is_readable($custom_template)) {
        return $custom_template;
    }

    return $template;
}
add_filter('template_include', 'housefinds_custom_product_template', 99);
