</main>
<footer class="hf-site-footer">
    <div class="hf-container">
        <p>&copy; <?php echo esc_html(wp_date('Y')); ?> <?php bloginfo('name'); ?>.</p>
        <?php
        wp_nav_menu([
            'theme_location' => 'footer',
            'container'      => false,
            'fallback_cb'    => false,
        ]);
        ?>
    </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
