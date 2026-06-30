# Bulletin App (MVP)

A mobile-first event discovery and social coordination app built with React Native (Expo) and Supabase.

The focus is on fast event browsing, composable filtering, RSVP tracking, and scalable feed generation.

---

## 🚀 Overview

Bulletin enables users to:

- Create and browse events
- RSVP and track attendance
- View personalized feeds (upcoming, my events, RSVP’d events)
- Search events by keyword and tags
- Discover events with infinite scroll

The system is built around a composable query pipeline using Supabase.

---

## 🧱 Tech Stack

- Frontend: React Native (Expo), TypeScript
- Backend: Supabase (Postgres, Auth, RPC)
- State: React hooks (custom data hooks)
- Query Architecture: Functional filter pipeline
- Pagination: Cursor-based (created_at / start_time)
- Geo Sorting: Postgres RPC (`get_events_sorted_by_distance`)

---

## 🧠 Architecture

UI → useEvents → fetchEventsWithFilters → buildEventQuery → Supabase

Design goals:

- Keep UI declarative
- Centralize query logic
- Make filters reusable
- Push complexity to backend-friendly layer

---

## 📦 Data Flow

### UI Layer

const { events, fetchMore, onRefresh, setFilterType } = useEvents({
userId,
initialFilter: "upcoming",
additionalFilters: {}
});

---

### useEvents Hook

Responsible for:

- Event state management
- Loading / refreshing states
- Infinite scroll pagination
- Filter switching
- Cursor tracking

Key behaviors:

- Upcoming uses start_time cursor
- Other feeds use created_at cursor
- Auto refresh triggers when filters change

---

### Fetch Layer

fetchEventsWithFilters(filters, cursor?)

Responsibilities:

- Handles RSVP-specific query path
- Delegates query building
- Applies pagination cursor
- Deduplicates results

---

### Query Builder

buildEventQuery(filters)

Uses a functional filter pipeline:

- upcoming filter
- keyword search
- tag matching
- creator filtering

Each filter is a pure function:

(q, f) =>
f.upcoming
? q.gte("start_time", new Date().toISOString())
: q

---

## 🔍 Filtering System

### EventFilters

type EventFilters = {
keyword?: string;
tags?: string[];
upcoming?: boolean;
userId?: string;
rsvped?: boolean;
sort?: "newest" | "upcoming" | "popular" | "closest";
userLat?: number;
userLng?: number;
};

---

### Filter Types

type FilterType = "upcoming" | "my" | "rsvped";

Maps:

- upcoming → future events
- my → events created by user
- rsvped → events user is attending

---

## ⚙️ RSVP Logic

When rsvped = true:

1. Query RSVP table for event IDs
2. Filter events using .in("id", ids)
3. Apply normal event query pipeline

No joins required → keeps queries simple and fast.

---

## 🌍 Geo Sorting

If sort = "closest":

get_events_sorted_by_distance(user_lat, user_lng)

Handled via Postgres RPC for performance.

---

## 🔁 Pagination Strategy

Cursor-based pagination:

- Upcoming → start_time
- Other feeds → created_at

query.lt("start_time", cursor)

Benefits:

- No duplicates
- Stable ordering
- Infinite scroll safe

---

## 🧩 Filter Pipeline

export const simpleFilters = [
(q, f) => (f.upcoming ? q.gte("start_time", new Date().toISOString()) : q),

(q, f) =>
f.keyword
? q.or(
`title.ilike.%${f.keyword}%,description.ilike.%${f.keyword}%,location.ilike.%${f.keyword}%`
)
: q,

(q, f) => (f.tags?.length ? q.overlaps("tags", f.tags) : q),

(q, f) => (f.userId && !f.rsvped ? q.eq("creator_id", f.userId) : q),
];

---

## 📊 Design Decisions

Functional Query Composition:
Filters are pure functions applied sequentially.

Hybrid Pagination Keys:

- start_time for discovery feeds
- created_at for general feeds

Supabase-Centric Architecture:

- Uses views (events_with_details)
- Uses RPC for geo sorting
- Minimal client-side joins

RSVP Separation:
RSVP queries are isolated for simplicity and performance.

---

## 📱 Features

- Event feed with infinite scroll
- Keyword + tag search
- RSVP system
- User-specific feeds
- Geo-based sorting
- Profile-based filtering

---

## 🧪 Example Usage

const { events, fetchMore } = useEvents({
userId: "123",
initialFilter: "upcoming",
additionalFilters: {
tags: ["tech", "music"],
keyword: "hackathon",
sort: "popular"
}
});

---

## 🧭 Philosophy

Keep UI simple. Push complexity into composable query logic.

- UI → declarative
- Filters → functional pipeline
- Supabase → source of truth
- Pagination → cursor-based
- Geo → database-level computation

---

## 📌 Future Improvements

- Postgres full-text search (replace ilike)
- Materialized views for trending feeds
- Redis caching layer for hot events
- Real-time RSVP updates
- Recommendation / ranking system
