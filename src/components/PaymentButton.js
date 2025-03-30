'use client'

import { useState } from 'react'
import Script from 'next/script'

export default function PaymentButton({ amount, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setLoading(true)
      
      // Create order through our API route
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create order')
      }
      
      const order = await response.json()
      
      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Headline Hero',
        description: 'Credits Purchase',
        order_id: order.id,
        handler: async function(response) {
          try {
            // Verify payment through our API route
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            })
            
            const data = await verifyResponse.json()
            if (data.success) {
              onSuccess?.()
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          // Pre-fill customer details if available
          name: 'Customer Name',
          email: 'customer@example.com'
        },
        theme: {
          color: '#6366F1'
        }
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()
      
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error)
        alert('Payment failed. Please try again.')
      })
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Buy Credits'}
      </button>
    </>
  )
} 