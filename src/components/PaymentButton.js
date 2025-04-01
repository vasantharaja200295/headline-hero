'use client'

import { useState } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function PaymentButton({ amount, onSuccess, className, disabled }) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setLoading(true)
      
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount')
      }

      // Create order through our API route
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create order')
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
              toast.success('Payment successful!')
            } else {
              throw new Error(data.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error(error.message || 'Payment verification failed. Please contact support.')
          }
        },
        prefill: {
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
        toast.error('Payment failed. Please try again.')
      })
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Failed to initiate payment. Please try again.')
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
      <Button
        onClick={handlePayment}
        disabled={loading || disabled}
        className={cn("w-full", className)}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Buy Credits'
        )}
      </Button>
    </>
  )
} 