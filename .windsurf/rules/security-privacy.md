---
trigger: always_on
---

# Security and privacy rules

- Never expose exact user coordinates to other users.
- Never show exact addresses or exact pins for other users.
- Separate true private location from public-safe displayed presence.
- Prefer approximate distance, area labels, and hotspot language.
- Red status means ghost mode and must remove the user from discovery.
- Any feature touching maps, distance, discovery, or presence must preserve privacy first.
- Do not create public APIs, views, or UI that leak raw location.