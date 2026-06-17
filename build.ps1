#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build script for Persianer Chrome Extension

.DESCRIPTION
    Creates production or development builds with appropriate optimizations

.PARAMETER Mode
    Build mode: 'dev' or 'prod'

.EXAMPLE
    .\build.ps1 -Mode prod
    .\build.ps1 -Mode dev
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev','prod')]
    [string]$Mode
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Persianer Extension Build Script      " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building for: " -NoNewline -ForegroundColor Yellow
Write-Host "$Mode" -ForegroundColor Magenta
Write-Host ""

# Configuration
$buildDir = "build-$Mode"
$excludeItems = @(
    'build-*',
    'node_modules',
    '.git',
    '.gitignore',
    '.github',
    '.docs',
    '*.md',
    '*.ps1',
    '*.bat',
    'test.html',
    'testlive.html'
)

# Step 1: Clean build directory
Write-Host "Cleaning build directory..." -ForegroundColor Yellow
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
    Write-Host "  Removed existing build directory" -ForegroundColor Green
}
New-Item -ItemType Directory -Path $buildDir | Out-Null
Write-Host "  Created fresh build directory: $buildDir" -ForegroundColor Green
Write-Host ""

# Step 2: Copy files
Write-Host "Copying extension files..." -ForegroundColor Yellow
$filesToCopy = Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    
    foreach ($pattern in $excludeItems) {
        # Check if item name matches pattern
        if ($item.Name -like $pattern) {
            $shouldExclude = $true
            break
        }
        # Check if any parent directory in the path matches pattern
        if ($item.FullName -like "*\$pattern\*" -or $item.FullName -like "*\$pattern") {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
}

foreach ($file in $filesToCopy) {
    $relativePath = $file.FullName.Substring($PSScriptRoot.Length + 1)
    $targetPath = Join-Path $buildDir $relativePath
    
    if ($file.PSIsContainer) {
        if (-not (Test-Path $targetPath)) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        }
    } else {
        $targetDir = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item $file.FullName -Destination $targetPath -Force
    }
}
Write-Host "  Files copied successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Process based on mode
if ($Mode -eq 'prod') {
    Write-Host "Applying PRODUCTION optimizations..." -ForegroundColor Yellow
    
    # Update config.js to production mode
    Write-Host "  Setting mode to 'production' in config.js..." -ForegroundColor Cyan
    $configPath = Join-Path $buildDir "config.js"
    $configContent = Get-Content $configPath -Raw
    $configContent = $configContent.Replace("mode: 'development'", "mode: 'production'")
    $configContent = $configContent.Replace("enableLogging: true", "enableLogging: false")
    $configContent | Set-Content $configPath -NoNewline
    Write-Host "    Config updated to production mode" -ForegroundColor Green
    
    # Update background.js to production mode
    Write-Host "  Setting IS_DEV to false in background.js..." -ForegroundColor Cyan
    $backgroundPath = Join-Path $buildDir "background.js"
    $backgroundContent = Get-Content $backgroundPath -Raw
    $backgroundContent = $backgroundContent.Replace("const IS_DEV = false;", "const IS_DEV = false; // Production build")
    $backgroundContent | Set-Content $backgroundPath -NoNewline
    Write-Host "    Background.js updated to production mode" -ForegroundColor Green
    
    # Update popup.js to production mode
    Write-Host "  Setting IS_DEV to false in popup.js..." -ForegroundColor Cyan
    $popupPath = Join-Path $buildDir "popup.js"
    $popupContent = Get-Content $popupPath -Raw
    $popupContent = $popupContent.Replace("const IS_DEV = false;", "const IS_DEV = false; // Production build")
    $popupContent | Set-Content $popupPath -NoNewline
    Write-Host "    Popup.js updated to production mode" -ForegroundColor Green
    
    # Update manifest.json
    Write-Host "  Updating manifest.json..." -ForegroundColor Cyan
    $manifestPath = Join-Path $buildDir "manifest.json"
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    
    # Remove -dev suffix if exists
    if ($manifest.version -match '-dev') {
        $manifest.version = $manifest.version -replace '-dev', ''
    }
    
    # Remove [DEV] suffix from name if exists
    if ($manifest.name -match '\[DEV\]') {
        $manifest.name = $manifest.name -replace '\s*\[DEV\]', ''
    }
    
    $manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
    Write-Host "    Manifest updated (version: $($manifest.version))" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "PRODUCTION build complete!" -ForegroundColor Green
    Write-Host "  Output: $buildDir" -ForegroundColor Cyan
    Write-Host "  Logging: DISABLED (only exceptions)" -ForegroundColor Cyan
    Write-Host "  Performance: OPTIMIZED" -ForegroundColor Cyan
    
} else {
    Write-Host "Applying DEVELOPMENT settings..." -ForegroundColor Yellow
    
    # Update config.js to development mode
    Write-Host "  Keeping mode as 'development' in config.js..." -ForegroundColor Cyan
    $configPath = Join-Path $buildDir "config.js"
    $configContent = Get-Content $configPath -Raw
    $configContent = $configContent.Replace("mode: 'production'", "mode: 'development'")
    $configContent = $configContent.Replace("enableLogging: false", "enableLogging: true")
    $configContent | Set-Content $configPath -NoNewline
    Write-Host "    Config kept in development mode" -ForegroundColor Green
    
    # Update background.js to development mode
    Write-Host "  Setting IS_DEV to true in background.js..." -ForegroundColor Cyan
    $backgroundPath = Join-Path $buildDir "background.js"
    $backgroundContent = Get-Content $backgroundPath -Raw
    $backgroundContent = $backgroundContent.Replace("const IS_DEV = false;", "const IS_DEV = true; // Development build")
    $backgroundContent | Set-Content $backgroundPath -NoNewline
    Write-Host "    Background.js updated to development mode" -ForegroundColor Green
    
    # Update popup.js to development mode
    Write-Host "  Setting IS_DEV to true in popup.js..." -ForegroundColor Cyan
    $popupPath = Join-Path $buildDir "popup.js"
    $popupContent = Get-Content $popupPath -Raw
    $popupContent = $popupContent.Replace("const IS_DEV = false;", "const IS_DEV = true; // Development build")
    $popupContent | Set-Content $popupPath -NoNewline
    Write-Host "    Popup.js updated to development mode" -ForegroundColor Green
    
    # Update manifest.json
    Write-Host "  Updating manifest.json..." -ForegroundColor Cyan
    $manifestPath = Join-Path $buildDir "manifest.json"
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    
    # Add -dev suffix if not exists
    if ($manifest.version -notmatch '-dev') {
        $manifest.version = $manifest.version + '-dev'
    }
    
    # Add [DEV] suffix to name if not exists
    if ($manifest.name -notmatch '\[DEV\]') {
        $manifest.name = $manifest.name + ' [DEV]'
    }
    
    $manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
    Write-Host "    Manifest updated with DEV markers (version: $($manifest.version))" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "DEVELOPMENT build complete!" -ForegroundColor Green
    Write-Host "  Output: $buildDir" -ForegroundColor Cyan
    Write-Host "  Logging: ENABLED (full debug mode)" -ForegroundColor Cyan
    Write-Host "  Debugging: ACTIVE" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "           Build Successful!               " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Go to chrome://extensions/" -ForegroundColor White
Write-Host "  2. Enable 'Developer mode'" -ForegroundColor White
Write-Host "  3. Click 'Load unpacked'" -ForegroundColor White
Write-Host "  4. Select the $buildDir folder" -ForegroundColor White
Write-Host ""
