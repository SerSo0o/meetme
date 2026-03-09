# Meet Me — project context

## Product
Meet Me is a mobile-first social discovery app for finding and connecting with people nearby in a lower-pressure, privacy-aware way.

It is not only a dating app.
It should feel broader:
- meeting new people
- spontaneous socializing
- finding company in a city
- social discovery at cafes, gyms, campuses, nightlife, parks, concerts, events, coworking spaces

## Core statuses
- Green = visible, open to talk, open to meet now
- Yellow = busy, but still open / interested
- Red = ghost mode / invisible

## Core interaction model
- users discover nearby people
- users can like someone
- users can see incoming likes
- mutual interest creates a match
- full 1:1 chat opens only after a mutual match

## Discovery model
Default main experience:
- nearby list / cards first
- map as secondary view
- profile and settings easily accessible
- approximate distance only
- area / zone / hotspot labels
- never expose exact public coordinates

## Privacy model
This app must never publicly expose exact user coordinates.
The product uses:
- approximate distance
- area / zone labels
- obfuscated map presence
- randomized visible marker position within a safe radius

Visible map markers are product theater, not real exact location.
Private true location and public-safe presence must be separated in architecture.

## Tech stack
- React Native
- Expo
- TypeScript
- Expo Router
- Supabase
- NativeWind
- react-native-maps
- expo-location
- TanStack Query where useful
- Zustand only if truly needed
- React Hook Form + Zod where useful

## Build strategy
Build the full product vision, but implement it in small, working phases.
Every phase must leave the app runnable.

Current priority:
1. stable project foundation
2. product architecture
3. database design
4. auth + onboarding
5. profile + statuses
6. nearby discovery list
7. privacy-safe map
8. likes + matches
9. chat
10. safety + settings
11. polish

## Non-goals for now
Do not add yet:
- payments
- subscriptions
- app store distribution flows
- growth tooling
- legal/compliance flows beyond placeholders
- overengineered backend layers
- fake integrations

## Engineering rules
- mobile-first always
- privacy-first always
- keep code clean and typed
- prefer reusable components
- avoid silent major product decisions
- label placeholders clearly
- no fake backend
- no exact-location leaks in UI, API, schema, or logs