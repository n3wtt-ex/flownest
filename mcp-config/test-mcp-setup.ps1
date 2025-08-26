Write-Host "Testing MCP Server Setup for FlowNest" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. Testing Supabase MCP installation..." -ForegroundColor Yellow
try {
    npx -y @supabase/mcp-server-supabase@latest --help
    Write-Host "✓ Supabase MCP server is available" -ForegroundColor Green
} catch {
    Write-Host "✗ Supabase MCP server test failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing Context 7 MCP installation..." -ForegroundColor Yellow
try {
    npx -y @upstash/context7-mcp@latest --help
    Write-Host "✓ Context 7 MCP server is available" -ForegroundColor Green
} catch {
    Write-Host "✗ Context 7 MCP server test failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Checking npm version..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Configuration files created:" -ForegroundColor Cyan
Write-Host "- combined-mcp-config.json (recommended)" -ForegroundColor White
Write-Host "- supabase-mcp-config.json" -ForegroundColor White
Write-Host "- context7-mcp-config.json" -ForegroundColor White
Write-Host "- MCP_SETUP_GUIDE.md" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your Supabase Personal Access Token from: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host "2. Configure your MCP client with the JSON configuration from combined-mcp-config.json" -ForegroundColor White
Write-Host "3. Replace <your-personal-access-token-here> with your actual token" -ForegroundColor White
Write-Host "4. Restart your MCP client" -ForegroundColor White

Write-Host ""
Read-Host "Press Enter to continue"