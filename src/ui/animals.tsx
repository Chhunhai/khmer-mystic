// The twelve birth-year emblems: carved-gold animals on a transparent ground (assets/zodiac/, see
// scripts/import-zodiac-emblems.sh). Decorative; the tile's label names the animal.
import { Image } from 'react-native';
import { zodiacArt } from './zodiacArt.ts';

export function AnimalEmblem({ id, size }: { id: string; size: number }) {
  const source = zodiacArt[id];
  if (!source) return null;
  return <Image source={source} style={{ width: size, height: size }} resizeMode="contain" accessible={false} />;
}
