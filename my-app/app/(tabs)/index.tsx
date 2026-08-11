import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** 圆形进度环尺寸 */
const WATER_SIZE = 156;
const WATER_STROKE = 8;

/** 今天吃什么 —— 三类食物候选 */
type FoodCategory = '主食' | '蛋白质' | '蔬菜';

const FOOD_OPTIONS: Record<FoodCategory, readonly string[]> = {
  主食: ['米饭', '馒头', '面条', '红薯'],
  蛋白质: ['鸡胸肉', '牛肉', '鸡蛋', '三文鱼'],
  蔬菜: ['西兰花', '菠菜', '生菜', '黄瓜'],
};

const FOOD_LABELS: readonly FoodCategory[] = ['主食', '蛋白质', '蔬菜'];

/* ------------------------------------------------------------------ */
/* Apple Liquid Glass token（按明暗主题取）                              */
/* ------------------------------------------------------------------ */
function useTokens() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  return {
    scheme,
    ground: Colors[scheme].background, // #f5f5f7 / #000
    surface: scheme === 'light' ? '#FFFFFF' : '#1C1C1E',
    text: Colors[scheme].text, // #1d1d1f / #f5f5f7
    secondary: scheme === 'light' ? '#424245' : '#a1a1a6',
    meta: Colors[scheme].icon, // #6e6e73 / #a1a1a6
    hairline: scheme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.12)',
    accent: Colors[scheme].tint, // #0071e3 / #0a84ff
    track: scheme === 'light' ? '#E8E8ED' : '#2C2C2E',
    buttonText: scheme === 'light' ? '#FFFFFF' : '#000000',
  };
}

/** 统一白色面板：圆角 18、双层轻阴影、hairline 描边（暗色模式无阴影） */
function Panel({ children }: { children: ReactNode }) {
  const { surface, hairline, scheme } = useTokens();
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: surface, borderColor: hairline },
        scheme === 'light' && styles.panelShadow,
      ]}>
      {children}
    </View>
  );
}

/** 面板外小标题（iOS grouped section header：13px meta 灰） */
function SectionTitle({ children }: { children: ReactNode }) {
  const { meta } = useTokens();
  return <Text style={[styles.sectionTitle, { color: meta }]}>{children}</Text>;
}

/* ------------------------------------------------------------------ */
/* ① 顶部板块：天气（静态数据）                                          */
/* ------------------------------------------------------------------ */
function WeatherPanel() {
  const { text, meta, hairline } = useTokens();

  const metaItems = [
    { label: '湿度', value: '10%' },
    { label: '紫外线', value: '低' },
    { label: '空气质量', value: '优' },
  ];

  return (
    <View>
      <SectionTitle>天气</SectionTitle>
      <Panel>
        <View style={styles.weatherHeader}>
          <Text style={[styles.weatherCity, { color: text }]}>郑州市</Text>
          <Text style={[styles.weatherTemp, { color: text }]}>27℃</Text>
        </View>

        <View style={[styles.weatherMeta, { borderTopColor: hairline }]}>
          {metaItems.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.weatherMetaItem,
                index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: hairline },
              ]}>
              <Text style={[styles.weatherMetaLabel, { color: meta }]}>{item.label}</Text>
              <Text style={[styles.weatherMetaValue, { color: text }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </Panel>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ② 中间板块：喝水打卡（长按 2 秒进度环 + 扩散波纹）                    */
/* ------------------------------------------------------------------ */

/** 圆形进度环：reanimated 驱动 strokeDashoffset */
function WaterRing({
  progress,
  trackColor,
  tintColor,
}: {
  progress: SharedValue<number>;
  trackColor: string;
  tintColor: string;
}) {
  const radius = (WATER_SIZE - WATER_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <Svg width={WATER_SIZE} height={WATER_SIZE} style={styles.waterRingSvg}>
      <Circle
        cx={WATER_SIZE / 2}
        cy={WATER_SIZE / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={WATER_STROKE}
        fill="none"
      />
      <AnimatedCircle
        cx={WATER_SIZE / 2}
        cy={WATER_SIZE / 2}
        r={radius}
        stroke={tintColor}
        strokeWidth={WATER_STROKE}
        strokeDasharray={circumference}
        strokeLinecap="round"
        fill="none"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

/** 扩散波纹：长按时从圆钮向外扩散并淡出（accent 蓝，单一彩色点） */
function Ripple({ progress, tintColor }: { progress: SharedValue<number>; tintColor: string }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 0.4 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ripple, { borderColor: tintColor }, animatedStyle]}
    />
  );
}

function WaterPanel() {
  const { text, meta, secondary, accent, track } = useTokens();

  const [done, setDone] = useState(false);

  // 长按 2 秒的进度（0 → 1）
  const progress = useSharedValue(0);
  // 两圈扩散波纹，错开 1 秒
  const rippleA = useSharedValue(0);
  const rippleB = useSharedValue(0);

  const stopRipples = useCallback(() => {
    cancelAnimation(rippleA);
    cancelAnimation(rippleB);
    rippleA.value = 0;
    rippleB.value = 0;
  }, [rippleA, rippleB]);

  const startRipples = useCallback(() => {
    rippleA.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false);
    rippleB.value = withDelay(
      1000,
      withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false),
    );
  }, [rippleA, rippleB]);

  /** 长按满 2 秒后触发（由进度动画回调经 runOnJS 调用） */
  const complete = useCallback(() => {
    setDone(true);
    stopRipples();
    Alert.alert('喝水打卡', '今天喝水已经完成！');
  }, [stopRipples]);

  const handlePressIn = useCallback(() => {
    if (done) return;
    progress.value = withTiming(1, { duration: 2000, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(complete)();
      }
    });
    startRipples();
  }, [done, progress, startRipples, complete]);

  const handlePressOut = useCallback(() => {
    if (done) return;
    cancelAnimation(progress);
    progress.value = 0;
    stopRipples();
  }, [done, progress, stopRipples]);

  return (
    <View>
      <SectionTitle>喝水打卡</SectionTitle>
      <Panel>
        <Text style={[styles.waterHint, { color: meta }]}>
          {done ? '今日饮水目标已达成' : '长按中央圆钮 2 秒，完成今日饮水'}
        </Text>

        <View style={styles.waterArea}>
          <Ripple progress={rippleA} tintColor={accent} />
          <Ripple progress={rippleB} tintColor={accent} />

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.waterButton}
            accessibilityRole="button"
            accessibilityLabel={done ? '今日喝水已完成' : '长按完成喝水打卡'}
          >
            <WaterRing progress={progress} trackColor={track} tintColor={accent} />
            <View style={styles.waterButtonCenter}>
              {done ? (
                <Text style={[styles.waterDone, { color: accent }]}>✓ 已完成</Text>
              ) : (
                <>
                  <Text style={[styles.waterValue, { color: text }]}>1500ml</Text>
                  <Text style={[styles.waterLabel, { color: meta }]}>水</Text>
                </>
              )}
            </View>
          </Pressable>
        </View>

        <Text style={[styles.waterFoot, { color: secondary }]}>
          目标：每天 1500 毫升 · {done ? '已完成' : '未完成'}
        </Text>
      </Panel>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ③ 底部板块：今天吃什么决策器（三行随机抽取）                          */
/* ------------------------------------------------------------------ */

/** 单行抽取：左侧标签 + 中间值 + 右侧 accent 按钮；行间 hairline 分隔 */
function FoodRow({
  label,
  items,
  text,
  accent,
  buttonText,
  hairline,
  isLast,
}: {
  label: FoodCategory;
  items: readonly string[];
  text: string;
  accent: string;
  buttonText: string;
  hairline: string;
  isLast: boolean;
}) {
  const [value, setValue] = useState(items[0]);
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 每次切换时的弹跳动效（translateY 快速抖动）
  const bounce = useSharedValue(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    bounce.value = withSequence(
      withTiming(-0.3, { duration: 60 }),
      withTiming(0.15, { duration: 70 }),
      withTiming(0, { duration: 50 }),
    );
  }, [value, bounce]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value * 14 }],
  }));

  /** 老虎机式滚动：快速随机切换约 0.9s 后停下 */
  const handleRandom = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    let count = 0;
    const total = 10;
    timerRef.current = setInterval(() => {
      count += 1;
      setValue(items[Math.floor(Math.random() * items.length)]);
      if (count >= total) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setSpinning(false);
      }
    }, 90);
  }, [spinning, items]);

  return (
    <View
      style={[styles.foodRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: hairline }]}>
      <Text style={[styles.foodLabel, { color: text }]}>{label}</Text>

      <View style={styles.foodSlot}>
        <Animated.Text
          numberOfLines={1}
          style={[styles.foodValue, { color: text }, animatedTextStyle]}
        >
          {value}
        </Animated.Text>
      </View>

      <Pressable
        onPress={handleRandom}
        disabled={spinning}
        style={({ pressed }) => [
          styles.randomButton,
          { backgroundColor: accent },
          pressed && !spinning && styles.randomButtonPressed,
          spinning && styles.randomButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`随机抽取${label}`}
      >
        <Text style={[styles.randomButtonText, { color: buttonText }]}>
          {spinning ? '···' : '随机'}
        </Text>
      </Pressable>
    </View>
  );
}

function FoodPanel() {
  const { text, meta, accent, buttonText, hairline } = useTokens();

  return (
    <View>
      <SectionTitle>今天吃什么</SectionTitle>
      <Panel>
        {FOOD_LABELS.map((label, index) => (
          <FoodRow
            key={label}
            label={label}
            items={FOOD_OPTIONS[label]}
            text={text}
            accent={accent}
            buttonText={buttonText}
            hairline={hairline}
            isLast={index === FOOD_LABELS.length - 1}
          />
        ))}
        <Text style={[styles.foodFoot, { color: meta, borderTopColor: hairline }]}>点击「随机」，帮你决定这一餐</Text>
      </Panel>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 首页：三个板块垂直排列                                               */
/* ------------------------------------------------------------------ */
export default function HomeScreen() {
  const { ground } = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: ground, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <WeatherPanel />
        <WaterPanel />
        <FoodPanel />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  panel: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  panelShadow: {
    // 双层轻阴影（panel tier）：0 1px 3px / 0 14px 40px，RN 取主层近似
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 2,
  },

  /* 天气面板 */
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  weatherCity: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  weatherTemp: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 48,
    fontVariant: ['tabular-nums'],
  },
  weatherMeta: {
    flexDirection: 'row',
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  weatherMetaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  weatherMetaLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  weatherMetaValue: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  /* 喝水打卡 */
  waterHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  waterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: WATER_SIZE * 1.4,
  },
  ripple: {
    position: 'absolute',
    width: WATER_SIZE,
    height: WATER_SIZE,
    borderRadius: WATER_SIZE / 2,
    borderWidth: 1.5,
  },
  waterButton: {
    width: WATER_SIZE,
    height: WATER_SIZE,
    borderRadius: WATER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterRingSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  waterButtonCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterValue: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  waterLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  waterDone: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  waterFoot: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },

  /* 吃什么决策器 */
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 8,
  },
  foodLabel: {
    width: 60,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  foodSlot: {
    flex: 1,
    alignItems: 'flex-start',
  },
  foodValue: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  randomButton: {
    minWidth: 68,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  randomButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  randomButtonDisabled: {
    opacity: 0.55,
  },
  foodFoot: {
    fontSize: 12,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
