# 🌱 Life OS · 个人成长看板

> Apple Health 风格的个人成长仪表盘 —— 把身体、习惯、目标，放进一个可以随时打开的仪表盘。

Life OS 不是又一个 Todo List。它是一个 **Personal Growth OS（个人成长操作系统）**：
打开 App 一屏看到「今日完成度 · 健康数据 · 习惯打卡」，把人生成长游戏化、可视化、持续化。

## ✨ 功能一览

| Tab | 模块 | 亮点 |
|---|---|---|
| 🏠 首页 | Dashboard | 今日完成度大圆环、健康摘要、习惯快速勾选 |
| ❤️ 健康 | Health | 喝水（+200/+500/自定义）· 睡眠自动算时长+星级 · 运动快捷记录 |
| 🔥 习惯 | Habit | 新建习惯（emoji 图标）、每日打卡、🔥 连续天数、当月日历 |
| 📊 数据 | Analysis | 近 7 天聚合（睡眠/喝水/运动/完成率）+ 完成率条形图 |
| ⚙️ 设置 | Settings | 每日目标调节（水/睡眠/运动）、一键清除数据 |

**核心体验：**
- 💾 **本地持久化** —— 杀进程、重开 App，数据一条不丢（Zustand + AsyncStorage）
- 🧭 **单一数据源** —— 首页 / 健康 / 数据页共享同一份状态，记录实时联动
- 🎯 **完成度算法可解释** —— 完成习惯数 + 水/睡眠/运动达标数 ÷ 应计项
- 📱 **Apple 风 UI** —— 大圆角（连续曲率）、大留白、大数字、iOS 轻触反馈

## 📸 截图

（待补充：真机运行截图，建议 3-5 张各 Tab 页面）

## 🚀 快速开始

**前置：** Node.js 18+ · 手机安装 Expo Go（iOS App Store 搜索 "Expo Go"）

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npx expo start

# 3. 手机 Expo Go 扫码（与电脑同一 Wi-Fi）
#    Windows 首次启动如弹防火墙提示，请允许 Node.js 通过
#    网络受限时可改用隧道模式：npx expo start --tunnel
```

也可以浏览器预览：`npm run web`

## ⚙️ 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Expo SDK 54 · React Native 0.81 · TypeScript（strict） |
| 路由 | expo-router v6（`(tabs)` 文件路由） |
| 状态 | Zustand + `persist` 中间件 |
| 存储 | AsyncStorage（按天记录 `records[YYYY-MM-DD]`） |
| 图形 / 控件 | react-native-svg（进度环）· datetimepicker（睡眠时间） |
| 体验 | expo-haptics（iOS 触感）· @expo/vector-icons（Ionicons） |

## 📂 项目结构

```
src/
├── app/(tabs)/        # 5 个 Tab 页面 + Tab 布局（expo-router）
├── components/        # card / progress-ring / habit-item 等复用组件
├── store/             # useAppStore —— 唯一数据源（zustand + persist）
├── utils/             # date（日期键）/ calc（完成度·连续·聚合）/ haptics / id
└── constants/         # theme —— Apple 风主题
```

依赖方向单向：`页面 → 组件 → store → utils/constants`，组件不直接读写 store。

## 🗺️ 路线图

**V1.1 候选**（按优先级）：
1. 本地通知（习惯打卡提醒、喝水提醒）
2. 深色模式
3. 饮食模块
4. XP 成长值 / 等级系统
5. Study / Goal 模块
6. Supabase 云同步 + 账号

## ⚠️ 版本说明（为什么锁 SDK 54）

Expo 官方自 2026 年 5 月起暂停了 **App Store 版 Expo Go** 的更新，商店最新版（54.0.2）只支持 SDK 54。
本项目对齐该版本，保证 **Expo Go 扫码即跑**。**请勿执行 `npx expo install expo@latest` 升级 SDK**，
否则手机上的 Expo Go 将无法打开项目；待商店版 Expo Go 更新后再升级。

## 📄 文档

- [MVP 设计文档](docs/lifeos-mvp.md) —— 范围、数据模型、验收标准、V1.1 路线
- `AGENTS.md` —— AI 编码规范（锁定 SDK 54 提示）

## 📄 License

MIT（见 [LICENSE](LICENSE)）
