# 每 3 天由 Windows 计划任务调用：巡检 → 构建 →（可选）发布
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$logDir = Join-Path $root 'reports'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir 'task-refresh.log'

function Write-Log([string]$Message) {
  $line = '[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Add-Content -Path $log -Value $line -Encoding utf8
}

Write-Log 'refresh start'
try {
  node scripts/crawl.mjs 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
  if ($LASTEXITCODE -ne 0) { throw "crawl.mjs exited with $LASTEXITCODE" }

  node scripts/build.mjs 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
  if ($LASTEXITCODE -ne 0) { throw "build.mjs exited with $LASTEXITCODE" }

  node scripts/verify.mjs 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
  if ($LASTEXITCODE -ne 0) { throw "verify.mjs exited with $LASTEXITCODE" }

  if ($env:GITHUB_TOKEN -and $env:GITHUB_REPO) {
    node scripts/deploy.mjs --target github 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
    if ($LASTEXITCODE -ne 0) { throw "deploy.mjs exited with $LASTEXITCODE" }
  }

  Write-Log 'refresh ok'
} catch {
  Write-Log "refresh failed: $_"
  exit 1
}
