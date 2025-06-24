/// <reference types="deno.ns" />
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Set up Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Authenticate user from access token
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return new Response("Missing token", { status: 401 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const eventId = uuidv4();

  try {
    const body = await req.json();

    const {
      title,
      description,
      location_type,
      location,
      start_time,
      ends_at,
      is_public = true,
      tags = [],
    } = body;

    // Basic input checks (add more as needed)
    if (!title || !description || !location_type || !start_time) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Normalize location
    const finalLocation = location_type === "online"
      ? "Online"
      : location?.trim() || "TBD";

    // Insert event
    const { error } = await supabase
      .from("events")
      .insert({
        id: eventId,
        creator_id: user.id, // same as profiles.id
        title,
        description,
        location_type,
        location: finalLocation,
        start_time,
        ends_at,
        is_public,
        tags,
      });

    if (error) {
      console.error("Error inserting event:", error);
      return new Response("Database insert error", { status: 500 });
    }

    return new Response("Event created", { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Invalid request", { status: 400 });
  }
});

