
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = "D:\desh-solar-website\frontend"
$catalogPath = Join-Path $root "migration-output\catalog-source.csv"
$reviewDir = Join-Path $root "migration-output\ingco-official-review"
$manifestPath = Join-Path $reviewDir "ingco-corrected-manifest.csv"
$assetDir = Join-Path $root "public\assets\products"
$backupDir = Join-Path $root "migration-output\ingco-sync-backup"

# Exact product-to-model mapping
$nameToModel = [ordered]@{
    "INGCO 12V Cordless Drill 1.5Ah (2x Battery)" = "CDLI12202"
    "INGCO 12V Cordless Impact Driver Dual Battery" = "CIRLI1201"
    "INGCO 16V Brushless Cordless Drill Dual Battery" = "CDLI16682"
    "INGCO 16V Lithium-Ion Battery 2.0Ah" = "FBLI1620"
    "INGCO 16V M16 Battery Charger" = "FCLI1613"
    "INGCO Lithium-Ion 1.5Ah battery" = "FBLI12153"
    "INGCO 12v Cordless Drill 1.5ah" = "CDLI12456"
    "INGCO 4V Cordless Screwdriver" = "CSDLI0406"
    "INGCO 4V Lithium-Ion Cordless Screwdriver" = "CSDLI0442"
    "INGCO 8V Cordless Screwdriver 1.5Ah" = "CSDLI08025"
}

try {
    Write-Host "`n=== INGCO APPROVED IMAGE SYNC ===" -ForegroundColor Cyan

    $catalog = @(Import-Csv -LiteralPath $catalogPath)
    $manifest = @(Import-Csv -LiteralPath $manifestPath)

    $ingcoRows = @($catalog | Where-Object { $_.brand -eq "INGCO" })
    $canonical = @($ingcoRows | Group-Object id)

    if ($canonical.Count -ne 10 -or $manifest.Count -ne 10) {
        throw "Expected 10 canonical INGCO products and 10 manifest entries."
    }

    $plan = @()

    foreach ($productName in $nameToModel.Keys) {

        $model = $nameToModel[$productName]

        # Do not use the reserved PowerShell $Matches variable
        $productRows = @(
            $ingcoRows | Where-Object { $_.name -ceq $productName }
        )

        $manifestRows = @(
            $manifest | Where-Object { $_.model_candidate -ceq $model }
        )

        if ($productRows.Count -lt 1 -or $manifestRows.Count -ne 1) {
            throw "Product/manifest mismatch: $model"
        }

        $ids = @($productRows | ForEach-Object { $_.id } | Select-Object -Unique)
        $prefixes = @(
            $productRows |
                ForEach-Object { $_.approvedImagePrefix } |
                Select-Object -Unique
        )

        if ($ids.Count -ne 1 -or $prefixes.Count -ne 1) {
            throw "Inconsistent catalog product: $model"
        }

        $prefix = $prefixes[0]

        if ([string]::IsNullOrWhiteSpace($prefix) -or
            $prefix -cnotmatch '^ingco-[a-z0-9-]+$') {
            throw "Invalid image prefix: $model"
        }

        $entry = $manifestRows[0]
        $expectedFile = "$($model.ToLowerInvariant())-corrected-review.webp"

        if ($entry.filename -cne $expectedFile) {
            throw "Unexpected source filename: $model"
        }

        $source = Join-Path $reviewDir $expectedFile
        $targetName = "$prefix.webp"
        $target = Join-Path $assetDir $targetName
        $webPath = "/assets/products/$targetName"

        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
            throw "Missing source image: $source"
        }

        foreach ($record in $productRows) {
            if ($record.approvedImage -cne $webPath -and
                $record.approvedImage -cne "/assets/products/product-placeholder.svg") {
                throw "Unexpected existing catalog image: $model"
            }
        }

        $sourceHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash

        if (Test-Path -LiteralPath $target) {
            $targetHash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
            if ($sourceHash -ne $targetHash) {
                throw "Destination conflict: $target"
            }
        }

        $plan += [pscustomobject]@{
            Name = $productName
            Model = $model
            Source = $source
            Target = $target
            WebPath = $webPath
            Hash = $sourceHash
        }
    }

    if ($plan.Count -ne 10) {
        throw "Incomplete synchronization plan."
    }

    if (@($plan | Select-Object -ExpandProperty Target -Unique).Count -ne 10) {
        throw "Duplicate destination image paths."
    }

    # Backup before modifications
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backup = Join-Path $backupDir "catalog-source-$stamp.csv"

    Copy-Item -LiteralPath $catalogPath -Destination $backup

    Write-Host "Backup: $backup" -ForegroundColor Cyan

    # Copy and verify all 10 images
    foreach ($item in $plan) {
        if (-not (Test-Path -LiteralPath $item.Target)) {
            Copy-Item -LiteralPath $item.Source -Destination $item.Target
        }

        $actualHash = (Get-FileHash -LiteralPath $item.Target -Algorithm SHA256).Hash

        if ($actualHash -ne $item.Hash) {
            throw "Image hash mismatch: $($item.Model)"
        }

        Write-Host "Image verified: $($item.Model)" -ForegroundColor Green
    }

    # Update approvedImage only for mapped INGCO records
    foreach ($item in $plan) {
        foreach ($record in $catalog) {
            if ($record.brand -eq "INGCO" -and
                $record.name -ceq $item.Name) {
                $record.approvedImage = $item.WebPath
            }
        }
    }

    $tempPath = "$catalogPath.tmp"

    $catalog |
        Export-Csv -LiteralPath $tempPath -NoTypeInformation -Encoding UTF8

    Move-Item -LiteralPath $tempPath -Destination $catalogPath -Force

    # Reimport catalog for final verification
    $finalCatalog = @(Import-Csv -LiteralPath $catalogPath)

    $finalIngco = @(
        $finalCatalog |
            Where-Object { $_.brand -eq "INGCO" } |
            Group-Object id |
            ForEach-Object { $_.Group | Select-Object -First 1 }
    )

    $approvedCount = 0
    $missingFiles = 0

    foreach ($item in $plan) {
        $matching = @(
            $finalIngco | Where-Object {
                $_.name -ceq $item.Name -and
                $_.approvedImage -ceq $item.WebPath
            }
        )

        if ($matching.Count -eq 1) {
            $approvedCount++
        }

        if (-not (Test-Path -LiteralPath $item.Target -PathType Leaf)) {
            $missingFiles++
        }
    }

    $placeholderCount = @(
        $finalIngco | Where-Object {
            $_.approvedImage -like "*product-placeholder*"
        }
    ).Count

    Write-Host "`n========== FINAL RESULTS ==========" -ForegroundColor Cyan
    Write-Host "Canonical INGCO products: $($finalIngco.Count)"
    Write-Host "Approved catalog images: $approvedCount"
    Write-Host "Remaining placeholders: $placeholderCount"
    Write-Host "Missing image files: $missingFiles"

    if ($finalIngco.Count -ne 10 -or
        $approvedCount -ne 10 -or
        $placeholderCount -ne 0 -or
        $missingFiles -ne 0) {
        throw "Final INGCO validation failed."
    }

    Write-Host "`nINGCO SYNC PASSED - 10/10" -ForegroundColor Green
}
catch {
    Write-Host "`nINGCO SYNC FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
