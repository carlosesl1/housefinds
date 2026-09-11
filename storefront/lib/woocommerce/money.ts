export function formatMoney(amount: string | number, minorUnit = 2, symbol = '£') {
  const value = typeof amount === 'string' ? Number(amount) : amount
  return `${symbol}${(value / Math.pow(10, minorUnit)).toFixed(minorUnit)}`
}
