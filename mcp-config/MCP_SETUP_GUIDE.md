# MCP Setup Guide for FlowNest

This guide will help you set up both Supabase MCP and Context 7 MCP for your FlowNest project.

## Prerequisites

1. Node.js installed on your machine
2. A Supabase account with access to your project
3. An MCP-compatible client (Cursor, Claude Desktop, Windsurf, etc.)

## Step 1: Create Supabase Personal Access Token

1. Go to [Supabase Settings > Access Tokens](https://supabase.com/dashboard/account/tokens)
2. Click "Generate new token"
3. Give it a descriptive name like "FlowNest MCP Server"
4. Copy the token (you won't be able to see it again)

## Step 2: Configure Your MCP Client

### For Cursor IDE
1. Open Cursor Settings
2. Navigate to Features > Model Context Protocol
3. Add the configuration from `combined-mcp-config.json`
4. Replace `<your-personal-access-token-here>` with your actual token

### For Claude Desktop
1. Open the Claude Desktop app
2. Go to Settings > Developer
3. Add the MCP server configuration
4. Use the configuration from `combined-mcp-config.json`

### For Other MCP Clients
Use the configuration from `combined-mcp-config.json` and adapt it to your client's format.

## Step 3: Update Environment Variables

Add these to your `.env` file:

```
# Supabase MCP Configuration
SUPABASE_PROJECT_REF=cbifyipldybovxaipbuo
SUPABASE_ACCESS_TOKEN=<your-personal-access-token>
```

## Available MCP Servers

### Supabase MCP (`@supabase/mcp-server-supabase`)
- **Features**: Database operations, table management, SQL execution, project management
- **Configuration**: `supabase-mcp-config.json`
- **Security**: Configured in read-only mode by default
- **Project Scope**: Limited to your FlowNest project (`cbifyipldybovxaipbuo`)

### Context 7 MCP (`@context7/mcp-server`)
- **Features**: Documentation access, library information, code context
- **Configuration**: `context7-mcp-config.json`
- **Purpose**: Provides up-to-date documentation and library context

## Available Tools

### Supabase MCP Tools
- `list_tables`: List all tables in your database
- `execute_sql`: Run SQL queries (read-only)
- `list_extensions`: List database extensions
- `search_docs`: Search Supabase documentation
- `get_project`: Get project details
- And many more...

### Context 7 MCP Tools
- `resolve-library-id`: Find library identifiers
- `get-library-docs`: Get library documentation
- Various documentation and context tools

## Security Considerations

1. **Read-only Mode**: Supabase MCP is configured in read-only mode to prevent accidental data modifications
2. **Project Scoping**: Limited to your specific FlowNest project
3. **Token Security**: Keep your personal access token secure and don't commit it to version control
4. **Environment Variables**: Use environment variables for sensitive configuration

## Testing the Setup

1. Restart your MCP client after configuration
2. Try asking questions about your Supabase database
3. Request documentation for libraries used in your project
4. Verify that both MCPs are working correctly

## Troubleshooting

### Common Issues
1. **Token not working**: Ensure your Supabase personal access token is valid
2. **Node.js not found**: Make sure Node.js is in your system PATH
3. **MCP client not recognizing servers**: Restart your MCP client after configuration changes

### Logs
Most MCP clients provide logs that can help diagnose connection issues.

## Configuration Files

- `combined-mcp-config.json`: Use this for most setups
- `supabase-mcp-config.json`: Supabase MCP only
- `context7-mcp-config.json`: Context 7 MCP only

## Next Steps

1. Configure your MCP client with the provided configuration
2. Add your Supabase personal access token
3. Test the connection
4. Start using AI assistance with direct access to your Supabase project and documentation