'use client'

import type { CheckoutAddress } from '@/store/cart'
import type { AddressErrors } from '@/lib/storefront/checkout'
import { normalisePostcode } from '@/lib/storefront/checkout'

export function checkoutFieldId(prefix: string, field: keyof CheckoutAddress) { return `${prefix}-${field.replaceAll('_', '-')}` }

export function CheckoutField({ prefix, field, label, value, onChange, onBlur, error, hint, autoComplete, optional = false, type = 'text' }: {
  prefix: string
  field: keyof CheckoutAddress
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  hint?: string
  autoComplete: string
  optional?: boolean
  type?: 'text' | 'email' | 'tel'
}) {
  const id = checkoutFieldId(prefix, field)
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--hf-ink)]">{label}{optional && <span className="ml-1.5 font-normal text-[var(--hf-ink-soft)]">(optional)</span>}</label>
      <input id={id} name={id} type={type} inputMode={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text'}
        autoComplete={autoComplete} autoCapitalize={type === 'email' ? 'none' : field === 'postcode' ? 'characters' : 'words'}
        spellCheck={false} required={!optional} value={value} maxLength={200}
        onChange={(event) => onChange(event.target.value)} onBlur={onBlur}
        aria-invalid={Boolean(error)} aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
        className={`hf-field !text-base disabled:opacity-70 ${error ? '!border-rose-600' : ''}`} />
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-[var(--hf-ink-soft)]">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm leading-5 text-rose-800">{error}</p>}
    </div>
  )
}

export function CheckoutAddressFields({ prefix, address, setField, errors, onBlur, phone = false }: {
  prefix: 'delivery' | 'billing'
  address: CheckoutAddress
  setField: (key: keyof CheckoutAddress, value: string) => void
  errors: AddressErrors
  onBlur: (field: keyof CheckoutAddress) => void
  phone?: boolean
}) {
  const group = prefix === 'delivery' ? 'shipping' : 'billing'
  const field = (key: keyof CheckoutAddress, label: string, autoComplete: string, optional = false, hint?: string) => (
    <CheckoutField prefix={prefix} field={key} label={label} value={address[key] || ''}
      onChange={(value) => setField(key, value)} onBlur={() => { if (key === 'postcode') setField(key, normalisePostcode(address.postcode)); onBlur(key) }}
      autoComplete={`${group} ${autoComplete}`} optional={optional} hint={hint} error={errors[key]} />
  )
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">{field('first_name', 'First name', 'given-name')}{field('last_name', 'Last name', 'family-name')}</div>
      {field('address_1', 'House number and street', 'address-line1')}
      <details className="group" open={address.address_2 || address.state ? true : undefined}>
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-[var(--hf-brand)] underline decoration-[var(--hf-brand)]/30 underline-offset-4">Add flat, apartment or county (optional)</summary>
        <div className="space-y-4 pb-1 pt-2">{field('address_2', 'Flat, apartment or suite', 'address-line2', true)}{field('state', 'County', 'address-level1', true)}</div>
      </details>
      <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">{field('city', 'Town or city', 'address-level2')}{field('postcode', 'Postcode', 'postal-code', false, 'For example, SW1A 1AA')}</div>
      <p className="flex flex-wrap gap-x-2 text-sm text-[var(--hf-ink-soft)]"><span>Country / region:</span><strong className="font-medium text-[var(--hf-ink)]">United Kingdom</strong></p>
      {errors.country && <p className="text-sm text-rose-800">{errors.country}</p>}
      {phone && <details className="group" open={address.phone ? true : undefined}>
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-[var(--hf-brand)] underline decoration-[var(--hf-brand)]/30 underline-offset-4">Add a phone number (optional)</summary>
        <div className="pt-2"><CheckoutField prefix={prefix} field="phone" label="Phone number" value={address.phone || ''} onChange={(value) => setField('phone', value)} onBlur={() => onBlur('phone')} optional type="tel" autoComplete="shipping tel" hint="Only for questions about delivery or your order." /></div>
      </details>}
    </div>
  )
}
