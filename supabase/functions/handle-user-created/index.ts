/// <reference types="deno.ns" />
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Edge function 'handle-user-created' is running");

serve(async (req) => {
  const secret = Deno.env.get('WEBHOOK_SECRET');
  const authHeader = req.headers.get('Authorization') ?? '';

  if (authHeader !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('Received body:', JSON.stringify(body));

    const user = body.record;
    if (!user) {
      console.error("No record found in request body");
      return new Response("Bad Request: No record", { status: 400 });
    }

    const { id, email } = user;
    if (!id || !email) {
      console.error("User id or email missing", user);
      return new Response("Bad Request: Missing user id or email", { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    );

    const { error } = await supabaseAdmin.from('profiles').insert({
      id,
      email,
      username: email.split('@')[0],
      full_name: '',
      avatar_url: '',
      bio: ''
    });

    if (error) {
      console.error('Error inserting profile:', error);
      return new Response('Failed to create profile', { status: 500 });
    }

    return new Response('Profile created', { status: 200 });
  } catch (e) {
    console.error('Unexpected error:', e);
    return new Response('Internal Server Error', { status: 500 });
  }
});
