import { NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/razorpay'
import { updateCredits, getCredits } from '@/lib/supabase'
import { creditPackages } from '@/lib/razorpay'
import { supabase } from '@/lib/supabase'

// Track processed payments to prevent duplicates
const processedPayments = new Set()

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payload: {
        payment: {
          entity: {
            amount,
            email,
            id: payment_id,
          },
        },
      },
    } = body

    // Check for duplicate webhook events
    if (processedPayments.has(payment_id)) {
      return NextResponse.json({ success: true, message: 'Payment already processed' })
    }

    // Verify payment signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Find the package based on amount
    const selectedPackage = creditPackages.find(p => p.price * 100 === amount)
    if (!selectedPackage) {
      return NextResponse.json({ error: 'Invalid package amount' }, { status: 400 })
    }

    // Get user from Supabase by email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserByEmail(email)
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Implement retry mechanism for credit updates
    let retries = 3
    let success = false

    while (retries > 0 && !success) {
      try {
        // Get current credits
        const currentCredits = await getCredits(user.id)
        if (currentCredits === null) {
          throw new Error('Failed to get current credits')
        }

        // Update credits
        const updatedCredits = await updateCredits(user.id, currentCredits + selectedPackage.credits)
        if (!updatedCredits) {
          throw new Error('Failed to update credits')
        }

        // Mark payment as processed
        processedPayments.add(payment_id)
        success = true

        return NextResponse.json({ 
          success: true,
          message: `Successfully added ${selectedPackage.credits} credits`
        })
      } catch (error) {
        retries--
        if (retries === 0) {
          console.error('Failed to update credits after retries:', error)
          return NextResponse.json({ 
            error: 'Failed to process payment. Please contact support.',
            details: error.message 
          }, { status: 500 })
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000))
      }
    }

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
} 