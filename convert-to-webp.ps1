# Image to WebP Converter Script
# Converts all JPG/PNG images in img/ folder to WebP format
# Backs up originals to img-backup/ folder

param(
    [string]$SourceDir = "img",
    [string]$BackupDir = "img-backup"
)

Write-Host "Starting image conversion to WebP..." -ForegroundColor Green

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Yellow
}

# Get all image files
$imageFiles = Get-ChildItem -Path $SourceDir -Recurse -Include *.jpg, *.jpeg, *.png, *.JPG, *.JPEG, *.PNG

Write-Host "Found $($imageFiles.Count) images to convert" -ForegroundColor Cyan

$convertedCount = 0
$skippedCount = 0

foreach ($file in $imageFiles) {
    try {
        # Get relative path for backup
        $currentDir = (Get-Location).Path
        $imgFullPath = Join-Path $currentDir $SourceDir
        $relativeToImg = $file.FullName.Substring($imgFullPath.Length + 1)
        $backupPath = Join-Path $BackupDir $relativeToImg
        $backupFolder = Split-Path $backupPath -Parent
        
        # Create backup folder structure
        if (-not (Test-Path $backupFolder)) {
            New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
        }
        
        # Copy original to backup (only if not already backed up)
        if (-not (Test-Path $backupPath)) {
            Copy-Item $file.FullName $backupPath -Force
            Write-Host "  Backed up: $relativeToImg" -ForegroundColor Gray
        }
        
        # Generate WebP filename
        $webpPath = [System.IO.Path]::ChangeExtension($file.FullName, ".webp")
        
        # Skip if WebP already exists
        if (Test-Path $webpPath) {
            Write-Host "  Skipped (exists): $relativeToImg -> WebP" -ForegroundColor DarkGray
            $skippedCount++
            continue
        }
        
        # Convert using ffmpeg
        Write-Host "  Converting: $relativeToImg" -ForegroundColor Yellow
        
        $null = & ffmpeg -i $file.FullName -c:v libwebp -quality 85 -lossless 0 $webpPath -y 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK Converted: $relativeToImg -> WebP" -ForegroundColor Green
            $convertedCount++
        }
        else {
            Write-Host "  X Failed: $relativeToImg" -ForegroundColor Red
        }
        
    }
    catch {
        Write-Host "  X Error converting $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Conversion Summary:" -ForegroundColor Cyan
Write-Host "  Total images: $($imageFiles.Count)" -ForegroundColor White
Write-Host "  Converted: $convertedCount" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "  Backed up to: $BackupDir" -ForegroundColor Gray
Write-Host ""
Write-Host "OK Image conversion complete!" -ForegroundColor Green
