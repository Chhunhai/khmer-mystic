# Khmer Mystic – Progress Log

Agents: read this file before starting any task, and update it before finishing.
Keep "Current status" accurate and add one line to "Log" per task (newest first).

## Current status

### Done
- Content: 78 card meanings, 100 questions, 12 zodiac profiles, reading templates (English and Khmer, in src/content/)
- Reading engine (src/engine/reading.ts) with content checks (npm run check)
- Clickable web prototype (docs/prototype/prototype.html)
- Card template design, card art prompts, disclaimer/privacy/terms drafts (links in docs/LINKS.md)
- Repo set up on GitHub; Expo SDK 57 + TypeScript; Node 24 required (SDK 57 matches App Store Expo Go 57.0.9; move to 58 once Expo Go for SDK 58 ships)

### In progress
- Starter screen only (App.tsx shows the sample reading)

### Next
1. Build the 6-screen flow: language, zodiac, topic and question, time frame, card draw, reading
2. Add fonts with expo-font: Kantumruy Pro, Moul, Cinzel
3. First-launch notice, privacy notice and terms screens
4. Tablet and desktop layouts
5. Card artwork into assets/cards/ once approved

### Waiting on the team
- Native Khmer review of all content
- Card artwork (start with The Sun)
- Legal review of disclaimer, privacy and terms
- Decisions: daily reading lock, reversed cards, monetisation

## Log
- 2026-10-22: Downgraded Expo SDK 58 → 57 (RN 0.86.3, React 19.2.3) so the app runs in the current App Store Expo Go; added react-dom and react-native-web for web preview. Lint not yet configured (no ESLint config).
- 2026-10-22: Repo created, Node 24 installed, content checks passing on Hai's Mac
