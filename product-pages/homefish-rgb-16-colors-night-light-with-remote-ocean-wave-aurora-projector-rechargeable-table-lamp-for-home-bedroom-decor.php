<?php
/**
 * Bespoke product page: HOMEFISH RGB 16 Colors Night Light / Aurora Projector.
 *
 * Commerce data remains owned by WooCommerce. This template only controls the
 * presentation and calls native WooCommerce add-to-cart/review functionality.
 */

if (!defined('ABSPATH')) {
    exit;
}

global $post, $product;

if (!$product || !is_a($product, 'WC_Product')) {
    $product = wc_get_product(get_queried_object_id());
}

if (!$product) {
    get_header();
    echo '<main class="hf-container hf-product-shell"><p>Product not found.</p></main>';
    get_footer();
    return;
}

$product_id       = $product->get_id();
$title            = $product->get_name();
$price_html       = $product->get_price_html();
$short_desc       = $product->get_short_description();
$description      = $product->get_description();
$rating_count     = $product->get_rating_count();
$average_rating   = $product->get_average_rating();
$main_image_id    = $product->get_image_id();
$gallery_ids      = $product->get_gallery_image_ids();
$image_ids        = array_values(array_unique(array_filter(array_merge([$main_image_id], $gallery_ids))));
$main_image       = $main_image_id ? wp_get_attachment_image_url($main_image_id, 'full') : wc_placeholder_img_src('full');
$attributes       = $product->get_attributes();

$feature_cards = [
    [
        'number' => '16',
        'label'  => __('RGB colours', 'housefinds'),
        'text'   => __('Shift the atmosphere to match the room, mood or moment.', 'housefinds'),
    ],
    [
        'number' => '01',
        'label'  => __('Remote control', 'housefinds'),
        'text'   => __('Change the ambience without interrupting the moment.', 'housefinds'),
    ],
    [
        'number' => '∞',
        'label'  => __('Ocean-wave ambience', 'housefinds'),
        'text'   => __('Light designed to turn plain walls and ceilings into a moving backdrop.', 'housefinds'),
    ],
    [
        'number' => 'USB',
        'label'  => __('Rechargeable', 'housefinds'),
        'text'   => __('A portable table light made to move with your space.', 'housefinds'),
    ],
];

get_header();
?>

<main class="hf-aurora" data-product-id="<?php echo esc_attr($product_id); ?>">
    <section class="hf-aurora-hero">
        <div class="hf-aurora-hero__glow" aria-hidden="true"></div>
        <div class="hf-aurora-hero__inner hf-container">
            <div class="hf-aurora-hero__copy">
                <p class="hf-aurora-kicker"><?php esc_html_e('Housefinds / Ambient light', 'housefinds'); ?></p>
                <h1><?php esc_html_e('Change the room without changing the room.', 'housefinds'); ?></h1>
                <p class="hf-aurora-lead">
                    <?php esc_html_e('A rechargeable RGB projector that washes your space in ocean-wave light — with 16 colours and remote control.', 'housefinds'); ?>
                </p>

                <div class="hf-aurora-hero__actions">
                    <a class="hf-aurora-btn hf-aurora-btn--primary" href="#buy">
                        <?php esc_html_e('Shop the light', 'housefinds'); ?>
                    </a>
                    <a class="hf-aurora-btn hf-aurora-btn--ghost" href="#experience">
                        <?php esc_html_e('See the experience', 'housefinds'); ?>
                    </a>
                </div>

                <div class="hf-aurora-price-row">
                    <span><?php echo wp_kses_post($price_html); ?></span>
                    <?php if ($rating_count > 0) : ?>
                        <span class="hf-aurora-rating">
                            <?php echo wp_kses_post(wc_get_rating_html($average_rating, $rating_count)); ?>
                            <small><?php echo esc_html(sprintf(_n('%s review', '%s reviews', $rating_count, 'housefinds'), number_format_i18n($rating_count))); ?></small>
                        </span>
                    <?php endif; ?>
                </div>
            </div>

            <div class="hf-aurora-hero__visual">
                <div class="hf-aurora-orbit" aria-hidden="true"></div>
                <figure>
                    <img src="<?php echo esc_url($main_image); ?>" alt="<?php echo esc_attr($title); ?>" fetchpriority="high">
                </figure>
                <span class="hf-aurora-pill hf-aurora-pill--top"><?php esc_html_e('16 colours', 'housefinds'); ?></span>
                <span class="hf-aurora-pill hf-aurora-pill--bottom"><?php esc_html_e('Remote controlled', 'housefinds'); ?></span>
            </div>
        </div>

        <div class="hf-aurora-scroll" aria-hidden="true">
            <span><?php esc_html_e('Scroll to transform the room', 'housefinds'); ?></span>
            <i></i>
        </div>
    </section>

    <section id="experience" class="hf-aurora-statement">
        <div class="hf-container">
            <p class="hf-aurora-kicker"><?php esc_html_e('One light. A different atmosphere.', 'housefinds'); ?></p>
            <h2><?php esc_html_e('Your room already has everything it needs. Give it better light.', 'housefinds'); ?></h2>
        </div>
    </section>

    <section class="hf-aurora-features hf-container" aria-label="<?php esc_attr_e('Product highlights', 'housefinds'); ?>">
        <?php foreach ($feature_cards as $feature) : ?>
            <article class="hf-aurora-feature">
                <strong><?php echo esc_html($feature['number']); ?></strong>
                <div>
                    <h3><?php echo esc_html($feature['label']); ?></h3>
                    <p><?php echo esc_html($feature['text']); ?></p>
                </div>
            </article>
        <?php endforeach; ?>
    </section>

    <?php if (count($image_ids) > 1) : ?>
        <section class="hf-aurora-gallery" aria-label="<?php esc_attr_e('Product gallery', 'housefinds'); ?>">
            <div class="hf-aurora-gallery__track">
                <?php foreach (array_slice($image_ids, 0, 8) as $index => $image_id) :
                    $image_url = wp_get_attachment_image_url($image_id, 'full');
                    if (!$image_url) {
                        continue;
                    }
                ?>
                    <figure class="hf-aurora-gallery__item <?php echo $index === 0 ? 'is-featured' : ''; ?>">
                        <img src="<?php echo esc_url($image_url); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy">
                    </figure>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endif; ?>

    <section class="hf-aurora-dark">
        <div class="hf-container hf-aurora-dark__grid">
            <div class="hf-aurora-dark__copy">
                <p class="hf-aurora-kicker"><?php esc_html_e('From functional to atmospheric', 'housefinds'); ?></p>
                <h2><?php esc_html_e('Desk light. Bedside glow. Late-night colour.', 'housefinds'); ?></h2>
                <p><?php esc_html_e('Move it around the room, switch colours from the remote and shape the atmosphere around what you are doing.', 'housefinds'); ?></p>
            </div>
            <div class="hf-aurora-dark__visual">
                <img src="<?php echo esc_url($main_image); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy">
            </div>
        </div>
    </section>

    <section id="buy" class="hf-aurora-buy hf-container">
        <div class="hf-aurora-buy__media">
            <img src="<?php echo esc_url($main_image); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy">
        </div>

        <div class="hf-aurora-buy__panel">
            <p class="hf-aurora-kicker"><?php esc_html_e('Bring the atmosphere home', 'housefinds'); ?></p>
            <h2><?php echo esc_html($title); ?></h2>

            <?php if ($short_desc) : ?>
                <div class="hf-aurora-buy__summary"><?php echo wp_kses_post(wpautop($short_desc)); ?></div>
            <?php endif; ?>

            <div class="hf-aurora-buy__price"><?php echo wp_kses_post($price_html); ?></div>

            <div class="hf-aurora-native-cart">
                <?php woocommerce_template_single_add_to_cart(); ?>
            </div>

            <ul class="hf-aurora-assurances">
                <li><?php esc_html_e('Secure checkout', 'housefinds'); ?></li>
                <li><?php esc_html_e('Order tracking', 'housefinds'); ?></li>
                <li><?php esc_html_e('WooCommerce protected checkout', 'housefinds'); ?></li>
            </ul>
        </div>
    </section>

    <?php if ($description || !empty($attributes)) : ?>
        <section class="hf-aurora-details">
            <div class="hf-container hf-aurora-details__grid">
                <div>
                    <p class="hf-aurora-kicker"><?php esc_html_e('Details', 'housefinds'); ?></p>
                    <h2><?php esc_html_e('Everything worth knowing.', 'housefinds'); ?></h2>
                </div>

                <div class="hf-aurora-details__content">
                    <?php if ($description) : ?>
                        <div class="hf-aurora-description">
                            <?php echo wp_kses_post(wpautop($description)); ?>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($attributes)) : ?>
                        <dl class="hf-aurora-specs">
                            <?php foreach ($attributes as $attribute) :
                                $label = wc_attribute_label($attribute->get_name());
                                if ($attribute->is_taxonomy()) {
                                    $values = wc_get_product_terms($product_id, $attribute->get_name(), ['fields' => 'names']);
                                } else {
                                    $values = $attribute->get_options();
                                }
                                if (empty($values)) {
                                    continue;
                                }
                            ?>
                                <div>
                                    <dt><?php echo esc_html($label); ?></dt>
                                    <dd><?php echo esc_html(implode(', ', array_map('strval', $values))); ?></dd>
                                </div>
                            <?php endforeach; ?>
                        </dl>
                    <?php endif; ?>
                </div>
            </div>
        </section>
    <?php endif; ?>

    <?php if (comments_open($product_id) || $rating_count > 0) : ?>
        <section class="hf-aurora-reviews hf-container">
            <p class="hf-aurora-kicker"><?php esc_html_e('Customer reviews', 'housefinds'); ?></p>
            <?php comments_template(); ?>
        </section>
    <?php endif; ?>

    <div class="hf-aurora-sticky" data-sticky-buy>
        <div>
            <strong><?php esc_html_e('Aurora RGB Projector', 'housefinds'); ?></strong>
            <span><?php echo wp_kses_post($price_html); ?></span>
        </div>
        <a href="#buy" class="hf-aurora-btn hf-aurora-btn--primary"><?php esc_html_e('Choose yours', 'housefinds'); ?></a>
    </div>
</main>

<?php
get_footer();
