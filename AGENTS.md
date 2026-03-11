# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

React + TypeScript + Vite frontend for Broxy MCP server management. Uses Tailwind CSS and Radix UI (shadcn/ui pattern). Deployed to Cloudflare Pages with PWA support.

## Build/Lint/Test Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Type-check and build (tsc -b && vite build)
npm run lint         # Run ESLint on all files
npm run preview      # Preview production build locally
npm run deploy       # Build and deploy to Cloudflare Pages
```

Note: No test framework is configured. Run lint and build before committing.

## Code Style Guidelines

### Imports

Order imports with blank line separators:

1. React imports
2. Third-party packages (Radix UI, Lucide icons, i18next)
3. Local imports using `@/` alias
4. Type-only imports last

```typescript
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Download, Settings, Code } from 'lucide-react';
import type { AppState } from '@/types';
```

### Path Aliases

Always use `@/` for src imports:

```typescript
import { cn } from '@/lib/utils';
import type { Route } from '@/types';
```

### Component Conventions

- Named exports only (no default exports):
  ```typescript
  export function ComponentName({ prop }: Props) { ... }
  ```
- Define props interface before component:
  ```typescript
  interface SettingsProps {
    state: AppState;
    actions: {
      saveConfig: (mcpConfig: any, initScript: string) => Promise<void>;
    };
  }
  ```
- forwardRef components need displayName:
  ```typescript
  Button.displayName = 'Button';
  ```
- PascalCase for component files: `Settings.tsx`, `RouteEditorDialog.tsx`

### TypeScript

- Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Use `interface` for object shapes, `type` for unions/aliases
- Use `import type` for type-only imports
- Catch errors as `err: any` for error.message access

### Styling

- Tailwind CSS utilities only - no custom CSS classes
- Use `cn()` for conditional class merging:
  ```typescript
  className={cn('base-classes', condition && 'conditional-class')}
  ```
- CSS variables for theming (defined in index.css)
- Follow shadcn/ui patterns in `src/components/ui/`

### Hooks

- Custom hooks in `src/hooks/` with `use` prefix
- Use `useCallback` for stable function references
- Use `useRef` for mutable values without re-renders

### Internationalization (CRITICAL)

- ALL user-facing strings MUST use i18next
- Use `useLocale()` hook:
  ```typescript
  const { t } = useLocale();
  return <span>{t('settings.title')}</span>;
  ```
- Translation files: `src/i18n/locales/en.json`, `src/i18n/locales/zh-CN.json`
- Add keys to BOTH locale files
- Interpolation: `t('toast.jsonParseFailed', { message: err.message })`

### Error Handling

- Use try/catch for async operations
- Display errors via toast notifications:
  ```typescript
  try {
    await actions.saveConfig(config);
    toast({ title: t('toast.saveSuccess'), variant: 'success' });
  } catch (err: any) {
    toast({ title: t('toast.error'), description: err.message, variant: 'destructive' });
  }
  ```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `RoutesManager`, `CodeEditorDialog` |
| Functions | camelCase | `handleSave`, `formatDuration` |
| Constants | SCREAMING_SNAKE_CASE | `TOAST_LIMIT` |
| Files | PascalCase (components), camelCase (hooks/utils) | `useToast.ts` |

### State Management

- Use React built-in hooks (useState, useReducer, useContext)
- Lift state up when multiple components need it
- Prefer useReducer for complex state with typed actions

## File Structure

```
src/
  components/       # React components
    ui/            # Base UI components (shadcn/ui)
  hooks/           # Custom hooks (useToast, useLocale, useTheme)
  lib/             # Utility functions (cn)
  types/           # TypeScript definitions (index.ts)
  i18n/            # Internationalization
    locales/       # Translation files (en.json, zh-CN.json)
```

## TypeScript Configuration

- Target: ES2020, Module: ESNext with bundler resolution
- JSX: react-jsx, Strict mode enabled
- Path alias: `@/*` maps to `./src/*`

## PWA Support

- Uses `vite-plugin-pwa` for offline caching
- Service worker registered in main.tsx
- App icon at `public/icon.svg`

## Deployment

- Cloudflare Pages via wrangler
- Use `npm run deploy` to build and deploy

## Before Committing

1. Run `npm run lint` - fix all errors
2. Run `npm run build` - must compile without errors
3. Add i18n keys to both en.json and zh-CN.json
4. Verify both light and dark themes work

## Git Operations

- Do NOT commit unless explicitly requested
- Never run `git push` without user request
