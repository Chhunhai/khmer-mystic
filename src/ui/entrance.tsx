import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';

/** A short, one-time reveal. Content stays available when motion is reduced or unavailable. */
export function Entrance({ children, delay = 0, style }: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [progress] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    const finish = () => { animation?.stop(); progress.setValue(1); };
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduced => {
      if (reduced) finish();
    });
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!active || reduced) return;
      progress.setValue(0);
      animation = Animated.timing(progress, {
        toValue: 1,
        delay,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      });
      animation.start();
    }).catch(() => {});
    return () => { active = false; animation?.stop(); subscription.remove(); };
  }, [delay, progress]);
  return (
    <Animated.View style={[style, {
      opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
    }]}>
      {children}
    </Animated.View>
  );
}
