// lib/queries/follows.ts
import { supabase } from '../supabase';

export async function getFollowers(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles!follower_id(*)')
    .eq('following_id', userId)
    .eq('status', 'accepted');

  if (error) throw error;
  return data;
}

export async function getPendingFollowRequests(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles!follower_id(*)')
    .eq('following_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
}

export async function getFollowing(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles!following_id(*)')
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  if (error) throw error;
  return data;
}
