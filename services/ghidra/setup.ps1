param(
  [Parameter(Mandatory = $true)]
  [string]$ArchiveRoot,

  [Parameter(Mandatory = $true)]
  [string]$WebswingServiceRoot
)

$ErrorActionPreference = "Stop"

function Normalize-PathForConfig([string]$Value) {
  return $Value.Replace("\", "/")
}

function Set-GhidraPreference {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PreferencesPath,

    [Parameter(Mandatory = $true)]
    [string]$Key,

    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $lines = @()
  if (Test-Path $PreferencesPath) {
    $lines = Get-Content $PreferencesPath
  }

  $updated = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^$([regex]::Escape($Key))=") {
      $lines[$i] = "$Key=$Value"
      $updated = $true
    }
  }

  if (-not $updated) {
    $lines += "$Key=$Value"
  }

  Set-Content -Path $PreferencesPath -Value $lines -Encoding utf8
}

function Get-SystemPath {
  $parts = @()

  foreach ($scope in @("Machine", "User")) {
    $value = [Environment]::GetEnvironmentVariable("Path", $scope)
    if ($value) {
      $parts += $value.Split(";")
    }
  }

  if ($env:Path) {
    $parts += $env:Path.Split(";")
  }

  return ($parts | Where-Object { $_ } | Select-Object -Unique) -join ";"
}

function Resolve-JavaExecutable {
  if ($env:JAVA_HOME) {
    $javaFromHome = Join-Path $env:JAVA_HOME "bin\\java.exe"
    if (Test-Path $javaFromHome) {
      return @{
        Home = $env:JAVA_HOME
        Executable = $javaFromHome
      }
    }
  }

  $javaCommand = Get-Command java.exe -ErrorAction SilentlyContinue
  if ($javaCommand) {
    $javaExecutable = $javaCommand.Source
    return @{
      Home = Split-Path (Split-Path $javaExecutable -Parent) -Parent
      Executable = $javaExecutable
    }
  }

  throw "Could not locate a Java runtime. Set JAVA_HOME to a supported JDK before installing Ghidra."
}

function Resolve-GradleCommand([string]$InstallDir) {
  $candidates = @(
    (Join-Path $InstallDir "support\\gradle\\gradlew.bat"),
    (Join-Path $InstallDir "support\\gradle\\gradlew"),
    (Join-Path $InstallDir "support\\gradle\\gradle.bat"),
    (Join-Path $InstallDir "support\\gradle\\gradle.exe")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return @{
        Command = $candidate
        Arguments = @("buildNatives")
        WorkingDirectory = Split-Path $candidate -Parent
      }
    }
  }

  $gradleCommand = Get-Command gradle -ErrorAction SilentlyContinue
  if ($gradleCommand) {
    return @{
      Command = $gradleCommand.Source
      Arguments = @("buildNatives")
      WorkingDirectory = Join-Path $InstallDir "support\\gradle"
    }
  }

  throw "Could not locate Gradle. Install Gradle or add support\\gradle\\gradle.bat to the Ghidra archive."
}

$env:Path = Get-SystemPath

$archiveRootResolved = (Resolve-Path $ArchiveRoot).Path
$webswingServiceRootResolved = (Resolve-Path $WebswingServiceRoot).Path

$installDir = Get-ChildItem -Path $archiveRootResolved -Directory | Where-Object {
  Test-Path (Join-Path $_.FullName "ghidraRun.bat")
} | Select-Object -First 1

if (-not $installDir) {
  throw "Could not find extracted Ghidra installation under '$archiveRootResolved'"
}

$java = Resolve-JavaExecutable
$gradle = Resolve-GradleCommand -InstallDir $installDir.FullName
$registrationDir = Join-Path $webswingServiceRootResolved "config\\registrations"
$registrationFile = Join-Path $registrationDir "ghidra.json"
$userSettingsDir = Join-Path $env:APPDATA "ghidra\\$($installDir.Name)"
$preferencesFile = Join-Path $userSettingsDir "preferences"

Write-Host "GHIDRA_INSTALL_DIR=$($installDir.FullName)"
Write-Host "GHIDRA_JAVA_HOME=$($java.Home)"
Write-Host "GHIDRA_JAVA_EXECUTABLE=$($java.Executable)"

Write-Host "Running buildNatives from '$($gradle.WorkingDirectory)'"
Push-Location $gradle.WorkingDirectory
try {
  & $gradle.Command @($gradle.Arguments)
  if ($LASTEXITCODE -ne 0) {
    # Native compilation depends on the local Windows toolchain, so keep setup going after the attempt.
    Write-Warning "buildNatives failed with exit code $LASTEXITCODE. Continuing with Ghidra registration."
  }
}
finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path $registrationDir | Out-Null
New-Item -ItemType Directory -Force -Path $userSettingsDir | Out-Null

# Pre-seed the user agreement so first launch does not pause on the acceptance dialog.
Set-GhidraPreference -PreferencesPath $preferencesFile -Key "USER_AGREEMENT" -Value "ACCEPT"

$ghidraInstallDir = Normalize-PathForConfig $installDir.FullName
$ghidraJavaExecutable = Normalize-PathForConfig $java.Executable

$registration = @{
  "/ghidra" = @{
    path = "/ghidra"
    name = "NSA Ghidra"
    sessionMode = "CONTINUE_FOR_USER"
    swingSessionTimeout = 3600
    allowStealSession = $true
    security = @{
      module = "INHERITED"
    }
    swingConfig = @{
      launcherType = "Desktop"
      jreExecutable = $ghidraJavaExecutable
      homeDir = $ghidraInstallDir
      userDir = '${user.dir}/userdata/ghidra/${user}'
      classPathEntries = @(
        "$ghidraInstallDir/Ghidra/Framework/Utility/lib/Utility.jar"
      )
      vmArgs = "-Djava.system.class.loader=ghidra.GhidraClassLoader -Dfile.encoding=UTF8 -Duser.country=US -Duser.language=en -Duser.variant= -Dsun.java2d.d3d=false -Djdk.tls.client.protocols=TLSv1.2,TLSv1.3 -Dpython.console.encoding=UTF-8 -Dlog4j.skipJansi=true -Xshare:off -Djavax.xml.accessExternalDTD= -Djavax.xml.accessExternalSchema= -Djavax.xml.accessExternalStylesheet= --enable-native-access=ALL-UNNAMED"
      launcherConfig = @{
        mainClass = "ghidra.Ghidra"
        args = "ghidra.GhidraRun"
      }
    }
  }
}

$registration | ConvertTo-Json -Depth 10 | Set-Content -Path $registrationFile -Encoding utf8
Write-Host "Registered Ghidra app for Webswing at '$registrationFile'"
