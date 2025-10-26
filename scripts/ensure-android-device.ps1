# Ensures an Android device/emulator is available and sets up adb reverse
param(
    [int]$Port = 5173,
    [int]$TimeoutSec = 90
)

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host $msg -ForegroundColor Red }

function Find-Exe([string]$name) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Path) { return $cmd.Path }
    $sdk = $env:ANDROID_HOME
    if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
    if ($sdk) {
        $candidates = @(
            Join-Path $sdk "platform-tools\$name.exe",
            Join-Path $sdk "emulator\$name.exe"
        )
        foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
    }
    return $null
}

$adb = Find-Exe 'adb'
if (-not $adb) { Write-Err "adb not found. Install Android SDK platform-tools and add to PATH."; exit 1 }

$emulator = Find-Exe 'emulator'

Write-Info "Checking Android devices..."

& $adb start-server | Out-Null

function Get-ConnectedDevices {
    (& $adb devices) -split "`n" |
        Where-Object { $_ -match "`t(device|unauthorized|offline)$" } |
        ForEach-Object { ($_ -split "`t")[0] }
}

$devices = Get-ConnectedDevices

if (-not $devices -and $emulator) {
    Write-Info "No devices found. Trying to start the first available Android emulator..."
    $avdOutput = & $emulator -list-avds
    $avdList = @()
    if ($avdOutput) {
        if ($avdOutput -is [string]) {
            $avdList = $avdOutput -split "`r?`n"
        } else {
            $avdList = $avdOutput
        }
    }
    $avdList = $avdList | Where-Object { $_ -and $_.ToString().Trim() -ne '' }
    $avd = ($avdList | Select-Object -First 1)
    if ($avd) {
        $avd = $avd.ToString().Trim()
        Write-Info "Starting AVD '$avd'..."
        Start-Process -FilePath $emulator -ArgumentList "-avd", $avd -WindowStyle Minimized -PassThru | Out-Null
    } else {
        Write-Warn "No AVDs found. Create a device in Android Studio (Device Manager)."
        Write-Warn "Alternatively, start Windows Subsystem for Android (WSA) and enable Developer mode, then run 'adb connect <ip:port>'."
    }
}

# Wait for a usable device
$deadline = (Get-Date).AddSeconds($TimeoutSec)
$statusPrinted = $false
do {
    Start-Sleep -Milliseconds 800
    $list = (& $adb devices) -split "`n" | Where-Object { $_ -match "`t(device|unauthorized|offline)$" }
    if ($list | Where-Object { $_ -match "`tdevice$" }) { break }
    if (-not $statusPrinted -and ($list | Where-Object { $_ -match "`tunauthorized$" })) {
        Write-Warn "Device detected but unauthorized. Please accept the RSA prompt on the device."
        $statusPrinted = $true
    }
} while ((Get-Date) -lt $deadline)

$ready = (& $adb devices) -split "`n" | Where-Object { $_ -match "`tdevice$" }
if (-not $ready) { Write-Err "No ready Android device/emulator detected within $TimeoutSec seconds."; exit 1 }

Write-Info "Setting up reverse port tcp:$Port -> tcp:$Port"
& $adb reverse "tcp:$Port" "tcp:$Port"
if ($LASTEXITCODE -ne 0) { Write-Err "Failed to set up adb reverse. Check 'adb devices'."; exit 1 }

Write-Host "✅ Android device ready and port forwarding active (:$Port)" -ForegroundColor Green
exit 0


