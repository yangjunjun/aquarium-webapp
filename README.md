# 一方水境 · Aquarium

一个无需依赖、无需构建的模拟鱼缸 Web App。原生 JavaScript + Canvas 2D，自绘场景，无外部图片、字体或 API。

## 三种水下世界

| 主题 | 环境 | 居民与投喂 |
| --- | --- | --- |
| 自然溪流 | 水草、沙地、气泡、柔和光束 | 自然鱼群、橙褐色螃蟹、普通鱼食 |
| 科幻实验舱 | 金属底床、管道、能量柱、扫描光 | 机械鱼、透明发光鱼、机械蟹、营养胶囊 |
| 克苏鲁深海 | 沉没遗迹、符文、触须、孢子、低频巨影 | 深海异鱼、岩壳蟹、幽光碎屑 |

点击主题预览卡片切换；鱼、蟹和鱼食不会被重建。主题与减少动态偏好自动保存；旧存档自动使用自然主题。
全屏内也可切换主题、灯光、暂停和动态效果。减少动态默认遵循系统设置，并关闭扫光、装饰摆动和巨物掠影。

## 功能

- 3 种鱼的外观、自由游动、水草、气泡与水下光束
- 2 只底栖螃蟹，沿缸底左右移动、触边折返，带蟹腿动画并保存位置
- 鱼缸全屏观看，支持按钮 / Esc 退出；不支持原生全屏时采用页面展开模式
- 点击 / 触摸鱼缸投喂；鱼群追逐、吃掉鱼食
- 添加鱼（最多 24 尾）、日光 / 月光模式、暂停、清理鱼食、确认后重置
- 自动本地保存鱼群与灯光；手机布局、键盘操作

## 启动

需要 Node.js 20 或更新版本，不需要安装依赖。

```sh
npm start
```

访问 http://localhost:3000 。使用 `PORT=8080 npm start` 自定义端口（Windows PowerShell：先 `$env:PORT=8080`）。

## 检查

```sh
npm run check
npm test
```

浏览器回归由 GitHub Actions 在发布前运行，不需要在本地安装依赖才能使用应用。如需本地运行浏览器回归：

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
node scripts/browser-smoke.mjs
```

截图输出到 `artifacts/`，在 Actions 中也可下载。仅将应用的静态文件部署到 Pages，不包含测试工具。

## 结构

- `src/simulation.js`：运动和投喂模型、保存数据校验
- `src/app.js`：交互、全屏、预览与过渡
- `src/renderer.js`、`src/themes/`：统一绘制接口和三套场景
- `src/preferences.js`：主题、动态偏好与过渡控制
- `src/style.css`：响应式界面
- `tests/`：Node 内置测试
- `docs/implementation.md`：需求、技术方案、验收记录

## 部署

工作流 `.github/workflows/pages.yml` 在每次推送到 `main` 时自动运行语法检查和测试，并运行 Chromium 交互回归，通过后发布到 GitHub Pages。也可在 Actions 中手动运行。

首次使用需在仓库 Settings → Pages → Build and deployment 中将 Source 设置为 **GitHub Actions**。

部署地址：https://yangjunjun.github.io/aquarium-webapp/

只发布 `index.html`、`src/` 和 `.nojekyll`；所有资源采用相对路径，支持 GitHub Pages 子目录。无需部署 Node 开发服务器。

这是视觉休闲模拟，不是物理或真实水族生态模型。数据只保存在当前浏览器，清理站点数据会丢失。
