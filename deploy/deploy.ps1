# 一键构建 + 部署（本机 / GitHub Pages / Docker / Netlify）
param(
  [ValidateSet('local', 'github', 'netlify', 'docker')]
  [string]$Target = 'local',
  [int]$Port = 4173,
  [string]$Repo = '',
  [switch]$SkipBuild,
  [switch]$NoOpen
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw '未找到 node。请先安装 Node.js（>= 20）。'
}

Write-Host ''
Write-Host "  DSH Academy · 一键部署 → $Target"
Write-Host '  ────────────────────────────────────────────'

if (-not $SkipBuild) {
  node scripts/build.mjs
  if ($LASTEXITCODE -ne 0) { throw '构建失败' }
}

if ($Repo) { $env:GITHUB_REPO = $Repo }

$deployArgs = @('scripts/deploy.mjs', '--target', $Target, '--port', "$Port")
node @deployArgs
if ($LASTEXITCODE -ne 0) { throw '部署失败' }

if ($Target -eq 'local') {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'deploy\register-tasks.ps1')
  if (-not $NoOpen) { Start-Process "http://127.0.0.1:$Port/" }
}

Write-Host ''
