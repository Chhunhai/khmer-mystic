// A slow golden vortex behind an enlarged card: soft out-of-focus blue bokeh drifting across the
// screen, a gold halo, and three spiral arms of gold sparks turning around the card. Each layer is
// drawn once as SVG and only rotates as a whole, so it stays cheap. Still when Reduce Motion is on.
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useReducedMotion } from './cards.tsx';

const useNativeDriver = Platform.OS !== 'web';

type Dot = { x: number; y: number; r: number; fill: string; opacity: number };

/** Small seeded random generator, so the pattern is the same every time. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const C = 500; // every layer is drawn on a 1000 × 1000 grid around this centre
const polar = (radius: number, angle: number) => ({ x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) });
const pick = <T,>(rand: () => number, items: T[]) => items[Math.floor(rand() * items.length)];

// Bokeh fills: soft discs that fade to nothing at the edge, so they read as out of focus.
const bokehFills = ['bokehA', 'bokehB', 'bokehC'];
const bokehColours = ['#3C5FA0', '#4A78B8', '#7FA2E0'];

/** Out-of-focus blue discs and fine blue sparks, out to the corners. */
const outerDots: Dot[] = (() => {
  const rand = seeded(7);
  const dots: Dot[] = [];
  for (let i = 0; i < 120; i++) {
    const p = polar(120 + Math.pow(rand(), 0.7) * 620, rand() * Math.PI * 2);
    dots.push({ ...p, r: 10 + rand() * 26, fill: `url(#${pick(rand, bokehFills)})`, opacity: 0.35 + rand() * 0.45 });
  }
  for (let i = 0; i < 160; i++) {
    const p = polar(140 + Math.pow(rand(), 0.8) * 580, rand() * Math.PI * 2);
    dots.push({ ...p, r: 0.9 + rand() * 1.5, fill: pick(rand, ['#A9C6FF', '#DCE8FF']), opacity: 0.3 + rand() * 0.5 });
  }
  return dots;
})();

/** Gold sparks on three tight spiral arms, from just inside the card's edge outwards. */
const spiralDots: Dot[] = (() => {
  const rand = seeded(19);
  const dots: Dot[] = [];
  for (let i = 0; i < 900; i++) {
    const arm = i % 3;
    const t = rand();
    const radius = 230 + t * 260 + (rand() - 0.5) * 22;
    const angle = (arm * 2 * Math.PI) / 3 + t * 2.4 * Math.PI + (rand() - 0.5) * 0.16;
    dots.push({
      ...polar(radius, angle),
      r: 0.9 + rand() * 2.4,
      fill: pick(rand, ['#E8C988', '#C9A45C', '#FFE7A8', '#FFF4D6']),
      opacity: (0.45 + rand() * 0.55) * (1 - t * 0.5), // brighter near the card, fading outwards
    });
  }
  return dots;
})();

function OuterLayer({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1000 1000">
      <Defs>
        {bokehFills.map((id, i) => (
          <RadialGradient key={id} id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={bokehColours[i]} stopOpacity={0.9} />
            <Stop offset="0.55" stopColor={bokehColours[i]} stopOpacity={0.45} />
            <Stop offset="1" stopColor={bokehColours[i]} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {outerDots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} opacity={d.opacity} />
      ))}
    </Svg>
  );
}

function SpiralLayer({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1000 1000">
      <Defs>
        <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0.35" stopColor="#E8C988" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#E8C988" stopOpacity={0.22} />
          <Stop offset="0.72" stopColor="#C9A45C" stopOpacity={0.08} />
          <Stop offset="1" stopColor="#C9A45C" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={C} cy={C} r={500} fill="url(#halo)" />
      {spiralDots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} opacity={d.opacity} />
      ))}
    </Svg>
  );
}

/** A turning layer: one full turn every `seconds`. */
function useSpin(seconds: number, reduced: boolean) {
  const [turn] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.timing(turn, { toValue: 1, duration: seconds * 1000, easing: Easing.linear, useNativeDriver }),
    );
    loop.start();
    return () => loop.stop();
  }, [turn, seconds, reduced]);
  return turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
}

/**
 * Fills its parent. The bokeh is centred on (`centerX`, `centerY`) and sized to reach every corner,
 * so it covers the screen while it turns; the gold spiral is sized to `cardRadius` (half the card's
 * diagonal) so its arms swirl just around the card's edges.
 */
export function Vortex({
  width,
  height,
  centerX,
  centerY,
  cardRadius,
}: {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  cardRadius: number;
}) {
  const reduced = useReducedMotion();
  const outer = useSpin(90, reduced);
  const spiral = useSpin(24, reduced);
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return;
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(pulse, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    breathe.start();
    return () => breathe.stop();
  }, [pulse, reduced]);

  // A rotating square always covers the circle it encloses, so its half side must reach the furthest corner.
  const reach = Math.max(
    Math.hypot(centerX, centerY),
    Math.hypot(width - centerX, centerY),
    Math.hypot(centerX, height - centerY),
    Math.hypot(width - centerX, height - centerY),
  );
  const outerSize = reach * 2;
  // The spiral's inner edge (230 of 500) sits just inside the card's corners, its arms reach 1.25× out.
  const spiralSize = ((cardRadius * 1.25) / 490) * 1000;
  const at = (size: number) => ({ left: centerX - size / 2, top: centerY - size / 2, width: size, height: size });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.layer, at(outerSize), { transform: [{ rotate: outer }] }]} shouldRasterizeIOS renderToHardwareTextureAndroid>
        <OuterLayer size={outerSize} />
      </Animated.View>
      <Animated.View
        style={[styles.layer, at(spiralSize), { transform: [{ rotate: spiral }, { scale }] }]}
        shouldRasterizeIOS
        renderToHardwareTextureAndroid
      >
        <SpiralLayer size={spiralSize} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
});
