# Supabase directory guidance

## Database principles
- use real SQL migrations
- prefer clear relational schema
- plan for row-level security from the beginning
- keep naming consistent and boring
- avoid premature denormalization

## Privacy-critical data separation
Keep these concepts separate:
- private true location
- public-safe displayed presence
- distance / area derivation
- visibility state

Never expose raw coordinates to other users through public queries or convenience views.

## Required entities
At minimum, plan for:
- profiles
- user_status
- user_locations
- obfuscated_presence
- interests
- likes
- matches
- messages
- blocks
- reports
- privacy_preferences
- notification_events placeholder

## RLS mindset
- default deny
- only allow the user to manage their own private records
- only expose public-safe presence data
- blocked users should disappear from discovery and messaging visibility

## Realtime
Use realtime only where it adds real value:
- messages
- status changes
- match creation