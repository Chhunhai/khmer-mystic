# Khmer Mystic

A bilingual (Khmer / English) Tarot and Khmer zodiac reading app for Android, iOS and web, built with Expo (React Native) and TypeScript.

Readings are built entirely from reviewed content in `src/content/`. There is no AI and no network call at runtime.

## Getting started

Requirements: Node.js 22 or newer, and the Expo Go app on a phone (or an Android emulator / iOS simulator).

```bash
npm install
npm run check      # validate all content and reproduce the sample reading
npm run typecheck  # TypeScript check
npm start          # start Expo, then scan the QR code with Expo Go
```

To run in a web browser (for the tablet and desktop layouts), add web support once:

```bash
npx expo install react-dom react-native-web
npm run web
```

Always add packages with `npx expo install <package>`, so their versions match the Expo SDK.

## Project structure

| Path | What it is |
| --- | --- |
| `src/app/` | Screens (Expo Router): language, zodiac, topic, question, time, draw, reading |
| `src/state/flow.tsx` | Selections shared across the flow, plus UI-string helpers |
| `src/ui/` | Theme tokens, shared components and card art |
| `src/content/` | All content as JSON: cards, zodiac, topics and questions, templates, UI strings |
| `src/engine/` | Reading engine (`reading.ts`) and data types (`types.ts`) |
| `scripts/check-content.mts` | Content checks and the worked example |
| `docs/BUILD_SPEC.md` | Build spec: IDs, user flow, engine rules, design tokens, open decisions |
| `docs/prototype/prototype.html` | The clickable prototype; open in any browser as the reference |
| `docs/LINKS.md` | Links to all source documents and designs |

## Content changes

The Claude Docs are the source of truth for content. When a doc changes (for example after the Khmer review), update the matching JSON in `src/content/` and run `npm run check` before committing.

## Next steps

1. Build the six screens of the flow (see the prototype and `docs/BUILD_SPEC.md`).
2. Add the Khmer and Cinzel fonts (Kantumruy Pro, Moul, Cinzel) with `expo-font`.
3. Add the card artwork to `assets/cards/` once it is generated and approved.
4. Add the first-launch notice, privacy notice and terms from the legal doc.
