export const SUPPORT_EMAIL = 'contact@housefindsstore.com'

export const SELLER_LEGAL_NAME = process.env.NEXT_PUBLIC_LEGAL_SELLER_NAME?.trim() || 'Housefinds'
export const SELLER_BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_LEGAL_BUSINESS_ADDRESS?.trim() || ''
export const SELLER_COMPANY_NUMBER = process.env.NEXT_PUBLIC_LEGAL_COMPANY_NUMBER?.trim() || ''

export const SELLER_IDENTITY_COMPLETE = Boolean(
  process.env.NEXT_PUBLIC_LEGAL_SELLER_NAME?.trim()
  && SELLER_BUSINESS_ADDRESS,
)
