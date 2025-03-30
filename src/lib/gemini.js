import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

export async function generateHeadlines({ topic, audience, tone, keywords }) {
  try {
    const prompt = `Generate 5 engaging headlines for a ${tone} article about "${topic}" targeting ${audience}. 
    Include these keywords where appropriate: ${keywords}.
    Each headline should be unique, attention-grabbing, and optimized for social media sharing.
    Format the response as a JSON array of strings.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse the JSON response
    try {
      const headlines = JSON.parse(text)
      return headlines
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      // If JSON parsing fails, split the text into lines and clean it up
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('[') && !line.startsWith(']'))
        .map(line => line.replace(/^["']|["']$/g, ''))
        .filter(line => line.length > 0)
    }
  } catch (error) {
    console.error('Error generating headlines:', error)
    throw new Error('Failed to generate headlines. Please try again.')
  }
}

export async function generateContent({ topic, audience, tone, keywords }) {
  try {
    const prompt = `Write a ${tone} article about "${topic}" targeting ${audience}. 
    Include these keywords where appropriate: ${keywords.join(', ')}.
    The article should be engaging, informative, and optimized for the target audience.
    Format the response in markdown.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating content:', error)
    throw new Error('Failed to generate content. Please try again.')
  }
}

export async function analyzeContent(content) {
  try {
    const prompt = `Analyze this content and provide feedback on:
    1. Engagement level
    2. Clarity
    3. SEO optimization
    4. Target audience alignment
    5. Suggested improvements
    
    Content: ${content}
    
    Format the response in markdown.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error analyzing content:', error)
    throw new Error('Failed to analyze content. Please try again.')
  }
} 