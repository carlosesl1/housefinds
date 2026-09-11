<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="hf-site-header">
    <div class="hf-container hf-site-header__inner">
        <a class="hf-brand" href="<?php echo esc_url(home_url('/')); ?>">
            <?php bloginfo('name'); ?>
        </a>
        <nav class="hf-nav" aria-label="<?php esc_attr_e('Primary navigation', 'housefinds'); ?>">
            <?php
            wp_nav_menu([
                'theme_location' => 'primary',
                'container'      => false,
                'fallback_cb'    => false,
                'items_wrap'     => '%3$s',
            ]);
            ?>
            <?php if (function_exists('wc_get_cart_url')) : ?>
                <a href="<?php echo esc_url(wc_get_cart_url()); ?>">
                    <?php esc_html_e('Cart', 'housefinds'); ?>
                    <?php if (function_exists('WC') && WC()->cart) : ?>
                        <span>(<?php echo esc_html((string) WC()->cart->get_cart_contents_count()); ?>)</span>
                    <?php endif; ?>
                </a>
            <?php endif; ?>
        </nav>
    </div>
</header>
<main class="hf-main">
