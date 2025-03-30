'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCredits, updateCredits } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PaymentButton from '@/components/PaymentButton'

export default function CreditsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)

  const creditPackages = [
    { id: 'basic', name: 'Basic', credits: 100, price: 5, description: 'Perfect for getting started' },
    { id: 'pro', name: 'Pro', credits: 500, price: 39, description: 'Most popular choice' },
    { id: 'enterprise', name: 'Enterprise', credits: 2000, price: 75, description: 'For power users' }
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      const userCredits = await getCredits(user.id)
      setCredits(userCredits)
    }
    getUser()
  }, [router])

  const handlePaymentSuccess = async (selectedPackageCredits) => {
    const newCredits = credits + selectedPackageCredits
    await updateCredits(user.id, newCredits)
    setCredits(newCredits)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Purchase Credits</h1>
          <p className="mt-2 text-sm text-gray-600">Current balance: {credits} credits</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creditPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{pkg.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${pkg.price}</span>
                  <span className="text-base font-medium text-gray-500">/package</span>
                </p>
                <p className="mt-2 text-sm text-gray-500">{pkg.credits} credits</p>
                <PaymentButton 
                  amount={pkg.price} 
                  onSuccess={ () => {
                    handlePaymentSuccess(pkg.credits)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
