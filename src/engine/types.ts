export type Lang = 'en' | 'km';
export type Text = Record<Lang, string>;
export type TimeFrameId = 'present' | 'near' | 'mid' | 'long';
export type Tag = 'bright' | 'steady' | 'testing';
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

export interface Templates {
  timeFrames: { id: TimeFrameId; phrase: Text; label: Record<Lang, [string, string]> }[];
  parts: {
    opening: Variants;
    strength: Variants;
    present: Variants;
    challenge: Variants;
    outcome: Variants;
    advice: Variants;
  };
  theme: Record<Lang, Record<'MAJ' | SuitId | 'MIX', string>>;
  tone: Record<Tag, Text>;
  disclaimer: Text;
}

export interface Content {
  cards: Card[];
  zodiac: Zodiac[];
  topics: Topic[];
  templates: Templates;
}

export interface ReadingInput {
  lang: Lang;
  zodiacId: string;
  questionId: string;
  timeFrame: TimeFrameId;
  cardIds: [string, string, string];
}

export type PartKey =
  | 'opening' | 'strength' | 'present' | 'challenge' | 'outcome'
  | 'theme' | 'advice' | 'closing' | 'disclaimer';

export interface Reading {
  parts: { key: PartKey; text: string }[];
  cards: [Card, Card, Card];
}
