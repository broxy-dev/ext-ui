# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

This is a React + TypeScript + Vite frontend application for Broxy, a web-based MCP (Model Context Protocol) server management UI. It uses Tailwind CSS and Radix UI components following the shadcn/ui pattern. The app is deployed to Cloudflare Pages with PWA support for offline caching.

## Build/Lint/Test Commands

```bash
npm run dev          # Start development server on port 3000
npm run build        # Type-check and build for production (tsc -b && vite build)
npm run lint         # Run ESLint on all files
npm run preview      # Preview production build locally (build + wrangler dev)
npm run deploy       # Build and deploy to Cloudflare Pages
```

Note: No test framework is currently configured in this project.

## Code Style Guidelines

### Imports

Order imports as follows, separated by blank lines:

1. React imports (e.g., `import { useState, useEffect } from 'react'`)
2. Third-party packages (e.g., Radix UI, Lucide icons, i18next)
3. Local imports using `@/` path alias (e.g., `import { Button } from '@/components/ui/button'`)
4. Type-only imports last (e.g., `import type { AppState } from '@/types'`)

Example:
```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { AppState } from '@/types';
```

### Path Aliases

Use `@/` for all imports from `src/`:

```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Route } from '@/types';
```

### Component Conventions

- Use named exports for components:
  ```typescript
  export function ComponentName({ prop }: Props) { ... }
  ```
- For forwardRef components, set `displayName`:
  ```typescript
  Button.displayName = 'Button';
  ```
- Use PascalCase for component files (e.g., `Settings.tsx`, `RouteEditorDialog.tsx`)
- Define explicit interfaces for props before the component:
  ```typescript
  interface SettingsProps {
    state: AppState;
    actions: {
      saveConfig: (mcpConfig: any, initScript: string) => Promise<void>;
    };
  }
  ```

### TypeScript

- Strict mode is enabled with additional checks: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
- Use `type` for type aliases and `interface` for object shapes that can be extended
- Prefer `import type` for type-only imports when appropriate
- Use explicit return types for exported functions when helpful for documentation

### Styling

- Use Tailwind CSS utility classes exclusively
- Use the `cn()` utility from `@/lib/utils` for conditional class merging:
  ```typescript
  className={cn('base-classes', condition && 'conditional-class')}
  ```
- Follow shadcn/ui patterns for UI components in `src/components/ui/`
- Use CSS variables for theming (defined in index.css)

### Hooks

- Custom hooks go in `src/hooks/` and start with `use` prefix
- Use `useCallback` for stable function references in dependencies
- Use `useRef` for mutable values that don't trigger re-renders
- Export both the hook and any related utilities/constants

### Internationalization

- All user-facing strings MUST use i18next
- Use the `useLocale()` hook for translations:
  ```typescript
  const { t } = useLocale();
  return <span>{t('settings.title')}</span>;
  ```
- Translation files are in `src/i18n/locales/` (en.json, zh-CN.json)
- When adding new i18n keys, add translations to BOTH locale files
- Use interpolation for dynamic values: `t('toast.jsonParseFailed', { message: err.message })`

### Error Handling

- Use try/catch for async operations
- Display errors via toast notifications:
  ```typescript
  try {
    await actions.saveConfig(config);
    toast({ title: t('toast.success'), variant: 'success' });
  } catch (err: any) {
    toast({ title: t('toast.error'), description: err.message, variant: 'destructive' });
  }
  ```
- Always provide user-friendly error messages with i18n

### Naming Conventions

- Components: PascalCase (e.g., `RoutesManager`, `CodeEditorDialog`)
- Functions: camelCase (e.g., `handleSave`, `formatDuration`)
- Constants: SCREAMING_SNAKE_CASE for true constants (e.g., `TOAST_LIMIT`)
- Files: PascalCase for components, camelCase for utilities/hooks
- CSS classes: Use Tailwind utilities only; no custom CSS classes

### State Management

- Use React's built-in hooks (useState, useReducer, useContext)
- Lift state up when needed
- For complex state, prefer useReducer with typed actions
- Use custom hooks to encapsulate related state and logic

### File Structure

```
src/
  components/       # React components
    ui/            # Base UI components (shadcn/ui style)
  hooks/           # Custom React hooks (useToast, useLocale, useTheme, etc.)
  lib/             # Utility functions (cn utility)
  types/           # TypeScript type definitions (index.ts)
  i18n/            # Internationalization config and locales
    locales/       # Translation JSON files (en.json, zh-CN.json)
```

## TypeScript Configuration

- Target: ES2020
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Strict mode enabled
- Path alias `@/*` maps to `./src/*`

## PWA Support

The app uses `vite-plugin-pwa` for Progressive Web App support:
- Service worker registered in `main.tsx`
- App icon at `public/icon.svg`
- PWA manifest configured in `vite.config.ts`
- Offline caching for static assets and Google Fonts

## Deployment

- Configured for Cloudflare Pages deployment via `wrangler`
- Use `npm run deploy` to build and deploy
- No separate config files needed when using Cloudflare's Git integration

## Before Committing

1. Run `npm run lint` to check for linting errors
2. Run `npm run build` to verify TypeScript compiles without errors
3. Ensure all new user-facing text uses i18n translations (both en.json and zh-CN.json)
4. Verify the app works in both light and dark themes
