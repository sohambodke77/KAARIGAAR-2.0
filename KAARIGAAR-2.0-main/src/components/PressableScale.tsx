import { Children, useCallback, useState } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({ children, scaleTo = 0.97, style, ...rest }: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));

  const animate = useCallback(
    (toValue: number) => {
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        speed: 42,
        bounciness: 0,
      }).start();
    },
    [scale],
  );

  return (
    <Pressable onPressIn={() => animate(scaleTo)} onPressOut={() => animate(1)} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {Children.only(children)}
      </Animated.View>
    </Pressable>
  );
}