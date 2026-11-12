# KotobaQuest PC local-only game server. No extra software or Internet needed.
# The fixed port keeps browser progress and saved game records on the same origin.
$ErrorActionPreference = 'Stop'
$gameRoot = [IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$gameRootPrefix = $gameRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$gamePort = 18731
$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.mjs' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.glb' = 'model/gltf-binary'
  '.gltf' = 'model/gltf+json'
  '.wasm' = 'application/wasm'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.gif' = 'image/gif'
  '.svg' = 'image/svg+xml'
  '.ico' = 'image/x-icon'
  '.mp3' = 'audio/mpeg'
  '.ogg' = 'audio/ogg'
  '.wav' = 'audio/wav'
  '.mp4' = 'video/mp4'
  '.woff' = 'font/woff'
  '.woff2' = 'font/woff2'
  '.ttf' = 'font/ttf'
  '.txt' = 'text/plain; charset=utf-8'
}
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $gamePort)
try { $listener.Start() }
catch {
  Write-Host 'Cannot start server on port 18731.' -ForegroundColor Red
  Write-Host 'Please close any other KotobaQuest startup window and try again.'
  exit 1
}
$gameUrl = "http://127.0.0.1:$gamePort/START_HERE.html"
Write-Host "KotobaQuest is running: $gameUrl" -ForegroundColor Green
Write-Host 'To stop the game server, close this window or press Ctrl+C.'
try { Start-Process $gameUrl }
catch { Write-Host "Open the following address in your browser: $gameUrl" }

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 6000
      $client.SendTimeout = 15000
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
      $firstLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($firstLine)) { continue }
      $parts = $firstLine.Split(' ')
      $method = $parts[0]
      $requestTarget = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $rangeHeader = ''
      do {
        $headerLine = $reader.ReadLine()
        if ($headerLine -match '^Range:\s*(.+)$') { $rangeHeader = $Matches[1] }
      } while ($null -ne $headerLine -and $headerLine.Length -gt 0)

      $status = '200 OK'
      $filePath = $null
      if ($method -notin @('GET', 'HEAD')) { $status = '405 Method Not Allowed' }
      else {
        try {
          $urlPath = [Uri]::UnescapeDataString(($requestTarget -split '\?', 2)[0])
          if ($urlPath -eq '/') { $urlPath = '/START_HERE.html' }
          $relative = $urlPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
          $candidate = [IO.Path]::GetFullPath((Join-Path $gameRoot $relative))
          if (!$candidate.StartsWith($gameRootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
            $status = '403 Forbidden'
          } elseif (![IO.File]::Exists($candidate)) {
            $status = '404 Not Found'
          } else { $filePath = $candidate }
        } catch { $status = '400 Bad Request' }
      }

      if ($null -eq $filePath) {
        $content = [Text.Encoding]::UTF8.GetBytes('Not found')
        $header = "HTTP/1.1 $status`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($content.Length)`r`nConnection: close`r`n`r`n"
        $encoded = [Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($encoded, 0, $encoded.Length)
        if ($method -ne 'HEAD') { $stream.Write($content, 0, $content.Length) }
        continue
      }

      $fileInfo = [IO.FileInfo]::new($filePath)
      $fileLength = $fileInfo.Length
      $start = [long]0
      $end = $fileLength - 1
      if ($rangeHeader -match '^bytes=(\d+)-(\d*)$') {
        $start = [long]$Matches[1]
        if ($Matches[2] -ne '') { $end = [Math]::Min([long]$Matches[2], $end) }
        if ($start -ge $fileLength -or $end -lt $start) {
          $status = '416 Range Not Satisfiable'
          $start = [long]0
          $end = -1
        } else { $status = '206 Partial Content' }
      }
      $contentLength = if ($status -eq '416 Range Not Satisfiable') { 0 } else { $end - $start + 1 }
      $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $mime = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
      $header = "HTTP/1.1 $status`r`nContent-Type: $mime`r`nContent-Length: $contentLength`r`nAccept-Ranges: bytes`r`nCache-Control: no-store`r`nConnection: close`r`n"
      if ($status -eq '206 Partial Content') { $header += "Content-Range: bytes $start-$end/$fileLength`r`n" }
      if ($status -eq '416 Range Not Satisfiable') { $header += "Content-Range: bytes */$fileLength`r`n" }
      $header += "`r`n"
      $encoded = [Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($encoded, 0, $encoded.Length)
      if ($method -ne 'HEAD' -and $contentLength -gt 0) {
        $fileStream = [IO.File]::OpenRead($filePath)
        try {
          [void]$fileStream.Seek($start, [IO.SeekOrigin]::Begin)
          $buffer = New-Object byte[] 65536
          $remaining = [long]$contentLength
          while ($remaining -gt 0) {
            $read = $fileStream.Read($buffer, 0, [int][Math]::Min($remaining, $buffer.Length))
            if ($read -le 0) { break }
            $stream.Write($buffer, 0, $read)
            $remaining -= $read
          }
        } finally { $fileStream.Dispose() }
      }
    } catch {
      Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor DarkYellow
    } finally {
      if ($null -ne $reader) { $reader.Dispose(); $reader = $null }
      $client.Dispose()
    }
  }
} finally { $listener.Stop() }
