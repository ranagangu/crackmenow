# Safe Space Cleanup (No Data Loss by Default)

Script: `scripts/safe-space-tools.ps1`

## Default behavior (safe)
This mode only shows a size report.  
It does **not** delete anything.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\safe-space-tools.ps1
```

## Backup heavy folders (still no delete)
Creates zip backups in `safe-backups/<timestamp>/`.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\safe-space-tools.ps1 -BackupHeavyFolders
```

## Backup + cleanup (only when you explicitly allow it)
Runs cleanup only after backups are created.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\safe-space-tools.ps1 -BackupHeavyFolders -CleanAfterBackup
```

## Targeted folders
- `Frontend/node_modules`
- `Frontend/build`
- `Frontend/node_modules/.cache`
- `Node-Backend/node_modules`

