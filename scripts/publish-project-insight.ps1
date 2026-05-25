param(
  [string]$ProjectPath = (Get-Location).Path,
  [string]$Title,
  [string]$ProjectName,
  [string]$Note,
  [switch]$SkipGit
)

$skillRoot = if ($env:CODEX_HOME) {
  Join-Path $env:CODEX_HOME "skills\publish-project-insight"
} else {
  Join-Path $HOME ".codex\skills\publish-project-insight"
}

$scriptPath = Join-Path $skillRoot "scripts\publish_project_insight.ps1"
if (!(Test-Path -LiteralPath $scriptPath)) {
  throw "未找到 publish-project-insight skill：$scriptPath"
}

$argsList = @(
  "-ExecutionPolicy", "Bypass",
  "-File", $scriptPath,
  "-ProjectPath", $ProjectPath
)

if ($Title) { $argsList += @("-Title", $Title) }
if ($ProjectName) { $argsList += @("-ProjectName", $ProjectName) }
if ($Note) { $argsList += @("-Note", $Note) }
if ($SkipGit) { $argsList += "-SkipGit" }

& powershell @argsList
exit $LASTEXITCODE
