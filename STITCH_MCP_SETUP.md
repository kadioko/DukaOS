# Stitch MCP Setup Guide

This repository includes configuration for **Stitch MCP**, a universal MCP (Model Context Protocol) server for Google Stitch that enables Claude Code and other AI agents to generate UI/UX designs programmatically.

## Prerequisites

Before setting up Stitch MCP, ensure you have:

- A Google Cloud project
- Google Cloud CLI (`gcloud`) installed
- Claude Code installed and configured

## Installation Steps

### Step 1: Set up Google Cloud Project

First, authenticate with Google Cloud and enable the Stitch API:

```bash
# Log in to Google Cloud
gcloud auth login

# Set your project (replace YOUR_PROJECT_ID with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Set quota project
gcloud auth application-default set-quota-project YOUR_PROJECT_ID

# Enable the Stitch API
gcloud beta services mcp enable stitch.googleapis.com
```

### Step 2: Set up Application Default Credentials

Authorize the tool to access Google services on your behalf:

```bash
gcloud auth application-default login
```

### Step 3: Configure Claude Code

The Stitch MCP server is automatically configured through the `.mcp.json` file in this repository. When you work in this project with Claude Code, the MCP server will be available.

To use it explicitly with Claude Code CLI:

```bash
# List configured MCP servers
claude mcp list

# View details about the Stitch server
claude mcp get stitch

# If needed, you can also add it manually:
claude mcp add --transport stdio --env GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID stitch -- npx -y stitch-mcp
```

### Step 4: Set Environment Variables

Make sure the `GOOGLE_CLOUD_PROJECT` environment variable is set:

```bash
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
```

Or add it to your `.env` file or shell profile.

## Usage

Once configured, you can use Stitch MCP with Claude Code to:

- **Generate UI designs**: Create modern dashboard UIs, mobile app screens, and more
- **Extract design context**: Analyze existing screens for design consistency
- **Generate code**: Convert designs to code (HTML, React, etc.)
- **Manage screens**: Create, fetch, and update design screens

### Example Usage in Claude Code

You can now ask Claude Code to generate UI designs using natural language:

```
Generate a modern dashboard UI for a SaaS application with:
- Header with navigation
- Sidebar with menu items
- Main content area with cards showing metrics
```

## Troubleshooting

### Authentication Issues

If you encounter authentication errors:

1. Verify you're logged in: `gcloud auth list`
2. Ensure your project is set: `gcloud config get-value project`
3. Re-authenticate: `gcloud auth application-default login`

### MCP Server Not Found

If Claude Code can't find the Stitch MCP server:

1. Check that the `.mcp.json` file exists in the project root
2. Verify the environment variable is set: `echo $GOOGLE_CLOUD_PROJECT`
3. Restart Claude Code to reload MCP configuration

### Package Installation Issues

If `stitch-mcp` fails to install:

1. Ensure you have Node.js and npm installed
2. Clear the npm cache: `npm cache clean --force`
3. Try installing manually: `npm install -g stitch-mcp`

## Project Structure

```
.
├── .mcp.json                 # MCP server configuration
├── STITCH_MCP_SETUP.md      # This setup guide
└── README.md                 # Project README
```

## Resources

- [Stitch MCP GitHub Repository](https://github.com/Kargatharaakash/stitch-mcp)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [Google Stitch Documentation](https://stitch.withgoogle.com/)

## Additional Notes

- The Stitch MCP configuration uses environment variables for flexibility across different environments
- For team collaboration, ensure all team members have access to the same Google Cloud project
- The `.mcp.json` file can be checked into version control to share MCP configuration with team members
