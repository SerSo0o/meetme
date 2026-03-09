# start-feature

Description: Plan and begin one Meet Me feature in a controlled way.

1. Read:
   - AGENTS.md
   - app/AGENTS.md
   - supabase/AGENTS.md
   - relevant rules

2. Summarize the requested feature in 3-5 bullets.

3. Invoke @feature-planner if the feature spans more than one screen, touches data, or changes product behavior.

4. Identify:
   - affected screens
   - affected tables / schema
   - privacy impact
   - whether realtime is needed
   - whether moderation / blocking affects this feature

5. Propose the smallest implementation slice that leaves the app runnable.

6. Before writing code, state:
   - goal
   - files expected to change
   - acceptance criteria

7. Implement only the first sensible slice.

8. After implementation:
   - list what is done
   - list placeholders
   - list the next smallest step