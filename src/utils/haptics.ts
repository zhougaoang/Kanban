import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** iOS 轻触感反馈（规范：触感反馈按平台条件启用；Android 不触发）。 */
export function lightTap() {
  if (Platform.OS === "ios") {
    Haptics.selectionAsync().catch(() => {});
  }
}
