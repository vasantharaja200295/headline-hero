import { supabase } from '../utils/supabase/client'

// Export the supabase client instance
export { supabase }

// Helper functions for database operations
export const getUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Get user error:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

export const getCredits = async (userId) => {
  try {
    const data = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', userId)
      .single()

      console.log(data)
    
    if (data.error) {
      console.error('Get credits error:', error)
      return 0
    }
    return data?.data.amount || 0
  } catch (error) {
    console.error('Get credits error:', error)
    return 0
  }
}

export const updateCredits = async (userId, amount) => {
  try {
    // First, check if the user already has a credits record
    const { data: existingCredits } = await supabase
      .from('credits')
      .select('id, amount')
      .eq('user_id', userId)
      .single()
    
    if (existingCredits) {
      // If record exists, use update instead of upsert
      const { data, error } = await supabase
        .from('credits')
        .update({
          amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
      
      if (error) {
        console.error('Update credits error:', error)
        return null
      }
      return data
    } else {
      // If no record exists, insert a new one
      const { data, error } = await supabase
        .from('credits')
        .insert({
          user_id: userId,
          amount: amount,
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('Update credits error:', error)
        return null
      }
      return data
    }
  } catch (error) {
    console.error('Update credits error:', error)
    return null
  }
}
export const saveHeadlineHistory = async (userId, headlineData) => {
  try {
    const { data, error } = await supabase
      .from('headline_history')
      .insert({
        user_id: userId,
        topic: headlineData.topic,
        audience: headlineData.audience,
        tone: headlineData.tone,
        keywords: headlineData.keywords,
        results: headlineData.results,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('Save headline history error:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Save headline history error:', error)
    return null
  }
} 