import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Generate unique quote number
function generateQuoteNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `Q${year}${month}${day}-${random}`
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
      
      // Interpretation Details (optional)
      interpretationType,
      interpretationDate,
      interpretationLocation,
      
      // Additional Info
      description,
      howDidYouHear,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !serviceType || !sourceLanguageId || !targetLanguageId) {
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
${interpretationType ? `\nInterpretation Type: ${interpretationType}` : ''}
${interpretationDate ? `Interpretation Date: ${interpretationDate}` : ''}
${interpretationLocation ? `Location: ${interpretationLocation}` : ''}
${howDidYouHear ? `\nReferral Source: ${howDidYouHear}` : ''}
${description ? `\nAdditional Notes:\n${description}` : ''}
    `.trim()

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        customerId: customer.id,
        languagePairId: languagePair.id,
        status: 'SUBMITTED',
        
        sourceLanguage: sourceLanguage.name,
        targetLanguage: targetLanguage.name,
        
        description: fullDescription,
        wordCount: wordCount ? parseFloat(wordCount) : null,
        
        // Pricing will be calculated by admin
        unitOfIssue: 'word',
        ratePerUnit: languagePair.ratePerWord,
        minimumCharge: languagePair.minimumCharge,
      }
    })

    // TODO: Send email notification to admin and customer
    // await sendQuoteNotificationEmail(quote)

    return NextResponse.json({
      success: true,
      quoteNumber: quote.quoteNumber,
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
