Write-Host "Starting Teacher Dashboard..." -ForegroundColor Green
Write-Host ""

# Kill any existing Node.js processes
Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Starting server on port 3001..." -ForegroundColor Green
Write-Host "Access your application at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

# Start the server
node server.js 