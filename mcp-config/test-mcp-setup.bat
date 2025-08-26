@echo off
echo Testing Supabase MCP Server...
echo.

echo 1. Testing Supabase MCP installation...
npx -y @supabase/mcp-server-supabase@latest --help

echo.
echo 2. Testing Context 7 MCP installation...
npx -y @context7/mcp-server@latest --help

echo.
echo 3. Checking Node.js version...
node -v

echo.
echo 4. Checking npm version...
npm -v

echo.
echo If all commands above ran successfully, your MCP setup is ready!
echo Next steps:
echo 1. Get your Supabase Personal Access Token from https://supabase.com/dashboard/account/tokens
echo 2. Configure your MCP client (Cursor, Claude Desktop, etc.) with the provided JSON configuration
echo 3. Replace ^<your-personal-access-token-here^> with your actual token
echo.
pause