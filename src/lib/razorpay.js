import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

export const createOrder = async (amount, currency = 'USD') => {
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount')
  }

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  }

  try {
    const order = await razorpay.orders.create(options)
    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw new Error(error.message || 'Failed to create order')
  }
}

export const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error('Missing payment verification parameters')
  }

  const crypto = require('crypto')
  const secret = process.env.RAZORPAY_KEY_SECRET
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex')

  return expectedSignature === razorpay_signature
}

export const creditPackages = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 100,
    price: 999,
    description: 'Perfect for getting started'
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 500,
    price: 3999,
    description: 'Most popular choice'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 2000,
    price: 14999,
    description: 'For power users'
  }
] 