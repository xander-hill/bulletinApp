import { useAuth } from '@/contexts/AuthContext'; // adjust path
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  interests?: string[];
  bio?: string;
  is_private: boolean;
  follower_count: number;
  following_count: number;
};

export function useProfile() {
  const { user } = useAuth(); // get user from context
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  return { profile, loading };
}
