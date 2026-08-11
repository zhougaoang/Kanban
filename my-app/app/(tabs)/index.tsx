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

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

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

/** 通用卡片容器：圆角 + 轻阴影，明暗双主题 */
function Card({ children }: { children: ReactNode }) {
  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1F' }, 'background');
  const borderColor = useThemeColor(
    { light: 'rgba(0, 0, 0, 0.06)', dark: 'rgba(255, 255, 255, 0.10)' },
    'background',
  );

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>{children}</View>
  );
}

/** 卡片标题行（图标 + 标题） */
function CardHeader({ icon, title, tintColor }: { icon: IconName; title: string; tintColor: string }) {
  const textColor = useThemeColor({}, 'text');
  return (
    <View style={styles.cardHeader}>
      <IconSymbol name={icon} size={20} color={tintColor} />
      <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
    </View>
  );
}

type IconName = 'cup.and.saucer.fill' | 'fork.knife';

/* ------------------------------------------------------------------ */
/* ① 顶部板块：天气卡片（静态数据）                                      */
/* ------------------------------------------------------------------ */
function WeatherCard() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = Colors[colorScheme ?? 'light'].icon;
  const accentColor = useThemeColor({ light: '#F1F3F5', dark: '#26262A' }, 'background');

  const meta = [
    { icon: 'drop.fill' as const, label: '湿度', value: '10%' },
    { icon: 'sun.min.fill' as const, label: '紫外线', value: '低' },
    { icon: 'aqi.medium' as const, label: '空气质量', value: '优' },
  ];

  return (
    <Card>
      <View style={styles.weatherHeader}>
        <View style={styles.weatherLocation}>
          <IconSymbol name="sun.max.fill" size={22} color={tintColor} />
          <Text style={[styles.weatherCity, { color: textColor }]}>郑州市</Text>
        </View>
        <Text style={[styles.weatherTemp, { color: textColor }]}>27℃</Text>
      </View>

      <View style={styles.weatherMeta}>
        {meta.map((item) => (
          <View key={item.label} style={[styles.weatherMetaItem, { backgroundColor: accentColor }]}>
            <IconSymbol name={item.icon} size={16} color={secondaryColor} />
            <Text style={[styles.weatherMetaLabel, { color: secondaryColor }]}>{item.label}</Text>
            <Text style={[styles.weatherMetaValue, { color: textColor }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </Card>
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

/** 扩散波纹：长按时从圆钮向外扩散并淡出 */
function Ripple({ progress }: { progress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 0.4 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.ripple, animatedStyle]} />;
}

function WaterCard() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = Colors[colorScheme ?? 'light'].icon;
  const trackColor = useThemeColor({ light: '#E4E7EC', dark: '#333338' }, 'background');

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
    <Card>
      <CardHeader icon="cup.and.saucer.fill" title="喝水打卡" tintColor={tintColor} />
      <Text style={[styles.sectionHint, { color: secondaryColor }]}>
        {done ? '今日饮水目标已达成 🎉' : '长按中央圆钮 2 秒，完成今日饮水'}
      </Text>

      <View style={styles.waterArea}>
        <Ripple progress={rippleA} />
        <Ripple progress={rippleB} />

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.waterButton}
          accessibilityRole="button"
          accessibilityLabel={done ? '今日喝水已完成' : '长按完成喝水打卡'}
        >
          <WaterRing progress={progress} trackColor={trackColor} tintColor={tintColor} />
          <View style={styles.waterButtonCenter}>
            {done ? (
              <Text style={[styles.waterDone, { color: tintColor }]}>✓ 已完成</Text>
            ) : (
              <>
                <Text style={[styles.waterValue, { color: textColor }]}>1500ml</Text>
                <Text style={[styles.waterLabel, { color: secondaryColor }]}>水</Text>
              </>
            )}
          </View>
        </Pressable>
      </View>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* ③ 底部板块：今天吃什么决策器（三行随机抽取）                          */
/* ------------------------------------------------------------------ */

/** 单行抽取：左侧标签 + 右侧滚轮显示区 + 「随机」按钮 */
function FoodRow({
  label,
  items,
  tintColor,
  textColor,
  secondaryColor,
  accentColor,
  buttonTextColor,
}: {
  label: FoodCategory;
  items: readonly string[];
  tintColor: string;
  textColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonTextColor: string;
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
    <View style={styles.foodRow}>
      <Text style={[styles.foodLabel, { color: textColor }]}>{label}</Text>

      <View style={[styles.foodSlot, { backgroundColor: accentColor }]}>
        <Animated.Text
          numberOfLines={1}
          style={[styles.foodValue, { color: tintColor }, animatedTextStyle]}
        >
          {value}
        </Animated.Text>
      </View>

      <Pressable
        onPress={handleRandom}
        disabled={spinning}
        style={({ pressed }) => [
          styles.randomButton,
          { backgroundColor: tintColor },
          pressed && !spinning && styles.randomButtonPressed,
          spinning && styles.randomButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`随机抽取${label}`}
      >
        <Text style={[styles.randomButtonText, { color: buttonTextColor }]}>
          {spinning ? '···' : '随机'}
        </Text>
      </Pressable>
    </View>
  );
}

function FoodDecisionCard() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = Colors[colorScheme ?? 'light'].icon;
  const accentColor = useThemeColor({ light: '#F1F3F5', dark: '#26262A' }, 'background');
  // 暗色模式下 tint 为白色，按钮文字需用深色保证对比度
  const buttonTextColor = colorScheme === 'dark' ? '#151718' : '#FFFFFF';

  return (
    <Card>
      <CardHeader icon="fork.knife" title="今天吃什么" tintColor={tintColor} />
      <Text style={[styles.sectionHint, { color: secondaryColor }]}>
        每行点击「随机」，帮你决定这一餐
      </Text>

      {FOOD_LABELS.map((label) => (
        <FoodRow
          key={label}
          label={label}
          items={FOOD_OPTIONS[label]}
          tintColor={tintColor}
          textColor={textColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          buttonTextColor={buttonTextColor}
        />
      ))}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 首页：三个板块垂直排列                                               */
/* ------------------------------------------------------------------ */
export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <WeatherCard />
        <WaterCard />
        <FoodDecisionCard />
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
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    // iOS 轻阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // Android 阴影
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 14,
  },

  /* 天气卡片 */
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherCity: {
    fontSize: 17,
    fontWeight: '600',
  },
  weatherTemp: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  weatherMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  weatherMetaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 14,
  },
  weatherMetaLabel: {
    fontSize: 12,
  },
  weatherMetaValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  /* 喝水打卡 */
  waterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: WATER_SIZE * 1.45,
    marginTop: 4,
  },
  ripple: {
    position: 'absolute',
    width: WATER_SIZE,
    height: WATER_SIZE,
    borderRadius: WATER_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#0a7ea4',
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
    fontWeight: '800',
  },
  waterLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  waterDone: {
    fontSize: 18,
    fontWeight: '800',
  },

  /* 吃什么决策器 */
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  foodLabel: {
    width: 60,
    fontSize: 15,
    fontWeight: '600',
  },
  foodSlot: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foodValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  randomButton: {
    minWidth: 66,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  randomButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  randomButtonDisabled: {
    opacity: 0.6,
  },
});
