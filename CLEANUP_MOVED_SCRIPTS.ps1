# ことばクエスト ver1.2.1 PC | JS/CSS 再配置後の旧ファイル削除
# 新ファイルが揃い、旧ファイルが元版と同一（SHA-256一致）の場合にだけ削除します。
$ErrorActionPreference='Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifest = Join-Path $root 'docs\SCRIPT_RELOCATION_MANIFEST.json'
if (-not (Test-Path -LiteralPath (Join-Path $root 'START_HERE.html'))) { Write-Host 'START_HERE.htmlと同じ場所で実行してください。'; exit 1 }
if (-not (Test-Path -LiteralPath $manifest)) { Write-Host '移動一覧がありません。'; exit 1 }
$m = Get-Content -LiteralPath $manifest -Encoding UTF8 -Raw | ConvertFrom-Json
$removed=0; $skipped=0
foreach($entry in $m.old_to_new.PSObject.Properties){
  $old=[string]$entry.Name;$new=[string]$entry.Value
  if($old -match '(^/|\.\.|\\|:)' -or $new -match '(^/|\.\.|\\|:)') { $skipped++;continue }
  if($old -notmatch '^(?:[a-zA-Z0-9._-]+\.(?:js|css)|shiba-burger-r4/[a-zA-Z0-9._-]+\.(?:js|css))$') { $skipped++;continue }
  $src=Join-Path $root ($old -replace '/', '\')
  $dst=Join-Path $root ($new -replace '/', '\')
  if(-not (Test-Path -LiteralPath $src -PathType Leaf)) {continue}
  if(-not (Test-Path -LiteralPath $dst -PathType Leaf)) {Write-Warning "移動先がありません: $new";$skipped++;continue}
  $newHashEntry=$m.sha256_new.PSObject.Properties[$old]
  if(-not $newHashEntry) {$skipped++;continue}
  $newHash=(Get-FileHash -LiteralPath $dst -Algorithm SHA256).Hash.ToLowerInvariant()
  if($newHash -ne [string]$newHashEntry.Value) {Write-Warning "移動先が一致しないため旧ファイルを保持: $new";$skipped++;continue}
  $hashEntry=$m.sha256_old.PSObject.Properties[$old]
  if(-not $hashEntry) { $skipped++;continue }
  $hash=(Get-FileHash -LiteralPath $src -Algorithm SHA256).Hash.ToLowerInvariant()
  if($hash -ne [string]$hashEntry.Value) {Write-Warning "変更済みの旧ファイルは残しました: $old";$skipped++;continue}
  Remove-Item -LiteralPath $src -Force;$removed++
}
Write-Host "旧JS・CSS削除: $removed 件。保留: $skipped 件。"
if($skipped -gt 0) { exit 2 }
