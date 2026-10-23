export type Lang = 'en' | 'km';
export type Text = Record<Lang, string>;
export type TimeFrameId = 'present' | 'near' | 'mid' | 'long';
export type Tag = 'bright' | 'steady' | 'testing';
/** What a question asks for, which shapes how the reading answers it. */
export type QuestionKind = 'state' | 'heading' | 'lesson' | 'who' | 'whatif' | 'obstacle' | 'how' | 'yesno' | 'when';
export type SuitId = 'WAN' | 'CUP' | 'SWO' | 'PEN';

export interface Card {
  id: string;
  arcana: 'major' | 'minor';
  suit: SuitId | null;
  numeral: string | null;
  tag: Tag;
  name: Text;
  meaning: { present: Text; challenge: Text; outcome: Text };
}

export interface Zodiac {
  id: string;
  name: Text;
  strength: Text;
  advice: Text;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  en: string;
  km: string;
}

export interface Topic {
  id: string;
  name: Text;
  focus: Text;
  closing: Text;
  questions: Question[];
}

type Variants = Record<Lang, string[]>;
type CardPart = 'present' | 'challenge' | 'outcome' | 'advice';
export type AnswerKey = Exclude<QuestionKind, 'yesno' | 'when'> | 'yes' | 'notyet' | 'depends' | 'soon' | 'later' | 'ready';

export interface Templates {
  /** `phrase` fits "…about your love life {time}"; `outlook` fits "…where this is heading {outlook}". */
  timeFrames: { id: TimeFrameId; phrase: Text; outlook: Text; label: Record<Lang, [string, string]> }[];
  parts: {
    opening: Variants;
    strength: Variants;
    present: Variants;
    challenge: Variants;
    outcome: Variants;
    advice: Variants;
  };
  /** Wording per kind of question; parts not listed fall back to `parts`. */
  kinds: Record<QuestionKind, Partial<Record<CardPart, Variants>>>;
  /** The short direct answer that leads the overall message. */
  answers: Record<AnswerKey, Text>;
  /** From the Present card to the Outcome card. */
  arc: Record<'better' | 'worse' | 'carry' | 'persist' | 'same', Text>;
  theme: Record<Lang, Record<'MAJ' | SuitId, string>>;
  tone: Record<Tag, Text>;
  disclaimer: Text;
}

/** Offline, question-specific interpretations. Keys use the existing card IDs. */
export interface QuestionReading {
  questionId: string;
  cards: Partial<Record<string, Card['meaning']>>;
}

export interface Content {
  cards: Card[];
  zodiac: Zodiac[];
  topics: Topic[];
  templates: Templates;
  questionReadings?: Partial<Record<string, QuestionReading>>;
}

export interface ReadingInput {
  lang: Lang;
  zodiacId: string;
  questionId: string;
  timeFrame: TimeFrameId;
  cardIds: [string, string, string];
}

export type PartKey =
  | 'opening' | 'answer' | 'strength' | 'present' | 'challenge' | 'outcome'
  | 'theme' | 'advice' | 'closing' | 'disclaimer';

export interface Reading {
  parts: { key: PartKey; text: string }[];
  cards: [Card, Card, Card];
}
