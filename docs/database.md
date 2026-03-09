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
- created_at: timestamptz
- updated_at: timestamptz (auto-updated via trigger)
- RLS: authenticated can read all, insert/update own only

## Critical separation
- true coordinates are private
- displayed map presence is obfuscated
- discovery returns only public-safe location data