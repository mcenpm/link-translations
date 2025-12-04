export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale)
}

export function formatDateTime(date: Date, locale = 'en-US'): string {
  return date.toLocaleString(locale)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateQuoteNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `QT-${random}-${timestamp}`
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${random}-${timestamp}`
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString().slice(-5)
  return `INV-${year}-${random}-${timestamp}`
}
