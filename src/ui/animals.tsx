// The twelve birth-year animals as gold line drawings on a 64 × 64 grid, from the app screens design.
import type { ReactElement } from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors } from './theme.ts';

const drawings: Record<string, (color: string) => ReactElement> = {
  RAT: color => (
    <>
      <Path d="M18 30 C18 20 46 20 46 30 C46 40 38 50 32 52 C26 50 18 40 18 30 Z" />
      <Circle cx={17} cy={19} r={7.5} />
      <Circle cx={47} cy={19} r={7.5} />
      <Circle cx={26.5} cy={32} r={1.6} fill={color} />
      <Circle cx={37.5} cy={32} r={1.6} fill={color} />
      <Circle cx={32} cy={49} r={2} fill={color} />
      <Path d="M27 46 L13 43 M27 48 L13 50 M37 46 L51 43 M37 48 L51 50" />
    </>
  ),
  OX: color => (
    <>
      <Path d="M21 25 C21 19 43 19 43 25 L41 41" />
      <Path d="M21 25 L23 41" />
      <Ellipse cx={32} cy={45} rx={11} ry={7} />
      <Circle cx={28} cy={45} r={1.4} fill={color} />
      <Circle cx={36} cy={45} r={1.4} fill={color} />
      <Path d="M21 24 C12 22 8 15 10 7 C14 14 18 16 23 18" />
      <Path d="M43 24 C52 22 56 15 54 7 C50 14 46 16 41 18" />
      <Path d="M21 28 L12 30 L20 34 M43 28 L52 30 L44 34" />
      <Circle cx={27} cy={30} r={1.6} fill={color} />
      <Circle cx={37} cy={30} r={1.6} fill={color} />
    </>
  ),
  TIG: color => (
    <>
      <Circle cx={32} cy={35} r={16} />
      <Path d="M19 25 C15 22 15 15 21 15 C24 15 25 18 25 21 M45 25 C49 22 49 15 43 15 C40 15 39 18 39 21" />
      <Path d="M32 19 L32 25 M27 20 L29 25 M37 20 L35 25 M16 34 L22 35 M17 40 L22 39 M48 34 L42 35 M47 40 L42 39" />
      <Path d="M24 32 C26 30 28 30 30 32 M34 32 C36 30 38 30 40 32" />
      <Path d="M29 38 L35 38 L32 41 Z" fill={color} />
      <Path d="M32 41 C30 45 26 45 25 42 M32 41 C34 45 38 45 39 42" />
    </>
  ),
  RAB: color => (
    <>
      <Path d="M25 27 C20 15 20 4 25 4 C30 4 30 16 29 26 M39 27 C44 15 44 4 39 4 C34 4 34 16 35 26" />
      <Path d="M25 10 L26 22 M39 10 L38 22" strokeWidth={1.2} />
      <Circle cx={32} cy={39} r={13} />
      <Circle cx={27} cy={37} r={1.6} fill={color} />
      <Circle cx={37} cy={37} r={1.6} fill={color} />
      <Path d="M30 42 L34 42 L32 44.5 Z" fill={color} />
      <Path d="M32 44.5 C31 47 29 47 28 46 M32 44.5 C33 47 35 47 36 46" />
    </>
  ),
  DRA: color => (
    <>
      <Path d="M14 34 C16 26 24 22 34 24 L50 28 C54 29 55 33 51 34 L41 35 L50 38 C52 39 51 42 48 42 L36 42 C30 46 20 46 16 42 C14 40 13 37 14 34 Z" />
      <Path d="M22 24 C20 16 24 10 30 8 M28 23 C28 16 32 12 38 12" />
      <Circle cx={33} cy={30} r={1.8} fill={color} />
      <Path d="M29 27 L37 27.5 M49 34 C56 36 60 42 58 50" />
      <Path d="M15 33 L7 29 L11 37 L4 41 L12 43 L8 50 L18 45" />
    </>
  ),
  SNA: color => (
    <>
      <Path d="M20 53 C8 53 8 41 20 41 L44 41 C56 41 56 29 44 29 L28 29 C18 29 18 17 28 17 L35 17" strokeWidth={3.4} />
      <Ellipse cx={40} cy={16.5} rx={6.5} ry={4.8} fill={color} />
      <Circle cx={41.5} cy={15} r={1.1} fill={colors.midnight} stroke="none" />
      <Path d="M46.5 16.5 L52 14 M46.5 16.5 L52 19" strokeWidth={1.4} />
    </>
  ),
  HOR: color => (
    <>
      <Path d="M22 56 C20 44 20 30 26 20 L28 11 L32 18 C38 18 44 22 48 30 L54 40 C56 44 52 48 48 46 L42 42 C38 44 36 48 38 56" />
      <Path d="M26 20 C20 24 16 34 16 46 C16 50 18 54 20 56" />
      <Path d="M22 26 L17 25 M19 33 L14 33 M18 40 L13 41 M18 47 L14 49" strokeWidth={1.4} />
      <Circle cx={36} cy={26} r={1.8} fill={color} />
      <Circle cx={50} cy={42} r={1.3} fill={color} />
    </>
  ),
  GOA: color => (
    <>
      <Path d="M24 27 C24 23 40 23 40 27 L38 44 C37 50 27 50 26 44 Z" />
      <Path d="M26 24 C22 13 13 11 11 19 C10 24 13 26 16 24 M38 24 C42 13 51 11 53 19 C54 24 51 26 48 24" />
      <Path d="M24 31 L14 33 L23 36 M40 31 L50 33 L41 36" />
      <Path d="M28 49 C29 57 35 57 36 49" />
      <Circle cx={28.5} cy={33} r={1.6} fill={color} />
      <Circle cx={35.5} cy={33} r={1.6} fill={color} />
      <Path d="M30 44 L31 45 M34 44 L33 45" />
    </>
  ),
  MON: color => (
    <>
      <Circle cx={32} cy={34} r={16} />
      <Circle cx={14.5} cy={34} r={5} />
      <Circle cx={49.5} cy={34} r={5} />
      <Path d="M22 33 C22 25 30 25 32 29 C34 25 42 25 42 33 C42 43 38 48 32 48 C26 48 22 43 22 33 Z" />
      <Circle cx={28} cy={33} r={1.6} fill={color} />
      <Circle cx={36} cy={33} r={1.6} fill={color} />
      <Path d="M30 39 L30.5 40 M34 39 L33.5 40 M28 43 C30 45 34 45 36 43" />
      <Path d="M27 19 C29 15 35 15 37 19" />
    </>
  ),
  ROO: color => (
    <>
      <Path d="M25 49 C20 40 22 27 30 25 C36 23 40 27 40 31 L49 33 L40 37 C38 43 35 47 31 51" />
      <Path d="M28 25 C26 19 30 17 31 21 C32 15 36 15 36 21 C38 17 42 19 39 25" fill={color} />
      <Path d="M38.5 37 C41 43 37 45 36 39" fill={color} />
      <Circle cx={33} cy={30} r={1.7} fill={color} />
      <Path d="M25 49 L20 57 M28 50 L26 58 M31 51 L32 58 M23 44 L16 50" />
    </>
  ),
  DOG: color => (
    <>
      <Path d="M20 27 C20 19 44 19 44 27 L44 39 C44 49 38 54 32 54 C26 54 20 49 20 39 Z" />
      <Path d="M20 25 C12 25 10 37 14 43 C18 41 20 35 20 31 M44 25 C52 25 54 37 50 43 C46 41 44 35 44 31" />
      <Circle cx={27} cy={34} r={1.7} fill={color} />
      <Circle cx={37} cy={34} r={1.7} fill={color} />
      <Ellipse cx={32} cy={42} rx={3.6} ry={2.6} fill={color} />
      <Path d="M32 44.5 L32 47.5 M28 48.5 C30 50.5 34 50.5 36 48.5" />
    </>
  ),
  PIG: color => (
    <>
      <Ellipse cx={32} cy={35} rx={17} ry={15} />
      <Path d="M19 25 L14 12 L27 20 M45 25 L50 12 L37 20" />
      <Ellipse cx={32} cy={41} rx={8} ry={6} />
      <Circle cx={29} cy={41} r={1.5} fill={color} />
      <Circle cx={35} cy={41} r={1.5} fill={color} />
      <Circle cx={25} cy={31} r={1.6} fill={color} />
      <Circle cx={39} cy={31} r={1.6} fill={color} />
    </>
  ),
};

export function AnimalDrawing({ id, size = 46, color = colors.gold }: { id: string; size?: number; color?: string }) {
  const draw = drawings[id];
  if (!draw) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      {draw(color)}
    </Svg>
  );
}
