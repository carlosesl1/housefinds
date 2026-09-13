<?php
/**
 * Plugin Name: Housefinds Order Bridge
 * Description: Exposes a minimal, privacy-conscious order tracking endpoint for the Housefinds headless storefront.
 * Version: 0.2.0
 * Author: Housefinds
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Housefinds_Order_Bridge {
    const NS = 'housefinds/v1';
    const ROUTE = '/order-status';

    public static function boot() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    public static function register_routes() {
        register_rest_route(self::NS, self::ROUTE, [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'order_status'],
            'permission_callback' => '__return_true',
            'args' => [
                'order_number' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'email' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_email',
                ],
            ],
        ]);
    }

    private static function client_key() {
        $forwarded = isset($_SERVER['HTTP_X_HOUSEFINDS_CLIENT_IP']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_X_HOUSEFINDS_CLIENT_IP'])) : '';
        $remote = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
        $client = $forwarded ?: $remote;
        return 'hf_order_lookup_' . substr(hash('sha256', $client . '|' . wp_salt('auth')), 0, 32);
    }

    private static function rate_limited() {
        $key = self::client_key();
        $count = (int) get_transient($key);
        if ($count >= 20) {
            return true;
        }
        set_transient($key, $count + 1, 15 * MINUTE_IN_SECONDS);
        return false;
    }

    private static function generic_not_found() {
        return new WP_Error(
            'housefinds_order_not_found',
            'We could not match that order number and email address.',
            ['status' => 404]
        );
    }

    private static function find_order($order_number, $email) {
        $order = null;

        if (ctype_digit((string) $order_number)) {
            $candidate = wc_get_order((int) $order_number);
            if ($candidate && strtolower((string) $candidate->get_billing_email()) === strtolower($email)) {
                $order = $candidate;
            }
        }

        if ($order) {
            return $order;
        }

        // Supports stores that later add sequential/custom order-number plugins.
        $orders = wc_get_orders([
            'limit' => 10,
            'billing_email' => $email,
            'orderby' => 'date',
            'order' => 'DESC',
            'return' => 'objects',
        ]);

        foreach ($orders as $candidate) {
            if ((string) $candidate->get_order_number() === (string) $order_number) {
                return $candidate;
            }
        }

        return null;
    }

    private static function tracking_items($order) {
        $result = [];
        $items = $order->get_meta('_wc_shipment_tracking_items', true);

        if (is_array($items)) {
            foreach ($items as $item) {
                if (!is_array($item)) {
                    continue;
                }
                $number = isset($item['tracking_number']) ? sanitize_text_field($item['tracking_number']) : '';
                if (!$number) {
                    continue;
                }
                $provider = '';
                if (!empty($item['tracking_provider'])) {
                    $provider = sanitize_text_field($item['tracking_provider']);
                } elseif (!empty($item['custom_tracking_provider'])) {
                    $provider = sanitize_text_field($item['custom_tracking_provider']);
                }
                $link = !empty($item['custom_tracking_link']) ? esc_url_raw($item['custom_tracking_link']) : '';
                $result[] = [
                    'provider' => $provider,
                    'number' => $number,
                    'url' => $link,
                    'date_shipped' => !empty($item['date_shipped']) ? (int) $item['date_shipped'] : null,
                ];
            }
        }

        if (!$result) {
            $number = $order->get_meta('_tracking_number', true);
            if (!$number) {
                $number = $order->get_meta('tracking_number', true);
            }
            if ($number) {
                $provider = $order->get_meta('_tracking_provider', true);
                if (!$provider) {
                    $provider = $order->get_meta('tracking_provider', true);
                }
                $link = $order->get_meta('_tracking_link', true);
                $result[] = [
                    'provider' => sanitize_text_field((string) $provider),
                    'number' => sanitize_text_field((string) $number),
                    'url' => $link ? esc_url_raw((string) $link) : '',
                    'date_shipped' => null,
                ];
            }
        }

        return $result;
    }

    public static function order_status(WP_REST_Request $request) {
        if (!function_exists('wc_get_order')) {
            return new WP_Error('housefinds_woocommerce_unavailable', 'Order tracking is temporarily unavailable.', ['status' => 503]);
        }

        if (self::rate_limited()) {
            return new WP_Error('housefinds_rate_limited', 'Too many lookup attempts. Please wait and try again.', ['status' => 429]);
        }

        $order_number = trim((string) $request->get_param('order_number'));
        $email = strtolower(trim((string) $request->get_param('email')));
        if (!$order_number || !is_email($email)) {
            return self::generic_not_found();
        }

        $order = self::find_order($order_number, $email);
        if (!$order) {
            return self::generic_not_found();
        }

        $created = $order->get_date_created();
        $estimated = $created ? clone $created : null;
        if ($estimated) {
            $estimated->modify('+14 days');
        }

        $line_items = [];
        foreach ($order->get_items('line_item') as $item) {
            $product = $item->get_product();
            $image = '';
            if ($product && $product->get_image_id()) {
                $image = wp_get_attachment_image_url($product->get_image_id(), 'woocommerce_thumbnail');
            }
            $variation = [];
            foreach ($item->get_formatted_meta_data('') as $meta) {
                $variation[] = [
                    'label' => wp_strip_all_tags((string) $meta->display_key),
                    'value' => wp_strip_all_tags((string) $meta->display_value),
                ];
            }
            $line_items[] = [
                'name' => wp_strip_all_tags((string) $item->get_name()),
                'quantity' => (int) $item->get_quantity(),
                'total' => (string) wc_format_decimal($item->get_total(), wc_get_price_decimals()),
                'image' => $image ?: '',
                'variation' => $variation,
            ];
        }

        $shipping = $order->get_address('shipping');
        $tracking = self::tracking_items($order);

        $response = [
            'order_number' => (string) $order->get_order_number(),
            'status' => (string) $order->get_status(),
            'status_label' => wc_get_order_status_name($order->get_status()),
            'created_at' => $created ? $created->date(DATE_ATOM) : null,
            'estimated_delivery' => $estimated ? $estimated->date('Y-m-d') : null,
            'currency' => (string) $order->get_currency(),
            'total' => (string) wc_format_decimal($order->get_total(), wc_get_price_decimals()),
            'items' => $line_items,
            'shipping' => [
                'name' => trim(((string) ($shipping['first_name'] ?? '')) . ' ' . ((string) ($shipping['last_name'] ?? ''))),
                'city' => (string) ($shipping['city'] ?? ''),
                'postcode' => (string) ($shipping['postcode'] ?? ''),
                'country' => (string) ($shipping['country'] ?? ''),
            ],
            'tracking' => $tracking,
            'support_email' => 'contact@housefindsstore.com',
        ];

        return rest_ensure_response($response);
    }
}

Housefinds_Order_Bridge::boot();
