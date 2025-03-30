import { NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/razorpay'
import { updateCredits } from '@/lib/supabase'
import { creditPackages } from '@/lib/razorpay'

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
          },
        },
      },
    } = body

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

    // Get current credits
    const currentCredits = await getCredits(user.id)

    // Update credits
    await updateCredits(user.id, currentCredits + selectedPackage.credits)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 