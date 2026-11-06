# 注册每 3 天巡检 + 登录自启（当前用户，无需管理员）
param(
  [switch]$RunNow
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$refresh = Join-Path $root 'deploy\refresh.ps1'
$serve = Join-Path $root 'deploy\serve.ps1'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw '未找到 node。请先安装 Node.js（>= 20）并确保它在 PATH 中。'
}

$refreshCmd = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}"' -f $refresh

Write-Host ''
Write-Host '  DSH Academy · 注册自动更新'
Write-Host '  ────────────────────────────────────────────'

# 1) 每 3 天 03:00 巡检并构建
schtasks /Create /F /TN "DSHAcademy-Refresh" /SC DAILY /MO 3 /ST 03:00 /RL LIMITED /TR $refreshCmd | Out-Host
if ($LASTEXITCODE -ne 0) { throw '创建 DSHAcademy-Refresh 失败' }

# 2) 登录自启：启动文件夹快捷方式（ONLOGON 计划任务在部分策略下需要管理员）
$vbs = Join-Path $root 'deploy\serve-hidden.vbs'
$vbsBody = @"
Set sh = CreateObject("WScript.Shell")
sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""$serve""", 0, False
"@
Set-Content -Path $vbs -Value $vbsBody -Encoding ASCII

$startup = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startup 'DSH Academy Preview.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'wscript.exe'
$shortcut.Arguments = '"' + $vbs + '"'
$shortcut.WorkingDirectory = $root
$shortcut.WindowStyle = 7
$shortcut.Description = 'DSH Academy local preview (http://127.0.0.1:4173/)'
$shortcut.Save()
Write-Host '  DSH Academy Preview  启动文件夹快捷方式（登录时启动 4173）'

if ($RunNow) {
  schtasks /Run /TN "DSHAcademy-Refresh" | Out-Host
}

Write-Host ''
Write-Host '  自动更新：每 3 天 03:00（DSHAcademy-Refresh）'
Write-Host '  本地预览：登录时启动 http://127.0.0.1:4173/'
Write-Host ''
Write-Host '  立即巡检：schtasks /Run /TN "DSHAcademy-Refresh"'
Write-Host '  查看任务：schtasks /Query /TN "DSHAcademy-Refresh" /V /FO LIST'
Write-Host ''
