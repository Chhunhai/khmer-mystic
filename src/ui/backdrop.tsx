// The Fool's artwork behind the screens, faded into the midnight background (app screens design).
import { useId, useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from './theme.ts';

// Full-size copy of The Fool (scripts/import-card-art.sh), sharp at desktop widths.
const art = require('../../assets/hero-fool.jpg');
const artAspect = 2 / 3;

/**
 * Fills its box with the artwork like CSS `object-fit: cover`, with `focus` (0–1 on each axis)
 * choosing which part stays in view, like `object-position`.
 */
export function CoverImage({
  focus,
  opacity = 1,
  style,
  label,
}: {
  focus: { x: number; y: number };
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const scale = Math.max(box.w / artAspect, box.h);
  const w = scale * artAspect;
  const h = scale;
  return (
    <View
      style={[styles.clip, style]}
      onLayout={e => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}
    >
      {box.w > 0 && (
        <Image
          source={art}
          style={{ position: 'absolute', width: w, height: h, left: (box.w - w) * focus.x, top: (box.h - h) * focus.y, opacity }}
        />
      )}
    </View>
  );
}

type Stops = [offset: number, opacity: number][];

/** A midnight gradient overlay; `stops` are [offset, opacity] pairs along the direction. */
export function Fade({ stops, horizontal = false, style }: { stops: Stops; horizontal?: boolean; style?: StyleProp<ViewStyle> }) {
  const id = `fade${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width="100%" height="100%" style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
          {stops.map(([offset, opacity]) => (
            <Stop key={offset} offset={offset} stopColor={colors.midnight} stopOpacity={opacity} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * phone: faint artwork rising from the bottom of each flow screen.
 * hero: desktop home, the artwork full-bleed and darkened towards the text on the right.
 * soft: other desktop pages, the artwork dimmed behind the content frame.
 */
export function Backdrop({ variant }: { variant: 'phone' | 'hero' | 'soft' }) {
  if (variant === 'phone') {
    return (
      <View style={styles.phone} pointerEvents="none">
        <CoverImage focus={{ x: 0.5, y: 0.88 }} opacity={0.34} style={StyleSheet.absoluteFill} />
        <Fade stops={[[0, 1], [0.55, 0.35], [1, 0.75]]} />
      </View>
    );
  }
  if (variant === 'hero') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <CoverImage focus={{ x: 0.22, y: 0.3 }} opacity={0.95} style={StyleSheet.absoluteFill} />
        <Fade horizontal stops={[[0, 0.05], [0.32, 0.45], [0.48, 0.86], [1, 0.93]]} />
        <Fade stops={[[0, 0.55], [0.18, 0], [0.75, 0], [1, 0.9]]} />
      </View>
    );
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <CoverImage focus={{ x: 0.5, y: 0.4 }} opacity={0.5} style={StyleSheet.absoluteFill} />
      <Fade stops={[[0, 0.72], [0.45, 0.86], [1, 0.95]]} />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  phone: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 420 },
});
