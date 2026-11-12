# ことばクエスト ver1.2.1 PC 画像移行後の安全な旧ファイル削除
# このスクリプトはこのフォルダーの旧画像と旧軽量化スクリプトのみを削除します。
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifest = Join-Path $root 'IMAGE_RELOCATION_MANIFEST.json'
if (-not (Test-Path -LiteralPath $manifest)) { Write-Host '移行一覧ファイルが見つかりません。'; exit 1 }
if (-not (Test-Path -LiteralPath (Join-Path $root 'START_HERE.html'))) { Write-Host 'ことばクエスト本体のフォルダーで実行してください。'; exit 1 }
$m = Get-Content -LiteralPath $manifest -Raw -Encoding UTF8 | ConvertFrom-Json
$removed=0; $skipped=0
foreach ($entry in $m.old_to_new.PSObject.Properties) {
    $old = [string]$entry.Name; $new = [string]$entry.Value
    if ($old -eq $new) { continue }
    if ($old -notmatch '^(images|assets|shiba-burger-r4)/[a-zA-Z0-9_./-]+$') { Write-Warning "不正なパス: $old"; $skipped++; continue }
    if ($old -match '\.\.(/|\\)' -or $new -match '\.\.(/|\\)') { $skipped++; continue }
    $oldFile = Join-Path $root ($old -replace '/', '\')
    $newFile = Join-Path $root ($new -replace '/', '\')
    if (-not (Test-Path -LiteralPath $oldFile -PathType Leaf)) { continue }
    if (-not (Test-Path -LiteralPath $newFile -PathType Leaf)) { Write-Warning "移行先がありません: $new"; $skipped++;continue }
    $expected = [string]$m.sha256_new.PSObject.Properties[$new].Value
    if (-not $expected) { $expected = [string]($m.sha256_new.PSObject.Properties | Where-Object {$_.Name -eq $new} | Select-Object -First 1).Value }
    $actual = (Get-FileHash -LiteralPath $newFile -Algorithm SHA256).Hash.ToLowerInvariant()
    $oldHash = (Get-FileHash -LiteralPath $oldFile -Algorithm SHA256).Hash.ToLowerInvariant()
    if (-not $expected -or $actual -ne $expected -or $oldHash -ne $actual) { Write-Warning "内容が一致しないため保持: $old"; $skipped++; continue }
    Remove-Item -LiteralPath $oldFile -Force
    $removed++
}
foreach ($name in $m.non_image_files_to_remove) {
    if ($name -notin @('CLEANUP_UNUSED_FILES.bat','CLEANUP_UNUSED_FILES.ps1','LIGHTWEIGHT_REMOVALS.json','README_差し替えと削除.txt','assets/images/README.txt')) { continue }
    $oldFile=Join-Path $root $name
    if (Test-Path -LiteralPath $oldFile -PathType Leaf) { Remove-Item -LiteralPath $oldFile -Force; $removed++ }
}
# 旧ファイルの移動先が揃った後、旧ディレクトリは「空」の場合にだけ削除します。
# 利用者が追加した素材が残っているディレクトリは消しません。
$oldDirs = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($entry in $m.old_to_new.PSObject.Properties) {
    if ($entry.Name -eq [string]$entry.Value) { continue }
    $oldFile = Join-Path $root (([string]$entry.Name) -replace '/', '\')
    $dir = Split-Path -Parent $oldFile
    while ($dir -and $dir -ne $root -and $dir.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
        [void]$oldDirs.Add($dir)
        $dir = Split-Path -Parent $dir
    }
}
foreach ($dir in ($oldDirs | Sort-Object Length -Descending)) {
    if (Test-Path -LiteralPath $dir -PathType Container) {
        if (@(Get-ChildItem -LiteralPath $dir -Force).Count -eq 0) {
            Remove-Item -LiteralPath $dir -Force
        }
    }
}
Write-Host "旧ファイル削除完了: $removed 件。保留: $skipped 件。"
if ($skipped -gt 0) { Write-Host '移動先を確認してから再実行してください。'; exit 2 }
