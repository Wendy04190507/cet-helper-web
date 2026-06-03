# CET Helper · 四六级备考助手

一个用"15分钟日课"对抗碎片化的四六级备考 Web 应用。

## 功能

- 📊 **短板诊断**：60秒自评 + 雷达图
- 📋 **智能日课**：根据短板权重生成每日任务
- 📝 **单词闪卡**：三向手势 + 艾宾浩斯记忆曲线
- ⏱️ **番茄钟**：Study With Me 共学伴侣
- 📈 **周度报告**：只跟自己比

## 技术栈

- React 19 + Vite 8
- Tailwind CSS 4
- React Router 7 (HashRouter)
- localStorage 持久化
- GitHub Pages 部署

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5173 即可看到应用。

## 构建与部署

```bash
# 构建
npm run build

# 预览构建结果
npm run preview

# 部署到 GitHub Pages (需安装 gh-pages)
npm run deploy
```

## GitHub Pages 部署

1. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支
2. 推送代码到 `main` 分支后，GitHub Actions 会自动构建并部署
3. 或者手动运行 `npm run deploy`

应用使用 HashRouter，确保路径在 GitHub Pages 上正常工作。

## 项目结构

```
cet-helper-web/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx                 # 入口
│   ├── App.jsx                  # 路由 + Context
│   ├── index.css                # Tailwind + 全局样式
│   ├── constants.js             # 常量数据
│   ├── utils/
│   │   ├── date.js              # 日期工具
│   │   ├── storage.js           # localStorage 封装
│   │   ├── spaced-repetition.js # 艾宾浩斯引擎
│   │   └── plan-engine.js       # 计划生成
│   ├── contexts/
│   │   └── AppContext.jsx        # 全局状态
│   ├── components/
│   │   ├── Layout.jsx           # App 外壳
│   │   ├── BottomNav.jsx        # 底部导航
│   │   ├── RadarChart.jsx       # SVG 雷达图
│   │   ├── ProgressBar.jsx      # 进度条
│   │   ├── TaskCard.jsx         # 任务卡片
│   │   ├── WordCard.jsx         # 单词闪卡
│   │   └── CheckinCalendar.jsx  # 打卡日历
│   └── pages/
│       ├── Onboarding.jsx       # 入学画像
│       ├── Home.jsx             # 今日任务
│       ├── WordReview.jsx       # 单词复习
│       ├── Pomodoro.jsx         # 番茄钟
│       ├── WeeklyReport.jsx     # 周报
│       └── Settings.jsx         # 设置
```

## 设计风格

极简效率风 — 黑/白/灰主色调，大留白，细字重数字，圆角卡片，微妙阴影。
