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

- Reading flow with Expo Router (src/app/): welcome → birth year → topic → question → time frame → draw (dealt face down, tap to turn, "Shuffle again") → result → full reading, with "Ask another question" and "Start over". Shared state in src/state/flow.tsx, UI kit in src/ui/
- App screens design (docs/LINKS.md) implemented: fonts (Cinzel, Moul, Kantumruy Pro via expo-font), step bar, line icons (src/ui/icons.tsx), and desktop layouts from 900 px wide (site header; home, topic + question, result side by side)
- Card art: all 78 images in assets/cards/<card id>.jpg (480 × 720), drawn in the v0.2 "royal frame" (crest, arch window, title band) with the new card back, in src/ui/cards.tsx. Re-import with `sh scripts/import-card-art.sh <art folder>`

### In progress
- (nothing)

### Next
1. First-launch notice, privacy notice and terms screens (notice goes after the language screen)
2. Remember the chosen language between launches (prototype did this with localStorage)
3. Desktop layouts for birth year, time frame and draw (not in the design; they use the phone column under the site header). "About" link in the desktop header needs an About page
4. Set up ESLint so `npx expo lint` runs

### Waiting on the team
- Native Khmer review of all content, including the new interface strings from the screens design (Khmer animal names, step names, intro)
- Final sign-off on card artwork (all 78 imported; title band shows the reading language only, the template shows English over Khmer)
- Legal review of disclaimer, privacy and terms
- Decisions: daily reading lock, reversed cards, monetisation

## Log
- 2026-10-22: Implemented the app screens design: new welcome (Fool artwork hero), round birth-year tiles, topic icons, radio question list, time-frame tiles with summary, draw over gold rings with "Shuffle again", result screen plus new full-reading screen, and desktop layouts. Loaded Cinzel/Moul/Kantumruy Pro; background now #0B1530. Checked on web at 390 and 1440 px in English and Khmer; typecheck and content checks pass
- 2026-10-22: Imported all 78 card images (from Khmer-Mystic-Tarot, resized to 480 × 720 JPEG, 12 MB) and rebuilt the card front and back from the v0.2 template (royal frame, Roman numeral or suit crest, new sun-and-lotus back). Checked on web at small and large sizes in English and Khmer; typecheck and content checks pass
- 2026-10-22: Built the 6-screen reading flow with Expo Router, replacing the App.tsx starter screen. Clicked through in English and Khmer on web (incl. Wellbeing reading, Ask another question, Start over); typecheck and content checks pass
- 2026-10-22: Downgraded Expo SDK 58 → 57 (RN 0.86.3, React 19.2.3) so the app runs in the current App Store Expo Go; added react-dom and react-native-web for web preview. Lint not yet configured (no ESLint config).
- 2026-10-22: Repo created, Node 24 installed, content checks passing on Hai's Mac
