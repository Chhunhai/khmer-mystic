# Khmer Mystic – Progress Log

Agents: read this file before starting any task, and update it before finishing.
Keep "Current status" accurate and add one line to "Log" per task (newest first).

## Current status

### Done
- UX refinement: shorter responsive welcome, docked phone actions (scrolling fallback for short screens/large text), readable questions and full-width reading text, mobile Back, desktop time/draw layouts, and local language/reading recovery with a resume action. ESLint configured and animation ref errors resolved.
- Source review of current mobile and web UX/UI: identified welcome-screen height, text sizing, reading layout, desktop time/draw sizing, and session persistence improvements.
- Content: 78 card meanings, 100 questions, 12 zodiac profiles, reading templates (English and Khmer, in src/content/)
- Reading engine (src/engine/reading.ts) with content checks (npm run check)
- Clickable web prototype (docs/prototype/prototype.html)
- Card template design, card art prompts, disclaimer/privacy/terms drafts (links in docs/LINKS.md)
- Repo set up on GitHub; Expo SDK 57 + TypeScript; Node 24 required (SDK 57 matches App Store Expo Go 57.0.9; move to 58 once Expo Go for SDK 58 ships)

- Reading flow with Expo Router (src/app/): welcome → birth year → topic → question → time frame → draw (dealt face down, tap to turn, "Shuffle again") → result → full reading, with "Ask another question" and "Start over". Shared state in src/state/flow.tsx, UI kit in src/ui/
- App screens design (docs/LINKS.md, version 1792667033-c20c) implemented: fonts (Cinzel, Moul, Kantumruy Pro via expo-font), step bar, line icons (src/ui/icons.tsx), birth-year medallions (src/ui/medallion.tsx), The Fool artwork behind every screen (src/ui/backdrop.tsx), and desktop layouts from 900 px wide (site header with Home / Tarot Reading; flow screens in the ornate frame with a numbered stepper)
- Birth-year emblems: 12 carved-gold animals in assets/zodiac/<zodiac id>.png (288 px, navy ground made transparent), shown in the birth-year medallions and the desktop home. Re-import with `sh scripts/import-zodiac-emblems.sh <emblem folder>`
- Card art: all 78 images in assets/cards/<card id>.jpg (480 × 720), drawn in the v0.2 "royal frame" (crest, arch window, title band) with the new card back, in src/ui/cards.tsx. Re-import with `sh scripts/import-card-art.sh <art folder>`

### In progress
- (nothing)

### Next
1. First-launch notice, privacy notice and terms screens (notice goes after the language screen)
2. "12 Animal Years" and "About" pages: the design's desktop header links to them; left out until the pages exist.
3. Verify native iOS/Android layouts, text scaling, and local storage in a development build

### Waiting on the team
- Native Khmer review of all content, including the new interface strings from the screens design (step names, intro, nav, feature labels)
- Final sign-off on card artwork (all 78 imported; title band shows the reading language only, the template shows English over Khmer)
- Legal review of disclaimer, privacy and terms
- Decisions: daily reading lock, reversed cards, monetisation

## Log
- 2026-10-22: Draw screen now shuffles and deals: the deck riffles twice, then three cards fly down into Present / Challenge / Outcome; "Shuffle again" gathers them back, reshuffles and deals anew (instant with Reduce Motion; no replay when cards are already dealt). Checked frame by frame on web at 390 and 1440 px, incl. flip and Shuffle again; typecheck, checks and lint pass
- 2026-10-22: Replaced the birth-year line drawings with the 12 carved-gold emblems (Khmer-Zodiac-12-Animals), background removed by scripts/key-emblem.py; also used for the desktop home's "12 animal years" feature. Checked on web at 390 and 1440 px in English and Khmer; typecheck, checks and lint pass
- 2026-10-22: Applied mobile/web UX recommendations: responsive welcome, reachable phone actions, larger question text, stacked reading artwork, Back recovery, desktop time/draw layouts, consistent fresh starts, and validated local session persistence with bilingual resume. Added persistence regression checks and ESLint config; typecheck, content/persistence checks and lint pass. Browser flow verifies refresh/resume and responsive layouts; native-device verification remains pending.
- 2026-10-22: Reviewed current mobile/web UX/UI against the supplied mockup (source review, no fresh rendered-device verification). Typecheck and content checks pass; lint's temporary auto-generated config reported 10 react-hooks/refs errors in draw.tsx and cards.tsx; removed that generated config after the review. No app code changed.
- 2026-10-22: Updated to the newer screens design: animal line-drawing medallions on the birth-year screen (Khmer year names as labels), faint artwork behind phone screens, desktop redesign (full-bleed artwork, nav links, centred home, ornate frame with stepper and Back/Continue, overall message under the cards). Added assets/hero-fool.jpg (full-size Fool) for backgrounds. Checked on web at 390 and 1440 px in English and Khmer; typecheck and content checks pass
- 2026-10-22: Implemented the app screens design: new welcome (Fool artwork hero), round birth-year tiles, topic icons, radio question list, time-frame tiles with summary, draw over gold rings with "Shuffle again", result screen plus new full-reading screen, and desktop layouts. Loaded Cinzel/Moul/Kantumruy Pro; background now #0B1530. Checked on web at 390 and 1440 px in English and Khmer; typecheck and content checks pass
- 2026-10-22: Imported all 78 card images (from Khmer-Mystic-Tarot, resized to 480 × 720 JPEG, 12 MB) and rebuilt the card front and back from the v0.2 template (royal frame, Roman numeral or suit crest, new sun-and-lotus back). Checked on web at small and large sizes in English and Khmer; typecheck and content checks pass
- 2026-10-22: Built the 6-screen reading flow with Expo Router, replacing the App.tsx starter screen. Clicked through in English and Khmer on web (incl. Wellbeing reading, Ask another question, Start over); typecheck and content checks pass
- 2026-10-22: Downgraded Expo SDK 58 → 57 (RN 0.86.3, React 19.2.3) so the app runs in the current App Store Expo Go; added react-dom and react-native-web for web preview. Lint not yet configured (no ESLint config).
- 2026-10-22: Repo created, Node 24 installed, content checks passing on Hai's Mac
