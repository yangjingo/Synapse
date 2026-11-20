"""Apply the reading template to existing articles without rewriting their content."""
from pathlib import Path
import argparse
import hashlib
import re

from bs4 import BeautifulSoup

TEMPLATE = Path(__file__).resolve().parents[1] / 'assets/blog-template.html'
EXTRA_CSS = '''
/* Existing research content: keep tables, code and original figures readable. */
main{overflow-wrap:anywhere;min-width:0}main img{max-width:100%;height:auto}
pre{overflow:auto;max-width:100%;padding:18px;background:white;border:1px solid var(--line);line-height:1.65;font-size:13px}
pre code{background:transparent;padding:0;font-style:normal;white-space:pre;color:var(--ink)}
blockquote{margin:28px 0;padding:14px 22px;border-left:3px solid var(--line);background:white}
.tablewrap,.table-scroll{max-width:100%;overflow:auto;margin:26px 0}
table{min-width:640px}th{font-weight:650}td,th{overflow-wrap:normal}
.diagram-scroll{overflow:auto}figure svg{min-width:680px}figure{overflow:auto}
figure img{display:block;margin:auto}h2,h3,h4{scroll-margin-top:65px}
.source-figure-note{font-size:13px;color:var(--muted)}
.hero h1{overflow-wrap:anywhere}.hero h1>span{display:block}.hero .meta{display:flex;flex-wrap:wrap;gap:12px}
.comment-storage-note{font-size:11px;line-height:1.7}
@media(max-width:1100px){.side.mobile-open{background:var(--bg);bottom:0;overflow:auto;max-height:calc(100dvh - 45px)}.topbar{height:45px}.toc.mobile-open{display:block}}
@media print{.masthead,.side,.comments-orb,.topbar,.toc-open{display:none!important}.workspace,.workspace.comments-hidden{display:block;padding:0}.hero{padding:0 0 20px}main{padding:0}body{font-size:11pt;background:white}pre{white-space:pre-wrap}pre code{white-space:pre-wrap}table,figure svg{min-width:0}.tablewrap,.table-scroll,figure{overflow:visible}h2,h3{break-after:avoid}}
'''


def fingerprint(article):
    """Check content and embedded assets independently of serialization/layout."""
    text = re.sub(r'\s+', '', article.get_text())
    images = [hashlib.sha256(img.get('src', '').encode()).hexdigest()
              for img in article.find_all('img')]
    return text, images, len(article.find_all('table')), len(article.find_all('svg'))


def apply(path):
    original = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    article = original.select_one('main#article') or original.find('article')
    if article is None:
        raise ValueError(f'No article body: {path}')
    original_h1 = article.find('h1')
    hero = original.select_one('.hero')
    title = original_h1 or (hero.find('h1') if hero else original.title)
    if title is None:
        raise ValueError(f'No article title: {path}')
    title_html = title.decode_contents()
    title_id = title.get('id')
    if original_h1:
        original_h1.extract()
    before = fingerprint(article)
    lead = hero.select_one('.lead, .dek') if hero else None
    meta = hero.select_one('.meta') if hero else None
    page = BeautifulSoup(TEMPLATE.read_text(encoding='utf-8'), 'html.parser')
    page.title.string = title.get_text(' ', strip=True)
    heading = page.select_one('.hero h1')
    heading.clear()
    heading.append(BeautifulSoup(title_html, 'html.parser'))
    if title_id:
        heading['id'] = title_id
    for selector, source, separator in (('.hero .lead', lead, ' '), ('.hero .meta', meta, ' · ')):
        target_node = page.select_one(selector)
        if source:
            target_node.string = source.get_text(separator, strip=True)
        else:
            target_node.decompose()
    # Preserve old section anchors; only allocate IDs for previously unnamed sections.
    used = {e.get('id') for e in article.select('[id]')}
    for i, h in enumerate(article.find_all('h2'), 1):
        if not h.get('id'):
            ident = f'article-section-{i}'
            while ident in used:
                ident += '-x'
            h['id'] = ident
            used.add(ident)
    for table in article.find_all('table'):
        if not table.find_parent(class_=re.compile(r'tablewrap|table-scroll')):
            wrapper = page.new_tag('div', attrs={'class': 'tablewrap', 'tabindex': '0', 'aria-label': '横向滚动查看完整表格'})
            table.wrap(wrapper)
    target = page.select_one('#article')
    target.clear()
    for child in list(article.contents):
        target.append(child.extract())
    assert fingerprint(target) == before, f'Article content changed: {path}'
    style = page.new_tag('style')
    style.string = EXTRA_CSS
    page.head.append(style)
    note = page.new_tag('p', attrs={'class': 'comment-storage-note'})
    note.string = '评论仅保存在当前浏览器，不会上传。更换浏览器、清理存储或移动文件路径后可能无法读取，请先复制备份。'
    page.select_one('.comments-content').append(note)
    # Keep the template key: existing comments at the same URL remain accessible.
    output = str(page)
    assert '{{ARTICLE_' not in output
    path.write_text(output, encoding='utf-8')
    print(f'{path.name}: preserved {before[2]} tables, {before[3]} SVGs, {len(before[1])} images; template applied')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', type=Path)
    args = parser.parse_args()
    for file in args.files:
        apply(file.resolve())
