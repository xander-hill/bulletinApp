export type Event = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  location_type: string;
  location: string;
  start_time: string;
  tags: string[];
  created_at: string;
  is_public: boolean;
};