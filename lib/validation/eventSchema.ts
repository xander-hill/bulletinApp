import { z } from "zod";

export const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  location_type: z.enum(["physical", "online"]),
  start_time: z.string().datetime("Invalid start time"),
  ends_at: z.string().datetime("Invalid end time"),
  is_public: z.boolean(),
  tags: z.array(z.string()),
});
