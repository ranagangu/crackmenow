param(
  [string]$ProjectRoot = "d:\Webasha",
  [switch]$BackupHeavyFolders,
  [switch]$CleanAfterBackup
)

$ErrorActionPreference = "Stop"

function Get-FolderSizeBytes {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return 0 }
  return (Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
    Measure-Object -Property Length -Sum).Sum
}

function Format-MB {
  param([double]$Bytes)
  return [math]::Round($Bytes / 1MB, 1)
}

Write-Host "`n[1/3] Space report for $ProjectRoot`n" -ForegroundColor Cyan

$topDirs = Get-ChildItem -Path $ProjectRoot -Directory
$rows = @()
foreach ($d in $topDirs) {
  $size = Get-FolderSizeBytes -Path $d.FullName
  $rows += [PSCustomObject]@{
    Folder = $d.Name
    SizeMB = Format-MB -Bytes $size
  }
}
$rows | Sort-Object SizeMB -Descending | Format-Table -AutoSize

$frontendNode = Join-Path $ProjectRoot "Frontend\node_modules"
$frontendBuild = Join-Path $ProjectRoot "Frontend\build"
$frontendCache = Join-Path $ProjectRoot "Frontend\node_modules\.cache"
$backendNode = Join-Path $ProjectRoot "Node-Backend\node_modules"

$heavyPaths = @(
  $frontendNode,
  $frontendBuild,
  $frontendCache,
  $backendNode
) | Where-Object { Test-Path $_ }

if (-not $BackupHeavyFolders) {
  Write-Host "`n[2/3] Backup skipped (use -BackupHeavyFolders to create backups)." -ForegroundColor Yellow
  Write-Host "[3/3] Cleanup skipped (safe mode)." -ForegroundColor Yellow
  exit 0
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $ProjectRoot "safe-backups\$timestamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

Write-Host "`n[2/3] Creating backups in: $backupRoot`n" -ForegroundColor Cyan
foreach ($path in $heavyPaths) {
  $name = ($path -replace "[:\\]", "_").Trim("_")
  $zipPath = Join-Path $backupRoot "$name.zip"
  Write-Host "Backing up: $path -> $zipPath"
  Compress-Archive -Path $path -DestinationPath $zipPath -CompressionLevel Optimal -Force
}

if (-not $CleanAfterBackup) {
  Write-Host "`n[3/3] Cleanup skipped. Backups are ready." -ForegroundColor Green
  exit 0
}

Write-Host "`n[3/3] Cleaning folders AFTER backup..." -ForegroundColor Cyan
foreach ($path in $heavyPaths) {
  Write-Host "Removing: $path"
  Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`nDone. You can restore from: $backupRoot" -ForegroundColor Green
