import { createOrder } from '@/lib/razorpay'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { amount } = await req.json()
    const order = await createOrder(amount)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
