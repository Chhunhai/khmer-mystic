import cards from './cards.json';
import zodiac from './zodiac.json';
import topics from './topics.json';
import templates from './templates.json';
import uiStrings from './ui-strings.json';
import type { Content } from '../engine/types.ts';

export const content = { cards, zodiac, topics, templates } as unknown as Content;
export { uiStrings };
