import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);

    supabase
      .from('events_with_details')
      .select("*, creator:creator_id(username, full_name, avatar_url)")
      .eq("id", eventId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEvent(data);
      })
      .finally(() => setLoading(false));
  }, [eventId]);
  
  return { event, loading, error };
}

