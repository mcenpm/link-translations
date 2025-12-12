import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface QuotePDFData {
  quoteNumber: string
  createdAt: string
  validUntil: string
  customer: {
    name: string
    email: string
    company?: string
    address?: string
  }
  items: {
    description: string
    sourceLanguage: string
    targetLanguage: string
    serviceType: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax?: number
  discount?: number
  total: number
  notes?: string
}

// Company settings for PDF generation
interface CompanyPDFSettings {
  companyName: string
  legalName?: string | null
  tagline?: string | null
  email: string
  phone: string
  tollFree?: string | null
  website: string
  address: string
  city: string
  state: string
  zipCode: string
  primaryColor?: string
  pdfHeaderText?: string | null
  pdfFooterText?: string | null
  pdfTermsAndConditions?: string | null
}

// Default settings if not provided
const defaultSettings: CompanyPDFSettings = {
  companyName: 'LINK TRANSLATIONS',
  legalName: 'Link Translations, LLC',
  tagline: 'Professional Translation & Interpretation Services',
  email: 'info@linktranslations.com',
  phone: '(800) 707-6752',
  website: 'www.linktranslations.com',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  primaryColor: '#2563eb'
}

// Convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [37, 99, 235] // default blue-600
}

export function generateQuotePDF(data: QuotePDFData, settings?: CompanyPDFSettings): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Merge with defaults
  const companySettings = { ...defaultSettings, ...settings }
  
  // Colors
  const primaryColor = hexToRgb(companySettings.primaryColor || '#2563eb')
  const grayColor = [107, 114, 128] as [number, number, number] // gray-500
  const darkColor = [31, 41, 55] as [number, number, number] // gray-800
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(companySettings.companyName.toUpperCase(), 20, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(companySettings.tagline || 'Professional Translation Services', 20, 35)
  
  // Quote badge
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(pageWidth - 70, 12, 55, 22, 3, 3, 'F')
  doc.setTextColor(...primaryColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('QUOTE', pageWidth - 55, 21)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.quoteNumber, pageWidth - 55, 29)
  
  // Reset text color
  doc.setTextColor(...darkColor)
  
  // Quote details section
  let yPos = 60
  
  // Left column - Bill To
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  doc.text('BILL TO', 20, yPos)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  doc.setFontSize(11)
  yPos += 8
  doc.text(data.customer.name, 20, yPos)
  yPos += 6
  if (data.customer.company) {
    doc.setFontSize(10)
    doc.text(data.customer.company, 20, yPos)
    yPos += 6
  }
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  doc.text(data.customer.email, 20, yPos)
  if (data.customer.address) {
    yPos += 5
    doc.text(data.customer.address, 20, yPos)
  }
  
  // Right column - Quote Info
  const rightCol = pageWidth - 80
  yPos = 60
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  doc.text('QUOTE DETAILS', rightCol, yPos)
  
  doc.setFont('helvetica', 'normal')
  yPos += 10
  
  const details = [
    ['Quote Date:', data.createdAt],
    ['Valid Until:', data.validUntil],
  ]
  
  details.forEach(([label, value]) => {
    doc.setTextColor(...grayColor)
    doc.setFontSize(9)
    doc.text(label, rightCol, yPos)
    doc.setTextColor(...darkColor)
    doc.text(value, rightCol + 35, yPos)
    yPos += 6
  })
  
  // Items table
  yPos = 110
  
  const tableColumns = [
    { header: 'Description', dataKey: 'description' },
    { header: 'Languages', dataKey: 'languages' },
    { header: 'Service', dataKey: 'service' },
    { header: 'Qty', dataKey: 'qty' },
    { header: 'Unit Price', dataKey: 'unitPrice' },
    { header: 'Total', dataKey: 'total' },
  ]
  
  const tableRows = data.items.map(item => ({
    description: item.description,
    languages: `${item.sourceLanguage} → ${item.targetLanguage}`,
    service: item.serviceType,
    qty: `${item.quantity} ${item.unit}`,
    unitPrice: `$${item.unitPrice.toFixed(2)}`,
    total: `$${item.total.toFixed(2)}`,
  }))
  
  autoTable(doc, {
    startY: yPos,
    head: [tableColumns.map(col => col.header)],
    body: tableRows.map(row => tableColumns.map(col => row[col.dataKey as keyof typeof row])),
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })
  
  // Get the Y position after the table
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  
  // Summary section
  const summaryX = pageWidth - 90
  let summaryY = finalY
  
  // Subtotal
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  doc.text('Subtotal:', summaryX, summaryY)
  doc.setTextColor(...darkColor)
  doc.text(`$${data.subtotal.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  
  // Discount if any
  if (data.discount && data.discount > 0) {
    summaryY += 8
    doc.setTextColor(...grayColor)
    doc.text('Discount:', summaryX, summaryY)
    doc.setTextColor(220, 38, 38) // red-600
    doc.text(`-$${data.discount.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  }
  
  // Tax if any
  if (data.tax && data.tax > 0) {
    summaryY += 8
    doc.setTextColor(...grayColor)
    doc.text('Tax:', summaryX, summaryY)
    doc.setTextColor(...darkColor)
    doc.text(`$${data.tax.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  }
  
  // Total
  summaryY += 12
  doc.setFillColor(...primaryColor)
  doc.roundedRect(summaryX - 5, summaryY - 7, 80, 14, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL:', summaryX, summaryY)
  doc.text(`$${data.total.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  
  // Notes section
  if (data.notes) {
    summaryY += 25
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 20, summaryY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    summaryY += 7
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 40)
    doc.text(splitNotes, 20, summaryY)
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(229, 231, 235) // gray-200
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10)
  
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.text(companySettings.legalName || companySettings.companyName, 20, footerY)
  doc.text(`${companySettings.email} | ${companySettings.phone}`, 20, footerY + 5)
  doc.text(companySettings.website, pageWidth - 20, footerY, { align: 'right' })
  
  // Add custom footer text if provided
  if (companySettings.pdfFooterText) {
    doc.text(companySettings.pdfFooterText, pageWidth / 2, footerY + 5, { align: 'center' })
  }
  
  return doc
}

// ==================== INVOICE PDF ====================

interface InvoicePDFData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customer: {
    name: string
    email: string
    company?: string
    address?: string
  }
  project?: {
    projectNumber: string
    description: string
  }
  items: {
    description: string
    sourceLanguage?: string
    targetLanguage?: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax?: number
  discount?: number
  total: number
  amountPaid?: number
  amountDue: number
  paymentTerms?: string
  bankDetails?: string | null
  notes?: string
}

export function generateInvoicePDF(data: InvoicePDFData, settings?: CompanyPDFSettings): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Merge with defaults
  const companySettings = { ...defaultSettings, ...settings }
  
  // Colors
  const primaryColor = hexToRgb(companySettings.primaryColor || '#2563eb')
  const grayColor = [107, 114, 128] as [number, number, number]
  const darkColor = [31, 41, 55] as [number, number, number]
  const greenColor = [22, 163, 74] as [number, number, number] // green-600
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(companySettings.companyName.toUpperCase(), 20, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(companySettings.tagline || 'Professional Translation Services', 20, 35)
  
  // Invoice badge
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(pageWidth - 70, 12, 55, 22, 3, 3, 'F')
  doc.setTextColor(...primaryColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - 55, 21)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.invoiceNumber, pageWidth - 55, 29)
  
  // Reset text color
  doc.setTextColor(...darkColor)
  
  // Invoice details section
  let yPos = 60
  
  // Left column - Bill To
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  doc.text('BILL TO', 20, yPos)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  doc.setFontSize(11)
  yPos += 8
  doc.text(data.customer.name, 20, yPos)
  yPos += 6
  if (data.customer.company) {
    doc.setFontSize(10)
    doc.text(data.customer.company, 20, yPos)
    yPos += 6
  }
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  doc.text(data.customer.email, 20, yPos)
  if (data.customer.address) {
    yPos += 5
    const addressLines = doc.splitTextToSize(data.customer.address, 80)
    doc.text(addressLines, 20, yPos)
  }
  
  // Right column - Invoice Info
  const rightCol = pageWidth - 80
  yPos = 60
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  doc.text('INVOICE DETAILS', rightCol, yPos)
  
  doc.setFont('helvetica', 'normal')
  yPos += 10
  
  const details = [
    ['Invoice Date:', data.invoiceDate],
    ['Due Date:', data.dueDate],
    ['Payment Terms:', data.paymentTerms || 'Net 30'],
  ]
  
  if (data.project) {
    details.push(['Project #:', data.project.projectNumber])
  }
  
  details.forEach(([label, value]) => {
    doc.setTextColor(...grayColor)
    doc.setFontSize(9)
    doc.text(label, rightCol, yPos)
    doc.setTextColor(...darkColor)
    doc.text(value, rightCol + 40, yPos)
    yPos += 6
  })
  
  // Items table
  yPos = 115
  
  const tableColumns = [
    { header: 'Description', dataKey: 'description' },
    { header: 'Qty', dataKey: 'qty' },
    { header: 'Unit Price', dataKey: 'unitPrice' },
    { header: 'Total', dataKey: 'total' },
  ]
  
  const tableRows = data.items.map(item => ({
    description: item.sourceLanguage && item.targetLanguage 
      ? `${item.description}\n${item.sourceLanguage} → ${item.targetLanguage}`
      : item.description,
    qty: `${item.quantity} ${item.unit}`,
    unitPrice: `$${item.unitPrice.toFixed(2)}`,
    total: `$${item.total.toFixed(2)}`,
  }))
  
  autoTable(doc, {
    startY: yPos,
    head: [tableColumns.map(col => col.header)],
    body: tableRows.map(row => tableColumns.map(col => row[col.dataKey as keyof typeof row])),
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })
  
  // Get the Y position after the table
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  
  // Summary section
  const summaryX = pageWidth - 90
  let summaryY = finalY
  
  // Subtotal
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  doc.text('Subtotal:', summaryX, summaryY)
  doc.setTextColor(...darkColor)
  doc.text(`$${data.subtotal.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  
  // Discount if any
  if (data.discount && data.discount > 0) {
    summaryY += 8
    doc.setTextColor(...grayColor)
    doc.text('Discount:', summaryX, summaryY)
    doc.setTextColor(220, 38, 38)
    doc.text(`-$${data.discount.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  }
  
  // Tax if any
  if (data.tax && data.tax > 0) {
    summaryY += 8
    doc.setTextColor(...grayColor)
    doc.text('Tax:', summaryX, summaryY)
    doc.setTextColor(...darkColor)
    doc.text(`$${data.tax.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  }
  
  // Total
  summaryY += 10
  doc.setTextColor(...grayColor)
  doc.text('Total:', summaryX, summaryY)
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.text(`$${data.total.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  
  // Amount Paid if any
  if (data.amountPaid && data.amountPaid > 0) {
    summaryY += 8
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text('Amount Paid:', summaryX, summaryY)
    doc.setTextColor(...greenColor)
    doc.text(`-$${data.amountPaid.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  }
  
  // Amount Due
  summaryY += 12
  doc.setFillColor(...primaryColor)
  doc.roundedRect(summaryX - 5, summaryY - 7, 80, 14, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('AMOUNT DUE:', summaryX, summaryY)
  doc.text(`$${data.amountDue.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  
  // Bank Details section (if provided)
  if (data.bankDetails) {
    summaryY += 25
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Payment Information:', 20, summaryY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    summaryY += 7
    const bankLines = doc.splitTextToSize(data.bankDetails, pageWidth - 40)
    doc.text(bankLines, 20, summaryY)
    summaryY += bankLines.length * 5
  }
  
  // Notes section
  if (data.notes) {
    summaryY += 15
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 20, summaryY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    summaryY += 7
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 40)
    doc.text(splitNotes, 20, summaryY)
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(229, 231, 235)
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10)
  
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.text(companySettings.legalName || companySettings.companyName, 20, footerY)
  doc.text(`${companySettings.email} | ${companySettings.phone}`, 20, footerY + 5)
  doc.text(companySettings.website, pageWidth - 20, footerY, { align: 'right' })
  
  return doc
}

// ==================== PURCHASE ORDER PDF ====================

interface PurchaseOrderPDFData {
  poNumber: string
  poDate: string
  dueDate: string
  vendor: {
    name: string
    email: string
    address?: string
  }
  project?: {
    projectNumber: string
    description: string
  }
  items: {
    description: string
    sourceLanguage?: string
    targetLanguage?: string
    quantity: number
    unit: string
    rate: number
    total: number
  }[]
  subtotal: number
  total: number
  notes?: string
  termsAndConditions?: string | null
}

export function generatePurchaseOrderPDF(data: PurchaseOrderPDFData, settings?: CompanyPDFSettings): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Merge with defaults
  const companySettings = { ...defaultSettings, ...settings }
  
  // Colors
  const grayColor = [107, 114, 128] as [number, number, number]
  const darkColor = [31, 41, 55] as [number, number, number]
  const amberColor = [217, 119, 6] as [number, number, number] // amber-600
  
  // Header
  doc.setFillColor(...amberColor)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(companySettings.companyName.toUpperCase(), 20, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(companySettings.tagline || 'Professional Translation Services', 20, 35)
  
  // PO badge
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(pageWidth - 85, 12, 70, 22, 3, 3, 'F')
  doc.setTextColor(...amberColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('PURCHASE ORDER', pageWidth - 70, 21)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.poNumber, pageWidth - 70, 29)
  
  // Reset text color
  doc.setTextColor(...darkColor)
  
  // PO details section
  let yPos = 60
  
  // Left column - Vendor Info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  doc.text('VENDOR', 20, yPos)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  doc.setFontSize(11)
  yPos += 8
  doc.text(data.vendor.name, 20, yPos)
  yPos += 6
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  doc.text(data.vendor.email, 20, yPos)
  if (data.vendor.address) {
    yPos += 5
    const addressLines = doc.splitTextToSize(data.vendor.address, 80)
    doc.text(addressLines, 20, yPos)
  }
  
  // Right column - PO Info
  const rightCol = pageWidth - 80
  yPos = 60
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  doc.text('PO DETAILS', rightCol, yPos)
  
  doc.setFont('helvetica', 'normal')
  yPos += 10
  
  const details = [
    ['PO Date:', data.poDate],
    ['Due Date:', data.dueDate],
  ]
  
  if (data.project) {
    details.push(['Project #:', data.project.projectNumber])
  }
  
  details.forEach(([label, value]) => {
    doc.setTextColor(...grayColor)
    doc.setFontSize(9)
    doc.text(label, rightCol, yPos)
    doc.setTextColor(...darkColor)
    doc.text(value, rightCol + 30, yPos)
    yPos += 6
  })
  
  // Company Info
  yPos += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  doc.text('FROM', rightCol, yPos)
  yPos += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...darkColor)
  doc.text(companySettings.companyName, rightCol, yPos)
  yPos += 5
  doc.setTextColor(...grayColor)
  doc.text(companySettings.email, rightCol, yPos)
  
  // Items table
  yPos = 115
  
  const tableColumns = [
    { header: 'Description', dataKey: 'description' },
    { header: 'Qty', dataKey: 'qty' },
    { header: 'Rate', dataKey: 'rate' },
    { header: 'Total', dataKey: 'total' },
  ]
  
  const tableRows = data.items.map(item => ({
    description: item.sourceLanguage && item.targetLanguage 
      ? `${item.description}\n${item.sourceLanguage} → ${item.targetLanguage}`
      : item.description,
    qty: `${item.quantity} ${item.unit}`,
    rate: `$${item.rate.toFixed(2)}`,
    total: `$${item.total.toFixed(2)}`,
  }))
  
  autoTable(doc, {
    startY: yPos,
    head: [tableColumns.map(col => col.header)],
    body: tableRows.map(row => tableColumns.map(col => row[col.dataKey as keyof typeof row])),
    theme: 'striped',
    headStyles: {
      fillColor: amberColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: [254, 252, 232], // amber-50
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })
  
  // Get the Y position after the table
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  
  // Total section
  const summaryX = pageWidth - 90
  let summaryY = finalY
  
  // Subtotal
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  doc.text('Subtotal:', summaryX, summaryY)
  doc.setTextColor(...darkColor)
  doc.text(`$${data.subtotal.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  
  // Total
  summaryY += 12
  doc.setFillColor(...amberColor)
  doc.roundedRect(summaryX - 5, summaryY - 7, 80, 14, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL:', summaryX, summaryY)
  doc.text(`$${data.total.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' })
  
  // Terms & Conditions
  if (data.termsAndConditions || companySettings.pdfTermsAndConditions) {
    summaryY += 25
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Terms & Conditions:', 20, summaryY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    summaryY += 7
    const terms = data.termsAndConditions || companySettings.pdfTermsAndConditions || ''
    const termLines = doc.splitTextToSize(terms, pageWidth - 40)
    doc.text(termLines, 20, summaryY)
  }
  
  // Notes section
  if (data.notes) {
    summaryY += 20
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 20, summaryY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    summaryY += 7
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 40)
    doc.text(splitNotes, 20, summaryY)
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(229, 231, 235)
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10)
  
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.text(companySettings.legalName || companySettings.companyName, 20, footerY)
  doc.text(`${companySettings.email} | ${companySettings.phone}`, 20, footerY + 5)
  doc.text(companySettings.website, pageWidth - 20, footerY, { align: 'right' })
  
  return doc
}

// Export types for use elsewhere
export type { QuotePDFData, InvoicePDFData, PurchaseOrderPDFData, CompanyPDFSettings }
