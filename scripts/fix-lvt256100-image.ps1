param(
    [string]$ProjectRoot = "D:\desh-solar-website\frontend"
)

$ErrorActionPreference = "Continue"

$TargetDir = Join-Path $ProjectRoot "public\assets\products-real"
$Destination = Join-Path $TargetDir "lvt256100.jpg"

New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

$urls = @(
    "https://ipowerbd.com/uploads/product/Hb9c2ec7efbf84b0890387b7666dac08f3_450.jpg",
    "https://www.tahaeshop.com/storage/lvtopsun/24v-100ah/lvtopsun-256v-100ah-lithium-battery.jpg"
)

$success = $false

foreach ($url in $urls) {
    Write-Host ""
    Write-Host "Trying real LVTOPSUN 25.6V 100Ah product image:" -ForegroundColor Cyan
    Write-Host $url

    if (Test-Path $Destination) {
        Remove-Item $Destination -Force
    }

    & curl.exe `
        -L `
        --fail `
        --silent `
        --show-error `
        --retry 3 `
        --retry-delay 2 `
        -A "Mozilla/5.0" `
        -o $Destination `
        $url

    if (
        $LASTEXITCODE -eq 0 -and
        (Test-Path $Destination) -and
        ((Get-Item $Destination).Length -gt 1500)
    ) {
        $sizeKb = [math]::Round((Get-Item $Destination).Length / 1KB, 1)

        Write-Host ""
        Write-Host "SUCCESS: lvt256100.jpg saved." -ForegroundColor Green
        Write-Host ("Size: " + $sizeKb + " KB") -ForegroundColor Green

        $success = $true
        break
    }

    if (Test-Path $Destination) {
        Remove-Item $Destination -Force
    }

    Write-Host "Source failed. Trying next source..." -ForegroundColor Yellow
}

Write-Host ""

if (-not $success) {
    Write-Host "FAILED: Could not download lvt256100.jpg from either verified source." -ForegroundColor Red
    exit 1
}

Write-Host "Now run:" -ForegroundColor Cyan
Write-Host "powershell -ExecutionPolicy Bypass -File .\scripts\verify-all-62-product-images.ps1"
