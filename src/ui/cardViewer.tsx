// Tap a card to see it large: it grows from where it sits on the page to the centre of the screen,
// over a dark backdrop, with its position label above and (optionally) its line of the reading below.
// Tap the card, the backdrop or Close (or press Back on Android) and it shrinks back into place.
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Card, Lang } from '../engine/types.ts';
import { useUi } from '../state/flow.tsx';
import { CardFace, useReducedMotion } from './cards.tsx';
import { Icon } from './icons.tsx';
import { Vortex } from './vortex.tsx';
import { AppText, PanelHeading } from './kit.tsx';
import { colors } from './theme.ts';

const useNativeDriver = Platform.OS !== 'web';

type Rect = { x: number; y: number; w: number; h: number };

export interface CardView {
  /** Identifies the source card on the page, so it can hide while the large copy is shown. */
  id: string;
  card: Card;
  lang: Lang;
  label: string;
  caption?: string;
}

/** Something on the page that can report where it is on screen. */
interface Measurable {
  measureInWindow: (callback: (x: number, y: number, w: number, h: number) => void) => void;
}

export function useCardViewer() {
  const [view, setView] = useState<(CardView & { from: Rect }) | null>(null);
  const open = (source: Measurable | null, info: CardView) => {
    if (!source) return setView({ ...info, from: { x: 0, y: 0, w: 0, h: 0 } });
    source.measureInWindow((x, y, w, h) => setView({ ...info, from: { x, y, w, h } }));
  };
  return {
    open,
    /** True while this card is shown large, so the page can hide its small copy. */
    isOpen: (id: string) => view?.id === id,
    modal: view ? <CardViewer {...view} onClosed={() => setView(null)} /> : null,
  };
}

export type CardViewerApi = ReturnType<typeof useCardViewer>;

/** A card face that opens the viewer when tapped. Give it a sized box, as you would CardFace. */
export function ZoomableCard({
  viewer,
  viewKey,
  card,
  lang,
  label,
  caption,
  style,
}: {
  viewer: CardViewerApi;
  viewKey: string;
  card: Card;
  lang: Lang;
  label: string;
  caption?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const ui = useUi();
  const ref = useRef<View>(null);
  return (
    <Pressable
      ref={ref}
      onPress={() => viewer.open(ref.current, { id: viewKey, card, lang, label, caption })}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${card.name[lang]}`}
      accessibilityHint={ui.viewCard}
      style={[style, viewer.isOpen(viewKey) && styles.hidden]}
    >
      <CardFace card={card} lang={lang} />
    </Pressable>
  );
}

function CardViewer({ card, lang, label, caption, from, onClosed }: CardView & { from: Rect; onClosed: () => void }) {
  const ui = useUi();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const [closing, setClosing] = useState(false);

  // Layout of the large card: close button, then the label, then the card, then the caption.
  const top = insets.top + 8;
  const cardTop = top + 44 + 8 + 36 + 12;
  const captionSpace = caption ? 160 : 0;
  const available = screenH - cardTop - Math.max(insets.bottom, 16) - captionSpace - 12;
  const cardW = Math.max(120, Math.min(screenW - 48, (available * 7) / 12, 460));
  const cardH = (cardW * 12) / 7;
  const cardLeft = (screenW - cardW) / 2;
  const captionW = Math.min(screenW - 48, 520);

  // Start exactly over the small card (or simply small in the centre if it could not be measured).
  const start = from.w > 0 ? from : { x: screenW / 2 - cardW / 4, y: screenH / 2 - cardH / 4, w: cardW / 2, h: cardH / 2 };
  const dx = start.x + start.w / 2 - (cardLeft + cardW / 2);
  const dy = start.y + start.h / 2 - (cardTop + cardH / 2);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 0 : 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    }).start();
  }, [progress, reduced]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    Animated.timing(progress, {
      toValue: 0,
      duration: reduced ? 0 : 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver,
    }).start(() => onClosed());
  };

  const cardMotion = {
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [dx, 0] }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [start.w / cardW, 1] }) },
    ],
  };
  const fadeIn = { opacity: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] }) };

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
      </Animated.View>
      {/* The vortex behind the card, kept faint so it reads as atmosphere. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }) }]}
        pointerEvents="none"
      >
        <Vortex
          width={screenW}
          height={screenH}
          centerX={cardLeft + cardW / 2}
          centerY={cardTop + cardH / 2}
          cardRadius={Math.hypot(cardW, cardH) / 2}
        />
      </Animated.View>

      <Animated.View style={[styles.closeRow, { top, right: 12 }, fadeIn]}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={ui.close} style={styles.closeButton}>
          <Icon name="close" size={22} strokeWidth={2} />
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.label, { top: top + 52 }, fadeIn]} pointerEvents="none">
        <PanelHeading size={18}>{label}</PanelHeading>
      </Animated.View>

      <Animated.View style={[styles.card, { left: cardLeft, top: cardTop, width: cardW, height: cardH }, cardMotion]}>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${card.name[lang]}. ${ui.close}`}
          style={StyleSheet.absoluteFill}
        >
          <CardFace card={card} lang={lang} />
        </Pressable>
      </Animated.View>

      {caption ? (
        <Animated.View
          style={[
            styles.caption,
            { top: cardTop + cardH + 12, maxHeight: captionSpace, width: captionW, left: (screenW - captionW) / 2 },
            fadeIn,
          ]}
        >
          <ScrollView>
            <AppText size={15} style={styles.captionText}>
              {caption}
            </AppText>
          </ScrollView>
        </Animated.View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
  backdrop: { backgroundColor: 'rgba(11,21,48,0.96)' },
  closeRow: { position: 'absolute' },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  card: { position: 'absolute', borderRadius: 12, boxShadow: `0 0 36px ${colors.glow}` },
  caption: { position: 'absolute' },
  captionText: { textAlign: 'center' },
});
