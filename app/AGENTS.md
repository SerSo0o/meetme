# App directory guidance

## UI direction
- modern
- minimal
- premium
- spacious
- rounded
- easy to scan
- safe-feeling
- socially inviting
- not cluttered
- not heavily "dating app" coded

## Navigation expectations
Primary mobile navigation should support:
- Nearby
- Map
- Matches / Chats
- Profile / Settings

## Screen expectations
Core screens should include:
- auth
- onboarding
- nearby list
- map
- profile
- edit profile
- incoming likes
- matches
- chat list
- chat detail
- settings
- report / block flows

## Component rules
- prefer reusable, small components
- extract primitives when repeated
- include loading, error, and empty states
- do not build huge monolithic screens
- use TypeScript strictly
- use Expo Router conventions cleanly

## Product rules in UI
- distance must be approximate
- labels like "near Main Square" are preferred over exact places
- red users are not shown in discovery
- yellow and green are visible if privacy settings allow
- chat unlocks only after mutual match