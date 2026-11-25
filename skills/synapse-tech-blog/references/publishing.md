# Notion、Bearblog 与双语交付

需要公众号排版时，读取 `synapse-life-note` 中的 [公众号排版与复制](../../synapse-life-note/references/wechat-layout.md)。

## 审定文章到 Notion

使用用户认可的公开稿。先核对标题、正文、来源和各图说明。生成本地富文本复制页：

```text
python scripts/build-notion-html.py --input <reviewed.md-or-html> --output <article-dir>/notion-<slug>.html
```

依赖 `markdown-it-py` 和 `beautifulsoup4`。页面支持复制正文，导入后检查阅读顺序、图片、代码和表格。本地图片需要上传或换成公开 HTTPS 图片。生成复制页与实际写入 Notion 是独立操作。

## 公开 Notion 到 Bearblog

拿到用户提供的公开 Notion 链接后，在已选定的文章目录里执行：

```text
pwsh -File scripts/convert-public-notion.ps1 -Url <public-notion-url> -OutputPath <article-dir>/draft-<slug>.md -AllowDraft
python scripts/validate-bearblog-figures.py <article-dir>/draft-<slug>.md
```

保持标题、段落、图序、表格、公式、链接和源语。文件头用 `title: <title>` 与 `___`。图保留实际图片链接与紧随其后的可见描述。Notion 附件用公开图片代理并验证免登录重定向后的 `image/*`，签名直链会过期。遇到无法公开读取的块或图片，记录缺口。

图检查通过后再将草稿定为 `bearlog-<slug>.md`。如果图注在 Bearblog 主题中显示为行内文字，可将以下样式加到主题 CSS。用户明确要求后再执行外部同步或发布。

```css
.post .notion-figure-desc {
  display: block;
  box-sizing: border-box;
  width: 100%;
  margin-top: 0.55rem;
  font-size: 0.9em;
  line-height: 1.55;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
}

.post .notion-figure-desc a {
  overflow-wrap: anywhere;
}

.post p:has(> img + .notion-figure-desc) {
  margin-block: 1.6rem;
}

.post p:has(> img + .notion-figure-desc) > img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0;
}
```

## 英文版

以同一篇审定稿为基础。英文另存 `bearlog-<slug>-en.md` 或独立 HTML。对照主张、限定词、术语、日期、数值、公式、图序、图片链接与来源。原论文题名保持原文，译图注和 alt。对 HTML 检查两版离线显示，对 Bearblog 文件两版各跑一次图检查脚本。
