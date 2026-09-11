export const CART_COOKIE = 'hf_cart_token'

export function getCartToken(headers: Headers) {
  return headers.get('Cart-Token') || headers.get('cart-token') || ''
}
