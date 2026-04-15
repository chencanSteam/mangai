param(
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action = "status",
    [int]$Port = 8000,
    [string]$BindAddress = "127.0.0.1"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$StateDir = Join-Path $PSScriptRoot ".state"
$PidFile = Join-Path $StateDir "dev-server-$Port.pid"
$StdOutLogFile = Join-Path $StateDir "dev-server-$Port.out.log"
$StdErrLogFile = Join-Path $StateDir "dev-server-$Port.err.log"

function Ensure-StateDir {
    if (-not (Test-Path -LiteralPath $StateDir)) {
        New-Item -ItemType Directory -Path $StateDir | Out-Null
    }
}

function Get-PythonPath {
    $python = Get-Command python -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($python -and $python.Source -notlike "*WindowsApps*") {
        return $python.Source
    }

    $localPython = Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA "Python") -Recurse -Filter python.exe -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if ($localPython) {
        return $localPython.FullName
    }

    throw "Python executable not found."
}

function Get-ManagedProcesses {
    $portToken = "http.server $Port"
    $directoryToken = "--directory $ProjectRoot"
    Get-CimInstance Win32_Process | Where-Object {
        $_.Name -eq "python.exe" -and
        $_.CommandLine -and
        $_.CommandLine.Contains($portToken) -and
        $_.CommandLine.Contains($directoryToken)
    }
}

function Stop-ManagedProcesses {
    $processes = @()

    if (Test-Path -LiteralPath $PidFile) {
        $pidText = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($pidText -match "^\d+$") {
            $process = Get-CimInstance Win32_Process -Filter "ProcessId = $pidText" -ErrorAction SilentlyContinue
            if ($process) {
                $processes += $process
            }
        }
    }

    $processes += Get-ManagedProcesses
    $processes = $processes | Sort-Object ProcessId -Unique

    foreach ($process in $processes) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }

    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

function Show-Status {
    $processes = Get-ManagedProcesses | Select-Object ProcessId, CreationDate, CommandLine
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1 State, LocalAddress, LocalPort, OwningProcess

    if ($processes) {
        Write-Host "Managed server process:"
        $processes | Format-Table -AutoSize
    }
    else {
        Write-Host "Managed server process: not running"
    }

    if ($listener) {
        Write-Host ""
        Write-Host ("Listening on http://{0}:{1}/ (PID {2})" -f $BindAddress, $Port, $listener.OwningProcess)
    }
}

switch ($Action) {
    "stop" {
        Stop-ManagedProcesses
        Show-Status
    }
    "status" {
        Show-Status
    }
    "restart" {
        Ensure-StateDir
        Stop-ManagedProcesses

        $pythonPath = Get-PythonPath
        $arguments = @("-m", "http.server", $Port, "--bind", $BindAddress, "--directory", $ProjectRoot)
        $process = Start-Process -FilePath $pythonPath -ArgumentList $arguments -WorkingDirectory $ProjectRoot -RedirectStandardOutput $StdOutLogFile -RedirectStandardError $StdErrLogFile -PassThru
        $process.Id | Set-Content -LiteralPath $PidFile
        Start-Sleep -Seconds 1
        Show-Status
    }
    "start" {
        Ensure-StateDir

        if (Get-ManagedProcesses) {
            Show-Status
            exit 0
        }

        $pythonPath = Get-PythonPath
        $arguments = @("-m", "http.server", $Port, "--bind", $BindAddress, "--directory", $ProjectRoot)
        $process = Start-Process -FilePath $pythonPath -ArgumentList $arguments -WorkingDirectory $ProjectRoot -RedirectStandardOutput $StdOutLogFile -RedirectStandardError $StdErrLogFile -PassThru
        $process.Id | Set-Content -LiteralPath $PidFile
        Start-Sleep -Seconds 1
        Show-Status
    }
}
