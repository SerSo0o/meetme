# Meet Me database outline

## Core tables
- profiles
- profile_photos
- user_status
- user_locations
- obfuscated_presence
- interests
- profile_interests
- likes
- matches
- messages
- blocks
- reports
- privacy_preferences
- notification_events

## profiles (implemented)
- id: uuid, PK
- user_id: uuid, FK → auth.users, unique
- display_name: text
- bio: text
- avatar_url: text, nullable
- status: text, default 'red' (green / yellow / red)
- age: integer, nullable (13–120)
- gender: text, nullable (male / female / non-binary / other / prefer-not-to-say)
- created_at: timestamptz
- updated_at: timestamptz (auto-updated via trigger)
- RLS: authenticated can read all, insert/update own only

## interests (implemented)
- id: uuid, PK
- name: text, unique
- created_at: timestamptz
- RLS: authenticated can read all
- seeded with 20 starter interests

## profile_interests (implemented)
- id: uuid, PK
- profile_id: uuid, FK → profiles, cascade delete
- interest_id: uuid, FK → interests, cascade delete
- unique(profile_id, interest_id)
- RLS: authenticated can read all, insert/delete own only

## privacy_preferences (implemented)
- id: uuid, PK
- user_id: uuid, FK → auth.users, unique, cascade delete
- show_distance: boolean, default true
- show_on_map: boolean, default true
- discoverable: boolean, default true
- created_at: timestamptz
- updated_at: timestamptz (auto-updated via trigger)
- RLS: read/insert/update own only

## user_locations (implemented)
- id: uuid, PK
- user_id: uuid, FK → auth.users, unique, cascade delete
- location: geography(Point, 4326) — PostGIS
- updated_at: timestamptz
- RLS: read/insert/update own only
- Spatial index (GIST) for fast proximity queries
- NEVER exposed to other users — only used server-side by discover_nearby_users()

## RPC functions (implemented)
- upsert_user_location(p_user_id, p_point): security definer, upserts user location
- discover_nearby_users(requesting_user_id, radius_meters): returns nearby profiles with approximate distance (rounded to 50m), excludes Red status and non-discoverable users

## Critical separation
- true coordinates are private (user_locations table, own-only RLS)
- displayed map presence is obfuscated (Phase 5)
- discovery returns only public-safe location data (approximate distance labels)