'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { generateHeadlines } from '@/lib/gemini'
import { getCredits, updateCredits, saveHeadlineHistory } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [headlines, setHeadlines] = useState([])
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    tone: 'professional',
    keywords: '',
    count: 5
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if user has enough credits
      if (credits < formData.count) {
        alert('Not enough credits. Please purchase more credits.')
        return
      }

      // Generate headlines
      const generatedHeadlines = await generateHeadlines(formData)

      // Update credits
      const newCredits = credits - formData.count
      await updateCredits(user.id, newCredits)
      setCredits(newCredits)

      // Save to history
      await saveHeadlineHistory(user.id, {
        ...formData,
        results: generatedHeadlines
      })

      setHeadlines(generatedHeadlines)
    } catch (error) {
      console.error('Error generating headlines:', error)
      alert('Error generating headlines. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Available credits: {credits}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                id="topic"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.topic}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <input
                type="text"
                name="audience"
                id="audience"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.audience}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                Tone
              </label>
              <select
                name="tone"
                id="tone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.tone}
                onChange={handleInputChange}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                name="keywords"
                id="keywords"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.keywords}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700">
                Number of Headlines
              </label>
              <input
                type="number"
                name="count"
                id="count"
                min="1"
                max="30"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.count}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Headlines'}
              </button>
            </div>
          </form>
        </div>

        {headlines.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Headlines</h2>
            <ul className="space-y-2">
              {headlines.map((headline, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-md">
                  {headline}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 