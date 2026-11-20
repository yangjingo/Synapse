# 技术博客 HTML 排版

正文阅读页默认使用[工程博客模板](../assets/blog-template.html)。需要 Pretext 式自适应标题、文字动画或已有 Blog DSL 的同款版式时，复制[中文版式模板](../examples/dsv4-blog-layout.html)。有多张 SVG 需缩放查看时参照[英文图文示例](../examples/dsv4-blog-opd-en.html)。

## 套用 Pretext 版式

1. 在模板副本中填写页面 `<title>`、作者日期、`TITLE`、`LEAD`、`SECTIONS` 和 `PULSE`。普通节用 `{ heading, body, callout }`，含格式的参考链接可用 `bodyHTML`。由 DSL 渲染时保留段落层级与顺序。
2. 图像使用独立的 `{ image, caption, prompt }` 项，路径相对输出文件，保留模板的缩放交互。用最终图像替换占位，图注和来源与正文对齐。生成提示词留在素材记录，确需保留调试放大层时避免把提示词放在正常阅读区。
3. 保留内嵌 Pretext 库。需要调整文字测量时，确保字体和行高与 CSS 一致，每种文本与字体只准备一次，窗口变化时重算布局。保留 JavaScript 字符串分隔符并检查编辑后的模块能否解析。
4. 在浏览器打开交付件，检查桌面和窄屏的目录、正文、图片、缩放和代码块。需要离线阅读时断网检查。图文示例的外置图与 HTML 一起交付，单文件要求下嵌入实际图像。

普通排版、插图规范和发布步骤见[技术文章](blog.md)、[技术插图](image.md)与[发布格式](publishing.md)。
