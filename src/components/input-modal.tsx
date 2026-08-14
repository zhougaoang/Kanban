import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";

import { theme } from "@/constants/theme";

interface Props {
  visible: boolean;
  title: string;
  placeholder: string;
  suffix?: string;
  keyboardType?: KeyboardTypeOptions;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

/** 通用输入弹窗（喝水自定义、新建习惯名称）。 */
export default function InputModal({
  visible,
  title,
  placeholder,
  suffix,
  keyboardType = "default",
  onCancel,
  onConfirm,
}: Props) {
  const [value, setValue] = useState("");

  const confirm = () => {
    const v = value.trim();
    if (!v) return;
    onConfirm(v);
    setValue("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType={keyboardType}
              autoFocus
              onSubmitEditing={confirm}
            />
            {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
          </View>
          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.cancelBtn]}
              onPress={() => {
                setValue("");
                onCancel();
              }}
            >
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.confirmBtn]} onPress={confirm}>
              <Text style={styles.confirmText}>确定</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xxl,
  },
  sheet: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.large,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.medium,
    paddingHorizontal: theme.spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  suffix: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  btn: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.medium,
  },
  cancelBtn: { backgroundColor: theme.colors.background },
  confirmBtn: { backgroundColor: theme.colors.primary },
  cancelText: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  confirmText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});
