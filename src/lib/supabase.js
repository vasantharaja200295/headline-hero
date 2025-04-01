import { supabase } from '../utils/supabase/client'

// Export the supabase client instance
export { supabase }

// Helper functions for database operations

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Logout error:', error)
    return false
  }
}

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
    const { data, error } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Get credits error:', error)
      return null
    }
    return data?.amount || 0
  } catch (error) {
    console.error('Get credits error:', error)
    return null
  }
}

export const updateCredits = async (userId, amount) => {
  try {
    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Invalid credit amount')
    }

    // Start a transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transactionError) {
      throw new Error('Failed to create transaction')
    }

    // First, check if the user already has a credits record
    const { data: existingCredits, error: existingError } = await supabase
      .from('credits')
      .select('id, amount')
      .eq('user_id', userId)
      .single()
    
    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw existingError
    }

    let result
    if (existingCredits) {
      // If record exists, use update
      const { data, error } = await supabase
        .from('credits')
        .update({
          amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      result = data
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
        .single()
      
      if (error) {
        throw error
      }
      result = data
    }

    // Update transaction status
    await supabase
      .from('credit_transactions')
      .update({ status: 'completed' })
      .eq('id', transaction.id)

    return result
  } catch (error) {
    // If there's an error, update transaction status to failed
    if (transaction?.id) {
      await supabase
        .from('credit_transactions')
        .update({ 
          status: 'failed',
          error_message: error.message 
        })
        .eq('id', transaction.id)
    }

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