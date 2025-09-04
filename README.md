# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/861048aa-1e66-4b03-9015-974211fc951d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/861048aa-1e66-4b03-9015-974211fc951d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## User Approval System

This project implements a user approval system where new users must be approved by an administrator before they can access the platform.

### How it works:

1. When a new user registers, they are automatically assigned to an organization with:
   - `approval_status = 'pending'`
   - `is_active = false`

2. Pending users cannot access the site and will see a message indicating their application is pending approval.

3. Administrators can review pending users in the Admin Panel and either:
   - Approve the user (sets `approval_status = 'approved'` and `is_active = true`)
   - Reject the user (sets `approval_status = 'rejected'` and `is_active = false`)

4. Rejected users cannot access the site and will see a specific rejection message when they try to log in.

### Implementation Details:

- Database functions handle user approval/rejection logic
- Authentication flow checks user approval status
- Admin Panel provides UI for managing user approvals
- Custom messages are displayed to users based on their approval status

For detailed implementation information, see [USER_APPROVAL_IMPLEMENTATION.md](USER_APPROVAL_IMPLEMENTATION.md)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/861048aa-1e66-4b03-9015-974211fc951d) and click on Share -> Publish.

## MCP Integration

This project includes Model Context Protocol (MCP) integration for enhanced AI assistance:

- **Supabase MCP**: Direct access to your Supabase database and documentation
- **Context 7 MCP**: Access to library documentation and code context

Configuration files are available in the `mcp-config/` directory:
- `combined-mcp-config.json` - Complete MCP setup (recommended)
- `MCP_SETUP_GUIDE.md` - Detailed setup instructions
- Test scripts for verifying the installation

To set up MCP integration, follow the guide in `mcp-config/MCP_SETUP_GUIDE.md`.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)