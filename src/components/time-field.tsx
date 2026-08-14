import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

interface Props {
  label: string;
  /** "HH:MM"，空串表示未设置 */
  value: string;
  onChange: (hhmm: string) => void;
}

/** 睡眠时间选择：Android 弹窗式；iOS 内联 spinner（点击展开/收起）。 */
export default function TimeField({ label, value, onChange }: Props) {
  const [show, setShow] = useState(false);

  const toDate = (): Date => {
    const [h, m] = value.split(":").map(Number);
    const d = new Date();
    d.setHours(Number.isNaN(h) ? 0 : h, Number.isNaN(m) ? 0 : m, 0, 0);
    return d;
  };

  const onPick = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (event.type === "set" && date) {
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      onChange(`${hh}:${mm}`);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.field} onPress={() => setShow((v) => !v)}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || "未设置"}
        </Text>
      </Pressable>
      {show ? (
        <DateTimePicker
          value={toDate()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onPick}
          themeVariant="light"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.lg,
  },
  field: {},
  label: { fontSize: 13, color: theme.colors.textSecondary },
  value: { fontSize: 18, fontWeight: "700", color: theme.colors.text, marginTop: 4, fontVariant: ["tabular-nums"] },
  placeholder: { color: theme.colors.textSecondary, fontWeight: "500" },
});
