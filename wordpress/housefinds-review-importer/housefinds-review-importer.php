<?php
/**
 * Plugin Name: Housefinds Product Review Importer
 * Description: Imports same-product marketplace reviews into native WooCommerce reviews for the Housefinds headless storefront.
 * Version: 0.1.0
 * Author: Housefinds
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

final class Housefinds_Product_Review_Importer {
    const NONCE_ACTION = 'hf_review_import';
    const AJAX_ACTION  = 'hf_import_product_reviews';
    const SOURCE_META  = '_hf_review_source';
    const SOURCE_ID_META = '_hf_external_review_id';

    public function __construct() {
        add_action( 'add_meta_boxes_product', array( $this, 'add_meta_box' ) );
        add_action( 'wp_ajax_' . self::AJAX_ACTION, array( $this, 'import_reviews' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
    }

    public function add_meta_box() {
        add_meta_box(
            'hf-review-importer',
            __( 'Housefinds product reviews', 'housefinds' ),
            array( $this, 'render_meta_box' ),
            'product',
            'side',
            'default'
        );
    }

    public function render_meta_box( $post ) {
        if ( ! current_user_can( 'edit_post', $post->ID ) ) {
            return;
        }
        ?>
        <p style="margin-top:0">
            Import authentic reviews for the same product into WooCommerce. Imported reviews are stored as external product feedback and are <strong>not</strong> marked as Housefinds verified purchases.
        </p>
        <p>
            <label for="hf-aliexpress-product-url"><strong>AliExpress product URL</strong></label>
            <input id="hf-aliexpress-product-url" type="url" class="widefat" placeholder="https://www.aliexpress.com/item/100500....html" />
        </p>
        <p>
            <label for="hf-review-limit"><strong>Reviews to import</strong></label>
            <select id="hf-review-limit" class="widefat">
                <option value="10">10</option>
                <option value="20" selected>20</option>
                <option value="30">30</option>
                <option value="50">50</option>
            </select>
        </p>
        <p>
            <button type="button" class="button button-secondary" id="hf-import-reviews">Import product reviews</button>
            <span class="spinner" id="hf-review-spinner" style="float:none;margin-top:0"></span>
        </p>
        <p id="hf-review-result" style="font-size:12px;line-height:1.45"></p>
        <p style="font-size:11px;color:#646970">The importer preserves source ratings, does not create fake customer emails and does not change low ratings.</p>
        <?php
    }

    public function enqueue_admin_script( $hook ) {
        if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
            return;
        }

        $screen = get_current_screen();
        if ( ! $screen || 'product' !== $screen->post_type ) {
            return;
        }

        global $post;
        if ( ! $post || ! current_user_can( 'edit_post', $post->ID ) ) {
            return;
        }

        wp_register_script( 'hf-review-importer-admin', '', array(), '0.1.0', true );
        wp_enqueue_script( 'hf-review-importer-admin' );
        wp_localize_script(
            'hf-review-importer-admin',
            'HFReviewImporter',
            array(
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'action'    => self::AJAX_ACTION,
                'nonce'     => wp_create_nonce( self::NONCE_ACTION ),
                'productId' => (int) $post->ID,
            )
        );

        $script = <<<'JS'
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var button = document.getElementById('hf-import-reviews');
    if (!button || typeof HFReviewImporter === 'undefined') return;

    var url = document.getElementById('hf-aliexpress-product-url');
    var limit = document.getElementById('hf-review-limit');
    var result = document.getElementById('hf-review-result');
    var spinner = document.getElementById('hf-review-spinner');

    button.addEventListener('click', function () {
      var productUrl = (url.value || '').trim();
      if (!productUrl) {
        result.textContent = 'Paste the AliExpress product URL first.';
        return;
      }

      button.disabled = true;
      spinner.classList.add('is-active');
      result.textContent = 'Fetching product reviews…';

      var body = new URLSearchParams();
      body.set('action', HFReviewImporter.action);
      body.set('_ajax_nonce', HFReviewImporter.nonce);
      body.set('product_id', String(HFReviewImporter.productId));
      body.set('product_url', productUrl);
      body.set('limit', limit.value || '20');

      fetch(HFReviewImporter.ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: body.toString()
      })
        .then(function (response) { return response.json(); })
        .then(function (payload) {
          if (!payload.success) throw new Error(payload.data && payload.data.message ? payload.data.message : 'Import failed.');
          result.textContent = payload.data.message;
        })
        .catch(function (error) {
          result.textContent = error.message || 'Import failed.';
        })
        .finally(function () {
          button.disabled = false;
          spinner.classList.remove('is-active');
        });
    });
  });
})();
JS;
        wp_add_inline_script( 'hf-review-importer-admin', $script );
    }

    public function import_reviews() {
        check_ajax_referer( self::NONCE_ACTION );

        $product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
        if ( ! $product_id || 'product' !== get_post_type( $product_id ) || ! current_user_can( 'edit_post', $product_id ) ) {
            wp_send_json_error( array( 'message' => 'You do not have permission to import reviews for this product.' ), 403 );
        }

        $product_url = isset( $_POST['product_url'] ) ? esc_url_raw( wp_unslash( $_POST['product_url'] ) ) : '';
        $product_source_id = $this->extract_product_id( $product_url );
        if ( ! $product_source_id ) {
            wp_send_json_error( array( 'message' => 'That does not look like a supported AliExpress product URL.' ), 400 );
        }

        $limit = isset( $_POST['limit'] ) ? absint( $_POST['limit'] ) : 20;
        $limit = min( 50, max( 1, $limit ) );

        $reviews = $this->fetch_reviews( $product_source_id, $limit );
        if ( is_wp_error( $reviews ) ) {
            wp_send_json_error( array( 'message' => $reviews->get_error_message() ), 502 );
        }

        if ( ! $reviews ) {
            wp_send_json_error( array( 'message' => 'No reviews were returned for this product.' ), 404 );
        }

        $existing_ids = $this->existing_external_ids( $product_id );
        $imported = 0;
        $skipped = 0;

        foreach ( array_slice( $reviews, 0, $limit ) as $review ) {
            $external_id = sanitize_text_field( (string) ( $review['evaluationId'] ?? '' ) );
            if ( $external_id && in_array( $external_id, $existing_ids, true ) ) {
                $skipped++;
                continue;
            }

            $comment_id = $this->insert_review( $product_id, $review, $external_id );
            if ( $comment_id ) {
                $imported++;
                if ( $external_id ) {
                    $existing_ids[] = $external_id;
                }
            } else {
                $skipped++;
            }
        }

        if ( function_exists( 'wc_update_product_rating_counts' ) ) {
            wc_update_product_rating_counts( $product_id );
        }
        if ( function_exists( 'wc_update_product_rating' ) ) {
            wc_update_product_rating( $product_id );
        }
        if ( function_exists( 'wc_update_product_review_count' ) ) {
            wc_update_product_review_count( $product_id );
        }
        clean_post_cache( $product_id );

        wp_send_json_success(
            array(
                'message' => sprintf(
                    'Imported %d product review%s. %d duplicate or unusable review%s skipped.',
                    $imported,
                    1 === $imported ? '' : 's',
                    $skipped,
                    1 === $skipped ? '' : 's'
                ),
            )
        );
    }

    private function extract_product_id( $url ) {
        if ( ! $url ) {
            return '';
        }

        $host = strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) );
        $allowed = preg_match( '/(^|\.)aliexpress\.(com|us)$|(^|\.)aliexpress\.com\.[a-z]{2}$/i', $host );
        if ( ! $allowed ) {
            return '';
        }

        if ( preg_match( '~/(?:item/)?(\d{8,})\.html~i', $url, $matches ) ) {
            return preg_replace( '/\D+/', '', $matches[1] );
        }

        if ( preg_match( '~/(\d{8,})(?:[/?#]|$)~', $url, $matches ) ) {
            return preg_replace( '/\D+/', '', $matches[1] );
        }

        return '';
    }

    private function fetch_reviews( $source_product_id, $limit ) {
        $endpoint = add_query_arg(
            array(
                'productId' => rawurlencode( $source_product_id ),
                'pageSize'  => min( 50, max( 1, $limit ) ),
            ),
            'https://feedback.aliexpress.com/pc/searchEvaluation.do'
        );

        $response = wp_safe_remote_get(
            $endpoint,
            array(
                'timeout'     => 15,
                'redirection' => 2,
                'headers'     => array(
                    'Accept'     => 'application/json,text/plain,*/*',
                    'User-Agent' => 'Mozilla/5.0 (compatible; HousefindsReviewImporter/0.1)',
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'hf_review_request', 'Could not reach the product review source.' );
        }

        $status = wp_remote_retrieve_response_code( $response );
        if ( 200 !== $status ) {
            return new WP_Error( 'hf_review_status', 'The product review source returned an unexpected response.' );
        }

        $body = wp_remote_retrieve_body( $response );
        if ( strlen( $body ) > 5 * MB_IN_BYTES ) {
            return new WP_Error( 'hf_review_too_large', 'The review response was unexpectedly large.' );
        }

        $payload = json_decode( $body, true );
        if ( ! is_array( $payload ) ) {
            return new WP_Error( 'hf_review_json', 'The product review response could not be read.' );
        }

        $reviews = $payload['data']['evaViewList'] ?? array();
        return is_array( $reviews ) ? $reviews : array();
    }

    private function existing_external_ids( $product_id ) {
        $comments = get_comments(
            array(
                'post_id'    => $product_id,
                'type'       => 'review',
                'status'     => 'all',
                'number'     => 0,
                'meta_query' => array(
                    array(
                        'key'     => self::SOURCE_ID_META,
                        'compare' => 'EXISTS',
                    ),
                ),
            )
        );

        $ids = array();
        foreach ( $comments as $comment ) {
            $value = get_comment_meta( $comment->comment_ID, self::SOURCE_ID_META, true );
            if ( $value ) {
                $ids[] = (string) $value;
            }
        }
        return array_values( array_unique( $ids ) );
    }

    private function insert_review( $product_id, $review, $external_id ) {
        $rating_raw = isset( $review['buyerEval'] ) ? floatval( $review['buyerEval'] ) : 0;
        $rating = $rating_raw > 5 ? (int) round( $rating_raw / 20 ) : (int) round( $rating_raw );
        $rating = min( 5, max( 1, $rating ) );

        $author = isset( $review['buyerName'] ) ? sanitize_text_field( (string) $review['buyerName'] ) : '';
        if ( '' === trim( $author ) ) {
            $author = 'Product buyer';
        }

        $content = isset( $review['buyerFeedback'] ) ? sanitize_textarea_field( (string) $review['buyerFeedback'] ) : '';
        $images  = $this->sanitize_image_urls( $review['images'] ?? array() );
        if ( $images ) {
            $content .= $this->review_images_html( $images );
        }

        $comment_date = current_time( 'mysql' );
        foreach ( array( 'evalDate', 'evaluationDate', 'date' ) as $date_key ) {
            if ( ! empty( $review[ $date_key ] ) ) {
                $timestamp = strtotime( (string) $review[ $date_key ] );
                if ( $timestamp ) {
                    $comment_date = wp_date( 'Y-m-d H:i:s', $timestamp );
                    break;
                }
            }
        }

        $comment_id = wp_insert_comment(
            array(
                'comment_post_ID'      => $product_id,
                'comment_author'       => $author,
                'comment_author_email' => '',
                'comment_author_url'   => '',
                'comment_content'      => wp_kses_post( $content ),
                'comment_type'         => 'review',
                'comment_approved'     => 1,
                'comment_date'         => $comment_date,
                'user_id'              => 0,
            )
        );

        if ( ! $comment_id ) {
            return 0;
        }

        update_comment_meta( $comment_id, 'rating', $rating );
        update_comment_meta( $comment_id, self::SOURCE_META, 'external_product_marketplace' );
        update_comment_meta( $comment_id, '_hf_review_imported_at', current_time( 'mysql', true ) );
        if ( $external_id ) {
            update_comment_meta( $comment_id, self::SOURCE_ID_META, $external_id );
        }

        return $comment_id;
    }

    private function sanitize_image_urls( $images ) {
        if ( ! is_array( $images ) ) {
            return array();
        }

        $urls = array();
        foreach ( array_slice( $images, 0, 6 ) as $image ) {
            $candidate = is_array( $image ) ? ( $image['url'] ?? $image['src'] ?? '' ) : $image;
            $candidate = esc_url_raw( (string) $candidate, array( 'https' ) );
            if ( $candidate ) {
                $urls[] = $candidate;
            }
        }
        return array_values( array_unique( $urls ) );
    }

    private function review_images_html( $urls ) {
        $html = '<div class="hf-imported-review-images">';
        foreach ( $urls as $url ) {
            $html .= '<img src="' . esc_url( $url ) . '" alt="Product review photo" loading="lazy" />';
        }
        $html .= '</div>';
        return $html;
    }
}

new Housefinds_Product_Review_Importer();
