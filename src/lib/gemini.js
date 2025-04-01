import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API with configuration
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

// Get the Gemini model with specific configuration
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
})

/**
 * Generates headlines based on the provided content and parameters
 * @param {Object} params - Generation parameters
 * @param {string} params.content - The newsletter content
 * @param {number} params.numHeadlines - Number of headlines to generate
 * @param {string} params.tone - Tone of the headlines
 * @returns {Promise<string[]>} Array of generated headlines
 */
export async function generateHeadlines({ content, numHeadlines, tone }) {
  if (!content?.trim()) {
    throw new Error('Please provide some content to generate headlines from.')
  }

  try {
    const chatSession = model.startChat({
      history: [],
    })

    const prompt = `Generate ${numHeadlines} unique and engaging headlines in a ${tone} tone based on the following content. 
    The headlines should be attention-grabbing and optimized for high click-through rates.
    
    Content: ${content}
    
    Requirements:
    - Each headline should be unique and capture a different aspect of the content
    - Headlines should be between 60-100 characters
    - Use power words and emotional triggers where appropriate
    - Maintain the specified ${tone} tone throughout
    - Format as a array of strings and dont generate anything else also dont use any markdown notation just return the array.
    
    Example format:
    ["Headline 1", "Headline 2", "Headline 3"]`

    const result = await chatSession.sendMessage(prompt)
    const response = result.response.text()
    
    try {
      const headlines = JSON.parse(response.replace(/`/g, ''))
      if (!Array.isArray(headlines) || headlines.length === 0) {
        throw new Error('Invalid response format')
      }
      return headlines
    } catch (parseError) {
      throw new Error('Unable to process the AI response. Please try again.')
    }
  } catch (error) {
    if (error.message.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.')
    }
    if (error.message.includes('quota')) {
      throw new Error('AI service quota exceeded. Please try again later.')
    }
    throw new Error(error.message || 'Failed to generate headlines. Please try again.')
  }
}

/**
 * Analyzes the quality of generated headlines
 * @param {string[]} headlines - Array of headlines to analyze
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeHeadlines(headlines) {
  if (!Array.isArray(headlines) || headlines.length === 0) {
    throw new Error('Please provide headlines to analyze.')
  }

  try {
    const chatSession = model.startChat({
      history: [],
    })

    const prompt = `Analyze these headlines for their effectiveness:

    ${headlines.join('\n')}

    Provide analysis on:
    1. Emotional appeal
    2. Clarity and conciseness
    3. Click-through potential
    4. SEO friendliness
    
    Format the response as JSON with scores and suggestions.`

    const result = await chatSession.sendMessage(prompt)
    const response = result.response.text()
    
    try {
      const analysis = JSON.parse(response)
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Invalid analysis format')
      }
      return analysis
    } catch (parseError) {
      throw new Error('Unable to process the analysis. Please try again.')
    }
  } catch (error) {
    if (error.message.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.')
    }
    throw new Error('Failed to analyze headlines. Please try again.')
  }
}

// Keep other utility functions
export async function generateContent({ topic, audience, tone, keywords }) {
  if (!topic?.trim()) {
    throw new Error('Please provide a topic for content generation.')
  }

  try {
    const chatSession = model.startChat({
      history: [],
    })

    const prompt = `Write a ${tone} article about "${topic}" targeting ${audience}. 
    Include these keywords where appropriate: ${keywords.join(', ')}.
    The article should be engaging, informative, and optimized for the target audience.
    Format the response in markdown.`

    const result = await chatSession.sendMessage(prompt)
    return result.response.text()
  } catch (error) {
    if (error.message.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.')
    }
    throw new Error('Failed to generate content. Please try again.')
  }
}

export async function analyzeContent(content) {
  if (!content?.trim()) {
    throw new Error('Please provide content to analyze.')
  }

  try {
    const chatSession = model.startChat({
      history: [],
    })

    const prompt = `Analyze this content and provide feedback on:
    1. Engagement level
    2. Clarity
    3. SEO optimization
    4. Target audience alignment
    5. Suggested improvements
    
    Content: ${content}
    
    Format the response in markdown.`

    const result = await chatSession.sendMessage(prompt)
    return result.response.text()
  } catch (error) {
    if (error.message.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.')
    }
    throw new Error('Failed to analyze content. Please try again.')
  }
} 