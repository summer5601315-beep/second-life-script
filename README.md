# 第二人生剧本

**换个出身，重写一局人生。**

免费可玩的网页 MVP：开局设定 → 8 回合事件选择 → 阶层结局与可分享复盘。

## 线上地址

https://summer5601315-beep.github.io/second-life-script/

仓库：https://github.com/summer5601315-beep/second-life-script

## 本地开发

```bash
cd /workspace/second-life-script
npm install
npm run dev
```

## 生产构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/`。当前 `vite.config.js` 的 `base` 设为 `/second-life-script/`（GitHub Pages 项目站）。若改用根域名或 Vercel，把 `base` 改成 `/` 后重建。

## 重新发布到 GitHub Pages

```bash
npm run build
# 将 dist 内容推到 gh-pages 分支（含 404.html SPA 回退）
```

## 功能

- 落地页：产品名 + 标语 +「开始这一局」
- 开局：资源档 / 城市 / 教育 / 家庭支持 / 性格，实时起点四维
- 8 回合事件（工作、城市、关系、能力、缺钱、靠近/防备、家庭、阶层一跃）
- 标签连锁：负债、导师、透支、伴侣、凭证、创业
- 结局：阶层落点、起点 vs 终点、选择轨迹、可复制分享文案
- 软 CTA：解锁对照局 / 复盘报告（无真实支付）
