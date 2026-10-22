# Khmer Mystic – Developer Handoff

Everything needed to build the Khmer Mystic app: all content in English and Khmer as JSON, a tested reading engine, and the working prototype as a reference for flow and behaviour.

## What's in this package

| File | Contents |
| --- | --- |
| `data/cards.json` | 78 cards: id, name, tag, and Present / Challenge / Outcome meanings (en, km) |
| `data/zodiac.json` | 12 Khmer zodiac animals: name, strength line, advice line |
| `data/topics.json` | 10 topics: name, focus phrase, closing line, 10 questions each (100 total) |
| `data/templates.json` | Time frames, sentence templates (variants A/B), theme and tone sentences, disclaimer |
| `data/ui-strings.json` | Interface text for every screen (en, km) |
| `engine.js` | Reference reading engine (plain JavaScript, no dependencies) |
| `test.js` | Data checks and the worked example; run `node test.js` |
| `prototype.html` | The clickable prototype; open in any browser |

## IDs

- Cards: `MAJ-00` to `MAJ-21`; suits `WAN`, `CUP`, `SWO`, `PEN` with `-01` (Ace) to `-10`, `-11` Page, `-12` Knight, `-13` Queen, `-14` King.
- Zodiac: `RAT OX TIG RAB DRA SNA HOR GOA MON ROO DOG PIG`.
- Questions: topic code + number, e.g. `LF-02`. Topics: `LF LR CW MF BI FF WB EG LO CD`.
- Time frames: `present near mid long`.

## User flow

1. Language (English / Khmer), then the first-launch notice once.
2. Birth-year animal. Show the hint that the Khmer year starts at Khmer New Year (mid-April).
3. Topic, then one question (single choice).
4. Time frame.
5. Shuffle, then tap each of the three cards to turn it over (Present, Challenge, Outcome).
6. Reading, with "Ask another question" and "Start over".

## Reading engine rules

- `buildReading()` takes the language, zodiac id, question id, time frame and three card ids, and returns the reading as ordered parts: opening, answer (all but open questions), strength, present, challenge, outcome, theme, advice, closing, disclaimer.
- Same inputs always give the same text. A seed (FNV-1a of the ids) picks variant A or B for each part.
- Each question has a `kind` in topics.json: `open`, `obstacle`, `how`, `yesno` or `when`. `templates.kinds` gives the present / challenge / outcome / advice wording per kind (falling back to `parts`), and `templates.answers` the short direct answer that leads the overall message.
- Mood of the draw: bright = +1, steady = 0, testing = −1, summed over all three cards. Yes/no leans yes (≥ 1), not yet (≤ −1) or depends (0); "when" leans soon / later / when ready the same way.
- Theme: 2+ Major cards → Major theme; otherwise a suit appearing 2+ times; otherwise mixed. Tone: bright (mood ≥ 2), testing (≤ −2), steady (2+ steady cards), otherwise mixed.
- Time frames have a `phrase` ("right now") for the opening and an `outlook` ("from here") for the outcome line.
- One language per reading. Never mix English and Khmer.
- The disclaimer is always last and always visible. On the Wellbeing topic (`WB`), never collapse it.
- No AI and no network calls at runtime. Every sentence comes from reviewed content.
- The draw is random with no duplicates and no reversed cards. `drawCards()` accepts a custom random function if a daily lock is chosen later.

## Design

- Colors: midnight `#0B1530`, night panel `#132042`, antique gold `#C9A45C`, ivory `#F3EBDD`.
- Fonts: Cinzel (English titles), Moul (Khmer titles), Kantumruy Pro (all body text, both languages).
- Card: 70 × 120 mm (7:12). The art sits in the arch window; the frame, numeral and name are shared by all cards. See the card template canvas.
- Khmer text needs line-height about 1.7 and runs longer than English. Test every screen in Khmer.

## Still to provide or decide

- Card artwork: imported to `assets/cards/<card id>.jpg` (e.g. `MAJ-19.jpg`) by `scripts/import-card-art.sh`; source folders hold 2:3 PNGs named like `19-The-Sun.png`.
- Native Khmer review of all content. Update the JSON from the reviewed docs.
- Daily lock, reversed cards, and monetisation: open product decisions.
- Legal text (first-launch notice, privacy, terms) is in the Disclaimer, Privacy and Terms doc; fill its placeholders after legal review.
- If analytics, ads, accounts or payments are added, update the privacy notice before release.

## Source documents

Card template · Card art prompts · Card meanings · 100 questions · Zodiac profiles · Reading templates · Disclaimer, privacy and terms. The JSON here was exported from the tested prototype and matches those documents as of the date of this package. After the Khmer review, re-export so the two stay in sync.
