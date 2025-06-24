// hooks/useDeleteEvent.ts
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDeleteEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteEvent = async (eventId: string) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    setLoading(false)

    if (error) {
      setError(error.message)
      throw new Error(error.message)
    }
  }

  return { deleteEvent, loading, error }
}
