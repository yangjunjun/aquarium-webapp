# 一方水境 · Aquarium

一个无需依赖、无需构建的模拟鱼缸 Web App。原生 JavaScript + Canvas 2D，自绘场景，无外部图片、字体或 API。

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

## 结构

- `src/simulation.js`：运动和投喂模型、保存数据校验
- `src/app.js`：Canvas 场景与交互
- `src/style.css`：响应式界面
- `tests/`：Node 内置测试
- `docs/implementation.md`：需求、技术方案、验收记录

## 部署

工作流 `.github/workflows/pages.yml` 在每次推送到 `main` 时自动运行语法检查和测试，通过后发布到 GitHub Pages。也可在 Actions 中手动运行。

首次使用需在仓库 Settings → Pages → Build and deployment 中将 Source 设置为 **GitHub Actions**。

部署地址：https://yangjunjun.github.io/aquarium-webapp/

只发布 `index.html`、`src/` 和 `.nojekyll`；所有资源采用相对路径，支持 GitHub Pages 子目录。无需部署 Node 开发服务器。

这是视觉休闲模拟，不是物理或真实水族生态模型。数据只保存在当前浏览器，清理站点数据会丢失。
