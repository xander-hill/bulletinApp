// seed.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Load variables from .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  throw new Error("Supabase URL is missing from your .env file.");
}
if (!supabaseKey || supabaseKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
  throw new Error("Supabase service role key is missing from your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const eventsData = [
  {
    id: uuidv4(),
    title: "Welcome Week Kickoff Concert",
    description: "Start the semester right! Join us on the Northrop Plaza for live music from local bands, free food, and giveaways. First 500 students get a free Gophers t-shirt!",
    location: "Northrop Mall",
    latitude: 44.9742,
    longitude: -93.2354,
    geom: 'SRID=4326;POINT(-93.2354 44.9742)',
    start_time: "2025-08-22T18:00:00",
    ends_at: "2025-08-22T21:00:00",
    tags: ["welcome week", "music", "free food", "social"],
  },
  {
    id: uuidv4(),
    title: "Gopher Football: Season Opener vs. Bison",
    description: "Cheer on the Golden Gophers as they kick off the 2025 season against the NDSU Bison at Huntington Bank Stadium. Student section gates open at 4:30 PM.",
    location: "Huntington Bank Stadium",
    latitude: 44.9758,
    longitude: -93.2253,
    geom: 'SRID=4326;POINT(-93.2253 44.9758)',
    start_time: "2025-08-23T18:00:00",
    ends_at: "2025-08-23T21:30:00",
    tags: ["sports", "gophers", "football"],
  },
  {
    id: uuidv4(),
    title: "CSCI Department Welcome & Pizza",
    description: "Meet faculty, advisors, and fellow students from the Computer Science & Engineering department. Learn about student groups and research opportunities. Free pizza and soda provided.",
    location: "Keller Hall Atrium",
    latitude: 44.9749,
    longitude: -93.2323,
    geom: 'SRID=4326;POINT(-93.2323 44.9749)',
    start_time: "2025-08-25T12:00:00",
    ends_at: "2025-08-25T13:30:00",
    tags: ["academic", "csci", "free food", "networking"],
  },
  {
    id: uuidv4(),
    title: "Outdoor Movie Night: 'Dune: Part Two'",
    description: "Bring a blanket and watch a free screening of 'Dune: Part Two' under the stars on the lawn outside Coffman Memorial Union.",
    location: "Coffman Memorial Union (Outside Lawn)",
    latitude: 44.9729,
    longitude: -93.2353,
    geom: 'SRID=4326;POINT(-93.2353 44.9729)',
    start_time: "2025-08-26T20:30:00",
    ends_at: "2025-08-26T23:00:00",
    tags: ["movie", "social", "welcome week"],
  },
  {
    id: uuidv4(),
    title: "Student Activities Fair",
    description: "Explore hundreds of student groups, from the Climbing Club to the Coding Club. Find your community and sign up for mailing lists. A can't-miss Welcome Week event!",
    location: "RecWell Center",
    latitude: 44.9750,
    longitude: -93.2289,
    geom: 'SRID=4326;POINT(-93.2289 44.9750)',
    start_time: "2025-08-27T11:00:00",
    ends_at: "2025-08-27T15:00:00",
    tags: ["clubs", "involvement", "welcome week"],
  },
  {
    id: uuidv4(),
    title: "Weisman Art Museum Tour",
    description: "Get a guided tour of the iconic Weisman Art Museum. Discover modern art and the unique architecture of the building itself. Free for all UMN students.",
    location: "Weisman Art Museum",
    latitude: 44.9722,
    longitude: -93.2383,
    geom: 'SRID=4326;POINT(-93.2383 44.9722)',
    start_time: "2025-08-28T14:00:00",
    ends_at: "2025-08-28T15:00:00",
    tags: ["art", "museum", "tour", "free"],
  },
  {
    id: uuidv4(),
    title: "St. Paul Campus Bonfire",
    description: "Hop on the Campus Connector and head to the St. Paul campus for a relaxing bonfire with s'mores, hot chocolate, and acoustic music.",
    location: "St. Paul Campus Mall",
    latitude: 44.9850,
    longitude: -93.1819,
    geom: 'SRID=4326;POINT(-93.1819 44.9850)',
    start_time: "2025-08-28T19:00:00",
    ends_at: "2025-08-28T21:00:00",
    tags: ["social", "st. paul campus", "free food"],
  },
  {
    id: uuidv4(),
    title: "Sunrise Yoga at the RecWell",
    description: "Start your day with a calming and energizing yoga session on the rooftop of the RecWell Center. All experience levels welcome. Mats provided.",
    location: "RecWell Center (Rooftop)",
    latitude: 44.9750,
    longitude: -93.2289,
    geom: 'SRID=4326;POINT(-93.2289 44.9750)',
    start_time: "2025-08-29T06:30:00",
    ends_at: "2025-08-29T07:30:00",
    tags: ["wellness", "fitness", "yoga"],
  },
  {
    id: uuidv4(),
    title: "Dinkytown Farmers Market",
    description: "The first farmers market of the semester! Grab fresh produce from local farmers, try artisanal bread, and enjoy the community atmosphere right in Dinkytown.",
    location: "Dinkytown Greenway",
    latitude: 44.9822,
    longitude: -93.2422,
    geom: 'SRID=4326;POINT(-93.2422 44.9822)',
    start_time: "2025-08-30T10:00:00",
    ends_at: "2025-08-30T14:00:00",
    tags: ["market", "local", "food", "community"],
  },
  {
    id: uuidv4(),
    title: "Study Abroad Information Session",
    description: "Interested in studying abroad? Come to this info session to learn about programs, scholarships, and application deadlines. Hosted by the Learning Abroad Center.",
    location: "Walter Library",
    latitude: 44.9754,
    longitude: -93.2329,
    geom: 'SRID=4326;POINT(-93.2329 44.9754)',
    start_time: "2025-09-02T15:00:00",
    ends_at: "2025-09-02T16:00:00",
    tags: ["academic", "info session", "study abroad"],
  }
];

async function seedEvents() {
  console.log('Seeding events...');

  const { error: deleteError } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Error deleting existing events:', deleteError.message);
    return;
  }
  console.log('Cleared existing events.');

  const { data, error } = await supabase.from('events').insert(eventsData).select();

  if (error) {
    console.error('Error seeding events:', error.message);
  } else {
    console.log(`Successfully seeded ${data.length} events.`);
  }
}

seedEvents();