/**
 * Calculate quote based on language pair pricing
 */
export function calculateQuotePrice(
  wordCount: number,
  ratePerWord: number,
  minimumCharge: number,
  tax: number = 0
): { subtotal: number; tax: number; total: number } {
  const subtotal = Math.max(wordCount * ratePerWord, minimumCharge)
  const taxAmount = subtotal * (tax / 100)
  const total = subtotal + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Get default pricing based on language complexity
 */
export function getDefaultLanguagePricing(sourceLanguage: string, targetLanguage: string): {
  ratePerWord: number
  minimumCharge: number
} {
  // Default pricing: simple language pairs at lower end, complex pairs at higher end
  const complexLanguages = ['Arabic', 'Chinese', 'Hebrew', 'Japanese', 'Korean', 'Thai', 'Vietnamese']

  const isComplex =
    complexLanguages.includes(sourceLanguage) || complexLanguages.includes(targetLanguage)

  return {
    ratePerWord: isComplex ? 0.28 : 0.16,
    minimumCharge: isComplex ? 35 : 25,
  }
}

/**
 * Calculate hourly rate from word count and typical time
 */
export function calculateHourlyRate(
  wordCount: number,
  estimatedHours: number,
  desiredRate: number
): number {
  if (estimatedHours === 0) return 0
  const totalFromWords = wordCount * desiredRate
  return Math.round((totalFromWords / estimatedHours) * 100) / 100
}
