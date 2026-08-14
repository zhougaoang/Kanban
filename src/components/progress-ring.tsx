import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { PropsWithChildren } from "react";

import { theme } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  size?: number;
  strokeWidth?: number;
  /** 0-100 */
  progress?: number;
  color?: string;
  trackColor?: string;
}

/** SVG 环形进度（首页完成度、喝水进度）。从 12 点方向顺时针。 */
export default function ProgressRing({
  size = 120,
  strokeWidth = 10,
  progress = 0,
  color = theme.colors.primary,
  trackColor = theme.colors.track,
  children,
}: PropsWithChildren<Props>) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(progress, 100));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // strokeDashoffset 走 JS 驱动
    }).start();
  }, [clamped, anim]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
        transform="rotate(-90)"
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
