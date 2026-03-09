# Meet Me architecture

## Frontend
- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind

## Backend
- Supabase Auth
- Postgres
- Realtime
- Storage

## Core domains
- auth
- profile
- status
- discovery
- map presence
- likes
- matches
- chat
- moderation
- privacy settings

## Route groups
- (auth) — sign-in, sign-up (unauthenticated users)
- (onboarding) — profile setup (authenticated, no profile yet)
- (tabs) — main app (authenticated with profile)

## Auth flow
- AuthProvider wraps app, manages session + profile state
- AuthGate in root layout redirects based on: no session → auth, no profile → onboarding, ready → tabs
- Supabase Auth with AsyncStorage for session persistence

## Key architectural principle
True private location must be stored separately from public-safe displayed presence.