import 'dotenv/config';

export default {
  expo: {
    name: 'Bulletin',
    slug: 'bulletin',
    version: '1.0.0',
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      WEBHOOK_SECRET: process.env.WEBHOOK_SECRET
    },
  },
};