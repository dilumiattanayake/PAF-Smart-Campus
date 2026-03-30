$ErrorActionPreference = 'Stop'

$port = 9199
$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($listeners) {
  $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($ownerPid in $pids) {
    Write-Host "Stopping process $ownerPid on port $port..."
    Stop-Process -Id $ownerPid -Force
  }
  Start-Sleep -Seconds 1
}

Write-Host "Starting Smart Campus backend on port $port..."
& "$PSScriptRoot\mvnw.cmd" spring-boot:run
