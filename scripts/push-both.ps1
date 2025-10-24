param(
  [switch]$OriginBranch,
  [switch]$OriginMain,
  [switch]$OrgMain,
  [string]$OriginRemote = "origin",
  [string]$OrgRemote    = "orgbranch-xeropulse-demi",
  [switch]$ForceOrgMain = $false,
  [switch]$ForceOriginMain = $false,
  [switch]$DryRun = $false
)

$ErrorActionPreference = 'Stop'

function Exec($cmd) {
  Write-Host "> $cmd" -ForegroundColor Cyan
  if (-not $DryRun) {
    & cmd.exe /c $cmd
    if ($LASTEXITCODE -ne 0) {
      throw ("Command failed with exit code {0}: {1}" -f $LASTEXITCODE, $cmd)
    }
  }
}

# Check git availability
try { git --version | Out-Null } catch { throw "git is not available in PATH" }

# Discover current branch and head
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$head   = (git rev-parse --short HEAD).Trim()
Write-Host "Current branch: $branch @ $head" -ForegroundColor Yellow

# Validate remotes exist
try { git remote get-url $OriginRemote | Out-Null } catch { throw "Remote '$OriginRemote' not found" }
try { git remote get-url $OrgRemote | Out-Null } catch { throw "Remote '$OrgRemote' not found" }

# Default behavior: if none of the push targets were specified, enable all
if (-not $PSBoundParameters.ContainsKey('OriginBranch') -and 
    -not $PSBoundParameters.ContainsKey('OriginMain') -and 
    -not $PSBoundParameters.ContainsKey('OrgMain')) {
  $OriginBranch = $true
  $OriginMain   = $true
  $OrgMain      = $true
}

# Always fetch before pushing
Exec "git fetch --all --prune"

$commands = @()

if ($OriginBranch) {
  $commands += "git push $OriginRemote HEAD"
}
if ($OriginMain) {
  $forceArg = if ($ForceOriginMain) { " --force-with-lease" } else { "" }
  $commands += ("git push $OriginRemote HEAD:main" + $forceArg)
}
if ($OrgMain) {
  $forceArg = if ($ForceOrgMain) { " --force-with-lease" } else { "" }
  $commands += ("git push $OrgRemote HEAD:main" + $forceArg)
}

if ($commands.Count -eq 0) {
  Write-Host "No push actions selected. Use -OriginBranch/-OriginMain/-OrgMain switches." -ForegroundColor Yellow
  exit 0
}

Write-Host "Planned pushes:" -ForegroundColor Green
$commands | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }

foreach ($c in $commands) {
  Exec $c
}

# Summary
Write-Host "\nVerification:" -ForegroundColor Green
Exec "git log -1 --oneline HEAD"
Exec "git log -1 --oneline $OriginRemote/main"
Exec "git log -1 --oneline $OrgRemote/main"

Write-Host "\nDone." -ForegroundColor Green
