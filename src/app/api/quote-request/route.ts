import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, getAdminEmail } from '@/lib/email'
import { quoteRequestEmail, adminNewOrderEmail } from '@/lib/email-templates'
import { calculateInterpretationPrice } from '@/lib/pricing/interpretation'

// Generate sequential quote number continuing from highest existing
async function generateQuoteNumber(): Promise<string> {
  // Find the highest numeric quote number
  const quotes = await prisma.quote.findMany({
    select: { quoteNumber: true },
    orderBy: { createdAt: 'desc' },
    take: 1000, // Check recent quotes
  })
  
  let maxNumber = 45733 // Start from last known number if no quotes found
  
  for (const quote of quotes) {
    if (quote.quoteNumber) {
      // Try to parse as pure number (e.g., "45733")
      const num = parseInt(quote.quoteNumber, 10)
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num
      }
    }
  }
  
  return (maxNumber + 1).toString()
}

// POST: Submit a new quote request from public form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      // Contact Info
      firstName,
      lastName,
      email,
      phone,
      company,
      
      // Service Details
      serviceType,
      sourceLanguageId,
      targetLanguageId,
      documentType,
      wordCount,
      deadline,
      
      // Interpretation Details
      interpretationSetting, // 'in-person', 'video-remote', 'phone'
      interpretationMode, // 'consecutive', 'simultaneous'
      subjectMatter,
      interpretationLocation,
      interpretationCity,
      interpretationState,
      timeZone,
      dateTimeEntries, // Array of { date, startTime, endTime }
      
      // Legacy interpretation fields (for backwards compatibility)
      interpretationType,
      interpretationDate,
      
      // Additional Info
      description,
      howDidYouHear,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !serviceType || !sourceLanguageId || !targetLanguageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find or create customer
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    let customer

    if (!user) {
      // Create new user and customer
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: '', // Will be set when they create account
          role: 'CUSTOMER',
          firstName,
          lastName,
          phone,
        }
      })

      customer = await prisma.corporate.create({
        data: {
          userId: user.id,
          company: company || `${firstName} ${lastName}`,
        }
      })
    } else {
      // Find existing customer
      customer = await prisma.corporate.findFirst({
        where: { userId: user.id }
      })

      if (!customer) {
        customer = await prisma.corporate.create({
          data: {
            userId: user.id,
            company: company || `${firstName} ${lastName}`,
          }
        })
      }
    }

    // Get languages
    const sourceLanguage = await prisma.language.findUnique({ where: { id: sourceLanguageId } })
    const targetLanguage = await prisma.language.findUnique({ where: { id: targetLanguageId } })

    if (!sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Invalid language selection' },
        { status: 400 }
      )
    }

    // Find or create language pair
    let languagePair = await prisma.languagePair.findFirst({
      where: {
        sourceLanguageId,
        targetLanguageId
      }
    })

    if (!languagePair) {
      // Create language pair with default rates
      languagePair = await prisma.languagePair.create({
        data: {
          sourceLanguageId,
          targetLanguageId,
          ratePerWord: 0.16, // Default rate
          minimumCharge: 25, // Default minimum
        }
      })
    }

    // Build description from all fields
    const fullDescription = `
Service Type: ${serviceType}
Document Type: ${documentType || 'Not specified'}
Word Count: ${wordCount || 'To be determined'}
Deadline: ${deadline || 'Flexible'}
${interpretationType || interpretationSetting ? `\nInterpretation Type: ${interpretationSetting || interpretationType}` : ''}
${interpretationMode ? `Interpretation Mode: ${interpretationMode}` : ''}
${subjectMatter ? `Subject Matter: ${subjectMatter}` : ''}
${interpretationDate || (dateTimeEntries && dateTimeEntries.length > 0) ? `Interpretation Date(s): ${interpretationDate || dateTimeEntries.map((e: { date: string; startTime: string; endTime: string }) => `${e.date} ${e.startTime}-${e.endTime}`).join(', ')}` : ''}
${interpretationLocation || interpretationCity ? `Location: ${interpretationLocation || ''} ${interpretationCity || ''} ${interpretationState || ''}`.trim() : ''}
${timeZone ? `Timezone: ${timeZone}` : ''}
${howDidYouHear ? `\nReferral Source: ${howDidYouHear}` : ''}
${description ? `\nAdditional Notes:\n${description}` : ''}
    `.trim()

    // Calculate pricing for interpretation
    let estimatedPrice = 0
    let estimatedHours = 0
    let pricingBreakdown = ''
    
    if (serviceType === 'interpretation' && dateTimeEntries && dateTimeEntries.length > 0 && interpretationSetting) {
      try {
        const pricingResult = await calculateInterpretationPrice({
          sourceLanguageId,
          targetLanguageId,
          interpretationSetting,
          state: interpretationState,
          timeZone,
          dateTimeEntries: dateTimeEntries.filter((e: { date: string; startTime: string; endTime: string }) => e.date && e.startTime && e.endTime),
        })
        
        if (!pricingResult.error) {
          estimatedPrice = pricingResult.total
          estimatedHours = pricingResult.totalHours
          pricingBreakdown = pricingResult.breakdown.join('\n')
        }
      } catch (pricingError) {
        console.error('Pricing calculation error:', pricingError)
      }
    }

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: await generateQuoteNumber(),
        customerId: customer.id,
        languagePairId: languagePair.id,
        status: 'REVIEWING',
        serviceType: serviceType === 'interpretation' ? 'interpretation' : 'translation',
        
        // These are String[] arrays
        sourceLanguage: [sourceLanguage.name],
        targetLanguage: [targetLanguage.name],
        // Also set the relation IDs
        sourceLanguageId: sourceLanguage.id,
        targetLanguageId: targetLanguage.id,
        
        description: fullDescription,
        wordCount: wordCount ? parseFloat(wordCount) : null,
        
        // For interpretation: use estimated pricing
        // For translation: use language pair rates
        unitOfIssue: serviceType === 'interpretation' ? 'hour' : 'word',
        ratePerUnit: serviceType === 'interpretation' && estimatedPrice > 0 
          ? estimatedPrice / Math.max(estimatedHours, 1)
          : languagePair.ratePerWord,
        minimumCharge: languagePair.minimumCharge,
        
        // Store estimated total for interpretation
        total: serviceType === 'interpretation' && estimatedPrice > 0 ? estimatedPrice : null,
        
        // Store interpretation details in notes/metadata
        notes: pricingBreakdown || undefined,
      }
    })

    // Send quote confirmation email to customer
    const customerEmail = quoteRequestEmail({
      firstName,
      quoteNumber: quote.quoteNumber,
      serviceType,
      sourceLanguage: sourceLanguage.name,
      targetLanguage: targetLanguage.name,
    })
    sendEmail({
      to: email,
      subject: customerEmail.subject,
      html: customerEmail.html,
    }).catch(err => console.error('Quote email to customer failed:', err))

    // Send notification to admin
    const adminAlert = adminNewOrderEmail({
      quoteNumber: quote.quoteNumber,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      serviceType,
      sourceLanguage: sourceLanguage.name,
      targetLanguage: targetLanguage.name,
      amount: estimatedPrice, // Include estimated price for interpretation
      notes: pricingBreakdown ? `${description || ''}\n\nPricing Breakdown:\n${pricingBreakdown}` : description,
    })
    sendEmail({
      to: getAdminEmail(),
      subject: adminAlert.subject,
      html: adminAlert.html,
    }).catch(err => console.error('Quote email to admin failed:', err))

    return NextResponse.json({
      success: true,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      estimatedPrice: estimatedPrice > 0 ? estimatedPrice : undefined,
      message: 'Quote request submitted successfully. We will contact you within 2 business hours.'
    })

  } catch (error) {
    console.error('Quote submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request. Please try again or call us at 1-877-272-LINK.' },
      { status: 500 }
    )
  }
}
