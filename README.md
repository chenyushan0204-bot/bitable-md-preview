# Markdown 单元格预览（多维表格边栏插件）

点击多维表格中的**多行文本**单元格，在侧边栏实时预览 Markdown 内容。

## 功能

- 点击单元格 → 侧边 Markdown 预览（GFM 表格、任务列表等）
- 可配置「头信息字段」，在预览顶部展示该行任意字段内容
- 上一行 / 下一行（表格视图，按当前视图可见行顺序）
- 复制、下载 `.md`、转文档（复制后引导粘贴到飞书文档）

## 团队使用（GitHub Pages）

部署后地址形如：

`https://<你的GitHub用户名>.github.io/bitable-md-preview/`

在多维表格中：**插件 → 自定义插件 → + 新增插件**，填入上述地址。

## 本地开发

```bash
npm install
npm run dev
```

本地调试地址一般为 `http://127.0.0.1:5173`。

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库 `bitable-md-preview`（Public）
2. 推送本仓库到 `main` 分支
3. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**
4. push 后 Actions 会自动 `npm run build` 并发布 `dist/`

## 构建

```bash
npm run build
```

产物在 `dist/`。
