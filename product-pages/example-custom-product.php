<?php
/**
 * Example bespoke product page.
 *
 * Rename this file to the exact WooCommerce product slug to activate it.
 */

if (!defined('ABSPATH')) {
    exit;
}

global $product;
if (!$product instanceof WC_Product) {
    $product = wc_get_product(get_queried_object_id());
}

get_header();
?>
<article class="hf-custom-product">
    <section class="hf-product-shell">
        <div class="hf-container hf-product-grid">
            <div>
                <?php woocommerce_show_product_images(); ?>
            </div>

            <div class="hf-product-summary">
                <p class="hf-section__eyebrow"><?php esc_html_e('Housefinds pick', 'housefinds'); ?></p>
                <h1 class="hf-product-title"><?php the_title(); ?></h1>

                <?php woocommerce_template_single_rating(); ?>
                <?php woocommerce_template_single_price(); ?>
                <?php woocommerce_template_single_excerpt(); ?>
                <?php woocommerce_template_single_add_to_cart(); ?>
            </div>
        </div>
    </section>

    <section class="hf-section hf-section--dark">
        <div class="hf-container">
            <p class="hf-section__eyebrow"><?php esc_html_e('Why it matters', 'housefinds'); ?></p>
            <h2 class="hf-section__title"><?php esc_html_e('Build a complete story around the product instead of forcing every item into the same template.', 'housefinds'); ?></h2>
        </div>
    </section>

    <section class="hf-section">
        <div class="hf-container">
            <?php the_content(); ?>
        </div>
    </section>

    <section class="hf-section">
        <div class="hf-container">
            <?php comments_template(); ?>
        </div>
    </section>
</article>
<?php
get_footer();
