# 移除 DSH Academy 的自动更新任务与登录启动项
$ErrorActionPreference = 'Continue'

schtasks /Delete /F /TN 'DSHAcademy-Refresh' 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host '  已删除计划任务 DSHAcademy-Refresh' } else { Write-Host '  未找到 DSHAcademy-Refresh' }

schtasks /Delete /F /TN 'DSHAcademy-Serve' 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host '  已删除计划任务 DSHAcademy-Serve' }

$shortcut = Join-Path ([Environment]::GetFolderPath('Startup')) 'DSH Academy Preview.lnk'
if (Test-Path $shortcut) {
  Remove-Item $shortcut -Force
  Write-Host '  已删除启动文件夹快捷方式'
}

$vbs = Join-Path (Split-Path -Parent $PSScriptRoot) 'deploy\serve-hidden.vbs'
if (Test-Path $vbs) {
  Remove-Item $vbs -Force
  Write-Host '  已删除 serve-hidden.vbs'
}
