import { StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** 第三个界面：静态 Dummy 页面，预留扩展 */
export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].icon;

  return (
    <ThemedView style={styles.container}>
      <IconSymbol
        name="person.crop.circle.fill"
        size={56}
        color={iconColor}
        style={styles.icon}
      />
      <ThemedText type="title">我的</ThemedText>
      <ThemedText style={styles.subtitle}>功能开发中，敬请期待</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.6,
  },
});
