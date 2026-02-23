@echo off
REM Trail Colombo - Admin Account Registration Helper

echo.
echo ================================================
echo Trail Colombo - Create Admin Account
echo ================================================
echo.
echo This script will create your first admin account.
echo.

setlocal enabledelayedexpansion

set email=admin@trailcolombo.com
set password=admin123

echo Admin Email: %email%
echo Admin Password: %password%
echo.

REM Use PowerShell to make the API call
powershell -Command ^
  "$body = @{ email = '%email%'; password = '%password%' } | ConvertTo-Json; " ^
  "try { " ^
  "  $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/register' -Method POST -ContentType 'application/json' -Body $body; " ^
  "  Write-Host 'SUCCESS: Admin account created!' -ForegroundColor Green; " ^
  "  Write-Host $response; " ^
  "} catch { " ^
  "  Write-Host 'ERROR: ' $_.Exception.Message -ForegroundColor Red; " ^
  "}"

echo.
echo ================================================
echo Admin Account Ready!
echo.
echo Next steps:
echo 1. Open: http://localhost:5173/admin
echo 2. Enter credentials:
echo    Email: %email%
echo    Password: %password%
echo.
echo ================================================
echo.

pause
