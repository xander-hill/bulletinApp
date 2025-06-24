
/// <reference types="deno.ns" />
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Verify webhook secret for security
  const SUPABASE_WEBHOOK_SECRET = Deno.env.get("SUPABASE_WEBHOOK_SECRET");
  const signature = req.headers.get("x-webhook-signature");

  // TODO: Validate signature here if you want (recommended)

  try {
    const body = await req.json();

    // Only handle user.created events
    if (body.type !== "user.created") {
      return new Response("Ignored event", { status: 200 });
    }

    const user = body.event;

    // Create a Supabase client with service role key to write to DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert profile for new user
    const { error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: user.email?.split("@")[0] || user.id.substring(0, 8), // example username
        full_name: user.user_metadata?.full_name || null,
      });

    if (error) {
      console.error("Error creating profile:", error);
      return new Response("Failed to create profile", { status: 500 });
    }

    return new Response("Profile created", { status: 200 });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response("Error", { status: 400 });
  }
});


