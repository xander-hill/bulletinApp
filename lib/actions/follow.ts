import { supabase } from "../supabase";

export async function followImmediately(followerId: string, followingId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_private')
    .eq('id', followingId)
    .single();

  if (error) throw error;

  const status = profile.is_private ? 'pending' : 'accepted';

  const { data, error: insertError } = await supabase
    .from('follows')
    .upsert(
      [{ follower_id: followerId, following_id: followingId, status }],
      { onConflict: ['follower_id', 'following_id'] }
    )
    .select();

  if (insertError) throw insertError;

  return data;  // <=== Return this so frontend can get the result
}



export async function sendFollowRequest(followerId: string, followingId: string) {
  // Safety: verify that the target user is private
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_private')
    .eq('id', followingId)
    .single();

  if (error) throw error;

  if (!profile.is_private) {
    throw new Error("User is public — follow should be accepted immediately.");
  }

  const { error: insertError } = await supabase
    .from('follows')
    .insert([
      { follower_id: followerId, following_id: followingId, status: 'pending' }
    ]);

  if (insertError) throw insertError;
}

export async function acceptFollowRequest(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .update({ status: 'accepted' })
    .match({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function rejectFollowRequest(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .update({ status: 'rejected' })
    .match({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function unfollow(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .match({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}


