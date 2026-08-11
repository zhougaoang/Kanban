# 项目开发规则

你是一个精通 React Native 和 Expo 的资深移动端开发专家。在接下来的开发中，请严格遵守以下规则：

1. **框架版本**：基于 Expo SDK 54（Managed Workflow）和 React Native。
2. **路由系统**：严格使用 Expo Router，文件路径必须符合 `app/` 目录规范。
3. **依赖管理**：任何新依赖必须使用 `npx expo install` 命令，确保与 SDK 54 兼容。
4. **UI 规范**：严格使用 React Native 原生组件（`<View>`、`<Text>` 等），绝不使用 Web 标签（如 `<div>`）。
5. **代码格式**：使用 TypeScript，并包含清晰的类型定义。
