import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { EMOJI_PRESETS, theme } from "@/constants/theme";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (name: string, emoji: string) => void;
}

/** 新建习惯：名称输入 + 预设 emoji 选择。 */
export default function AddHabitModal({ visible, onCancel, onConfirm }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string>(EMOJI_PRESETS[0]);

  const confirm = () => {
    const n = name.trim();
    if (!n) return;
    onConfirm(n, emoji);
    setName("");
    setEmoji(EMOJI_PRESETS[0]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>新建习惯</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="习惯名称，如：阅读30分钟"
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
            onSubmitEditing={confirm}
          />
          <Text style={styles.label}>选择图标</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.emojiRow}>
              {EMOJI_PRESETS.map((e) => (
                <Pressable
                  key={e}
                  style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.confirmBtn, !name.trim() && styles.btnDisabled]}
              onPress={confirm}
              disabled={!name.trim()}
            >
              <Text style={styles.confirmText}>创建</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.large,
    borderTopRightRadius: theme.radius.large,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emojiRow: { flexDirection: "row", gap: theme.spacing.sm, paddingVertical: 4 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  emojiText: { fontSize: 22 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  btn: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.medium,
  },
  cancelBtn: { backgroundColor: theme.colors.background },
  confirmBtn: { backgroundColor: theme.colors.primary },
  btnDisabled: { opacity: 0.4 },
  cancelText: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  confirmText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});
