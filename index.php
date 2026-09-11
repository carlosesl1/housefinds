<?php
get_header();
?>
<div class="hf-container" style="padding:64px 0;">
    <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
            <article <?php post_class(); ?>>
                <h1><?php the_title(); ?></h1>
                <?php the_content(); ?>
            </article>
        <?php endwhile; ?>
    <?php else : ?>
        <p><?php esc_html_e('Nothing found.', 'housefinds'); ?></p>
    <?php endif; ?>
</div>
<?php
get_footer();
