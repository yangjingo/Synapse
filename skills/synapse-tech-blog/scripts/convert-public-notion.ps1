param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [switch]$AllowDraft
)

$ErrorActionPreference = 'Stop'

function Get-PlainText($runs) {
    if (-not $runs) { return '' }
    return ((@($runs) | ForEach-Object { if ($null -ne $_ -and $_.Count -gt 0) { [string]$_[0] } }) -join '').Replace([char]0xA0, ' ')
}

function Escape-Markdown([string]$value) {
    return [regex]::Replace($value, '([\\`*_\[\]])', '\$1')
}

function Convert-RichText($runs) {
    if (-not $runs) { return '' }
    $segments = [System.Collections.Generic.List[object]]::new()
    foreach ($run in @($runs)) {
        if ($null -eq $run -or $run.Count -eq 0) { continue }
        $raw = ([string]$run[0]).Replace([char]0xA0, ' ')
        $bold = $false
        $italic = $false
        $code = $false
        $strike = $false
        $href = $null
        foreach ($annotation in @($run[1])) {
            if ($null -eq $annotation -or $annotation.Count -eq 0) { continue }
            switch ([string]$annotation[0]) {
                'b' { $bold = $true }
                'i' { $italic = $true }
                'c' { $code = $true }
                's' { $strike = $true }
                'a' { $href = [string]$annotation[1] }
            }
        }
        $key = "$bold|$italic|$code|$strike|$href"
        if ($segments.Count -gt 0 -and $segments[$segments.Count - 1].Key -eq $key) {
            $segments[$segments.Count - 1].Text += $raw
        } else {
            $segments.Add([pscustomobject]@{ Key = $key; Text = $raw; Bold = $bold; Italic = $italic; Code = $code; Strike = $strike; Href = $href })
        }
    }
    $parts = foreach ($segment in $segments) {
        $piece = Escape-Markdown $segment.Text
        if ($segment.Bold) { $piece = "**$piece**" }
        if ($segment.Italic) { $piece = "*$piece*" }
        if ($segment.Code) { $piece = '`' + $piece + '`' }
        if ($segment.Strike) { $piece = "~~$piece~~" }
        if ($segment.Href) {
            $safeHref = $segment.Href.Replace(' ', '%20').Replace('(', '%28').Replace(')', '%29')
            $piece = "[$piece]($safeHref)"
        }
        $piece
    }
    return ($parts -join '')
}

function Convert-HeadingText($runs) {
    $heading = (Convert-RichText $runs).Trim()
    if ($heading -match '^\*\*([^*]+)\*\*$') { return $Matches[1] }
    return $heading
}

function Get-Block([string]$blockId) {
    if (-not $script:blocks.ContainsKey($blockId)) { throw "Missing Notion block: $blockId" }
    return $script:blocks[$blockId]
}

function Get-ImageUrl($block) {
    $source = Get-PlainText $block.properties.source
    if ($source -match '^https://') { return $source }
    if ($source -match '^attachment:' -and $block.space_id) {
        $encoded = [Uri]::EscapeDataString($source)
        return "https://www.notion.so/image/$encoded`?table=block&id=$($block.id)&spaceId=$($block.space_id)"
    }
    throw "Could not resolve a direct HTTPS image URL for block $($block.id)"
}

function Convert-Table($table) {
    $columns = @($table.format.table_block_column_order)
    if ($columns.Count -eq 0) { throw "Table has no columns: $($table.id)" }
    $rows = foreach ($rowId in @($table.content)) {
        $row = Get-Block $rowId
        if ($row.type -ne 'table_row') { throw "Expected table_row: $rowId" }
        $cells = foreach ($column in $columns) {
            $property = $row.properties.PSObject.Properties[[string]$column]
            $cell = if ($property) { Convert-RichText $property.Value } else { '' }
            $cell.Replace('|', '\|').Replace("`r", '').Replace("`n", '<br>')
        }
        '| ' + ($cells -join ' | ') + ' |'
    }
    if ($rows.Count -eq 0) { return '' }
    if (-not $table.format.table_block_column_header) {
        $headers = 1..$columns.Count | ForEach-Object { "Column $_" }
        $rows = @('| ' + ($headers -join ' | ') + ' |') + @($rows)
    }
    $separator = '| ' + ((@($columns) | ForEach-Object { '---' }) -join ' | ') + ' |'
    return (@($rows[0], $separator) + @($rows | Select-Object -Skip 1)) -join "`n"
}

function Convert-Children($block) {
    $pieces = foreach ($childId in @($block.content)) {
        if (-not $childId) { continue }
        $child = Get-Block $childId
        $piece = Convert-Block $child
        if ($piece) { $piece }
    }
    return ($pieces -join "`n`n")
}

function Convert-Reference($block) {
    $raw = (Get-PlainText $block.properties.title).Trim()
    $href = $null
    foreach ($run in @($block.properties.title)) {
        foreach ($annotation in @($run[1])) {
            if ($annotation -and $annotation[0] -eq 'a') { $href = [string]$annotation[1]; break }
        }
        if ($href) { break }
    }
    if (-not $href) {
        $urlMatch = [regex]::Match($raw, 'https?://\S+')
        if ($urlMatch.Success) { $href = $urlMatch.Value.TrimEnd('.', ',', ';') }
    }
    if (-not $href) {
        foreach ($childId in @($block.content)) {
            if (-not $childId) { continue }
            $child = Get-Block $childId
            $urlMatch = [regex]::Match((Get-PlainText $child.properties.title), 'https?://\S+')
            if ($urlMatch.Success) { $href = $urlMatch.Value.TrimEnd('.', ',', ';'); break }
        }
    }
    if (-not $href) { return (Convert-Block $block) }
    $raw = $raw.Replace($href, '').Trim()
    $open = $raw.IndexOf('*')
    $close = if ($open -ge 0) { $raw.IndexOf('*', $open + 1) } else { -1 }
    if ($close -gt $open) {
        $before = Escape-Markdown $raw.Substring(0, $open)
        $name = Escape-Markdown $raw.Substring($open + 1, $close - $open - 1)
        $after = Escape-Markdown $raw.Substring($close + 1)
        return $before + '[' + $name + '](' + $href + ')' + $after
    }
    return (Convert-RichText $block.properties.title).TrimEnd()
}

function Convert-Block($block) {
    $title = if ($block.properties) { Convert-RichText $block.properties.title } else { '' }
    switch ([string]$block.type) {
        'text' { return $title.TrimEnd() }
        'header' { return '# ' + (Convert-HeadingText $block.properties.title) }
        'sub_header' { return '## ' + (Convert-HeadingText $block.properties.title) }
        'sub_sub_header' { return '### ' + (Convert-HeadingText $block.properties.title) }
        'quote' {
            $pieces = @()
            if ($title.Trim()) { $pieces += $title.TrimEnd() }
            $children = Convert-Children $block
            if ($children) { $pieces += $children }
            if ($pieces.Count -eq 0) { return '' }
            return ((($pieces -join "`n`n") -split "`n") | ForEach-Object { if ($_ -eq '') { '>' } else { '> ' + $_ } }) -join "`n"
        }
        'callout' {
            $pieces = Convert-Children $block
            if (-not $pieces) { return '' }
            return ((($pieces -join "`n`n") -split "`n") | ForEach-Object { if ($_ -eq '') { '>' } else { '> ' + $_ } }) -join "`n"
        }
        'code' {
            $source = Get-PlainText $block.properties.title
            $language = (Get-PlainText $block.properties.language).ToLowerInvariant().Replace(' ', '')
            if (-not $language -or $language -eq 'plaintext') { $language = 'text' }
            $fence = if ($source.Contains('```')) { '````' } else { '```' }
            return $fence + $language + "`n" + $source.TrimEnd() + "`n" + $fence
        }
        'image' {
            $script:imageCount++
            $caption = (Get-PlainText $block.properties.caption).Trim()
            $captionMarkdown = (Convert-RichText $block.properties.caption).Trim()
            $figureName = "Figure $($script:imageCount)"
            $alt = $figureName
            if ($caption) { $alt += ': ' + $caption }
            $imageUrl = Get-ImageUrl $block
            $visibleTitle = "**$figureName**"
            if ($captionMarkdown) {
                $visibleTitle += ' — ' + $captionMarkdown
            } else {
                $script:missingCaptions.Add("$figureName ($($block.id))")
            }
            return "![" + (Escape-Markdown $alt) + "]($imageUrl)`n<span class=`"notion-figure-desc`">$visibleTitle</span>"
        }
        'table' { return Convert-Table $block }
        'table_of_contents' { return '' }
        'column_list' { return Convert-Children $block }
        'column' { return Convert-Children $block }
        'numbered_list' { return $title.TrimEnd() }
        'bulleted_list' { return '- ' + $title.TrimEnd() }
        'divider' { return '---' }
        default { throw "Unsupported Notion block type '$($block.type)' at $($block.id)" }
    }
}

$sourceUri = [Uri]$Url
if ($sourceUri.Scheme -ne 'https' -or $sourceUri.Host -notmatch '(^|\.)notion\.(site|so)$') {
    throw 'Expected an HTTPS notion.site or notion.so URL.'
}
$pageMatch = [regex]::Match($sourceUri.AbsolutePath, '([0-9a-fA-F]{32})(?:/)?$')
if (-not $pageMatch.Success) { throw 'Could not find a 32-character Notion page ID in the URL path.' }
$rawId = $pageMatch.Groups[1].Value.ToLowerInvariant()
$pageId = "$($rawId.Substring(0,8))-$($rawId.Substring(8,4))-$($rawId.Substring(12,4))-$($rawId.Substring(16,4))-$($rawId.Substring(20,12))"
$script:blocks = @{}
$script:imageCount = 0
$script:missingCaptions = [System.Collections.Generic.List[string]]::new()
$cursor = $null
$chunk = 0
$endpoint = "$($sourceUri.Scheme)://$($sourceUri.Host)/api/v3/loadPageChunk"
do {
    $payload = @{ pageId = $pageId; limit = 100; chunkNumber = $chunk; verticalColumns = $false }
    if ($null -ne $cursor) { $payload.cursor = $cursor }
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -ContentType 'application/json' -Body ($payload | ConvertTo-Json -Depth 30 -Compress)
    foreach ($entry in $response.recordMap.block.PSObject.Properties) {
        if ($entry.Value.value.value) { $script:blocks[$entry.Name] = $entry.Value.value.value }
    }
    $cursor = $response.cursor
    $chunk++
    if ($chunk -gt 30) { throw 'Notion pagination exceeded 30 chunks.' }
} while ($cursor -and @($cursor.stack).Count -gt 0)

$page = Get-Block $pageId
if ($page.type -ne 'page') { throw 'Root block is not a Notion page.' }
$lines = [System.Collections.Generic.List[string]]::new()
$number = 0
$inReferences = $false
foreach ($childId in @($page.content)) {
    $block = Get-Block $childId
    if ($block.type -in 'header', 'sub_header', 'sub_sub_header') {
        $inReferences = ((Get-PlainText $block.properties.title).Trim() -eq 'References')
    }
    if ($block.type -eq 'numbered_list') {
        $number++
        $item = if ($inReferences) { Convert-Reference $block } else { Convert-Block $block }
        $rendered = "$number. $item"
    } else {
        $number = 0
        $rendered = Convert-Block $block
    }
    if ($rendered) { $lines.Add($rendered) }
}
$postTitle = Get-PlainText $page.properties.title
$markdown = "title: $postTitle`n___`n`n" + ($lines -join "`n`n").TrimEnd() + "`n"
if ($script:missingCaptions.Count -gt 0 -and -not $AllowDraft) {
    throw "Missing figure descriptions: $($script:missingCaptions -join ', '). Run with -AllowDraft and a draft output path to inspect the images; do not deliver that draft as a Bearblog post."
}
$parent = Split-Path -Parent $OutputPath
if ($parent -and -not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
Set-Content -LiteralPath $OutputPath -Value $markdown -Encoding utf8 -NoNewline
Write-Output "Converted $(@($page.content).Count) page blocks across $chunk chunks; $script:imageCount Markdown images; output: $OutputPath"
if ($script:missingCaptions.Count -gt 0) {
    Write-Warning "DRAFT ONLY: $($script:missingCaptions.Count) figure(s) have no source caption and require a verified description before delivery: $($script:missingCaptions -join ', ')"
}
