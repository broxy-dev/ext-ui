# Broxy Extension UI

[中文文档](./README.zh-CN.md)

A modern web-based management UI for Broxy MCP (Model Context Protocol) server, built with React, TypeScript, and Tailwind CSS.

## Features

- **Route Management** - Create and manage custom API routes with JavaScript handlers
- **MCP Tools** - Define and configure MCP tools with custom input schemas
- **Real-time Logs** - Monitor execution logs for API calls and tool invocations
- **Authentication** - Optional token-based authentication for API and MCP endpoints
- **Init Scripts** - Execute custom JavaScript after server startup
- **Data Import/Export** - Backup and restore configuration data
- **Dark/Light Theme** - Toggle between themes
- **i18n Support** - English and Chinese language support

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives (shadcn/ui pattern)
- **Monaco Editor** - Code editor
- **i18next** - Internationalization

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Structure

```
src/
  components/       # React components
    ui/            # Base UI components (shadcn/ui)
  hooks/           # Custom React hooks
  lib/             # Utility functions
  types/           # TypeScript type definitions
  i18n/            # Internationalization config and locales
```

## License

MIT
