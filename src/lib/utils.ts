import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique quote number
export function generateQuoteNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `Q${year}${month}${day}-${random}`
}

// Calculate quote price based on word count and rate
export function calculateQuotePrice(
  wordCount: number,
  ratePerWord: number | { toNumber: () => number },
  minimumCharge: number | { toNumber: () => number } | null = 25
): { subtotal: number; tax: number; total: number } {
  const rate = typeof ratePerWord === 'number' ? ratePerWord : ratePerWord.toNumber()
  const minimum = minimumCharge 
    ? (typeof minimumCharge === 'number' ? minimumCharge : minimumCharge.toNumber())
    : 25
  
  const subtotal = Math.max(wordCount * rate, minimum)
  const tax = subtotal * 0 // No tax for now
  const total = subtotal + tax
  
  return { subtotal, tax, total }
}
