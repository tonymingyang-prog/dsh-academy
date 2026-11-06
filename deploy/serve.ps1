# 登录时由启动项调用：后台启动本地预览服务
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$logDir = Join-Path $root 'reports'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir 'task-serve.log'
Add-Content -Path $log -Value ('[{0}] serve start' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) -Encoding utf8
node scripts/serve.mjs --port 4173 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
