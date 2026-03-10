# Meet Me roadmap

## Phase 1 ✓
- project foundation
- AGENTS / rules / skills / workflows
- repo docs
- Expo app scaffold (tabs: Nearby, Map, Matches, Profile)
- NativeWind + Tailwind CSS configured
- Supabase client ready (pending project credentials)

## Phase 2 ✓
- Supabase Auth (email/password) with session persistence
- sign-in / sign-up screens
- onboarding screen (display name + bio)
- profiles table with RLS migration
- AuthProvider context + auth route guard
- profile tab shows user info + sign out
- pending: connect to live Supabase project + run migration

## Phase 3 ✓
- Status system: Green (open) / Yellow (busy) / Red (ghost) manual toggle
- Extended profile: age, gender, interest tags
- Edit Profile screen with interest picker
- Privacy Settings screen (show distance, show on map, discoverable)
- StatusToggle + InterestPicker reusable components
- 4 new/altered tables: profiles (altered), interests, profile_interests, privacy_preferences
- All tables with RLS, 20 seeded interests

## Phase 4
- nearby list / cards

## Phase 5
- privacy-safe map presence

## Phase 6
- likes
- incoming likes
- matches

## Phase 7
- realtime chat

## Phase 8
- block / report / settings

## Phase 9
- polish
- demo seed data
- end-to-end smoke flow