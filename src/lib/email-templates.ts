// Email template generator functions
// These create beautiful HTML emails for Link Translations

const BRAND_COLOR = '#2563eb' // Blue-600
// const LOGO_URL = 'https://linktranslations.com/logo.png' // For future use

function baseTemplate(content: string, previewText?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${previewText ? `<meta name="x-apple-data-detectors" content="none">` : ''}
  <title>Link Translations</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    td { padding: 0; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}
  
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Link Translations</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Professional Language Services</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                      <strong>Link Translations</strong><br>
                      2070 Post Road, Darien, CT 06820
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      <a href="tel:+12032541181" style="color: #6b7280; text-decoration: none;">(203) 254-1181</a> • 
                      <a href="mailto:info@linktranslations.com" style="color: #6b7280; text-decoration: none;">info@linktranslations.com</a>
                    </p>
                    <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 11px;">
                      © ${new Date().getFullYear()} Link Translations. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// Welcome Email - sent after registration
export function welcomeEmail(data: { firstName: string; email: string }): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Welcome to Link Translations, ${data.firstName}! 🎉</h2>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Thank you for creating an account with us. We're excited to help you with your translation and interpretation needs.
    </p>
    
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">What you can do now:</h3>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
        <li>Request instant quotes for translation & interpretation</li>
        <li>Track your projects in real-time</li>
        <li>Access your invoice history</li>
        <li>Save your preferences for faster ordering</li>
      </ul>
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); border-radius: 8px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/quote" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            Get Your First Quote →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
      If you have any questions, reply to this email or call us at <a href="tel:+12032541181" style="color: ${BRAND_COLOR};">(203) 254-1181</a>.
    </p>
  `
  
  return {
    subject: `Welcome to Link Translations, ${data.firstName}!`,
    html: baseTemplate(content, `Welcome ${data.firstName}! Start requesting translation & interpretation quotes today.`)
  }
}

// Quote Request Confirmation - sent after quote submission
export function quoteRequestEmail(data: {
  firstName: string
  quoteNumber: string
  serviceType: string
  sourceLanguage: string
  targetLanguage: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Quote Request Received ✓</h2>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${data.firstName}, we've received your quote request and our team is reviewing it now.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Quote Number</span><br>
            <strong style="color: #111827; font-size: 18px;">#${data.quoteNumber}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 50%;">
                  <span style="color: #6b7280; font-size: 12px;">Service</span><br>
                  <span style="color: #111827; font-size: 14px; font-weight: 500;">${data.serviceType === 'interpretation' ? '🎤 Interpretation' : '📄 Translation'}</span>
                </td>
                <td style="width: 50%;">
                  <span style="color: #6b7280; font-size: 12px;">Languages</span><br>
                  <span style="color: #111827; font-size: 14px; font-weight: 500;">${data.sourceLanguage} → ${data.targetLanguage}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>⏱️ Expected Response:</strong> You'll receive your detailed quote within 2 hours during business hours.
      </p>
    </div>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
      We'll send you another email once your quote is ready. In the meantime, feel free to reach out with any questions.
    </p>
  `
  
  return {
    subject: `Quote Request #${data.quoteNumber} Received`,
    html: baseTemplate(content, `Your quote request #${data.quoteNumber} has been received. We'll respond within 2 hours.`)
  }
}

// Order Confirmation - sent after payment
export function orderConfirmationEmail(data: {
  firstName: string
  quoteNumber: string
  projectId?: string
  amount: number
  serviceType: string
  sourceLanguage: string
  targetLanguage: string
}): { subject: string; html: string } {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background-color: #d1fae5; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
        <span style="font-size: 32px;">✓</span>
      </div>
      <h2 style="margin: 0; color: #059669; font-size: 24px;">Payment Successful!</h2>
    </div>
    
    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Thank you, ${data.firstName}! Your order has been confirmed and is now being processed.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px;">Order Summary</h3>
      
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Number</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">#${data.quoteNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.serviceType === 'interpretation' ? 'Interpretation' : 'Translation'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Languages</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.sourceLanguage} → ${data.targetLanguage}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 12px; border-top: 1px solid #e5e7eb;"></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Total Paid</td>
          <td style="padding: 8px 0; color: #059669; font-size: 20px; font-weight: 700; text-align: right;">$${data.amount.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px;">What happens next?</h4>
      <ol style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
        <li>Our team will review your request</li>
        <li>We'll assign a qualified linguist to your project</li>
        <li>You'll receive updates via email</li>
        <li>Track progress in your dashboard anytime</li>
      </ol>
    </div>
    
    ${data.projectId ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto; text-align: center;">
      <tr>
        <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); border-radius: 8px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/projects/${data.projectId}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            View Your Project →
          </a>
        </td>
      </tr>
    </table>
    ` : ''}
  `
  
  return {
    subject: `Order Confirmed - #${data.quoteNumber}`,
    html: baseTemplate(content, `Your order #${data.quoteNumber} is confirmed! Total: $${data.amount.toFixed(2)}`)
  }
}

// Admin New Order Alert
export function adminNewOrderEmail(data: {
  quoteNumber: string
  customerName: string
  customerEmail: string
  serviceType: string
  sourceLanguage: string
  targetLanguage: string
  amount: number
  notes?: string
}): { subject: string; html: string } {
  const content = `
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #92400e; font-size: 18px;">🆕 New Paid Order!</h2>
    </div>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Quote Number</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">#${data.quoteNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Customer</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
            ${data.customerName}<br>
            <a href="mailto:${data.customerEmail}" style="color: ${BRAND_COLOR}; font-size: 12px;">${data.customerEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.serviceType === 'interpretation' ? '🎤 Interpretation' : '📄 Translation'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Languages</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.sourceLanguage} → ${data.targetLanguage}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 12px; border-top: 1px solid #e5e7eb;"></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Amount</td>
          <td style="padding: 8px 0; color: #059669; font-size: 20px; font-weight: 700; text-align: right;">$${data.amount.toFixed(2)}</td>
        </tr>
      </table>
      
      ${data.notes ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <span style="color: #6b7280; font-size: 12px;">Customer Notes:</span>
        <p style="margin: 8px 0 0 0; color: #374151; font-size: 14px; background-color: #ffffff; padding: 12px; border-radius: 4px;">${data.notes}</p>
      </div>
      ` : ''}
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto; text-align: center;">
      <tr>
        <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); border-radius: 8px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/quotes" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            View in Admin Panel →
          </a>
        </td>
      </tr>
    </table>
  `
  
  return {
    subject: `🆕 New Order #${data.quoteNumber} - $${data.amount.toFixed(2)}`,
    html: baseTemplate(content)
  }
}

// Interpreter Job Alert
export function interpreterJobAlertEmail(data: {
  linguistName: string
  sourceLanguage: string
  targetLanguage: string
  date: string
  time: string
  duration: string
  setting: string // 'in-person', 'video-remote', 'phone'
  location?: string
  rate: number
  acceptUrl: string
  declineUrl: string
}): { subject: string; html: string } {
  const settingLabel = {
    'in-person': '📍 In-Person',
    'video-remote': '🎥 Video Remote',
    'phone': '📞 Phone'
  }[data.setting] || data.setting
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">New Interpretation Job Available 🎤</h2>
    
    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${data.linguistName}, a new interpretation job matching your profile is available!
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Languages</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.sourceLanguage} ↔ ${data.targetLanguage}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Date</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Time</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right;">${data.time}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Duration</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right;">${data.duration}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Setting</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right;">${settingLabel}</td>
        </tr>
        ${data.location ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Location</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right;">${data.location}</td>
        </tr>
        ` : ''}
        <tr>
          <td colspan="2" style="padding-top: 12px; border-top: 1px solid #e5e7eb;"></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #111827; font-size: 16px; font-weight: 600;">Rate</td>
          <td style="padding: 10px 0; color: #059669; font-size: 20px; font-weight: 700; text-align: right;">$${data.rate.toFixed(2)}/hr</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>⚡ Act Fast:</strong> This job is offered on a first-come, first-served basis.
      </p>
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="width: 48%; text-align: center;">
          <a href="${data.acceptUrl}" style="display: inline-block; width: 100%; padding: 14px 20px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
            ✓ Accept Job
          </a>
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 48%; text-align: center;">
          <a href="${data.declineUrl}" style="display: inline-block; width: 100%; padding: 14px 20px; background-color: #f3f4f6; color: #374151; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; border: 1px solid #d1d5db;">
            ✗ Decline
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 13px; text-align: center;">
      Questions? Reply to this email or call <a href="tel:+12032541181" style="color: ${BRAND_COLOR};">(203) 254-1181</a>
    </p>
  `
  
  return {
    subject: `🎤 New ${data.sourceLanguage}/${data.targetLanguage} Interpretation Job - ${data.date}`,
    html: baseTemplate(content, `New interpretation job available: ${data.sourceLanguage}/${data.targetLanguage} on ${data.date}`)
  }
}

// Project Started Email - sent when project begins
export function projectStartedEmail(data: {
  customerName: string
  projectNumber: string
  projectName: string
  serviceType: string
  sourceLanguage: string
  targetLanguage: string
  estimatedDelivery: string
  dashboardUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Your Project Has Started! 🚀</h2>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${data.customerName},
    </p>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Great news! Your ${data.serviceType.toLowerCase()} project is now in progress. Our team of professional linguists is working on it.
    </p>
    
    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 16px;">${data.projectName || `Project #${data.projectNumber}`}</h3>
      <p style="margin: 0; color: #047857; font-size: 14px;">
        ${data.sourceLanguage} → ${data.targetLanguage}
      </p>
    </div>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Project Number</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.projectNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service Type</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.serviceType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Est. Delivery</td>
          <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${data.estimatedDelivery}</td>
        </tr>
      </table>
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); border-radius: 8px;">
          <a href="${data.dashboardUrl}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            Track Project →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
      We'll notify you as soon as your project is ready. In the meantime, you can track progress in your dashboard.
    </p>
  `
  
  return {
    subject: `🚀 Project Started: ${data.projectName || `#${data.projectNumber}`}`,
    html: baseTemplate(content, `Your ${data.serviceType.toLowerCase()} project is now in progress`)
  }
}

// Project Completed Email - sent when project is delivered
export function projectCompletedEmail(data: {
  customerName: string
  projectNumber: string
  projectName: string
  serviceType: string
  downloadUrl: string
  dashboardUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Your Project is Complete! 🎉</h2>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${data.customerName},
    </p>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Your ${data.serviceType.toLowerCase()} project has been completed and is ready for download.
    </p>
    
    <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
      <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 18px;">${data.projectName || `Project #${data.projectNumber}`}</h3>
      <p style="margin: 0; color: #047857; font-size: 14px;">Ready for Download</p>
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${data.downloadUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
            📥 Download Files
          </a>
        </td>
      </tr>
    </table>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Quality Guarantee:</strong> If you have any concerns about your translation, please let us know within 7 days and we'll make it right.
      </p>
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #f3f4f6; border-radius: 8px;">
          <a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; color: #374151; text-decoration: none; font-weight: 500; font-size: 14px;">
            View in Dashboard
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
      Thank you for choosing Link Translations. We hope to work with you again soon!
    </p>
  `
  
  return {
    subject: `✅ Project Complete: ${data.projectName || `#${data.projectNumber}`}`,
    html: baseTemplate(content, `Your ${data.serviceType.toLowerCase()} project is ready for download`)
  }
}

// Quote Reminder Email - sent before quote expires
export function quoteReminderEmail(data: {
  customerName: string
  quoteNumber: string
  totalPrice: number
  expiresIn: string
  quoteUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Your Quote is Expiring Soon ⏰</h2>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${data.customerName},
    </p>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Your quote <strong>#${data.quoteNumber}</strong> will expire ${data.expiresIn}. Don't miss out on this price!
    </p>
    
    <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 36px; margin-bottom: 8px;">⚠️</div>
      <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;">EXPIRES ${data.expiresIn.toUpperCase()}</p>
      <p style="margin: 0; color: #111827; font-size: 28px; font-weight: 700;">$${data.totalPrice.toFixed(2)}</p>
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${data.quoteUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
            Review & Accept Quote →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
      Have questions? Simply reply to this email or call us at <a href="tel:+12032541181" style="color: ${BRAND_COLOR};">(203) 254-1181</a>.
    </p>
  `
  
  return {
    subject: `⏰ Quote #${data.quoteNumber} Expires ${data.expiresIn}`,
    html: baseTemplate(content, `Your quote expires ${data.expiresIn} - lock in your price now`)
  }
}

// Job Assigned Confirmation - sent to linguist when assigned
export function jobAssignedEmail(data: {
  linguistName: string
  projectNumber: string
  serviceType: string
  sourceLanguage: string
  targetLanguage: string
  dueDate: string
  customerName: string
  dashboardUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">You've Been Assigned a Job! 📋</h2>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${data.linguistName},
    </p>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      You have been assigned to a new ${data.serviceType.toLowerCase()} project. Please review the details below.
    </p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid ${BRAND_COLOR}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px;">Project #${data.projectNumber}</h3>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
        ${data.sourceLanguage} → ${data.targetLanguage}
      </p>
    </div>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Client</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.serviceType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date</td>
          <td style="padding: 8px 0; color: #dc2626; font-size: 14px; font-weight: 600; text-align: right;">${data.dueDate}</td>
        </tr>
      </table>
    </div>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); border-radius: 8px;">
          <a href="${data.dashboardUrl}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            View Assignment →
          </a>
        </td>
      </tr>
    </table>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Important:</strong> Please ensure delivery by the due date. If you anticipate any delays, contact us immediately.
      </p>
    </div>
  `
  
  return {
    subject: `📋 New Assignment: ${data.sourceLanguage}/${data.targetLanguage} ${data.serviceType}`,
    html: baseTemplate(content, `You've been assigned to project #${data.projectNumber}`)
  }
}

// Password Reset Email
export function passwordResetEmail(data: {
  firstName: string
  resetUrl: string
  expiresIn: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Reset Your Password 🔐</h2>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${data.firstName},
    </p>
    
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="text-align: center;">
          <a href="${data.resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
            Reset Password →
          </a>
        </td>
      </tr>
    </table>
    
    <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        <strong>⏰ This link expires ${data.expiresIn}.</strong> If you didn't request this, please ignore this email.
      </p>
    </div>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
      If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
      <span style="color: ${BRAND_COLOR}; word-break: break-all;">${data.resetUrl}</span>
    </p>
  `
  
  return {
    subject: `🔐 Reset Your Link Translations Password`,
    html: baseTemplate(content, `Password reset requested for your Link Translations account`)
  }
}
