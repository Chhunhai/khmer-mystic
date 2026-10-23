# Saved question-specific readings

## Completed draft batches

| File | Question | Coverage |
| --- | --- | --- |
| `src/content/readings/LF-01.json` | What does my current path look like? | 78 cards × 3 positions, English and Khmer |
| `src/content/readings/LF-02.json` | What should I focus on right now? | 78 cards × 3 positions, English and Khmer |
| `src/content/readings/LF-03.json` | What challenges might I face soon? | 78 cards × 3 positions, English and Khmer |
| `src/content/readings/LF-04.json` | What opportunities are coming my way? | 78 cards × 3 positions, English and Khmer (heading) |
| `src/content/readings/LF-05.json` | What can I do to improve my life? | 78 cards × 3 positions, English and Khmer (how) |
| `src/content/readings/LF-06.json` | What is the likely outcome of my current situation? | 78 cards × 3 positions, English and Khmer (heading) |
| `src/content/readings/LF-07.json` | What advice do I need to hear? | 78 cards × 3 positions, English and Khmer (how) |
| `src/content/readings/LF-08.json` | What energy surrounds me now? | 78 cards × 3 positions, English and Khmer (state) |
| `src/content/readings/LF-09.json` | What should I avoid? | 78 cards × 3 positions, English and Khmer (obstacle) |

- Each file has 234 bilingual interpretations (468 individual language texts); combined coverage is 702 bilingual interpretations across 3 of 100 questions.
- Authored with AI during development on 2026-10-23, using the existing card meanings as the starting point.
- Editorial status: draft. English editorial review and native Khmer review remain pending; automated checks do not certify translation quality.
- Enabled in the current app for preview. The other 98 questions still use the existing generic meanings and templates.
- No external generation service, API credentials or runtime network calls are involved.

This is a library of individual card interpretations, not a library of every three-card spread. Shared templates still connect the passages and determine the theme, arc, mood, time wording and zodiac advice. The overall answer for LF-01 uses the saved Present interpretation. A complete spread is still assembled deterministically rather than authored as a single AI response.

LF-02 is an action question (`how`): its Present text names a practical focus, its Challenge text addresses a barrier or distraction, and its Outcome text describes what that effort could bring. The existing `how` templates frame these passages. Its short overall answer still uses the shared three-card advice template; the saved guidance appears in the full reading and card captions.

## File format

One JSON file per question, named after its existing ID. The root contains `questionId` and `cards`. Each card ID has `present`, `challenge` and `outcome`; every position has `en` and `km` text. See LF-01.json for the complete example.

The passages are inserted into the existing sentence templates. Keep them as complete sentences without card-name prefixes, placeholders, fixed dates, zodiac references or UI labels. The templates supply that context. Describe possibilities and reflective choices rather than certain predictions; the reading's disclaimer remains visible.

All user-facing reading prose belongs in JSON. `src/engine/reading.ts` only selects and assembles it. Lookup order is question → card → position → selected language; an absent entry falls back to the generic meaning in `cards.json`. It never falls back to a different language.

## Adding the next question

1. Read the exact English/Khmer question in `src/content/topics.json`, including its kind. Author interpretations that answer that question, rather than copying LF-01 or adding the same prefix to generic meanings.
2. Create `src/content/readings/<questionId>.json` with all 78 cards and all three bilingual positions.
3. Import the JSON in `src/content/index.ts` and add it to `questionReadings` under the matching question ID. Static imports bundle the content for offline use.
4. Run `npm run check`, `npm run typecheck` and `npm run lint`. The content checks discover question files and verify IDs, structure, coverage, language separation, deterministic selection and fallback behaviour.
5. Review complete readings as well as individual entries. Include difficult cards, mixed moods, all time frames and both languages; check how the summary and connecting templates fit the new text.
6. Record editorial/translation review status and update `docs/PROGRESS.md` with the same commit.

LF-03 is an obstacle question: its Present text describes what you are carrying into this period, its Challenge text names the specific difficulty to watch for (each starts with “Watch for…” or a similar plain warning, because the template already says “The main challenge … is {card}”), and its Outcome text describes where facing it can lead. Drafted on 2026-10-23. The obstacle short answer now quotes the first sentence of the Challenge text, which also improves the 13 other obstacle questions that use generic meanings.

Next batch: LF-04, “What opportunities are coming my way?” Editorial and native Khmer review remain pending for all three completed batches. Full coverage of all 100 questions would contain 23,400 bilingual entries. Reassess installed content size and loading performance as the library grows.

## Zodiac guidance

`src/content/zodiac-readings.json` gives each of the 12 birth-year animals its own guidance for every card position (Present, Challenge, Outcome) and card mood (bright, steady, testing): 108 bilingual entries. The same card therefore reads differently for a Tiger and a Rabbit.

- Each card paragraph is the card's meaning (saved question text, else the generic meaning) followed by the animal's guidance for that position and the card's mood.
- The short answer quotes only the first sentence of the answering card's meaning, then adds that card's animal guidance once. The answering card depends on the question kind: Present for state / how / who, Challenge for obstacle / lesson, Outcome for heading / what-if / yes-no / when.
- When an animal has guidance, the fixed birth-year line (`zodiac.json` strength) is left out, because the animal already speaks in every card. The closing advice line stays.
- Guidance never changes the cards, the lean, the theme or the mood. An animal without guidance falls back to the old behaviour.
- Write each entry as one complete sentence (or two short ones) in plain, second-person language, without the animal's name, card names or placeholders.
- Editorial status: AI-drafted on 2026-10-23; English editorial review and native Khmer review pending.
